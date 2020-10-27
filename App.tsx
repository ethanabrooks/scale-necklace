import React, { useEffect, useState } from "react";
import { Button, Text, TouchableOpacity, View } from "react-native";
import "./scales";
import { scales } from "./scales";
import { start, Synth } from "tone";
import { styles } from "./styles";
import { Note, notes, NUM_NOTES } from "./notes";

type Scale = number[];

function randomNumber(n: number): number {
  return Math.floor(Math.random() * n);
}

function mod(a: number, b: number): number {
  return ((a % b) + b) % b;
}

type State =
  | { loaded: false }
  | {
      loaded: true;
      synth: Synth;
      notesToPlay: Note[];
      octave: number;
    };

function Timer(props: { notesInScale: Note[] }) {
  const [state, setState] = useState<State>({ loaded: false });

  useEffect(() => {
    start().then(() => {
      const synth = new Synth().toDestination();
      setState({
        loaded: true,
        synth: synth,
        notesToPlay: [],
        octave: 3,
      });
    });
  }, [setState]);

  useEffect(() => {
    if (state.loaded) {
      const [head, ...tail]: Note[] = state.notesToPlay;
      if (head) {
        state.synth.triggerAttack(`${head.sharp}${state.octave}`);
        const interval: number = setInterval(() => {
          setState({
            ...state,
            notesToPlay: tail,
          });
        }, 200);
        return () => {
          state.synth.triggerRelease();
          clearInterval(interval);
        };
      }
    }
  }, [state]);

  if (!state.loaded) {
    return <Text>loading...</Text>;
  }

  function toggle() {
    if (state.loaded) setState({ ...state, notesToPlay: props.notesInScale });
  }

  return <Button title={"Play"} onPress={toggle} />;
}

export default function App(): JSX.Element {
  const [scale, setScale] = React.useState<Scale>(scales[0]);
  const [root, setRoot] = React.useState<number>(0);

  const rootButton: JSX.Element = (
    <Button
      title={"Randomize Root"}
      onPress={() => setRoot(randomNumber(NUM_NOTES))}
    />
  );

  const scaleIndices: number[] = scale.reduce(
    (soFar: number[], n: number) => {
      return soFar.concat(soFar[soFar.length - 1] + n);
    },
    [root]
  );
  const notesInScale = scaleIndices.map((i) => notes[i % NUM_NOTES]);
  const width = 250;
  const necklace = (
    <View
      style={{
        flex: 1,
        width: width,
      }}
    >
      {notes.map((_: Note, i: number) => {
        const theta = (2 * Math.PI * i) / NUM_NOTES - Math.PI / 2;
        const diameter = width / 6;
        const left = (width * (1 + Math.cos(theta)) - diameter) / 2;
        const top = (width * (1 + Math.sin(theta))) / 2;
        let j = mod(i + root, NUM_NOTES);
        const t = notes[j];
        const color = scaleIndices.map((i) => i % NUM_NOTES).includes(j)
          ? "black"
          : "lightgrey";

        return (
          <TouchableOpacity
            style={{
              width: diameter,
              height: diameter,
              position: "absolute",
              left: left,
              top: top,
              backgroundColor: color,
              borderRadius: 50,
              alignItems: "center",
              justifyContent: "center",
            }}
            onPress={() => {
              setRoot(j);
              setScale(scales[randomNumber(scales.length)]);
            }}
            key={i}
          >
            <Text style={{ color: "white" }}>
              {t.sharp == t.flat ? t.sharp : `${t.sharp}/${t.flat}`}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
  return (
    <View style={styles.container}>
      <View style={styles.button}>{rootButton}</View>
      <View style={styles.button}>
        <Timer notesInScale={notesInScale} />
      </View>
      <View style={styles.necklace}>{necklace}</View>
    </View>
  );
}
