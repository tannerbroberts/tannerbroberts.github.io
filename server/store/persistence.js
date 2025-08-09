import fs from 'fs'
import path from 'path'

const MEMORY_FILE = path.resolve(process.cwd(), 'server_memory.json')

function readState() {
  try {
    if (!fs.existsSync(MEMORY_FILE)) return {}
    const data = fs.readFileSync(MEMORY_FILE, 'utf-8')
    if (!data) return {}
    const parsed = JSON.parse(data)
    // Only allow plain objects
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch (e) {
    console.error('[persistence] read failed, starting empty', e)
    return {}
  }
}

function writeState(state) {
  try {
    const json = JSON.stringify(state)
    fs.writeFileSync(MEMORY_FILE, json)
  } catch (e) {
    console.error('[persistence] write failed', e)
  }
}

function updateState(updater) {
  const current = readState()
  const next = updater(current) || current
  writeState(next)
}

const shutdownHooks = []
let shutdownWired = false

function onShutdown(hook) {
  shutdownHooks.push(hook)
  if (!shutdownWired) {
    shutdownWired = true
    const handler = () => {
      try {
        for (const h of shutdownHooks) {
          try { h() } catch (e) { console.error('[persistence] shutdown hook failed', e) }
        }
      } finally {
        process.exit(0)
      }
    }
    process.on('SIGINT', handler)
    process.on('SIGTERM', handler)
  }
}

export { readState, writeState, updateState, onShutdown }
