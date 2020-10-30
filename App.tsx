import React, { useEffect, useState } from "react";
import { Button, Text, TouchableOpacity, View } from "react-native";
import { zipWith } from "fp-ts/Array";
import "./scales";
import { scales } from "./scales";
import { styles } from "./styles";
import { Note, notes } from "./notes";
import { Synth } from "tone";
import { Spring } from "react-spring/renderprops-universal";
import * as d3 from "d3";

export type Scale = number[];
export type State =
  | { loaded: false }
  | {
      loaded: true;
      synth: Synth;
      notesToPlay: Scale;
    };
type Color = { r: number; g: number; b: number };

type Triple = [number, number, number];

function randomNumber(n: number): number {
  return Math.floor(Math.random() * n);
}

function mod(a: number, b: number): number {
  return ((a % b) + b) % b;
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
    <Button
      title={playing ? "Pause" : "Play"}
      onPress={function () {
        setState({ ...state, notesToPlay: playing ? [] : scaleIndices });
      }}
    />
  ) : (
    <Text>loading...</Text>
  );

  const rootButton: JSX.Element = (
    <Button
      title={"Randomize Root"}
      onPress={() => setRoot(randomNumber(notes.length))}
    />
  );

  const scaleButton: JSX.Element = (
    <Button
      title={"Randomize Scale"}
      onPress={() => {
        const newScale = scales[randomNumber(scales.length)];
        setScale(rotate(newScale, randomNumber(newScale.length)));
      }}
    />
  );

  const modNotes = rotate(notes, root);
  const width = 500;
  const diameter = width / 6;
  const noteNames = modNotes.map((note: Note, i: number) => {
    const theta = (2 * Math.PI * i) / notes.length - Math.PI / 2;
    const left = (width * (1 + Math.cos(theta)) - diameter) / 2;
    const top = (width * (1 + Math.sin(theta))) / 2;
    const j = i + root;
    return (
      <TouchableOpacity
        style={{
          height: diameter,
          position: "absolute",
          left: left,
          top: top,
          transform: "translate(-50%,-50%)",
          MozTransform: "translate(-50% -50%)",
          WebkitTransform: "translate(-50% -50%)",
          OTransform: "translate(-50% -50%)",
          border: "1px red solid",
          // maxWidth: 50,
          // width: "100%",
          // alignItems: "center",
          // justifyContent: "center",
        }}
        onPress={(e) => {
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
        <Text style={{ color: "black" }}>
          {note.sharp == note.flat ? note.sharp : `${note.sharp}/${note.flat}`}
        </Text>
      </TouchableOpacity>
    );
  });

  const innerRadius = diameter / 4;
  const outerRadius = diameter / 2;
  const arcSize = (2 * Math.PI) / notes.length;
  const arcGen = d3
    .arc()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius)
    .startAngle((_: Note, i: number) => (i + 0.5) * arcSize)
    .endAngle((_: Note, i: number) => (i + 1.5) * arcSize);
  const arcD: string[] = notes.map(arcGen);
  return (
    <View style={styles.container}>
      <View style={styles.button}>
        {rootButton}
        {scaleButton}
        {player}
      </View>
      <View style={styles.necklace}>
        <svg
          style={{
            width: width,
            height: width,
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
                transform={`translate(${width / 10},${width / 3})`}
                d={d}
                key={i}
              />
            );
          })}
        </svg>
        <View
          style={{
            position: "absolute",
            width: width,
            height: width,
            backgroundColor: "yellow",
          }}
        >
          {noteNames}
        </View>
      </View>
    </View>
  );
}
