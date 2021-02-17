import React from "react";
import "./scales";
import { adjacentTo, hasAug2nd, hasDoubleHalfSteps, patterns } from "./scales";
import { Note, notes, NUM_NOTES } from "./notes";
import { start, Synth } from "tone";
import * as d3 from "d3";
import "./styles.scss";
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
} from "./util";
import { Slider, Switch } from "./components";

type Scale = { root: number; steps: Steps };

export default function App(): JSX.Element {
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

  const containerSize = Math.min(width / 2, height / 2);
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
      root
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

  function getTurn(i: number) {
    return i / noteNames.length - 1 / 4;
  }
  const scaleIndices = new Set(cumSum(scale.steps, scale.root));
  let allIndices = Array.from(Array(NUM_NOTES).keys());
  const getColor = (i: number) => {
    if (
      state.loaded &&
      state.notesToPlay.length > 0 &&
      modNotes(state.notesToPlay[0]) === i
    )
      return playingColor;
    if (scaleIndices.has(i)) return highlightColor;
    return foregroundColor;
  };

  return (
    <div className={"flex-column full-height"}>
      <header id="masthead" className="site-header" role="banner">
        <hgroup>
          <h1 className="site-title">
            <a
              href="/"
              title="Violin Lessons Lancaster PA   .  Decades of Teaching Experience"
              rel="home"
            >
              Violin Lessons Lancaster PA . Decades of Teaching Experience
            </a>
          </h1>
          <h2 className="site-description">
            Christopher Brooks, 717.291.9123, kenorjazz@gmail.com
          </h2>
        </hgroup>
      </header>
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

      <div
        className={
          "relative width-100-percent flex-column justify-content-center full-height"
        }
        style={
          {
            "--m": notes.length,
            "--fg": foregroundColor,
            "--hl": highlightColor,
            "--ll": lowlightColor,
            "--pl": playingColor,
          } as any
        }
      >
        <div
          className={
            "inside-necklace-height flex-column space-evenly center-text"
          }
        >
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
        {notes.map((_, i: number) => {
          let classNames = [
            "droplet",
            "center",
            "offset-angle",
            "button",
            "border-color",
          ];
          if (moveRoot) {
            classNames = classNames.concat(classNames, ["no-pointer-events"]);
          }
          return (
            <button
              aria-controls="noteSequence"
              className={classNames.join(" ")}
              aria-label={noteNames[i]}
              style={
                {
                  "--color": getColor(i),
                  "--turn": getTurn(i),
                } as any
              }
              onClick={() => {
                if (moveRoot) {
                  setScale({ ...scale, root: i });
                } else if (included) {
                  const steps = rotate(steps1, modIndices.indexOf(i));
                  setScale({ ...scale, steps });
                }
              }}
            />
          );
        })}
        {notes.map((note: Note, i: number) => {
          let turn = getTurn(i + root);

          let classNames = [
            "droplet",
            "offset-angle",
            "text-color",
            "medium-font",
            "center",
            "invert-on-hover",
          ];
          if (!moveRoot) {
            classNames = classNames.concat(classNames, ["no-pointer-events"]);
          }
          const sharpName = note.sharp.replace(/(\w)#/, "$1♯");
          const flatName = note.flat.replace(/(\w)b/, "$1♭");
          return (
            <div
              className={classNames.join(" ")}
              style={{ "--turn": turn, "--color": getColor(i) } as any}
              id={`note${root + i}`}
              key={i}
              onClick={() => setScale({ ...scale, root: root + i })}
            >
              <div style={{ "--turn": turn } as any} className={"rotate"}>
                {`${sharpName} / ${flatName}`}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
