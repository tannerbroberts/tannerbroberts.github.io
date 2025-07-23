F// Example: Using node-interval-tree for a base calendar

const IntervalTree = require('node-interval-tree');

// CalendarEvent: { id, start, end, title }
class BaseCalendar {
  constructor() {
    this.tree = new IntervalTree();
    this.events = new Map(); // id -> event
  }

  addEvent(event) {
    this.tree.insert(event.start, event.end, event.id);
    this.events.set(event.id, event);
  }

  removeEvent(eventId) {
    const event = this.events.get(eventId);
    if (event) {
      this.tree.remove(event.start, event.end, event.id);
      this.events.delete(eventId);
    }
  }

  // Find all events overlapping a given interval
  findOverlapping(start, end) {
    const ids = this.tree.search(start, end);
    return ids.map(id => this.events.get(id));
  }

  // List all events
  listEvents() {
    return Array.from(this.events.values());
  }
}

// Example usage:
const calendar = new BaseCalendar();
calendar.addEvent({ id: 1, start: 10, end: 20, title: 'Meeting' });
calendar.addEvent({ id: 2, start: 15, end: 25, title: 'Call' });
calendar.addEvent({ id: 3, start: 30, end: 40, title: 'Break' });

console.log('Overlapping 12-18:', calendar.findOverlapping(12, 18));
console.log('All events:', calendar.listEvents());

// Remove an event
calendar.removeEvent(2);
console.log('After removal:', calendar.listEvents());
