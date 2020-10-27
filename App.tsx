import React, { useEffect, useState } from "react";
import { Button, Text, TouchableOpacity, View } from "react-native";
import "./scales";
import { scales } from "./scales";
import { styles } from "./styles";
import { Note, notes, NUM_NOTES } from "./notes";
import { Synth } from "tone";
import { animated, config, useSpring } from "react-spring";
import { Spring } from "react-spring/renderprops-universal";

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
        const note = notes[head % NUM_NOTES];
        state.synth.triggerAttack(
          `${note.sharp}${head < NUM_NOTES ? octave : octave + 1}`
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
      onPress={() => setRoot(randomNumber(NUM_NOTES))}
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
                (2 * Math.PI * (i + (root - props.root))) / NUM_NOTES -
                Math.PI / 2;
              const diameter = width / 6;
              const left = (width * (1 + Math.cos(theta)) - diameter) / 2;
              const top = (width * (1 + Math.sin(theta))) / 2;
              let j = mod(i + root, NUM_NOTES);
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
                  onPress={(e) => {
                    // @ts-ignore
                    if (e.shiftKey) {
                      const indices = scaleIndices.map((k) => k % NUM_NOTES);
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
