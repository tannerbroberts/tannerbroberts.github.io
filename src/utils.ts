type CondensedEvent = {
  name: string;
  length: number;
  locations: CondensedLocation[];
  schedule: CondensedSchedule;
};
export class Event {
  name: string;
  length: number;
  locations: Location[];
  schedule: Schedule | null;

  constructor(name: string, length: number, locations: Location[]) {
    this.name = name;
    this.length = length;
    this.schedule = null;
    this.locations = locations;
  }

  private getSchedule(): Schedule {
    if (this.schedule === null) {
      throw new Error(`Event ${this.name} has no associated schedule`);
    }
    return this.schedule;
  }

  public insert(event: Event, startTime: number, priorityLevel: number = 0) {
    this.getSchedule().insert(event, startTime, priorityLevel);
  }

  public remove(event: Event) {
    this.getSchedule().remove(event);
  }

  public moveEvent(
    eventName: string,
    eventStartTime: number,
    newStartTime: number,
  ) {
    this.getSchedule().move(eventName, eventStartTime, newStartTime);
  }

  condense(): CondensedEvent {
    return {
      name: this.name,
      length: this.length,
      locations: this.locations.condense(),
      schedule: this.schedule.condense(),
    };
  }
}

type CondensedSchedule = {
  events: CondensedChild[];
  collisions: Collision[];
};
type CondensedChild = {
  name: string;
  startTime: number;
  priority: number;
  busy: boolean;
};
class Schedule {
  children: Child[];
  collisions: Collision[];
  parent: Event;
  constructor(
    children: Child[] = [],
    collisions: Collision[] = [],
    parent: Event,
  ) {
    this.children = children;
    this.collisions = collisions;
    this.parent = parent;
  }

  insert(event: Event, startTime: number, priorityLevel: number = 0) {
    const newOne = new Child(event, startTime, priorityLevel);
    this.collisions = [...this.collisions, ...this.getCollisions(newOne)];
    this.children.push(newOne);
  }

  remove(event: Event) {
    this.children = this.children.filter((ce) => ce.event !== event);
    // remove all collisions that involve the event
    this.collisions = this.collisions.filter(
      (collision) =>
        collision.event1.event !== event && collision.event2.event !== event,
    );
  }

  move(eventName: string, eventStartTime: number, newStartTime: number) {
    const event = this.children.find(
      (ce) => ce.event.name === eventName && ce.startTime === eventStartTime,
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

  getCollisions(newOne: Child): Collision[] {
    const collisions: Collision[] = [];
    this.children.forEach((oldOne) => {
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

  toCondensedForm(): CondensedSchedule {
    return {
      children: this.children.map((ce) => ({
        name: ce.event.name,
        startTime: ce.startTime,
        priority: ce.priority,
        busy: ce.busy,
      })),
      collisions: this.collisions,
    };
  }

  static fromCondensedForm(
    condensed: CondensedSchedule,
    parent: Event,
  ): Schedule {
    const store = EventStore.getList();
    const children = condensed.children.map((ce) => {
      const event = store.getEvent(ce.name);
      return new Child(event, ce.startTime, ce.priority, ce.busy);
    });
    const collisions = condensed.collisions.map((collision) => {
      const event1 = children.find((e) => e.event.name === collision.event1);
      const event2 = children.find((e) => e.event.name === collision.event2);
      if (event1 && event2) {
        return new Collision(event1, event2);
      }
      throw new Error("Collision children not found");
    });
    return new Schedule(children, collisions, parent);
  }
}

export class Child {
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

type CondensedCollision = {
  event1: string;
  event2: string;
};
export class Collision {
  event1: Child;
  event2: Child;
  constructor(event1: Child, event2: Child) {
    this.event1 = event1;
    this.event2 = event2;
  }

  toCondensedForm(): CondensedCollision {
    return {
      event1: this.event1.event.name,
      event2: this.event2.event.name,
    };
  }
}

export class Parent {
  event: Event;
  startTime: number;

  constructor(event: Event, startTime: number) {
    this.event = event;
    this.startTime = startTime;
  }
}

export type EventInitInfo = {
  name: string;
  length: number;
};
export class EventStore {
  private static instance: EventStore;
  events: Event[];

  private constructor() {
    const eventList = localStorage.getItem("EventList");
    if (eventList) {
      const names = JSON.parse(eventList) as string[];
      this.events = names.map((name) => {
        const eventJSON = localStorage.getItem(`event-${name}`);
        if (eventJSON) {
          return Event.fromJSON(eventJSON);
        }
        throw new Error(`Event ${name} not found in localStorage`);
      });
    } else {
      this.events = [];
    }
  }

  static getList(): EventStore {
    if (!EventStore.instance) {
      EventStore.instance = new EventStore();
    }
    return EventStore.instance;
  }

  create(eventInitInfo: EventInitInfo) {
    const { name, length } = eventInitInfo;
    if (this.events.find((e) => e.name === name))
      throw new Error("Event already exists in EventStore");
    const event = new Event(name, length, [], []);
    this.events.push(event);
    localStorage.setItem(
      "EventList",
      JSON.stringify(this.events.map((e) => e.name)),
    );
    localStorage.setItem(`event-${event.name}`, event.toJSON());
  }

  remove(eventName: string) {
    // Remove the event from the list of event names
    this.events = this.events.filter((event) => event.name !== eventName);
    localStorage.setItem("EventList", JSON.stringify(this.events));

    // Remove the 'event-<name>' key from localStorage
    localStorage.removeItem(`event-${eventName}`);
  }

  getEvent(eventName: string): Event {
    const event = this.events.find((event) => event.name === eventName);
    if (event) {
      return event;
    }
    throw new Error(`Event ${eventName} not found in EventStore`);
  }
}
