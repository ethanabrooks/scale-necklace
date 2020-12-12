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

type Scale = { root: number; steps: Steps };

export default function App(): JSX.Element {
  const [offset, setOffset]: [
    number,
    React.Dispatch<React.SetStateAction<number>>
  ] = React.useState<number>(0);
  const [scaleHistory, setScaleHistory] = React.useState<Scale[]>([
    {
      root: 0,
      steps: patterns[0],
    },
  ]);
  const [scaleChoice, setScaleChoice] = React.useState<number>(0);
  const scale = scaleHistory[scaleChoice];
  const root = scale.root;
  function setScale(scale: Scale) {
    setScaleChoice(scaleHistory.length);
    setScaleHistory(scaleHistory.concat(scale));
  }
  const [moveRoot, setMoveRoot] = React.useState<boolean>(true);
  const [doubleHalfStepsProb, setDoubleHalfStepsProb] = React.useState<number>(
    prob(hasDoubleHalfSteps)
  );
  const [aug2ndProb, setAug2ndProb] = React.useState<number>(prob(hasAug2nd));
  // const [stepsBetween, setStepsBetween] = React.useState<Steps>(
  //   randomSteps(patterns, aug2ndProb, doubleHalfStepsProb) as Steps
  // );
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
      if (key === "m") {
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
    const root = randomNumber(notes.length);
    setScale({ ...scale, root });
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

  const steps1 = scale.steps;
  const absIndices: Indices = cumSum(steps1, root);
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
      setScale({ ...scale, steps });
    }
  };

  const setRandomAdjacentScale = () => {
    const adjacent = adjacentTo(steps1);
    const steps = randomSteps(adjacent, aug2ndProb, doubleHalfStepsProb);
    if (steps === null) {
      alert("No adjacent scale possible.");
      console.log(steps1);
    } else {
      setScale({ ...scale, steps });
    }
  };
  const centerButtonClassName =
    "button large-font z-1000 no-border curved-radius auto-margin";
  const staticTextClassName = "low-light-color medium-font auto-margin";

  function turn(i: number) {
    return (r: number) => (r - i) / noteNames.length - 1 / 4;
  }

  return (
    <div
      className={"relative"}
      style={
        {
          "--containerSize": `${containerSize}px`,
          "--m": notes.length,
          "--fg": foregroundColor,
          "--hl": highlightColor,
          "--ll": lowlightColor,
          "--pl": playingColor,
        } as any
      }
    >
      <div
        id="noteSequence"
        aria-live={"assertive"}
        className={"absolute z-1000 invisible"}
        tabIndex={0}
      >
        {modIndices.map((i) => noteNames[i].split("/")[0]).join(",")}
      </div>
      <div className={"absolute"}>
        <button
          className={centerButtonClassName}
          onClick={() => setScaleChoice(scaleChoice - 1)}
          disabled={scaleChoice === 0}
        >
          ⇦
        </button>
        <button
          className={centerButtonClassName}
          onClick={() => setScaleChoice(scaleChoice + 1)}
          disabled={scaleChoice === scaleHistory.length - 1}
        >
          ⇨
        </button>
      </div>
      <div className={"fixed center height-necklace width-100-percent"}>
        <div className={"column space-around center-text absolute"}>
          <button className={centerButtonClassName} onClick={setRandomRoot}>
            Randomize Root
          </button>
          <button className={centerButtonClassName} onClick={setRandomScale}>
            Randomize Scale
          </button>
          <button
            className={centerButtonClassName}
            onClick={setRandomAdjacentScale}
          >
            Random Adjacent Scale
          </button>
          <button
            className={centerButtonClassName}
            onClick={() => setNotesToPlay(absIndices)}
            aria-pressed={playing}
          >
            {playing ? "Pause" : "Play"}
          </button>
          <span className={staticTextClassName}>
            Click on a note or shift-click on a yellow note.
          </span>
          <Switch value={moveRoot} setValue={setMoveRoot} />
          <span className={staticTextClassName}>
            Probability of consecutive half-steps
          </span>
          <Slider
            value={doubleHalfStepsProb}
            setValue={setDoubleHalfStepsProb}
          />
          <span className={staticTextClassName}>
            Probability of augmented 2nd
          </span>
          <Slider value={aug2ndProb} setValue={setAug2ndProb} />
        </div>
      </div>
      <div className={"fixed center"}>
        <div className={"absolute width-100-percent height-100-percent"}>
          {arcInfo.map(([[absIndex, included, color], d], i: number) => (
            <animated.button
              aria-controls="noteSequence"
              className={"offset-angle pearl-shape button border-color"}
              aria-label={noteNames[absIndex]}
              style={
                {
                  "--color": color,
                  "--turn": springOffset.interpolate(turn(i)),
                } as any
              }
              onClick={() => {
                const newOffset = modNotes(offset + (absIndex - root));
                // setNotesToPlay([]);
                if (moveRoot) {
                  setScale({ ...scale, root: absIndex });
                } else if (included) {
                  setOffset(newOffset);
                  const steps = rotate(steps1, modIndices.indexOf(absIndex));
                  setScale({ ...scale, steps });
                }
              }}
            />
          ))}
          <div className={"absolute width-100-percent height-100-percent"}>
            {noteNamesInfo.map(([name, color], i) => (
              <animated.span
                className={
                  "offset-angle text-color diff-blend-mode no-pointer-events medium-font"
                }
                style={
                  {
                    "--turn": springRoot.interpolate(turn(i + root)),
                    "--color": color,
                  } as any
                }
                id={`note${root + i}`}
                key={i}
              >
                {name}
              </animated.span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
