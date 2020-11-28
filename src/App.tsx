import React from "react";
import "./scales";
import { adjacentTo, hasAug2nd, hasDoubleHalfSteps, patterns } from "./scales";
import { Note, notes } from "./notes";
import { start, Synth } from "tone";
import * as d3 from "d3";
import "./styles.scss";
import { animated, useSpring } from "react-spring";
import { zip } from "fp-ts/Array";
import {
  Action,
  backgroundColor,
  cumSum,
  foregroundColor,
  highlightColor,
  Indices,
  lowlightColor,
  modNotes,
  playingColor,
  prob,
  randomNumber,
  randomSteps,
  rotate,
  State,
  Steps,
  useNearestModulo,
} from "./util";
import { Slider, Switch } from "./components";

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
    randomSteps(patterns, aug2ndProb, doubleHalfStepsProb) as Steps
  );
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

  const [state, dispatch] = React.useReducer(
    (state: State, action: Action): State => {
      if (state.loaded) {
        if (action.type === "play") {
          return { ...state, notesToPlay: action.notes };
        } else if (action.type === "nextNote") {
          const [, ...notesToPlay] = state.notesToPlay;
          return { ...state, notesToPlay };
        } else if (action.type === "reset") {
          return { ...state, notesToPlay: [] };
        } else {
          throw new Error("Invalid action.type");
        }
      }
      return { loaded: true, notesToPlay: [] };
    },
    {
      loaded: false,
    }
  );

  const playing: boolean = state.loaded && state.notesToPlay.length > 0;
  const octave: number = 3;

  React.useEffect(() => {
    if (state.loaded) {
      if (playing) {
        const [head]: Indices = state.notesToPlay;
        let interval: number | null = null;
        const note = notes[head % notes.length];
        synth.triggerAttack(
          `${note.sharp}${head < notes.length ? octave : octave + 1}`
        );
        // @ts-ignore
        interval = setInterval(() => {
          dispatch({ type: "nextNote" });
        }, 500);
        return () => {
          synth.triggerRelease();
          if (interval) clearInterval(interval);
        };
      }
    } else {
      synth.toDestination();
      dispatch({ type: "reset" });
    }
  }, [state, synth, playing]);

  React.useEffect(() => {
    const resizeListener = () =>
      setWindow({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", resizeListener);
    return () => {
      window.removeEventListener("resize", resizeListener);
    };
  }, []);

  React.useEffect(() => {
    const keyDownListener = ({ key }: { key: string }) => {
      if (key === "Shift") setMoveRoot(false);
      if (key === "Enter") {
        setMoveRoot((m) => !m);
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
  }, [setMoveRoot]);

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
  const setRandomRoot = () => {
    setRoot(randomNumber(notes.length));
    setOffset(0);
    setNotesToPlay([]);
  };
  const setNotesToPlay = (notes: Indices) => {
    if (state.loaded) {
      if (playing) {
        dispatch({ type: "reset" });
      } else {
        start().then(() => dispatch({ type: "play", notes }));
      }
    }
  };

  const absIndices: Indices = cumSum(stepsBetween, root);
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
    const steps = randomSteps(patterns, aug2ndProb, doubleHalfStepsProb);
    if (steps === null) {
      alert("No valid scale.");
    } else {
      setStepsBetween(steps);
    }
  };

  const setRandomAdjacentScale = () => {
    const adjacent = adjacentTo(stepsBetween);
    const steps = randomSteps(adjacent, aug2ndProb, doubleHalfStepsProb);
    if (steps === null) {
      alert("No adjacent scale possible.");
      console.log(stepsBetween);
    } else {
      return setStepsBetween(steps);
    }
  };
  return (
    <div
      className={"container"}
      style={
        {
          "--s": `${containerSize}px`,
          "--m": notes.length,
          "--bg": backgroundColor,
          "--fg": foregroundColor,
          "--hl": highlightColor,
          "--ll": lowlightColor,
          "--pl": playingColor,
        } as any
      }
    >
      <div className={"buttons"}>
        <button className={"button"} onClick={setRandomRoot}>
          Randomize Root
        </button>
        <button className={"button"} onClick={setRandomScale}>
          Randomize Scale
        </button>
        <button className={"button"} onClick={setRandomAdjacentScale}>
          Random adjacent Scale
        </button>
        <button
          className={"button"}
          onClick={() => setNotesToPlay(absIndices)}
          aria-pressed={playing}
        >
          {playing ? "Pause" : "Play"}
        </button>
        <span className={"static"}>
          Click on a note or shift-click on a yellow note.
        </span>
        <Switch value={moveRoot} setValue={setMoveRoot} />
        <span className={"static"}>Probability of consecutive half-steps</span>
        <Slider value={doubleHalfStepsProb} setValue={setDoubleHalfStepsProb} />
        <span className={"static"}>Probability of augmented 2nd</span>
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
              style={{ "--i": i, "--c": color } as any}
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
