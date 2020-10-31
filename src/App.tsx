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
function zip3<A, B, C>(a: A[], b: B[], c: C[]): [A, B, C][] {
  return zip(zip(a, b), c).map(([[a, b], c]) => [a, b, c]);
}

function zip4<A, B, C, D>(a: A[], b: B[], c: C[], d: D[]): [A, B, C, D][] {
  return zip(zip(zip(a, b), c), d).map(([[[a, b], c], d]) => [a, b, c, d]);
}

function mod(a: number, b: number) {
  return ((a % b) + b) % b;
}

export default function App(): JSX.Element {
  const [stepsBetween, setStepsBetween] = React.useState<Scale>(scales[0]);
  const [offsetFromRoot, setOffsetFromRoot] = React.useState<number>(0);
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
    setOffsetFromRoot(0);
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

  const absOffsets: Scale = stepsBetween.reduce(
    (soFar: Scale, n: number) => soFar.concat(soFar[soFar.length - 1] + n),
    [0]
  );
  const rotatedSteps = rotate(stepsBetween, absOffsets.indexOf(offsetFromRoot));
  const absIndices: Scale = rotatedSteps.reduce(
    (soFar: Scale, n: number) => soFar.concat(soFar[soFar.length - 1] + n),
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
  const arcInfo: [[number, boolean, string], string][] = zip(
    rotate(
      zip(included, colors).map((x, i) => [i, ...x]),
      -offsetFromRoot
    ),
    arcs
  );
  // let intInc = included.map((i) => (i ? 1 : 0));
  // console.log(intInc);
  // console.log(
  //   "rotate neg",
  //   -offsetFromRoot,
  //   mod(-offsetFromRoot, intInc.length),
  //   rotate(intInc, -offsetFromRoot)
  // );

  const noteNames = notes.map((note: Note) =>
    note.sharp == note.flat
      ? note.sharp
      : `${note.sharp}/${note.flat}`
          .replace(/(\w)#/, "$1♯")
          .replace(/(\w)b/, "$1♭")
  );
  const noteNamesInfo = rotate(zip(noteNames, colors), root);

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
      <div className={"necklace"}>
        {arcInfo.map(([[absIndex, included, color], d], i: number) => {
          return (
            <svg className={"svg"} key={i}>
              <animated.path
                stroke={color}
                fill={i == mousedOver ? color : backgroundColor}
                strokeWidth={2}
                d={d}
                transform={spring.root.interpolate((r) => {
                  const degrees = (-offsetFromRoot * 360) / notes.length;
                  return `rotate(${degrees})`;
                })}
                onMouseEnter={() => setMouseOver(i)}
                onMouseLeave={() => setMouseOver(null)}
                onClick={(e: React.MouseEvent<SVGPathElement>) => {
                  let newOffset = mod(
                    offsetFromRoot + (absIndex - root),
                    notes.length
                  );
                  if (e.shiftKey) {
                    if (included) {
                      setOffsetFromRoot(newOffset);
                    }
                  } else {
                    setRoot(absIndex);
                    setOffsetFromRoot(newOffset);
                  }
                }}
              />
            </svg>
          );
        })}
        <div className={"note-names"} style={noteNamesStyle}>
          {noteNamesInfo.map(([name, color], i) => (
            <animated.a
              style={
                {
                  "--i": i,
                  "--c": i == mousedOver ? backgroundColor : color,
                  ...fontStyle,
                } as any
              }
              key={i}
            >
              {name}
            </animated.a>
          ))}
        </div>
      </div>
    </div>
  );
}
