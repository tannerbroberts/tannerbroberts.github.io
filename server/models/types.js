// Shared type hints (JSDoc) for runtime JS

/**
 * @typedef {Object} BasicItem
 * @property {string} id
 * @property {string} templateHash - unique identifier for template lookup
 * @property {number} start - epoch ms
 * @property {number} end - epoch ms (exclusive)
 * @property {number} priority - integer, higher means more important
 * @property {string[]} parents - array of ancestor item ids (closest first)
 * @property {string|null} parentId - direct parent id if any
 */

/**
 * @typedef {Object} CalendarItem
 * @property {string} id
 * @property {string} type - 'basic' | 'container'
 * @property {string} templateHash
 * @property {number} start
 * @property {number} end
 * @property {string|null} parentId
 * @property {string[]} children
 * @property {number|undefined} priority
 */

/**
 * @typedef {Object} Template
 * @property {string} hash
 * @property {string} name
 * @property {string} kind // 'basic' | 'container' | 'checklist' | 'variable-group'
 * @property {any} data
 */
