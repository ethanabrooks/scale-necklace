import React, {useEffect, useState} from "react";
import "./scales";
import {scales} from "./scales";
import {Note, notes} from "./notes";
import {Synth} from "tone";
import * as d3 from "d3";

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
    <button
      title={playing ? "Pause" : "Play"}
      onClick={function () {
        setState({ ...state, notesToPlay: playing ? [] : scaleIndices });
      }}
    />
  ) : (
    <text>loading...</text>
  );

  const rootButton: JSX.Element = (
    <button
      title={"Randomize Root"}
      onClick={() => setRoot(randomNumber(notes.length))}
    />
  );

  const scaleButton: JSX.Element = (
    <button
      title={"Randomize Scale"}
      onClick={() => {
        const newScale = scales[randomNumber(scales.length)];
        setScale(rotate(newScale, randomNumber(newScale.length)));
      }}
    />
  );

  const modNotes = rotate(notes, root);
  const size = 500;
  const diameter = size / 6;
  const noteNames = modNotes.map((note: Note, i: number) => {
    const theta = (2 * Math.PI * i) / notes.length - Math.PI / 2;
    const left = (size * (1 + Math.cos(theta)) - diameter) / 2;
    const top = (size * (1 + Math.sin(theta))) / 2;
    const j = i + root;
    return (
      <button
        style={{
          height: diameter,
          position: "absolute",
          left: left,
          top: top,
        }}
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
      </button>
    );
  });

  const innerRadius = diameter / 4;
  const outerRadius = diameter / 2;
  const arcSize = (2 * Math.PI) / notes.length;
  const arcGen = d3
    .arc<Note>()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius)
    .startAngle(((_, i: number) => (i + 0.5) * arcSize))
    .endAngle((_, i: number) => (i + 1.5) * arcSize);
  const arcD: string[] = notes.map(arcGen) as unknown as string[];
  return (
    <div style={{flex: 1, height: "100%"}}>
      <div style={{flex: 1, width: "100%"}}>
        {rootButton}
        {scaleButton}
        {player}
      </div>
      <div style={{
          flex: 3,
          width: "100%",
          alignItems: "center",
      }}>
        <svg
          style={{
            width: size,
            height: size,
            backgroundColor: "green",
            position: "absolute",
          }}
        >
          {arcD.map((d: string, i: number) => {
            return (
              <path
                fill={
                  scaleIndices.map((j) => j % notes.length).includes(i)
                    ? "grey"
                    : "lightgrey"
                }
                stroke={"white"}
                transform={`translate(${size / 10},${size / 3})`}
                d={d}
                key={i}
              />
            );
          })}
        </svg>
        <div
          style={{
            position: "absolute",
            width: size,
            height: size,
            backgroundColor: "yellow",
          }}
        >
          {noteNames}
        </div>
      </div>
    </div>
  );
}
