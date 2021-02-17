import React, { Dispatch, SetStateAction } from "react";

export const Slider: React.FC<{
  value: number;
  setValue: Dispatch<SetStateAction<number>>;
}> = ({ value, setValue }) => (
  <label className="relative">
    <input
      type="range"
      className={"width-100 translate-minus-50 slide absolute"}
      min={0}
      max={100}
      step={10}
      value={value}
      onChange={({ target }) => {
        setValue(+target.value);
      }}
    />
  </label>
);
export const Switch: React.FC<{
  value: boolean;
  setValue: Dispatch<SetStateAction<boolean>>;
}> = ({ value, setValue }) => (
  <label className="relative">
    <input
      className={"invisible"}
      type="checkbox"
      onChange={() => setValue(!value)}
      checked={!value}
    />
    <span className="slide switch absolute center" />
  </label>
);
