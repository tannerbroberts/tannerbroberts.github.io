import { IntervalTree } from 'node-interval-tree'
import { v4 as uuidv4 } from 'uuid'
import { readState, updateState, onShutdown } from './persistence.js'

// Per-user stores held in-memory
const userStores = new Map()

function serializeStore() {
  const obj = {}
  for (const [userId, store] of userStores.entries()) {
    obj[userId] = {
      items: Array.from(store.items.values()),
      templates: Array.from(store.templates.values()),
    }
  }
  return obj
}

function persistToDisk() {
  try {
    const snapshot = serializeStore()
    updateState(state => ({ ...state, stores: snapshot }))
  } catch (e) {
    console.error('[store] persist failed', e)
  }
}

function loadFromDisk() {
  try {
    const state = readState()
    // Back-compat: older files stored stores at top-level (no wrapper key)
    const source = state.stores && typeof state.stores === 'object' ? state.stores : state
    for (const [userId, payload] of Object.entries(source || {})) {
      if (userId === 'users') continue // never treat auth users array as a calendar user store
      const s = getUserStore(userId)
      // rebuild maps
      for (const it of payload.items || []) {
        s.items.set(it.id, it)
      }
      for (const t of payload.templates || []) {
        s.templates.set(t.hash, t)
      }
      // rebuild trees
      for (const it of s.items.values()) {
        s.tree.insert(it.start, it.end, it.id)
        if (it.type === 'basic') s.busyTree.insert(it.start, it.end, it.id)
      }
    }
    console.log('[store] loaded from server_memory.json')
  } catch (e) {
    console.error('[store] load failed', e)
  }
}

function getUserStore(userId) {
  if (!userStores.has(userId)) {
    userStores.set(userId, {
      // raw items by id
      items: new Map(),
      // user templates by hash (simulate CDN/cache later)
      templates: new Map(),
      // an interval tree for fast time queries; store ids
      tree: new IntervalTree(),
      // maintain basic busy items separately for conflict/summary
      busyTree: new IntervalTree(),
    })
  }
  return userStores.get(userId)
}

// Helpers
function insertInterval(tree, item) {
  tree.insert(item.start, item.end, item.id)
}
function removeInterval(tree, item) {
  tree.remove(item.start, item.end, item.id)
}

// Public API for the store
export const Store = {
  ensureUser(userId) {
    return getUserStore(userId)
  },

  upsertTemplate(userId, template) {
    const s = getUserStore(userId)
    s.templates.set(template.hash, template)
    persistToDisk()
    return template
  },

  getTemplate(userId, hash) {
    return getUserStore(userId).templates.get(hash) || null
  },

  // Insert or update an item and index intervals
  upsertItem(userId, itemInput) {
    const s = getUserStore(userId)
    const id = itemInput.id || uuidv4()
    const prev = s.items.get(id)

    if (prev) {
      // remove old indexes
      removeInterval(s.tree, prev)
      if (prev.type === 'basic') removeInterval(s.busyTree, prev)
    }

    const item = { ...itemInput, id }
    s.items.set(id, item)
    insertInterval(s.tree, item)
    if (item.type === 'basic') insertInterval(s.busyTree, item)
    persistToDisk()
    return item
  },

  deleteItem(userId, id) {
    const s = getUserStore(userId)
    const prev = s.items.get(id)
    if (!prev) return false
    removeInterval(s.tree, prev)
    if (prev.type === 'basic') removeInterval(s.busyTree, prev)
    s.items.delete(id)
    persistToDisk()
    return true
  },

  // Query items for window [start, end)
  // Options:
  // - busyOnly: only 'basic' items
  // - largestFit: prefer largest items to cover the window without sub-fragmenting
  // - fullyWithin: only return items fully contained in [start,end)
  query(userId, start, end, options = {}) {
    const s = getUserStore(userId)
    const { busyOnly = false, largestFit = true, fullyWithin = true } = options
    const tree = busyOnly ? s.busyTree : s.tree
    const hits = new Set(tree.search(start, end))
    const results = []

    // Optionally reduce to largest items that still fit in [start,end)
    if (largestFit) {
      // Strategy: materialize all items, then filter to those which are not contained by a parent also within range
      /** @type {Map<string, any>} */
      const items = new Map()
      for (const id of hits) {
        const it = s.items.get(id)
        if (!it) continue
        if (fullyWithin && !(it.start >= start && it.end <= end)) continue
        items.set(id, it)
      }

      // Keep those that are not fully contained by another item's time window within the set
      const arr = Array.from(items.values())
      // Sort by duration desc to prefer larger first
      arr.sort((a, b) => (b.end - b.start) - (a.end - a.start))
      const kept = []
      const covered = [] // array of [start,end) already covered by kept items

      function overlapsCover(st, en) {
        for (const [cs, ce] of covered) {
          if (st >= cs && en <= ce) return true
        }
        return false
      }

      for (const it of arr) {
        const st = Math.max(it.start, start)
        const en = Math.min(it.end, end)
        if (st >= en) continue
        if (!overlapsCover(st, en)) {
          kept.push(it)
          covered.push([st, en])
        }
      }
      kept.sort((a, b) => a.start - b.start)
      results.push(...kept)
    } else {
      for (const id of hits) {
        const it = s.items.get(id)
        if (!it) continue
        if (fullyWithin && !(it.start >= start && it.end <= end)) continue
        results.push(it)
      }
      results.sort((a, b) => a.start - b.start)
    }

    return results
  },

  // Detect conflicts among busy items in [start,end).
  // Returns array of conflict groups, each with items sorted by priority desc then start asc
  conflicts(userId, start, end) {
    const s = getUserStore(userId)
    const ids = new Set(s.busyTree.search(start, end))
    const items = Array.from(ids).map(id => s.items.get(id)).sort((a, b) => a.start - b.start)

    const groups = []
    let cur = []
    let curEnd = -Infinity
    for (const it of items) {
      if (cur.length === 0) {
        cur.push(it)
        curEnd = it.end
      } else if (it.start < curEnd) {
        cur.push(it)
        curEnd = Math.max(curEnd, it.end)
      } else {
        groups.push(cur)
        cur = [it]
        curEnd = it.end
      }
    }
    if (cur.length) groups.push(cur)

    return groups.map(g => g.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0) || a.start - b.start))
  },

  // Summary of unscheduled time by priority buckets in [start,end)
  // Compute total duration of the window minus union of busy intervals of each priority or higher
  busySummary(userId, start, end, priorityLevels = [2, 1, 0]) {
    const s = getUserStore(userId)
    const ids = new Set(s.busyTree.search(start, end))
    const busy = Array.from(ids).map(id => s.items.get(id))

    // For each level, consider items with priority >= level
    function unionDuration(minLevel) {
      const intervals = busy.filter(b => (b.priority ?? 0) >= minLevel).map(b => [Math.max(b.start, start), Math.min(b.end, end)])
      intervals.sort((a, b) => a[0] - b[0])
      let total = 0
      let curS = null
      let curE = null
      for (const [s1, e1] of intervals) {
        if (s1 >= e1) continue
        if (curS === null) {
          curS = s1; curE = e1
        } else if (s1 <= curE) {
          curE = Math.max(curE, e1)
        } else {
          total += curE - curS
          curS = s1; curE = e1
        }
      }
      if (curS !== null) total += curE - curS
      return total
    }

    const windowDur = Math.max(0, end - start)
    const result = {}
    for (const lvl of priorityLevels) {
      const busyDur = unionDuration(lvl)
      result[`unscheduled_p${lvl}`] = windowDur - busyDur
    }
    return result
  }
}

// load persisted data at startup
loadFromDisk()

// best-effort save on exit using centralized shutdown handling
onShutdown(() => { try { persistToDisk() } catch (e) { console.error('[store] shutdown persist failed', e) } })
