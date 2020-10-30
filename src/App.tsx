import React, { useEffect, useState } from "react";
import "./scales";
import { scales } from "./scales";
import { Note, notes } from "./notes";
import { Synth } from "tone";
import * as d3 from "d3";
import "./styles.scss";

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

export default function App(): JSX.Element {
  const [scale, setScale] = React.useState<Scale>(scales[0]);
  const [root, setRoot] = React.useState<number>(0);
  const [state, setState] = useState<State>({ loaded: false });
  const [{ width, height }, setWindow] = React.useState<{
    width: number;
    height: number;
  }>({ width: window.innerWidth, height: window.innerHeight });

  React.useEffect(() => {
    const listener = () =>
      setWindow({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", listener);
    return () => window.removeEventListener("resize", listener);
  }, []);

  const octave: number = 3;
  const playing: boolean = state.loaded && state.notesToPlay.length > 0;

  useEffect(() => {
    const synth = new Synth().toDestination();
    setState({
      loaded: true,
      synth: synth,
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
  }, [state]);

  const scaleIndices: Scale = scale.reduce(
    (soFar: Scale, n: number) => {
      return soFar.concat(soFar[soFar.length - 1] + n);
    },
    [root]
  );
  const modScaleIndices = scaleIndices.map((i) => i % notes.length);
  const included = notes.map((n, i) => ({
    note: n,
    included: modScaleIndices.includes(i),
  }));

  const containerSize = Math.min(width - 30, height - 30);
  const fontSize = `${containerSize / 50}pt`;
  const player: JSX.Element = state.loaded ? (
    <button
      style={{ "--f": fontSize } as any}
      onClick={function () {
        setState({ ...state, notesToPlay: playing ? [] : scaleIndices });
      }}
    >
      {playing ? "Pause" : "Play"}
    </button>
  ) : (
    <text>loading...</text>
  );

  const rootButton: JSX.Element = (
    <button
      style={{ "--f": fontSize } as any}
      onClick={() => setRoot(randomNumber(notes.length))}
    >
      Randomize Root
    </button>
  );

  const scaleButton: JSX.Element = (
    <button
      style={{ "--f": fontSize } as any}
      onClick={() => {
        const newScale = scales[randomNumber(scales.length)];
        setScale(rotate(newScale, randomNumber(newScale.length)));
      }}
    >
      Randomize Scale
    </button>
  );
  console.log(notes[root], scaleIndices);

  const noteNames = rotate(included, root).map(
    ({ note, included }, i: number) => {
      const j = i + root;
      const noteName =
        note.sharp == note.flat
          ? note.sharp
          : `${note.sharp}/${note.flat}`
              .replace(/(\w)#/, "$1♯")
              .replace(/(\w)b/, "$1♭");
      return (
        <a
          style={
            {
              "--i": i,
              "--f": fontSize,
              "--c": included ? highlightColor : lowLightColor,
            } as any
          }
          onClick={(e) => {
            // @ts-ignore
            if (e.shiftKey) {
              const indices = scaleIndices.map((k) => k % notes.length);
              if (indices.includes(j)) {
                setScale(rotate(scale, indices.indexOf(j)));
                setRoot(j);
              }
            } else {
              setRoot(j);
            }
          }}
          key={i}
        >
          {noteName}
        </a>
      );
    }
  );

  const arcSize = (2 * Math.PI) / notes.length;
  const arcGen = d3
    .arc<number>()
    .padAngle(0.02)
    .innerRadius(containerSize / 2.5)
    .outerRadius(containerSize / 2)
    .startAngle((i: number) => (i - 0.5) * arcSize)
    .endAngle((i: number) => (i + 0.5) * arcSize)
    .cornerRadius(containerSize);

  return (
    <div className={"container"}>
      <div className={"necklace"}>
        {included
          .map((n, i) => ({ ...n, d: arcGen(i - root) }))
          .map(({ included, note, d }, i: number) => {
            return (
              <div key={i}>
                <svg>
                  <path
                    stroke={included ? highlightColor : lowLightColor}
                    fill={backgroundColor}
                    strokeWidth={2}
                    d={d as string}
                    key={i}
                  />
                </svg>
              </div>
            );
          })}
        <div
          className={"note-names"}
          style={{ "--m": notes.length, "--s": `${containerSize}px` } as any}
        >
          {noteNames}
        </div>
      </div>
      <div className={"buttons"} style={{ "--s": `${containerSize}px` } as any}>
        {rootButton}
        {scaleButton}
        {player}
      </div>
    </div>
  );
}
