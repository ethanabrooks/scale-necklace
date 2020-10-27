import React, { useEffect, useState } from "react";
import { Button, Text, TouchableOpacity, View } from "react-native";
import "./scales";
import { scales } from "./scales";
import { styles } from "./styles";
import { Note, notes, NUM_NOTES } from "./notes";
import { context, start, Synth } from "tone";

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

function mod(a: number, b: number): number {
  return ((a % b) + b) % b;
}

export default function App(): JSX.Element {
  const [scale, setScale] = React.useState<Scale>(scales[0]);
  const [root, setRoot] = React.useState<number>(0);
  const [state, setState] = useState<State>({ loaded: false });
  const octave: number = 3;
  const playing: boolean = state.loaded && state.notesToPlay.length > 0;

  useEffect(() => {
    start().then(() => {
      const synth = new Synth().toDestination();
      setState({
        loaded: true,
        synth: synth,
        notesToPlay: [],
      });
    });
  }, [setState]);

  useEffect(() => {
    if (state.loaded) {
      const [head, ...tail]: Scale = state.notesToPlay;
      if (playing) {
        context.resume().then(() => {
          const note = notes[head % NUM_NOTES];
          return state.synth.triggerAttack(
            `${note.sharp}${head < NUM_NOTES ? octave : octave + 1}`
          );
        });
        const interval: number = setInterval(() => {
          setState({ ...state, notesToPlay: tail });
        }, 200);
        return () => {
          state.synth.triggerRelease();
          clearInterval(interval);
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
      onPress={() => setRoot(randomNumber(NUM_NOTES))}
    />
  );

  const width = 500;
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
        let color: string;

        const indices = scaleIndices.map((i) => i % NUM_NOTES);
        if (state.loaded && state.notesToPlay[0] % NUM_NOTES == j) {
          color = "#2F4F4F";
        } else if (indices.includes(j)) {
          color = "grey";
        } else {
          color = "lightgrey";
        }

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
      <View style={styles.button}>
        {rootButton}
        {player}
      </View>
      <View style={styles.necklace}>{necklace}</View>
    </View>
  );
}
