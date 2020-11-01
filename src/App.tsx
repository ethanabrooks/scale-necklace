import React, { Dispatch, SetStateAction } from "react";
import "./scales";
import { hasAug2nd, hasDoubleHalfSteps } from "./scales";
import { Note, notes } from "./notes";
import { start, Synth } from "tone";
import * as d3 from "d3";
import "./styles.scss";
import { animated, useSpring } from "react-spring";
import { zip } from "fp-ts/Array";
import {
  highlightColor,
  foregroundColor,
  modNotes,
  playingColor,
  prob,
  randomNumber,
  randomSteps,
  rotate,
  State,
  Steps,
  useNearestModulo,
  lowlightColor,
} from "./util";

const Slider: React.FC<{
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

const Switch: React.FC<{
  value: boolean;
  setValue: Dispatch<SetStateAction<boolean>>;
}> = ({ value, setValue }) => (
  <label className="switch">
    <input
      type="checkbox"
      onClick={() => setValue(!value)}
      defaultChecked={!value}
    />
    <span className="slide" />
  </label>
);

export default function App(): JSX.Element {
  const [offset, setOffset]: [
    number,
    React.Dispatch<React.SetStateAction<number>>
  ] = React.useState<number>(0);
  const [root, setRoot] = React.useState<number>(0);
  const [moveRoot, setMoveRoot] = React.useState<boolean>(true);
  const [doubleHalfStepsProb, setDoubleHalfStepsProb] = React.useState<number>(
    prob(hasDoubleHalfSteps)
  );
  const [aug2ndProb, setAug2ndProb] = React.useState<number>(prob(hasAug2nd));
  const [stepsBetween, setStepsBetween] = React.useState<Steps>(
    randomSteps(aug2ndProb, doubleHalfStepsProb)
  );
  const [state, setState] = React.useState<State>({ loaded: false });
  const [{ width, height }, setWindow] = React.useState<{
    width: number;
    height: number;
  }>({ width: window.innerWidth, height: window.innerHeight });
  const synth = React.useMemo(() => new Synth(), []);
  const targetRoot = useNearestModulo(root, notes.length);
  const targetOffset = useNearestModulo(offset, notes.length);
  const { springRoot, springOffset } = useSpring({
    springRoot: targetRoot,
    springOffset: targetOffset,
    config: { tension: 200, friction: 120, mass: 10 },
  });

  const playing: boolean = state.loaded && state.notesToPlay.length > 0;
  const octave: number = 3;

  React.useEffect(() => {
    const resizeListener = () =>
      setWindow({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", resizeListener);
    return () => {
      window.removeEventListener("resize", resizeListener);
    };
  }, [setWindow]);

  React.useEffect(() => {
    const keyDownListener = ({ key }: { key: string }) => {
      if (key === "Shift") setMoveRoot(false);
      if (key === "Enter") {
        setMoveRoot(!moveRoot);
      }
    };
    const keyUpListener = ({ key }: { key: string }) => {
      if (key === "Shift") setMoveRoot(true);
    };
    window.addEventListener("keydown", keyDownListener);
    window.addEventListener("keyup", keyUpListener);
    return () => {
      window.removeEventListener("keydown", keyDownListener);
      window.removeEventListener("keyup", keyUpListener);
    };
  }, [moveRoot, setMoveRoot]);

  React.useEffect(() => {
    if (state.loaded) {
      const [head, ...tail]: Steps = state.notesToPlay;
      if (playing) {
        let interval: number | null = null;
        const note = notes[head % notes.length];
        synth.triggerAttack(
          `${note.sharp}${head < notes.length ? octave : octave + 1}`
        );
        // @ts-ignore
        interval = setInterval(() => {
          setState({ ...state, notesToPlay: tail });
        }, 300);
        return () => {
          synth.triggerRelease();
          if (interval) clearInterval(interval);
        };
      }
    } else {
      synth.toDestination();
      setState({
        loaded: true,
        notesToPlay: [],
      });
    }
  }, [state, playing]);

  const containerSize = Math.min(width - 30, height - 30);
  const arcSize = (2 * Math.PI) / notes.length;
  const arcGen = d3
    .arc<number>()
    .padAngle(0.1)
    .innerRadius(containerSize / 2.9)
    .outerRadius(containerSize / 2)
    .startAngle((i: number) => (i - 0.5) * arcSize)
    .endAngle((i: number) => (i + 0.5) * arcSize)
    .cornerRadius(containerSize);
  const arcs = notes.map((_, i) => arcGen(i) as string);
  const fontSize = `${containerSize / 50}pt`;
  const fontStyle = { "--f": fontSize } as any;
  const randomAdjacent = () => {};
  const setRandomRoot = () => {
    setRoot(randomNumber(notes.length));
    setOffset(0);
    setNotesToPlay([]);
  };
  const setNotesToPlay = (notes: Steps) => {
    if (state.loaded) {
      if (playing) {
        setState({ ...state, notesToPlay: [] });
      } else {
        start().then(() => setState({ ...state, notesToPlay: notes }));
      }
    }
  };

  const absIndices: Steps = stepsBetween.reduce(
    (soFar: Steps, n: number) => soFar.concat(soFar[soFar.length - 1] + n),
    [root]
  );
  const modIndices = absIndices.map((i) => i % notes.length);
  const included = notes.map((_, i) => modIndices.includes(i));
  const colors = included.map((inc, i) => {
    if (
      state.loaded &&
      state.notesToPlay.length > 0 &&
      modNotes(state.notesToPlay[0]) === i
    )
      return playingColor;
    if (inc) return highlightColor;
    return foregroundColor;
  });
  const arcInfo: [[number, boolean, string], string][] = zip(
    rotate(
      zip(included, colors).map(([...x], i) => [i, ...x]),
      root - offset
    ),
    arcs
  );

  const noteNames = notes.map((note: Note) =>
    note.sharp === note.flat
      ? note.sharp
      : `${note.sharp}/${note.flat}`
          .replace(/(\w)#/, "$1♯")
          .replace(/(\w)b/, "$1♭")
  );
  const noteNamesInfo = rotate(zip(noteNames, colors), root);

  const setRandomScale = () => {
    return setStepsBetween(randomSteps(aug2ndProb, doubleHalfStepsProb));
  };
  return (
    <div
      className={"container"}
      style={{ "--s": `${containerSize}px`, "--m": notes.length } as any}
    >
      <div className={"buttons"}>
        <button style={fontStyle} onClick={setRandomRoot}>
          Randomize Root
        </button>
        <button style={fontStyle} onClick={setRandomScale}>
          Randomize Scale
        </button>
        <button style={fontStyle} onClick={setRandomScale}>
          Random adjacent Scale
        </button>
        <button
          style={fontStyle}
          onClick={() => setNotesToPlay(absIndices)}
          aria-pressed={playing}
        >
          {playing ? "Pause" : "Play"}
        </button>
        <span style={{ ...fontStyle, color: lowlightColor } as any}>
          Click on a note or shift-click on a yellow note.
        </span>
        <Switch value={moveRoot} setValue={setMoveRoot} />
        <span>Probability of consecutive half-steps</span>
        <Slider value={doubleHalfStepsProb} setValue={setDoubleHalfStepsProb} />
        <span>Probability of augmented 2nd</span>
        <Slider value={aug2ndProb} setValue={setAug2ndProb} />
      </div>
      <animated.div
        className={"necklace"}
        style={{ "--r": springOffset.interpolate((r: number) => -r) } as any}
      >
        {arcInfo.map(([[absIndex, included, color], d], i: number) => (
          <svg className={"svg"} key={i} style={{ "--c": color } as any}>
            <path
              className={"path"}
              stroke={color}
              d={d}
              aria-labelledby={`note${absIndex}`}
              role={"button"}
              tabIndex={0}
              onClick={() => {
                const newOffset = modNotes(offset + (absIndex - root));
                // setNotesToPlay([]);
                if (moveRoot) {
                  setRoot(absIndex);
                } else if (included) {
                  setOffset(newOffset);
                  setStepsBetween(
                    rotate(stepsBetween, modIndices.indexOf(absIndex))
                  );
                }
              }}
            />
          </svg>
        ))}
        <animated.div
          className={"note-names"}
          style={{ "--a": springRoot.interpolate((r) => root - r) } as any}
        >
          {noteNamesInfo.map(([name, color], i) => (
            <span
              style={{ "--i": i, "--c": color, ...fontStyle } as any}
              id={`note${root + i}`}
              key={i}
            >
              {name}
            </span>
          ))}
        </animated.div>
      </animated.div>
    </div>
  );
}
