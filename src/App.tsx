import React, { useEffect, useState } from "react";
import "./scales";
import { scales } from "./scales";
import { Note, notes } from "./notes";
import { Synth } from "tone";
import * as d3 from "d3";
import "./styles.scss";
import { animated, useSpring } from "react-spring";
import { zip } from "fp-ts/Array";
import { pipe } from "fp-ts/function";

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
  return array.slice(start).concat(array.slice(0, start));
}
function zip3<A, B, C>(a: A[], b: B[], c: C[]): [A, B, C][] {
  return zip(zip(a, b), c).map(([[a, b], c]) => [a, b, c]);
}

function zip4<A, B, C, D>(a: A[], b: B[], c: C[], d: D[]): [A, B, C, D][] {
  return zip(zip(zip(a, b), c), d).map(([[[a, b], c], d]) => [a, b, c, d]);
}

export default function App(): JSX.Element {
  const [stepsBetween, setStepsBetween] = React.useState<Scale>(scales[0]);
  const [stepsStart, setStepsStart] = React.useState<number>(0);
  const [root, setRoot] = React.useState<number>(0);
  const [state, setState] = useState<State>({ loaded: false });
  const [mousedOver, setMouseOver] = useState<number | null>(null);
  const [{ width, height }, setWindow] = React.useState<{
    width: number;
    height: number;
  }>({ width: window.innerWidth, height: window.innerHeight });
  const spring = useSpring({ root: root });
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
  let noteNamesStyle = {
    "--m": notes.length,
    "--s": `${containerSize}px`,
  } as any;
  const setRandomRoot = () => {
    setRoot(randomNumber(notes.length));
    setStepsStart(0);
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
    (soFar: Scale, n: number) => {
      return soFar.concat(soFar[soFar.length - 1] + n);
    },
    [root]
  );
  const modIndices = absIndices.map((i) => i % notes.length);
  const included = notes.map((_, i) => modIndices.includes(i));
  const colors = included.map((inc) => {
    if (playing) return playingColor;
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
  const arcInfo: [number, boolean, string, string][] = rotate(
    zip3(included, colors, arcs).map((x, i) => [i, ...x]),
    stepsStart
  );
  console.log(included);
  console.log(colors);
  console.log(arcs);

  const noteNames = notes.map((note: Note) =>
    note.sharp == note.flat
      ? note.sharp
      : `${note.sharp}/${note.flat}`
          .replace(/(\w)#/, "$1♯")
          .replace(/(\w)b/, "$1♭")
  );
  const noteNamesInfo = zip(noteNames, colors);

  return (
    <div className={"container"}>
      <div className={"buttons"} style={{ "--s": `${containerSize}px` } as any}>
        <button style={fontStyle} onClick={setRandomRoot}>
          Randomize Root
        </button>
        <button style={fontStyle} onClick={setRandomScale}>
          Randomize Scale
        </button>
        <button style={fontStyle} onClick={setNotesToPlay}>
          {playing ? "Pause" : "Play"}
        </button>
      </div>
      <animated.div className={"necklace"}>
        {arcInfo.map(([absIndex, included, color, d], i: number) => {
          return (
            <svg className={"svg"}>
              <animated.path
                stroke={color}
                fill={absIndex == mousedOver ? color : backgroundColor}
                strokeWidth={2}
                d={d}
                key={i}
                transform={spring.root.interpolate((r) => {
                  const degrees = (stepsStart * 360) / notes.length;
                  return `rotate(${degrees})`;
                })}
                onMouseEnter={() => setMouseOver(i)}
                onMouseLeave={() => setMouseOver(null)}
                onClick={(e: React.MouseEvent<SVGPathElement>) => {
                  if (e.shiftKey) {
                    if (included) {
                      setStepsStart(absIndex);
                    }
                  } else {
                    setRoot(absIndex);
                  }
                }}
              />
            </svg>
          );
        })}
        {/*<div className={"note-names"} style={noteNamesStyle}>*/}
        {/*  {noteNamesInfo.map(([name, color], i) => (*/}
        {/*    <animated.a*/}
        {/*      style={{ "--i": i, "--c": color, ...fontStyle } as any}*/}
        {/*      key={i}*/}
        {/*    >*/}
        {/*      {name}*/}
        {/*    </animated.a>*/}
        {/*  ))}*/}
        {/*</div>*/}
      </animated.div>
    </div>
  );
}
