import React, { Dispatch, SetStateAction } from "react";

export const Slider: React.FC<{
  value: number;
  setValue: Dispatch<SetStateAction<number>>;
}> = ({ value, setValue }) => {
  return (
    <input
      type="range"
      className={"slider"}
      min={0}
      max={100}
      value={value}
      onChange={({ target }) => {
        setValue(+target.value);
      }}
    />
  );
};
export const Switch: React.FC<{
  value: boolean;
  setValue: Dispatch<SetStateAction<boolean>>;
}> = ({ value, setValue }) => (
  <label className="switch">
    <input type="checkbox" onChange={() => setValue(!value)} checked={!value} />
    <span className="slide" />
  </label>
);
