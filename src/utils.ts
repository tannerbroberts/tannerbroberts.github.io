export type CondensedEvent = {
  name: string;
  length: number;
  locations: CondensedLocation[];
  schedule: CondensedSchedule;
};

export type CondensedLocation = {
  parentName: string;
  position: number;
};

export type CondensedSchedule = {
  children: CondensedChild[];
  collisions: CondensedCollision[];
};

export type CondensedChild = {
  eventName: string;
  location: CondensedLocation;
  priority: number;
  busy: boolean;
};

export type ConstructorParams_Schedule = {
  children: Child[];
  collisions: Collision[];
  parent: Event;
};

export type ConstructorParams_Event = {
  name: string;
  length: number;
  locations?: Location[];
};

export type ConstructorParams_Collision = {
  first: Child;
  second: Child;
};

export type ConstructorParams_Location = {
  parent: Event;
  position: number;
};

export type ConstructorParams_Child = {
  event: Event;
  priority: number;
  location: Location;
  busy?: boolean;
};

export type ConstructorParams_Parent = {
  event: Event;
  startTime: number;
};

export type CondensedCollision = CondensedChild[];

export type NewEventInfo = {
  name: string;
  length: number;
};

export class Location {
  parent: Event;
  position: number;

  public constructor({ parent, position }: ConstructorParams_Location) {
    this.parent = parent;
    this.position = position;
  }

  public condense(): CondensedLocation {
    return {
      parentName: this.parent.name,
      position: this.position,
    };
  }
}

export class Event {
  name: string;
  length: number;
  locations: Location[];
  schedule: Schedule | null;

  public constructor({
    name,
    length,
    locations = [],
  }: ConstructorParams_Event) {
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

  public removeChild(event: Event) {
    this.getSchedule().removeChild(event);
  }

  public moveEvent(
    eventName: string,
    eventStartTime: number,
    newStartTime: number,
  ) {
    this.getSchedule().move(eventName, eventStartTime, newStartTime);
  }

  public condense(): CondensedEvent {
    return {
      name: this.name,
      length: this.length,
      locations: this.locations.map((location) => location.condense()),
      schedule: this.schedule?.condense() || Schedule.emptyCondensed(),
    };
  }

  static fromCondensedForm(condensed: CondensedEvent): Event {
    const store = EventStore.getList();
    const event = store.getEvent(condensed.name);
    event.locations = condensed.locations.map((cl) => {
      const parent = store.getEvent(cl.parentName);
      return new Location({ parent, position: cl.position });
    });
    event.schedule = Schedule.fromCondensedForm(condensed.schedule, event);
    return event;
  }
}

export class Schedule {
  children: Child[];
  collisions: Collision[];
  parent: Event;
  public constructor({
    children,
    collisions,
    parent,
  }: ConstructorParams_Schedule) {
    this.children = children;
    this.collisions = collisions;
    this.parent = parent;
  }

  private getCollisions(newOne: Child): Collision[] {
    const collisions: Collision[] = [];
    this.children.forEach((oldOne) => {
      const timeOverlap =
        !oldOne.busy &&
        newOne.location.position <
          oldOne.location.position + oldOne.event.length &&
        newOne.location.position + newOne.event.length >
          oldOne.location.position;
      const priorityOverlap = newOne.priority === oldOne.priority;
      const bothBusy = newOne.busy && oldOne.busy;
      if (timeOverlap && priorityOverlap && bothBusy) {
        collisions.push(new Collision({ first: newOne, second: oldOne }));
      }
    });
    return collisions;
  }

  public insert(
    event: Event,
    position: number,
    priority: number = 0,
    busy: boolean = false,
  ) {
    const location = new Location({
      parent: this.parent,
      position,
    });
    const newOne = new Child({ event, priority, location, busy });
    this.collisions = [...this.collisions, ...this.getCollisions(newOne)];
    this.children.push(newOne);
  }

  public removeChild(event: Event) {
    this.children = this.children.filter((child) => child.event !== event);
    this.collisions = this.collisions.filter(
      (collision) =>
        collision.first.event !== event && collision.second.event !== event,
    );
  }

  public move(eventName: string, eventStartTime: number, newStartTime: number) {
    const childToMove = this.children.find(
      (child) =>
        child.event.name === eventName &&
        child.location.position === eventStartTime,
    );
    if (childToMove) {
      childToMove.location.position = newStartTime;
      // remove all collisions and re-add them if they still exist
      this.collisions = [
        ...this.collisions.filter(
          (collision) =>
            collision.first !== childToMove && collision.second !== childToMove,
        ),
        ...this.getCollisions(childToMove),
      ];
    }
  }

  public condense(): CondensedSchedule {
    return {
      children: this.children.map((child) => child.condense()),
      collisions: this.collisions.map((collision) =>
        collision.toCondensedForm(),
      ),
    };
  }

  static fromCondensedForm(
    condensed: CondensedSchedule,
    parent: Event,
  ): Schedule {
    const store = EventStore.getList();
    const children = condensed.children.map((ce) => {
      const event = store.getEvent(ce.eventName);
      const location = new Location({ parent, position: ce.location.position });
      return new Child({
        event,
        priority: ce.priority,
        location,
        busy: ce.busy,
      });
    });
    const collisions = condensed.collisions.map((cc) => {
      return Collision.fromCondensedForm(cc, parent);
    });
    return new Schedule({ children, collisions, parent });
  }

  static emptyCondensed(): CondensedSchedule {
    return {
      children: [],
      collisions: [],
    };
  }
}

export class Child {
  event: Event;
  priority: number;
  busy: boolean;
  location: Location;

  public constructor({
    event,
    priority,
    location,
    busy = false,
  }: ConstructorParams_Child) {
    this.event = event;
    this.priority = priority;
    this.location = location;
    this.busy = busy;
  }

  public condense(): CondensedChild {
    return {
      eventName: this.event.name,
      priority: this.priority,
      busy: this.busy,
      location: this.location.condense(),
    };
  }
}

export class Collision {
  first: Child;
  second: Child;
  public constructor({ first, second }: ConstructorParams_Collision) {
    this.first = first;
    this.second = second;
  }

  public toCondensedForm(): CondensedCollision {
    return [this.first.condense(), this.second.condense()];
  }

  static fromCondensedForm(
    condensed: CondensedCollision,
    parent: Event,
  ): Collision {
    const store = EventStore.getList();
    const firstEvent = store.getEvent(condensed[0].eventName);
    const second = store.getEvent(condensed[1].eventName);
    return new Collision({
      first: new Child({
        event: firstEvent,
        priority: condensed[0].priority,
        location: new Location({
          parent,
          position: condensed[0].location.position,
        }),
        busy: condensed[0].busy,
      }),
      second: new Child({
        event: second,
        priority: condensed[1].priority,
        location: new Location({
          parent,
          position: condensed[1].location.position,
        }),
        busy: condensed[1].busy,
      }),
    });
  }
}

export class Parent {
  event: Event;
  startTime: number;

  public constructor({ event, startTime }: ConstructorParams_Parent) {
    this.event = event;
    this.startTime = startTime;
  }
}

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
          const condensedEvent = JSON.parse(eventJSON) as CondensedEvent;
          if (condensedEvent) return Event.fromCondensedForm(condensedEvent);
          throw new Error(
            `Event ${name} could not be parsed from localStorage`,
          );
        }
        throw new Error(`Event ${name} not found in localStorage`);
      });
    } else {
      this.events = [];
    }
  }

  public static getList(): EventStore {
    if (!EventStore.instance) {
      EventStore.instance = new EventStore();
    }
    return EventStore.instance;
  }

  public create(eventInitInfo: NewEventInfo) {
    const { name, length } = eventInitInfo;
    if (this.events.find((e) => e.name === name))
      throw new Error("Event already exists in EventStore");
    const event = new Event({ name, length, locations: [] });
    this.events.push(event);
    localStorage.setItem(
      "EventList",
      JSON.stringify(this.events.map((e) => e.name)),
    );
    localStorage.setItem(
      `event-${event.name}`,
      JSON.stringify(event.condense()),
    );
  }

  public remove(eventName: string) {
    // Remove the event from the list of event names
    this.events = this.events.filter((event) => event.name !== eventName);
    localStorage.setItem("EventList", JSON.stringify(this.events));

    // Remove the 'event-<name>' key from localStorage
    localStorage.removeItem(`event-${eventName}`);
  }

  public getEvent(eventName: string): Event {
    const event = this.events.find((event) => event.name === eventName);
    if (event) {
      return event;
    }
    throw new Error(`Event ${eventName} not found in EventStore`);
  }
}
