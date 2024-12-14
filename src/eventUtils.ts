class CondensedLocation {
  parentName: string;
  position: number;

  public constructor({
    parentName,
    position,
  }: {
    parentName: string;
    position: number;
  }) {
    this.parentName = parentName;
    this.position = position;
  }

  public inflate(): Location {
    return new Location({
      parent: EventStore.getList().getEvent(this.parentName),
      position: this.position,
    });
  }
}

class Location {
  parent: Event;
  position: number;

  public constructor({
    parent,
    position,
  }: {
    parent: Event;
    position: number;
  }) {
    this.parent = parent;
    this.position = position;
  }

  public condense(): CondensedLocation {
    return new CondensedLocation({
      parentName: this.parent.name,
      position: this.position,
    });
  }
}

class CondensedEvent {
  name: string;
  length: number;
  condensedLocations?: CondensedLocation[];
  condensedSchedule?: CondensedSchedule;

  public constructor({
    name,
    length,
    condensedLocations,
    condensedSchedule,
  }: {
    name: string;
    length: number;
    condensedLocations?: CondensedLocation[];
    condensedSchedule?: CondensedSchedule;
  }) {
    this.name = name;
    this.length = length;
    this.condensedSchedule = condensedSchedule;
    this.condensedLocations = condensedLocations;
  }

  public basicInflate(): Event {
    return new Event({
      name: this.name,
      length: this.length,
    });
  }

  public inflate(): Event {
    return new Event({
      name: this.name,
      length: this.length,
      locations: this.condensedLocations?.map((condensedLocation) =>
        condensedLocation.inflate(),
      ),
      schedule: this.condensedSchedule?.inflate(),
    });
  }
}

export class Event {
  name: string;
  length: number;
  locations?: Location[];
  schedule?: Schedule;

  public constructor({
    name,
    length,
    locations,
    schedule,
  }: {
    name: string;
    length: number;
    locations?: Location[];
    schedule?: Schedule;
  }) {
    this.name = name;
    this.length = length;
    this.schedule = schedule;
    this.locations = locations;
  }

  public setSchedule(schedule: Schedule) {
    this.schedule = schedule;
  }

  public setLocations(locations: Location[]) {
    this.locations = locations;
  }

  private getSchedule(): Schedule {
    if (this.schedule === undefined) {
      throw new Error(`Event ${this.name} has no associated schedule`);
    }
    return this.schedule;
  }

  public insertChild(
    event: Event,
    startTime: number,
    priorityLevel: number = 0,
  ) {
    this.getSchedule().insert(event, startTime, priorityLevel);
  }

  public removeChild(event: Event) {
    this.getSchedule().remove(event);
  }

  public moveChild(
    eventName: string,
    eventStartTime: number,
    newStartTime: number,
  ) {
    this.getSchedule().move(eventName, eventStartTime, newStartTime);
  }

  condense(): CondensedEvent {
    return new CondensedEvent({
      name: this.name,
      length: this.length,
      condensedLocations: this.locations?.map((location) =>
        location.condense(),
      ),
      condensedSchedule: this.schedule?.condense(),
    });
  }
}

class CondensedSchedule {
  condensedChildren: CondensedChild[];
  condensedCollisions: CondensedCollision[];
  parentName: string;

  public constructor({
    children,
    condensedCollisions,
    parentName,
  }: {
    children: CondensedChild[];
    condensedCollisions: CondensedCollision[];
    parentName: string;
  }) {
    this.condensedChildren = children;
    this.condensedCollisions = condensedCollisions;
    this.parentName = parentName;
  }

  public inflate(): Schedule {
    return new Schedule({
      children: this.condensedChildren.map((condensedChild) =>
        condensedChild.inflate(),
      ),
      collisions: this.condensedCollisions.map((condensedCollision) =>
        condensedCollision.inflate(),
      ),
      parent: EventStore.getList().getEvent(this.parentName),
    });
  }
}

class Schedule {
  children: Child[];
  collisions: Collision[];
  parent: Event;
  public constructor({
    children,
    collisions,
    parent,
  }: {
    children: Child[];
    collisions: Collision[];
    parent: Event;
  }) {
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
    if (this.parent === null) throw new Error("Schedule has no parent");
    const location = new Location({
      parent: this.parent,
      position,
    });
    const newOne = new Child({ event, priority, location, busy });
    this.collisions = [...this.collisions, ...this.getCollisions(newOne)];
    this.children.push(newOne);
  }

  public remove(event: Event) {
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
    return new CondensedSchedule({
      children: this.children.map((child) => child.condense()),
      condensedCollisions: this.collisions.map((collision) =>
        collision.condense(),
      ),
      parentName: this.parent.name,
    });
  }
}

class CondensedChild {
  event: string;
  priority: number;
  busy: boolean;
  location: CondensedLocation;

  public constructor({
    event,
    priority,
    location,
    busy = false,
  }: {
    event: string;
    priority: number;
    location: CondensedLocation;
    busy?: boolean;
  }) {
    this.event = event;
    this.priority = priority;
    this.location = location;
    this.busy = busy;
  }

  public inflate(): Child {
    return new Child({
      event: EventStore.getList().getEvent(this.event),
      priority: this.priority,
      location: this.location.inflate(),
      busy: this.busy,
    });
  }
}

class Child {
  event: Event;
  priority: number;
  busy: boolean;
  location: Location;

  public constructor({
    event,
    priority,
    location,
    busy = false,
  }: {
    event: Event;
    priority: number;
    location: Location;
    busy: boolean;
  }) {
    this.event = event;
    this.priority = priority;
    this.location = location;
    this.busy = busy;
  }

  public condense(): CondensedChild {
    return new CondensedChild({
      event: this.event.name,
      priority: this.priority,
      location: this.location.condense(),
      busy: this.busy,
    });
  }
}

class CondensedCollision {
  firstCondensedChild: CondensedChild;
  secondCondensedChild: CondensedChild;

  public constructor({
    firstCondensedChild,
    secondCondensedChild,
  }: {
    firstCondensedChild: CondensedChild;
    secondCondensedChild: CondensedChild;
  }) {
    this.firstCondensedChild = firstCondensedChild;
    this.secondCondensedChild = secondCondensedChild;
  }

  public inflate(): Collision {
    return new Collision({
      first: this.firstCondensedChild.inflate(),
      second: this.secondCondensedChild.inflate(),
    });
  }
}

class Collision {
  first: Child;
  second: Child;
  public constructor({ first, second }: { first: Child; second: Child }) {
    this.first = first;
    this.second = second;
  }

  condense() {
    return new CondensedCollision({
      firstCondensedChild: this.first.condense(),
      secondCondensedChild: this.second.condense(),
    });
  }
}

export class EventStore {
  private static instance: EventStore;
  private eventList: Map<string, Event> = new Map<string, Event>();
  private condensedEvents: Map<string, CondensedEvent> = new Map<
    string,
    CondensedEvent
  >();

  private constructor() {
    const eventListNamesJSON = localStorage.getItem("EventList");

    // Guard against null EventList in localStorage
    if (!eventListNamesJSON) {
      this.eventList = new Map<string, Event>();
      return;
    }

    // Guard against invalid EventList JSON in localStorage
    const eventListNames = JSON.parse(eventListNamesJSON) as string[];
    if (!eventListNames) throw new Error("EventList is invalid JSON");

    // Store the condensed events in the eventList
    this.condensedEvents = new Map<string, CondensedEvent>(
      eventListNames.map((name) => {
        // Guard against null event in localStorage
        const condensedEventJSON = localStorage.getItem(`event-${name}`);
        if (!condensedEventJSON) throw new Error(`'${name}' not found`);

        // Guard against invalid event JSON in localStorage
        const parsedCondensedEventJSON = JSON.parse(condensedEventJSON);
        if (!parsedCondensedEventJSON)
          throw new Error(`'${name}' is invalid JSON`);

        const condensedEvent = new CondensedEvent(parsedCondensedEventJSON);

        return [name, condensedEvent];
      }),
    );
  }

  private inflate() {
    // Create Event object references from the condensedEvents
    this.eventList = new Map<string, Event>(
      Array.from(this.condensedEvents.entries()).map(
        ([name, condensedEvent]) => {
          return [name, condensedEvent.basicInflate()];
        },
      ),
    );

    // Add locations and schedules to the Event objects
    this.eventList.forEach((event) => {
      const condensedLocations = this.condensedEvents.get(
        event.name,
      )?.condensedLocations;
      let locations = condensedLocations?.map((condensedLocation) =>
        condensedLocation.inflate(),
      );
      if (locations === undefined) locations = [];
      event.setLocations(locations);

      const condensedSchedule = this.condensedEvents.get(
        event.name,
      )?.condensedSchedule;
      let schedule = condensedSchedule?.inflate();
      if (schedule === undefined)
        schedule = new Schedule({
          children: [],
          collisions: [],
          parent: event,
        });
      event.setSchedule(schedule);
    });
  }

  public static getList(): EventStore {
    if (!EventStore.instance) {
      EventStore.instance = new EventStore();
      EventStore.instance.inflate();
    }
    return EventStore.instance;
  }

  public allEventNames(): string[] {
    return [...this.eventList.keys()];
  }

  public create(eventInitInfo: { name: string; length: number }): Event {
    const newEvent = new Event(eventInitInfo);
    this.eventList.set(newEvent.name, newEvent);
    this.condensedEvents.set(newEvent.name, newEvent.condense());
    localStorage.setItem(
      "EventList",
      JSON.stringify([...this.eventList.keys()]),
    );
    localStorage.setItem("event-" + newEvent.name, JSON.stringify(newEvent));
    return newEvent;
  }

  public remove(eventName: string) {
    this.eventList.delete(eventName);
    this.condensedEvents.delete(eventName);
    localStorage.setItem(
      "EventList",
      JSON.stringify([...this.eventList.keys()]),
    );
    localStorage.removeItem("event-" + eventName);
  }

  public getEvent(eventName: string): Event {
    const event = this.eventList.get(eventName);
    if (event === undefined) throw new Error(`Event ${eventName} not found`);
    return event;
  }
}
