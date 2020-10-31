import React, { useEffect, useState } from "react";
import "./scales";
import { scales } from "./scales";
import { Note, notes } from "./notes";
import { Synth } from "tone";
import * as d3 from "d3";
import "./styles.scss";
import { animated, useSpring } from "react-spring";
import { zip } from "fp-ts/Array";

const backgroundColor = getComputedStyle(
  document.documentElement
).getPropertyValue("--bg");
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
// function zip3<A, B, C>(a: A[], b: B[], c: C[]): [A, B, C][] {
//   return zip(zip(a, b), c).map(([[a, b], c]) => [a, b, c]);
// }
//
// function zip4<A, B, C, D>(a: A[], b: B[], c: C[], d: D[]): [A, B, C, D][] {
//   return zip(zip(zip(a, b), c), d).map(([[[a, b], c], d]) => [a, b, c, d]);
// }

function mod(a: number, b: number) {
  return ((a % b) + b) % b;
}

function modNotes(a: number) {
  return mod(a, notes.length);
}

// useNearestModulo returns a value minimizing the distance traveled around a
// circle. It always satisfies useNearestModulo(P, N % M, M) % M = N.
//
// useNearestModulo(P, N, M) finds N' that minimizes |N' - P|
// with the constraint that N' % M = N % M,
//
// Examples:
//   useNearestModulo(5, 0, 12) =  0  // travel downward/counterclockwise
//   useNearestModulo(6, 0, 12) =  0  // tie resolved downward
//   useNearestModulo(7, 0, 12) = 12  // travel upward/clockwise
//   useNearestModulo(7, 1, 12) = 1
//   useNearestModulo(7,-1, 12) = 11  // -1 % 12 = 11
function getNearestModulo(current: number, target: number, m: number): number {
  const q = current % m;
  const pp = target % m;
  return Math.round((q - pp) / m) * m + pp;
}

export default function App(): JSX.Element {
  const [stepsBetween, setStepsBetween] = React.useState<Scale>(scales[0]);
  const [modOffset, setModOffset] = React.useState<number>(0);
  const [modRoot, setModRoot] = React.useState<number>(0);
  const [state, setState] = useState<State>({ loaded: false });
  // const [mousedOver, setMouseOver] = useState<number | null>(null);
  const [{ width, height }, setWindow] = React.useState<{
    width: number;
    height: number;
  }>({ width: window.innerWidth, height: window.innerHeight });
  const { springRoot, springOffset } = useSpring({
    springRoot: modRoot,
    springOffset: modOffset,
    config: { tension: 40, friction: 40, mass: 10 },
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

  const root = modNotes(modRoot);
  const offset = modNotes(modOffset);
  const setRootNearestModule = (newRoot: number) =>
    setModRoot(getNearestModulo(root, newRoot, notes.length));
  const setOffsetNearestModule = (newOffset: number) =>
    setModOffset(getNearestModulo(offset, newOffset, notes.length));
  const octave: number = 3;
  const containerSize = Math.min(width - 30, height - 30);
  const fontSize = `${containerSize / 50}pt`;
  const arcSize = (2 * Math.PI) / notes.length;
  const fontStyle = { "--f": fontSize } as any;
  const setRandomRoot = () => {
    setRootNearestModule(randomNumber(notes.length));
    setOffsetNearestModule(0);
  };
  let setRandomScale = () => {
    const newScale = scales[randomNumber(scales.length)];
    setStepsBetween(rotate(newScale, randomNumber(newScale.length)));
  };
  const setNotesToPlay = () => {
    if (state.loaded)
      setState({
        ...state,
        notesToPlay: playing ? [] : absIndices,
      });
  };

  const absIndices: Scale = stepsBetween.reduce(
    (soFar: Scale, n: number) => soFar.concat(soFar[soFar.length - 1] + n),
    [root]
  );
  const modIndices = absIndices.map((i) => i % notes.length);
  const included = notes.map((_, i) => {
    return modIndices.includes(i);
  });
  const colors = included.map((inc, i) => {
    if (
      state.loaded &&
      state.notesToPlay.length > 0 &&
      modNotes(state.notesToPlay[0]) == i
    )
      return playingColor;
    if (inc) return highlightColor;
    return lowLightColor;
  });
  const arcGen = d3
    .arc<number>()
    .padAngle(0.02)
    .innerRadius(containerSize / 2.5)
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
    note.sharp == note.flat
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
      {/*<div className={"buttons"}>*/}
      {/*  <button style={fontStyle} onClick={setRandomRoot}>*/}
      {/*    Randomize Root*/}
      {/*  </button>*/}
      {/*  <button style={fontStyle} onClick={setRandomScale}>*/}
      {/*    Randomize Scale*/}
      {/*  </button>*/}
      {/*  <button style={fontStyle} onClick={setNotesToPlay}>*/}
      {/*    {playing ? "Pause" : "Play"}*/}
      {/*  </button>*/}
      {/*</div>*/}
      <div className={"necklace"}>
        {arcInfo.map(([[absIndex, included, color], d], i: number) => {
          return (
            <svg
              className={"svg"}
              key={i}
              style={
                {
                  "--r": springOffset.interpolate((r: number) => -r),
                } as any
              }
            >
              <path
                className={"path"}
                stroke={color}
                d={d}
                onClick={(e: React.MouseEvent<SVGPathElement>) => {
                  let newOffset = modNotes(offset + (absIndex - root));
                  if (e.shiftKey) {
                    if (included) {
                      setOffsetNearestModule(newOffset);
                      setStepsBetween(
                        rotate(stepsBetween, modIndices.indexOf(absIndex))
                      );
                    }
                  } else {
                    setRootNearestModule(absIndex);
                    setOffsetNearestModule(offset + (absIndex - root));
                  }
                }}
              />
            </svg>
          );
        })}
        {/*  <div className={"note-names"}>*/}
        {/*    {noteNamesInfo.map(([name, color], i) => (*/}
        {/*      <animated.a*/}
        {/*        style={*/}
        {/*          {*/}
        {/*            "--i": springRoot.interpolate((r) => i + (root - r)),*/}
        {/*            "--c": color,*/}
        {/*            ...fontStyle,*/}
        {/*          } as any*/}
        {/*        }*/}
        {/*        key={i}*/}
        {/*      >*/}
        {/*        {name}*/}
        {/*      </animated.a>*/}
        {/*    ))}*/}
        {/*  </div>*/}
      </div>
      <svg width="24" height="24" viewBox="0 0 24 24">
        <path d="M5,20.5A3.5,3.5 0 0,1 1.5,17A3.5,3.5 0 0,1 5,13.5A3.5,3.5 0 0,1 8.5,17A3.5,3.5 0 0,1 5,20.5M5,12A5,5 0 0,0 0,17A5,5 0 0,0 5,22A5,5 0 0,0 10,17A5,5 0 0,0 5,12M14.8,10H19V8.2H15.8L13.86,4.93C13.57,4.43 13,4.1 12.4,4.1C11.93,4.1 11.5,4.29 11.2,4.6L7.5,8.29C7.19,8.6 7,9 7,9.5C7,10.13 7.33,10.66 7.85,10.97L11.2,13V18H13V11.5L10.75,9.85L13.07,7.5M19,20.5A3.5,3.5 0 0,1 15.5,17A3.5,3.5 0 0,1 19,13.5A3.5,3.5 0 0,1 22.5,17A3.5,3.5 0 0,1 19,20.5M19,12A5,5 0 0,0 14,17A5,5 0 0,0 19,22A5,5 0 0,0 24,17A5,5 0 0,0 19,12M16,4.8C17,4.8 17.8,4 17.8,3C17.8,2 17,1.2 16,1.2C15,1.2 14.2,2 14.2,3C14.2,4 15,4.8 16,4.8Z" />
      </svg>
    </div>
  );
}
