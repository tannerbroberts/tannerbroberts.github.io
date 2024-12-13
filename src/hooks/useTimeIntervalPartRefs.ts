import React from "react";
import type { MutableRefObject } from "react";
import type { TimeInputPart } from "../components/LengthInput";

export default function useTimeIntervalPartRefs(
  length: number,
): MutableRefObject<{
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
