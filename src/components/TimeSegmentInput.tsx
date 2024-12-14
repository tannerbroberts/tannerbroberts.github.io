import { TimeInputPart, params_setLengthFromParts } from "./LengthInput";

const timeSegmentInputCSS = ({
  digitCount,
}: {
  digitCount: number;
}): Object => ({
  width: `${digitCount * 10 + 20}px`,
});
export default function TimeSegmentInput({
  value,
  setLengthFromParts,
  partType,
  placeholder,
}: {
  value: string;
  setLengthFromParts: (params: params_setLengthFromParts) => void;
  partType: TimeInputPart;
  placeholder: string;
}): React.JSX.Element {
  // For normal character input chnages
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numberValue: number = parseInt(e.target.value) || 0;
    setLengthFromParts({ value: numberValue, partType });
  };

  // For special cases "Backspace", "ArrowUp", "ArrowDown"
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.target as HTMLInputElement;
    // Handle backspace
    if (e.key === "Backspace") {
      if (input.value.length === 1) {
        setLengthFromParts({ value: 0, partType });
      } else if (input.value.length > 1) {
        setLengthFromParts({
          value: parseInt(input.value),
          partType,
        });
      } else if (input.value.length === 0) {
        // Do nothing
      }
    } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      let numberValue = parseInt(input.value) || 0;
      if (e.key === "ArrowUp") {
        numberValue++;
        setLengthFromParts({ value: numberValue, partType });
      } else if (e.key === "ArrowDown") {
        numberValue <= 0 ? 0 : numberValue--;
        setLengthFromParts({ value: numberValue, partType });
      }
    } else {
      // Other cases are handled by onChange
    }
  };

  const shownValue = value === "0" ? "" : value;

  return (
    <input
      key={partType}
      className={"lengthSegmentInput"}
      placeholder={placeholder}
      style={timeSegmentInputCSS({ digitCount: value.toString().length })}
      type="string"
      value={shownValue}
      onChange={onChange}
      onKeyDown={onKeyDown}
    />
  );
}
