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
  onChange,
  partType,
  placeholder,
}: {
  value: string;
  onChange: (params: params_setLengthFromParts) => void;
  partType: TimeInputPart;
  placeholder: string;
}): React.JSX.Element {
  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value: string | number = parseInt(e.target.value);
    if (typeof value !== "number") return;
    onChange({ value, partType });
  };
  const onKeyDownHandler = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    let value: number = parseInt(target.value);
    if (typeof value !== "number") return;
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      if (e.key === "ArrowDown") {
        if (typeof value !== "number") return;
        value++;
        onChange({ value, partType });
      } else if (e.key === "ArrowUp") {
        value--;
        // TODO get number value from input
        onChange({ value, partType });
      }
    }
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
      onKeyDown={onKeyDownHandler}
    />
  );
}
