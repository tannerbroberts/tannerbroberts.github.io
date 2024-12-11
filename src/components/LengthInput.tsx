import React, { MutableRefObject } from "react";

type TimeInputPart =
  | "years"
  | "months"
  | "days"
  | "hours"
  | "minutes"
  | "seconds"
  | "milliseconds";

export default function LengthInput({
  length,
  setLength,
}: {
  length: number;
  setLength: (length: number) => void;
}) {
  const parts = useTimeIntervalPartRefs(length);

  // Runs for each part of the time interval when the value changes
  const setLengthFromParts = React.useCallback(
    ({
      partType,
      e,
    }: {
      partType: TimeInputPart;
      e: React.ChangeEvent<HTMLInputElement>;
    }) => {
      const value = parseInt(e.target.value);
      if (isNaN(value)) return; // Ensure value is a number
      parts.current[partType] = value;
      console.log("parts.current", parts.current, partType, value);
      setLength(
        parts.current.years * 31536000000 +
          parts.current.months * 2628000000 +
          parts.current.days * 86400000 +
          parts.current.hours * 3600000 +
          parts.current.minutes * 60000 +
          parts.current.seconds * 1000 +
          parts.current.milliseconds,
      );
    },
    [setLength, parts],
  );

  const TimeSegmentInputs = React.useMemo(() => {
    return (
      [
        ["years", "Yrs"],
        ["months", "Mo"],
        ["days", "D"],
        ["hours", "H"],
        ["minutes", "M"],
        ["seconds", "S"],
        ["milliseconds", "Ms"],
      ] as const
    ).map(([partType, label]) => ({
      value: parts.current[partType],
      partType,
      label,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    parts.current.years,
    parts.current.months,
    parts.current.days,
    parts.current.hours,
    parts.current.minutes,
    parts.current.seconds,
    parts.current.milliseconds,
    parts,
  ]);

  return (
    <div
      style={{
        display: "flex",
        border: "2px solid black",
        borderRadius: "5px",
      }}
    >
      {TimeSegmentInputs.map(({ value, partType, label }) => (
        <LabeledTimeSegment key={partType}>
          <p style={{ fontFamily: "monospace" }}>{label}</p>
          <TimeSegmentInput
            value={value}
            onChange={setLengthFromParts}
            partType={partType}
          />
        </LabeledTimeSegment>
      ))}
      <p>{length}</p>
    </div>
  );
}

function useTimeIntervalPartRefs(length: number): MutableRefObject<{
  [key in TimeInputPart]: number;
}> {
  const timeUnits = [
    { unit: "years", ms: 31536000000 },
    { unit: "months", ms: 2628000000 },
    { unit: "days", ms: 86400000 },
    { unit: "hours", ms: 3600000 },
    { unit: "minutes", ms: 60000 },
    { unit: "seconds", ms: 1000 },
    { unit: "milliseconds", ms: 1 },
  ] as const;

  const parts = React.useRef(
    timeUnits.reduce(
      (acc, { unit, ms }) => {
        acc[unit] = Math.floor(length / ms);
        length %= ms;
        return acc;
      },
      {} as { [key in TimeInputPart]: number },
    ),
  );

  return parts;
}

const labeledTimeSegmentCSS = {
  width: "min-content",
  height: "min-content",
  fontWeight: "bold",
  backgroundColor: "lightgray",
  fontFamily: "monospace",
};
function LabeledTimeSegment({ children }: { children: React.ReactNode }) {
  return <div style={labeledTimeSegmentCSS}>{children}</div>;
}

const timeSegmentInputCSS = ({ digitCount }: { digitCount: number }): Object => ({
  width: `${digitCount * 10 + 20}px`,
  fontWeight: "bold",
  border: "none",
  backgroundColor: "lightgray",
});
function TimeSegmentInput({
  value,
  onChange,
  partType,
}: {
  value: number;
  onChange: ({
    e,
    partType,
  }: {
    e: React.ChangeEvent<HTMLInputElement>;
    partType: TimeInputPart;
  }) => void;
  partType: TimeInputPart;
}): React.JSX.Element {
  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (typeof parseInt(e.target.value) !== "number") return;
    onChange({ e, partType });
  };

  return (
    <input
      style={timeSegmentInputCSS({ digitCount: value.toString().length })}
      type="number"
      value={value}
      onChange={onChangeHandler}
    />
  );
}
