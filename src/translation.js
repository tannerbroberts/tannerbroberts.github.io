export default function translation(input) {
  switch (input) {
    case "UP_NEXT": return "Up Next";
    case "DAY": return "Day";
    case "WEEK": return "Week";
    case "MONTH": return "Month";
    case "CHANGELOG": return "Changelog";
    default: return `No translation available for: ${input}`;
  }
}