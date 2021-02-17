import React from "react";
import "./scales";
import { adjacentTo, hasAug2nd, hasDoubleHalfSteps, patterns } from "./scales";
import { Note, notes } from "./notes";
import { start, Synth } from "tone";
import "./styles.scss";
import {
  Action,
  cumSum,
  foregroundColor,
  highlightColor,
  Indices,
  lowlightColor,
  mod,
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

type Scale = { root: number; steps: Steps; rootStep: number };

export default function App(): JSX.Element {
  const [scaleHistory, setScaleHistory] = React.useState<Scale[]>([
    {
      root: 0,
      rootStep: 0,
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

  const setRandomScale = () => {
    const steps = randomSteps(patterns, aug2ndProb, doubleHalfStepsProb);
    if (steps === null) {
      alert("No valid scale.");
    } else {
      setScale({ ...scale, rootStep: 0, steps });
    }
  };

  const getName = ({ sharp, flat }: Note) => {
    const sharpName = sharp.replace(/(\w)#/, "$1♯");
    const flatName = flat.replace(/(\w)b/, "$1♭");
    return sharpName === flatName ? sharpName : `${sharpName} / ${flatName}`;
  };
  const noteNames = notes.map(getName);

  const setRandomAdjacentScale = () => {
    const adjacent = adjacentTo(scale.steps);
    const steps = randomSteps(adjacent, aug2ndProb, doubleHalfStepsProb);
    if (steps === null) {
      alert("No adjacent scale possible.");
    } else {
      setScale({ ...scale, steps });
    }
  };
  const centerButtonClassName =
    "button large-font z-1000 no-border curved-radius auto-margin";
  const staticTextClassName = "low-light-color medium-font auto-margin";

  const modNotes = (scale: number[]) => scale.map((i) => mod(i, notes.length));
  const steps = rotate(scale.steps, scale.rootStep);
  const indices = cumSum(steps, scale.root);
  const notesIndices = modNotes(indices);
  const stepsIndices = modNotes(cumSum(scale.steps));
  const stepsOffset =
    scale.rootStep === 0
      ? 0
      : scale.steps.slice(0, scale.rootStep).reduce((sum, n) => sum + n);

  const getColor = (i: number, indices: number[]) => {
    if (
      state.loaded &&
      state.notesToPlay.length > 0 &&
      mod(state.notesToPlay[0], notes.length) === i
    )
      return playingColor;
    if (indices.includes(i)) return highlightColor;
    return foregroundColor;
  };

  const turnSteps = useNearestModulo(-stepsOffset / notes.length, 1);
  const turnNotes = useNearestModulo(-root / notes.length, 1);

  return (
    <div
      className={"flex-column full-height"}
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
        {notesIndices.map((i) => noteNames[i]).join(",")}
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
      >
        <div
          className={
            "inside-necklace-height flex-column space-evenly center-text z-1000"
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
            onClick={() => setNotesToPlay(indices)}
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

          const turn = turnSteps + i / notes.length;
          return (
            <button
              aria-controls="noteSequence"
              className={classNames.join(" ")}
              aria-label={rotate(noteNames, stepsOffset)[i]}
              key={i}
              style={
                {
                  "--color": getColor(i, stepsIndices),
                  "--turn": turn,
                } as any
              }
              onClick={() => {
                if (!moveRoot && stepsIndices.includes(i)) {
                  setScale({
                    ...scale,
                    rootStep: stepsIndices.indexOf(i),
                  });
                }
              }}
            />
          );
        })}
        {notes.map((note: Note, i: number) => {
          let classNames = [
            "droplet",
            "offset-angle",
            "color",
            "medium-font",
            "center",
            "invert-on-hover",
          ];
          if (!moveRoot) {
            classNames = classNames.concat(classNames, ["no-pointer-events"]);
          }
          let turn = turnNotes + i / notes.length;
          return (
            <div
              className={classNames.join(" ")}
              style={
                { "--turn": turn, "--color": getColor(i, notesIndices) } as any
              }
              id={`note${i}`}
              key={i}
              onClick={() => setScale({ ...scale, root: i })}
            >
              <div
                style={{ "--turn": turn } as any}
                className={"reverse-rotate"}
              >
                {getName(note)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
