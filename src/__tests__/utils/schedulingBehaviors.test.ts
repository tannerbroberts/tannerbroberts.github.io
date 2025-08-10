import { describe, it, expect } from 'vitest'
import { BasicItem, CheckListChild, CheckListItem, SubCalendarItem, Child } from '../../functions/utils/item'
import { applySchedulingRules } from '../../utils/schedulingBehaviors'

function mkChecklist(name = 'buy fresh ingredients') {
  return new CheckListItem({ name, duration: 0 })
}

function mkParentWithChecklist(list: CheckListItem) {
  const parent = new SubCalendarItem({ name: '3day', duration: 3 * 24 * 60 * 60 * 1000 })
  // Attach the checklist as a child reference so behavior can find it
  const ref = new CheckListChild({ itemId: list.id })
  const childRef = new Child({ id: list.id, start: 0, relationshipId: ref.relationshipId })
  parent.children.push(childRef)
  return parent
}

describe('applySchedulingRules', () => {
  it('creates and adds task to checklist per rule', () => {
    const meal = new BasicItem({
      name: 'teriyaki',
      duration: 30 * 60 * 1000,
      scheduling: {
        rules: [{
          when: { start: 'parent', chain: [{ op: 'findChildren' }, { op: 'filter', match: { typeIs: 'CheckListItem' } }], assert: [{ kind: 'exists', value: true }] },
          then: [
            { type: 'createItem', name: 'Buy asparagus (6)', duration: 2 * 60 * 1000 },
            { type: 'addToChecklist', target: 'firstMatch', source: 'lastCreatedItem' }
          ]
        }]
      }
    })
    const checklist = mkChecklist()
    const parent = mkParentWithChecklist(checklist)
    const items = [meal, checklist, parent]

    const res = applySchedulingRules(items, parent, meal)

    // Should produce new tasks and return updated checklist
    expect(res.updatedItems.length).toBeGreaterThan(0)
    const updatedChecklist = res.updatedItems.find(i => i.id === checklist.id) as CheckListItem
    expect(updatedChecklist).toBeTruthy()

    // Verify at least one created task exists among returned items
    const buyTask = res.updatedItems.find(i => i.name.toLowerCase().startsWith('buy asparagus'))
    expect(buyTask).toBeTruthy()
  })
})
