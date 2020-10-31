import React, { useEffect, useState } from "react";
import "./scales";
import { scales } from "./scales";
import { Note, notes } from "./notes";
import { start, Synth } from "tone";
import * as d3 from "d3";
import "./styles.scss";
import { animated, useSpring } from "react-spring";
import { zip } from "fp-ts/Array";

const highlightColor = getComputedStyle(
  document.documentElement
).getPropertyValue("--hl");
const lowLightColor = getComputedStyle(
  document.documentElement
).getPropertyValue("--ll");
const playingColor = getComputedStyle(
  document.documentElement
).getPropertyValue("--pl");

export type Scale = number[];
export type State =
  | { loaded: false }
  | {
      loaded: true;
      synth: Synth;
      notesToPlay: Scale;
    };

function randomNumber(n: number): number {
  return Math.floor(Math.random() * n);
}

function rotate<X>(array: X[], start: number) {
  let modStart = mod(start, array.length);
  return array.slice(modStart).concat(array.slice(0, modStart));
}

function mod(a: number, b: number) {
  return ((a % b) + b) % b;
}

function modNotes(a: number) {
  return mod(a, notes.length);
}

// useNearestModulo returns a value minimizing the distance traveled around a
// circle. It always satisfies useNearestModulo(P, M) % M = P.
//
// useNearestModulo(P', M) = Q' such that Q' % M = P' but minimizing |Q' - Q|,
// where Q is the return value from the previous call. The returned value Q' is
// then used as the Q for the next call, and so forth.
//
// In the code below, P' is pp and Q' is qq.
//
// Example (sequence of calls):
//   useNearestModulo( 0, 12) =  0
//   useNearestModulo(10, 12) = -2
//   useNearestModulo( 3, 12) =  3
//   useNearestModulo( 7, 12) =  7
//   useNearestModulo(10, 12) = 10
function useNearestModulo(pp: number, m: number): number {
  const q = React.useRef<number | null>(null);

  // If the function hasn't been called yet, just return P' which satisfies
  // P' % M = P', but record it as Q for the next call.
  if (q.current == null) {
    q.current = pp;
    return pp;
  }

  // Calculate Q' that gets as close to Q as possible while satisfying
  // Q' % M = P'.
  const qq = Math.round((q.current - pp) / m) * m + pp;
  q.current = qq;
  return qq;
}

export default function App(): JSX.Element {
  const [stepsBetween, setStepsBetween] = React.useState<Scale>(scales[0]);
  const [offset, setOffset] = React.useState<number>(0);
  const [root, setRoot] = React.useState<number>(0);
  const [state, setState] = useState<State>({ loaded: false });
  const [{ width, height }, setWindow] = React.useState<{
    width: number;
    height: number;
  }>({ width: window.innerWidth, height: window.innerHeight });
  const targetRoot = useNearestModulo(root, notes.length);
  const targetOffset = useNearestModulo(offset, notes.length);
  const { springRoot, springOffset } = useSpring({
    springRoot: targetRoot,
    springOffset: targetOffset,
    config: { tension: 200, friction: 120, mass: 10 },
  });
  const playing: boolean = state.loaded && state.notesToPlay.length > 0;

  React.useEffect(() => {
    const listener = () =>
      setWindow({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", listener);
    return () => window.removeEventListener("resize", listener);
  }, [setWindow]);

  useEffect(() => {
    setState({
      loaded: true,
      synth: new Synth().toDestination(),
      notesToPlay: [],
    });
  }, [setState]);

  useEffect(() => {
    if (state.loaded) {
      const [head, ...tail]: Scale = state.notesToPlay;
      if (playing) {
        let interval: number | null = null;
        const note = notes[head % notes.length];
        state.synth.triggerAttack(
          `${note.sharp}${head < notes.length ? octave : octave + 1}`
        );
        // @ts-ignore
        interval = setInterval(() => {
          setState({ ...state, notesToPlay: tail });
        }, 300);
        return () => {
          state.synth.triggerRelease();
          if (interval) clearInterval(interval);
        };
      }
    }
  }, [state, playing]);

  const octave: number = 3;
  const containerSize = Math.min(width - 30, height - 30);
  const fontSize = `${containerSize / 50}pt`;
  const arcSize = (2 * Math.PI) / notes.length;
  const fontStyle = { "--f": fontSize } as any;
  const setRandomRoot = () => {
    setRoot(randomNumber(notes.length));
    setOffset(0);
    setNotesToPlay([]);
  };
  let setRandomScale = () => {
    const newScale = scales[randomNumber(scales.length)];
    setStepsBetween(rotate(newScale, randomNumber(newScale.length)));
    setNotesToPlay([]);
  };
  const setNotesToPlay = (notes: Scale) => {
    if (state.loaded) {
      if (playing) {
        setState({ ...state, notesToPlay: [] });
      } else {
        start().then(() => setState({ ...state, notesToPlay: notes }));
      }
    }
  };

  const absIndices: Scale = stepsBetween.reduce(
    (soFar: Scale, n: number) => soFar.concat(soFar[soFar.length - 1] + n),
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
    return lowLightColor;
  });
  const arcGen = d3
    .arc<number>()
    .padAngle(0.1)
    .innerRadius(containerSize / 2.9)
    .outerRadius(containerSize / 2)
    .startAngle((i: number) => (i - 0.5) * arcSize)
    .endAngle((i: number) => (i + 0.5) * arcSize)
    .cornerRadius(containerSize);
  const arcs = notes.map((_, i) => arcGen(i) as string);
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
        <button style={fontStyle} onClick={() => setNotesToPlay(absIndices)}>
          {playing ? "Pause" : "Play"}
        </button>
        <span style={fontStyle}>
          Try clicking on a note or shift-clicking on yellow note.
        </span>
      </div>
      <animated.div
        className={"necklace"}
        style={{ "--r": springOffset.interpolate((r: number) => -r) } as any}
      >
        {arcInfo.map(([[absIndex, included, color], d], i: number) => (
          <svg
            className={"svg"}
            key={i}
            tabIndex={absIndex}
            style={{ "--c": color } as any}
          >
            <path
              className={"path"}
              stroke={color}
              d={d}
              onClick={(e: React.MouseEvent<SVGPathElement>) => {
                let newOffset = modNotes(offset + (absIndex - root));
                setNotesToPlay([]);
                if (e.shiftKey) {
                  if (included) {
                    setOffset(newOffset);
                    setStepsBetween(
                      rotate(stepsBetween, modIndices.indexOf(absIndex))
                    );
                  }
                } else {
                  setRoot(absIndex);
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
