import React, { useEffect, useRef, useState } from "react";
import { Button, Text, TouchableOpacity, View } from "react-native";
import "./scales";
import { Note, NUM_NOTES, scales, notes } from "./scales";
import { now, Synth } from "tone";
import { styles } from "./styles";
import { Seconds } from "tone/build/esm/core/type/Units";

type Scale = number[];

function randomNumber(n: number): number {
  return Math.floor(Math.random() * n);
}

function mod(a: number, b: number): number {
  return ((a % b) + b) % b;
}

type State = { loaded: false } | { loaded: true; synth: Synth; now: Seconds };

export default function App(): JSX.Element {
  const [scale, setScale] = React.useState<Scale>(scales[0]);
  const [root, setRoot] = React.useState<number>(0);
  const [state, setState] = useState<State>({ loaded: false });
  const sampler = useRef<null | Synth>(null);

  useEffect(() => {
    const synth = new Synth().toMaster();
    setState({ loaded: true, synth: synth, now: now() });
  }, []);

  if (!state.loaded) {
    return <Text>loading...</Text>;
  }

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
  const Now = now();

  const playButton: JSX.Element = (
    <Button
      title={"Play"}
      onPress={() => {
        const synth = new Synth().toDestination();
        scaleIndices.forEach((index: number, i: number) => {
          const note = notes[index % NUM_NOTES];
          const octave = index < NUM_NOTES ? 3 : 4;
          synth.triggerAttack(`${note.sharp}${octave}`, Now + i);
          synth.triggerRelease(Now + i + 0.5);
        });
      }}
    />
  );

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
      <View style={styles.button}>{playButton}</View>
      <View style={styles.necklace}>{necklace}</View>
    </View>
  );
}
