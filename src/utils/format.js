import { TIME_VALUES } from "./constants";

// Format a length of milliseconds like this: ##d ##h ##m ##s
// Always use two digits, but don't print the character if the value for that unit is 0, instead print an underscore
// Example: 1d 02h 00_ 04s
export function formatMillis(milliseconds) {
  let days = Math.floor(milliseconds / TIME_VALUES.DAY);
  milliseconds %= 86_400_000;

  let hours = Math.floor(milliseconds / TIME_VALUES.HOUR);
  milliseconds %= 3_600_000;

  let minutes = Math.floor(milliseconds / TIME_VALUES.MINUTE);
  milliseconds %= 60_000;

  let seconds = Math.floor(milliseconds / TIME_VALUES.SECOND);
  milliseconds %= 1_000;

  // Format the string like this: ##day(s) ##hr(s) ##min(s) ##.###sec(s)
  let formattedString = "";

  formattedString += `${days.toString().padStart(2, "0")}${
    days !== 0 ? "d" : "_"
  } `;
  formattedString += `${hours.toString().padStart(2, "0")}${
    hours !== 0 ? "h" : "_"
  } `;
  formattedString += `${minutes.toString().padStart(2, "0")}${
    minutes !== 0 ? "m" : "_"
  } `;
  formattedString += `${seconds.toString().padStart(2, "0")}${
    seconds !== 0 ? "s" : "_"
  }`;
  return formattedString;
}

// For taking milliseconds and turning it into a long-form human readable string of time
export function formatMillis2(milliseconds) {
  let days = Math.floor(milliseconds / TIME_VALUES.DAY);
  milliseconds %= 86_400_000;
  const evenDays = milliseconds === 0;

  let hours = Math.floor(milliseconds / TIME_VALUES.HOUR);
  milliseconds %= 3_600_000;
  const evenHours = milliseconds === 0;

  let minutes = Math.floor(milliseconds / TIME_VALUES.MINUTE);
  milliseconds %= 60_000;
  const evenMinutes = milliseconds === 0;

  let seconds = Math.floor(milliseconds / TIME_VALUES.SECOND);
  milliseconds %= 1_000;
  const evenSeconds = milliseconds === 0;

  // Format the string like this: ##day(s) ##hr(s) ##min(s) ##.###sec(s)
  let formattedString = "";

  if (days > 0) {
    formattedString += `${days} day${days > 1 ? "s" : ""}${
      evenDays ? "" : ", "
    }`;
  }
  if (evenDays) return formattedString;

  formattedString += `${hours.toString().padStart(2, "0")} hour${
    hours > 1 ? "s" : ""
  }${evenHours ? "" : ", "}`;
  if (evenHours) return formattedString;

  formattedString += `${minutes.toString().padStart(2, "0")} minute${
    minutes > 1 ? "s" : ""
  }${evenMinutes ? "" : ", "}`;
  if (evenMinutes) return formattedString;

  formattedString += `${seconds.toString().padStart(2, "0")}${
    evenSeconds ? " second" : ""
  }${seconds > 1 && evenSeconds ? "s" : ""}${evenSeconds ? "" : "."}`;
  if (evenSeconds) return formattedString;

  formattedString += `${milliseconds.toString().padStart(3, "0")} seconds${
    milliseconds > 1 ? "s" : ""
  }`;
  return formattedString;
}
