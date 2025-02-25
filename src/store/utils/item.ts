export class Item {
  id: string
  name: string
  duration: number
  children: Child[]
  showChildren: boolean

  constructor(id: string, name: string, duration: number, children: Child[], showChildren: boolean) {
    this.id = id
    this.name = name
    this.duration = duration
    this.children = children
    this.showChildren = showChildren
  }
}

export class Child {
  id: string
  start: number

  constructor(id: string, start: number) {
    this.id = id
    this.start = start
  }
}

export function getItemById(items: Item[], id: string | null): Item | null {
  if (!id) return null
  const item = items.find(item => item.id === id)
  if (!item) return null
  return item
}