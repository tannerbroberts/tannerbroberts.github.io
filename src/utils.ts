/**
 * Data:
 * Events: name, length, child events, parent events
 * Schedule: scheduled events
 * Variables: quantities, states
 * 
 * operations:
 * create an event
 * delete an event
 * edit an event

 * schedule an event
 * schedule a recurring event
 * unschedule an event
 * unschedule a recurring event
 * get all event names
 * filter event names
 * get all events within a time range
 * 
 * contexts:
 * event
 * up next window
 * day window
 * week window
 * month window
 * accounting view?
 */

export class Event {
  name: string;
  length: number;
  schedule: Schedule;
  parentEvents: Event[];

  constructor(
    name: string,
    length: number,
    schedule: Schedule,
    parentEvents: Event[],
  ) {
    this.name = name;
    this.length = length;
    this.schedule = schedule;
    this.parentEvents = parentEvents;
  }
}

export class ScheduledPrioritizedEvent {
  event: Event;
  startTime: number;
  priority: number;
  busy: boolean;

  constructor(
    event: Event,
    startTime: number,
    priority: number,
    busy: boolean = false,
  ) {
    this.event = event;
    this.priority = priority;
    this.startTime = startTime;
    this.busy = busy; // busy means the event cannot be overlapped without forcing sacrificial prioritization
    // The concept of busy is really just a loose definition of an unspecified requirement.
    // For example, a meeting blocks me from doing MOST anything else, so it is busy to MOST anything else,
    // unless that something else happens to be playing a game on my phone, which the meeting does not block.
    // I'm using 'busy' as an idea because I don't want to get into the weeds of defining all the possible ways that one event could block another.
    // Things like: location, resources, mental state, etc. are all things that could be used to determine if an event is busy, and they're all hard to define.
  }
}

export class Collision {
  event1: ScheduledPrioritizedEvent;
  event2: ScheduledPrioritizedEvent;
  constructor(
    event1: ScheduledPrioritizedEvent,
    event2: ScheduledPrioritizedEvent,
  ) {
    this.event1 = event1;
    this.event2 = event2;
  }
}

export class Schedule {
  events: ScheduledPrioritizedEvent[];
  collisions: Collision[];
  constructor(events: ScheduledPrioritizedEvent[], collisions: Collision[]) {
    this.events = events;
    this.collisions = collisions;
  }

  addEvent(event: Event, startTime: number, priorityLevel: number = 0) {
    const newOne = new ScheduledPrioritizedEvent(
      event,
      startTime,
      priorityLevel,
    );
    this.collisions = [...this.collisions, ...this.getCollisions(newOne)];
    this.events.push(newOne);
  }

  removeEvent(event: Event) {
    this.events = this.events.filter((spe) => spe.event !== event);
    // remove all collisions that involve the event
    this.collisions = this.collisions.filter(
      (collision) =>
        collision.event1.event !== event && collision.event2.event !== event,
    );
  }

  editEventStartTime(
    eventName: string,
    eventStartTime: number,
    newStartTime: number,
  ) {
    const event = this.events.find(
      (spe) => spe.event.name === eventName && spe.startTime === eventStartTime,
    );
    if (event) {
      event.startTime = newStartTime;
      // remove all collisions and re-add them if they still exist
      this.collisions = [
        ...this.collisions.filter(
          (collision) =>
            collision.event1 !== event && collision.event2 !== event,
        ),
        ...this.getCollisions(event),
      ];
    }
  }

  getCollisions(newOne: ScheduledPrioritizedEvent): Collision[] {
    const collisions: Collision[] = [];
    this.events.forEach((oldOne) => {
      const timeOverlap =
        !oldOne.busy &&
        newOne.startTime < oldOne.startTime + oldOne.event.length &&
        newOne.startTime + newOne.event.length > oldOne.startTime;
      const priorityOverlap = newOne.priority === oldOne.priority;
      const bothBusy = newOne.busy && oldOne.busy;
      if (timeOverlap && priorityOverlap && bothBusy) {
        collisions.push(new Collision(oldOne, newOne));
      }
    });
    return collisions;
  }
}
