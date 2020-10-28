import React, { useEffect, useState } from "react";
import { Button, Text, TouchableOpacity, View } from "react-native";
import { zipWith } from "fp-ts/Array";
import "./scales";
import { scales } from "./scales";
import { styles } from "./styles";
import { Note, notes } from "./notes";
import { Synth } from "tone";
import { Spring } from "react-spring/renderprops-universal";

const parse = require("color-parse");

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
  const grey = { r: 128, g: 128, b: 128 };
  const lightgrey = { r: 211, g: 211, b: 211 };
  const colors: Color[] = modNotes.map((_, i) =>
    scaleIndices.includes(i + root) ? grey : lightgrey
  );
  const necklace = (
    <View
      style={{
        flex: 1,
        width: width,
      }}
    >
      {modNotes.map((note: Note, i: number) => {
        return (
          <Spring to={{ root: root }} config={{ tension: 40 }} key={i}>
            {(props) => {
              const theta =
                (2 * Math.PI * (i + (root - props.root))) / notes.length -
                Math.PI / 2;
              const left = (width * (1 + Math.cos(theta)) - diameter) / 2;
              const top = (width * (1 + Math.sin(theta))) / 2;
              const idx = mod(theta / (2 * Math.PI) + 1 / 4, 1) * notes.length;
              const lIdx = Math.floor(idx);
              const rIdx = Math.ceil(idx);
              const t = idx - lIdx;
              const lColor = colors[lIdx % colors.length];
              const rColor = colors[rIdx % colors.length];
              const c2a = (c: Color): Triple => [c.r, c.g, c.b];
              const a2c = ([r, g, b]: Triple) => ({ r: r, g: g, b: b });
              const interpolated = zipWith(
                c2a(lColor),
                c2a(rColor),
                (l, r) => (1 - t) * l + t * r
              );
              const color = a2c(interpolated as Triple);
              const j = i + root;
              return (
                <TouchableOpacity
                  style={{
                    width: diameter,
                    height: diameter,
                    position: "absolute",
                    left: left,
                    top: top,
                    backgroundColor: `rgb(${color.r},${color.g},${color.b})`,
                    borderRadius: 50,
                    alignItems: "center",
                    justifyContent: "center",
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
                  <Text style={{ color: "white" }}>
                    {note.sharp == note.flat
                      ? note.sharp
                      : `${note.sharp}/${note.flat}`}
                  </Text>
                </TouchableOpacity>
              );
            }}
          </Spring>
        );
      })}
    </View>
  );
  return (
    <View style={styles.container}>
      <View style={styles.button}>
        {rootButton}
        {scaleButton}
        {player}
      </View>
      <View style={styles.necklace}>{necklace}</View>
    </View>
  );
}
