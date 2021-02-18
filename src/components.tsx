import React, { Dispatch, SetStateAction } from "react";
import { notes } from "./notes";
import { staticTextClassName, Steps, sum } from "./util";
import { isValid, Scale } from "./scales";

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

export const Form: React.FC<{ onSubmit: (scale: Scale) => void }> = ({
  onSubmit,
}) => {
  const [input, setInput] = React.useState<string | null>(null);
  const validNoteNames = notes.flatMap(({ sharp, flat }) => [sharp, flat]);
  const validNoteNamesSet = new Set(validNoteNames);

  const getSteps = (input: string): null | Steps => {
    const noteNames = input.split(" ");
    for (const name of noteNames) {
      if (!validNoteNamesSet.has(name)) {
        return null;
      }
    }
    const indices = noteNames.map((name) =>
      Math.floor(validNoteNames.indexOf(name) / 2)
    );
    let [head, ...tail] = indices;
    tail = tail.concat([head + notes.length]);
    return tail.reduce((soFar: Steps, index: number) => {
      const cumulative = head + sum(soFar);
      return soFar.concat([index - cumulative]);
    }, []);
  };

  let errorMsg = null;
  let steps = null;
  let scale: null | Scale = null;
  if (input !== null) {
    steps = getSteps(input);
    const noteNames = input.split(" ").filter((s) => s !== "");
    for (const name of noteNames) {
      if (!validNoteNamesSet.has(name)) {
        errorMsg = `${name} is not a valid note name.`;
      }
    }
    if (errorMsg === null) {
      const indices = noteNames.map((name) =>
        Math.floor(validNoteNames.indexOf(name) / 2)
      );
      let [root, ...tail] = indices;
      tail = tail.concat([root + notes.length]);
      steps = tail.reduce((soFar: Steps, index: number) => {
        const cumulative = root + sum(soFar);
        return soFar.concat([index - cumulative]);
      }, []);
      scale = { steps, root, rootStep: 0 };
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (scale !== null) {
          if (!isValid(scale.steps)) {
            const steps = scale.steps.slice(0, scale.steps.length - 1);
            alert(`${steps} is not a valid sequence of steps.`);
          }
          onSubmit(scale);
        }
      }}
      className={"auto-margin flex-row width-400"}
    >
      <label className={`${staticTextClassName} flex-row width-300`}>
        {errorMsg === null ? "Input scale" : errorMsg}
        <input
          className={"margin-left-20"}
          type="text"
          value={input === null ? "" : input}
          onChange={(e) => setInput(e.target.value)}
        />
      </label>
      <input
        className={"button no-border curved-radius"}
        type="submit"
        value="Submit"
      />
    </form>
  );
};
