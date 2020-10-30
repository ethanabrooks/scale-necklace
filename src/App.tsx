import React, { useEffect, useState } from "react";
import "./scales";
import { scales } from "./scales";
import { Note, notes } from "./notes";
import { Synth } from "tone";
import * as d3 from "d3";
import "./styles.scss";

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

  const player: JSX.Element = state.loaded ? (
    <div
      onClick={function () {
        setState({ ...state, notesToPlay: playing ? [] : scaleIndices });
      }}
    >
      {playing ? "Pause" : "Play"}
    </div>
  ) : (
    <text>loading...</text>
  );

  const rootButton: JSX.Element = (
    <div onClick={() => setRoot(randomNumber(notes.length))}>
      Randomize Root
    </div>
  );

  const scaleButton: JSX.Element = (
    <div
      onClick={() => {
        const newScale = scales[randomNumber(scales.length)];
        setScale(rotate(newScale, randomNumber(newScale.length)));
      }}
    >
      Randomize Scale
    </div>
  );

  const modNotes = rotate(notes, root);
  const noteNames = modNotes.map((note: Note, i: number) => {
    const j = i + root;
    return (
      <a
        style={{ "--i": i } as any}
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
        <text style={{ color: "black" }}>
          {note.sharp == note.flat ? note.sharp : `${note.sharp}/${note.flat}`}
        </text>
      </a>
    );
  });

  const containerSize = 500;
  const arcSize = (2 * Math.PI) / notes.length;
  const arcGen = d3
    .arc<Note>()
    .innerRadius(containerSize / 4)
    .outerRadius(containerSize / 2)
    .startAngle((_, i: number) => (i + 0.5) * arcSize)
    .endAngle((_, i: number) => (i + 1.5) * arcSize);
  return (
    <div style={{}}>
      <div className={"buttons"} style={{ "--s": `${containerSize}px` } as any}>
        {rootButton}
        {scaleButton}
        {player}
      </div>
    </div>
  );
}
