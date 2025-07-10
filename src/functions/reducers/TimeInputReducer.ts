export type TimeInputState = typeof initialState;
export type TimeInputAction =
  | { type: "SET_MILLIS"; payload: { millis: number } }
  | { type: "SET_SECONDS"; payload: { seconds: number } }
  | { type: "SET_MINUTES"; payload: { minutes: number } }
  | { type: "SET_HOURS"; payload: { hours: number } }
  | { type: "SET_DAYS"; payload: { days: number } }
  | { type: "SET_WEEKS"; payload: { weeks: number } }
  | { type: "SET_YEARS"; payload: { years: number } }
  | { type: "RESET" };

export const initialState = {
  total: 0,
  millis: 0,
  seconds: 0,
  minutes: 0,
  hours: 0,
  days: 0,
  weeks: 0,
  years: 0,
};

const getTotal = ({
  millis,
  seconds,
  minutes,
  hours,
  days,
  weeks,
  years,
}: {
  millis: number;
  seconds: number;
  minutes: number;
  hours: number;
  days: number;
  weeks: number;
  years: number;
}): number => {
  return (
    millis +
    seconds * 1000 +
    minutes * 1000 * 60 +
    hours * 1000 * 60 * 60 +
    days * 1000 * 60 * 60 * 24 +
    weeks * 1000 * 60 * 60 * 24 * 7 +
    years * 1000 * 60 * 60 * 24 * 365
  );
};

export default function reducer(
  previous: TimeInputState,
  action: TimeInputAction,
): TimeInputState {
  switch (action.type) {
    case "SET_MILLIS": {
      const { millis } = action.payload;
      const { ...rest } = previous;
      return {
        ...rest,
        millis,
        total: getTotal({ ...rest, millis }),
      };
    }
    case "SET_SECONDS": {
      const { seconds } = action.payload;
      const { ...rest } = previous;
      return {
        ...rest,
        seconds,
        total: getTotal({ ...rest, seconds }),
      };
    }
    case "SET_MINUTES": {
      const { minutes } = action.payload;
      const { ...rest } = previous;
      return {
        ...rest,
        minutes,
        total: getTotal({ ...rest, minutes }),
      };
    }
    case "SET_HOURS": {
      const { hours } = action.payload;
      const { ...rest } = previous;
      return {
        ...rest,
        hours,
        total: getTotal({ ...rest, hours }),
      };
    }
    case "SET_DAYS": {
      const { days } = action.payload;
      const { ...rest } = previous;
      return {
        ...rest,
        days,
        total: getTotal({ ...rest, days }),
      };
    }
    case "SET_WEEKS": {
      const { weeks } = action.payload;
      const { ...rest } = previous;
      return {
        ...rest,
        weeks,
        total: getTotal({ ...rest, weeks }),
      };
    }
    case "SET_YEARS": {
      const { years } = action.payload;
      const { ...rest } = previous;
      return {
        ...rest,
        years,
        total: getTotal({ ...rest, years }),
      };
    }
    case "RESET":
      return initialState;
    default:
      return previous;
  }
}
