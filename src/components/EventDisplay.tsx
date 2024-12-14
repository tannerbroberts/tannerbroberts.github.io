import React from "react";
import { Event } from "../eventUtils";

interface EventDisplayProps {
  event: Event;
}

const timeIncrements = [
  { unitMultiplier: 31536000000, unit: "years", unitCount: 1 },
  { unitMultiplier: 604800000, unit: "weeks", unitCount: 1 },
  { unitMultiplier: 86400000, unit: "days", unitCount: 1 },
  { unitMultiplier: 3600000, unit: "hours", unitCount: 1 },
  { unitMultiplier: 900000, unit: "minutes", unitCount: 15 },
  { unitMultiplier: 300000, unit: "minutes", unitCount: 5 },
  { unitMultiplier: 60000, unit: "minutes", unitCount: 1 },
  { unitMultiplier: 15000, unit: "seconds", unitCount: 15 },
  { unitMultiplier: 1000, unit: "seconds", unitCount: 1 },
  { unitMultiplier: 100, unit: "/ 10th seconds", unitCount: 0.1 },
  { unitMultiplier: 1, unit: "ms", unitCount: 1 },
];

const EventDisplay: React.FC<EventDisplayProps> = ({ event }) => {
  const increment = timeIncrements.find(
    (inc) => event.length / inc.unitMultiplier >= 10,
  );
  if (!increment)
    throw new Error("Event too short to display, must be at least 10ms");

  const lines = Array.from(
    { length: Math.ceil(event.length / increment.unitMultiplier) },
    (_, i) => i * increment.unitMultiplier,
  );

  return (
    <div>
      <h2>{event.name}</h2>
      <div
        style={{
          height: `${lines.length * 100}px`,
          backgroundColor: "lightblue",
          position: "relative",
        }}
      >
        {lines.map((line, index) => (
          <div
            key={line}
            style={{
              position: "absolute",
              top: `${index * 100}px`,
              width: "100%",
              borderTop: "1px solid black",
            }}
          >
            {`${Math.floor((line / increment.unitMultiplier) * increment.unitCount)} ${increment.unit}`}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventDisplay;
