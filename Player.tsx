import React, { useEffect, useState } from "react";
import { context, start, Synth } from "tone";
import { notes, NUM_NOTES } from "./notes";
import { Button, Text } from "react-native";

export type Scale = number[];
type State =
  | { loaded: false }
  | {
      loaded: true;
      synth: Synth;
      notesToPlay: Scale;
    };

export function Player(props: { notesInScale: Scale }) {
  const [state, setState] = useState<State>({ loaded: false });
  const octave: number = 3;

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
      if (state.notesToPlay.length > 0) {
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

  return state.loaded ? (
    <Button
      title={"Play"}
      onPress={function () {
        setState({ ...state, notesToPlay: props.notesInScale });
      }}
    />
  ) : (
    <Text>loading...</Text>
  );
}
