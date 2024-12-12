import React, { MutableRefObject } from "react";

type TimeInputPart =
  | "years"
  | "months"
  | "days"
  | "hours"
  | "minutes"
  | "seconds"
  | "milliseconds";
const TimePartsInMilliseconds = {
  years: 31536000000,
  months: 2628000000,
  days: 86400000,
  hours: 3600000,
  minutes: 60000,
  seconds: 1000,
  milliseconds: 1,
} as { [key in TimeInputPart]: number };

type props_LengthInput = {
  length: number;
  setLength: (length: number) => void;
};

type params_setLengthFromParts = {
  partType: TimeInputPart;
  e: React.ChangeEvent<HTMLInputElement>;
};

export default function LengthInput({
  length,
  setLength,
}: props_LengthInput): React.ReactElement {
  const parts = useTimeIntervalPartRefs(length);

  // Runs for each part of the time interval when the value changes
  const setLengthFromParts = React.useCallback(
    ({ partType, e }: params_setLengthFromParts) => {
      const value = parseInt(e.target.value);
      if (e.target.value === "") parts.current[partType] = 0;
      else if (isNaN(value))
        return; // Order matters here, as isNaN("") returns false
      else parts.current[partType] = value;
      const newLength = Object.entries(parts.current).reduce(
        (acc: number, [ptype, pval]) => {
          return acc + pval * TimePartsInMilliseconds[ptype as TimeInputPart];
        },
        0,
      );
      setLength(newLength);
    },
    [parts, setLength],
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
      value: parts.current[partType].toString(),
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
        border: "px solid black",
        borderRadius: "5px",
      }}
    >
      {TimeSegmentInputs.map(({ value, partType, label }) => (
        <>
          <TimeSegmentInput
            value={value}
            placeholder={label}
            onChange={setLengthFromParts}
            partType={partType}
          />
          :
        </>
      ))}
      <p style={{ paddingLeft: "20px", paddingRight: "20px" }}>{length} ms</p>
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

const timeSegmentInputCSS = ({
  digitCount,
}: {
  digitCount: number;
}): Object => ({
  width: `${digitCount * 10 + 20}px`,
  fontWeight: "bold",
  placeHolderColor: "black",
  border: "none",
});
function TimeSegmentInput({
  value,
  onChange,
  partType,
  placeholder,
}: {
  value: string;
  onChange: Function;
  partType: TimeInputPart;
  placeholder: string;
}): React.JSX.Element {
  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    let parsedInput: string | number = parseInt(e.target.value);
    if (typeof parsedInput !== "number") return;
    if (parsedInput <= 0) parsedInput = "";
    onChange({ e, partType });
  };

  const shownValue = value === "0" ? "" : value;

  return (
    <input
      className={"lengthSegmentInput"}
      placeholder={placeholder}
      style={timeSegmentInputCSS({ digitCount: value.toString().length })}
      type="string"
      value={shownValue}
      onChange={onChangeHandler}
    />
  );
}
