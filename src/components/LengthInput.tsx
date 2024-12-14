import React from "react";
import useTimeIntervalPartRefs from "../hooks/useTimeIntervalPartRefs";
import TimeSegmentInput from "./TimeSegmentInput";

export type TimeInputPart =
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

export type params_setLengthFromParts = {
  partType: TimeInputPart;
  value: number;
};

export default function LengthInput({
  length,
  setLength,
}: props_LengthInput): React.ReactElement {
  const parts = useTimeIntervalPartRefs(length);

  // Passed for each TimeSegmentInput
  const setLengthFromParts = React.useCallback(
    ({ partType, value }: params_setLengthFromParts) => {
      parts.current[partType] = value;
      const newLength = Object.entries(parts.current).reduce(
        (acc: number, [pType, pValue]) => {
          return acc + pValue * TimePartsInMilliseconds[pType as TimeInputPart];
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
      key="lengthInput"
      style={{
        border: "px solid black",
        borderRadius: "5px",
      }}
    >
      {TimeSegmentInputs.map(({ value, partType, label }) => (
        <React.Fragment key={partType}>
          <TimeSegmentInput
            value={value}
            placeholder={label}
            setLengthFromParts={setLengthFromParts}
            partType={partType}
          />
          :
        </React.Fragment>
      ))}
      <p style={{ paddingLeft: "20px", paddingRight: "20px" }}>{length} ms</p>
    </div>
  );
}
