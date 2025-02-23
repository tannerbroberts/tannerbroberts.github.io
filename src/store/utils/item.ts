export class Item {
  id: string
  name: string
  duration: number
  children: Child[]

  constructor(id: string, name: string, duration: number, children: Child[]) {
    this.id = id
    this.name = name
    this.duration = duration
    this.children = children
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

export function getItemById(items: Item[], id: string): Item | undefined {
  return items.find(item => item.id === id)
}