import React, { useEffect, useState } from "react";
import "./scales";
import { scales } from "./scales";
import { Note, notes } from "./notes";
import { Synth } from "tone";
import * as d3 from "d3";
import "./styles.scss";
import { zip } from "fp-ts/Array";
import { useSpring, animated } from "react-spring";

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
  const [mousedOver, setMouseOver] = useState<number | null>(null);
  const spring = useSpring({ root: root });
  const [{ width, height }, setWindow] = React.useState<{
    width: number;
    height: number;
  }>({ width: window.innerWidth, height: window.innerHeight });

  // const props = useSpring();

  const octave: number = 3;
  const playing: boolean = state.loaded && state.notesToPlay.length > 0;

  React.useEffect(() => {
    const listener = () =>
      setWindow({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", listener);
    return () => window.removeEventListener("resize", listener);
  }, []);

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

  const arcSize = (2 * Math.PI) / notes.length;
  const arcGen = d3
    .arc<number>()
    .padAngle(0.02)
    .innerRadius(containerSize / 2.5)
    .outerRadius(containerSize / 2)
    .startAngle((i: number) => (i - 0.5) * arcSize)
    .endAngle((i: number) => (i + 0.5) * arcSize)
    .cornerRadius(containerSize);

  let setRandomRoot = () => {
    setRoot(randomNumber(notes.length));
  };
  let fontStyle = { "--f": fontSize } as any;
  let setRandomScale = () => {
    const newScale = scales[randomNumber(scales.length)];
    setScale(rotate(newScale, randomNumber(newScale.length)));
  };
  let setNotesToPlay = () => {
    if (state.loaded)
      setState({
        ...state,
        notesToPlay: playing ? [] : scaleIndices,
      });
  };
  let noteNamesStyle = {
    "--m": notes.length,
    "--s": `${containerSize}px`,
  } as any;
  const noteNames = rotate(notes, root).map((note: Note) =>
    note.sharp == note.flat
      ? note.sharp
      : `${note.sharp}/${note.flat}`
          .replace(/(\w)#/, "$1♯")
          .replace(/(\w)b/, "$1♭")
  );
  const noteColors = included.map(({ note, included }, i: number) => {
    if (i == mousedOver) return backgroundColor;
    return included ? highlightColor : lowLightColor;
  });
  const noteStyles: any[] = noteColors.map(
    (color: string, i: number) =>
      ({
        "--i": spring.root.interpolate((r) => i + root - (r % notes.length)),
        "--f": fontSize,
        "--c": color,
      } as any)
  );
  let svgTransform = spring.root.interpolate(
    (r) => `rotate(${(-(r % notes.length) / notes.length) * 360})`
  );
  let handleClickOnPath = (i: number, included: boolean) => (
    e: React.MouseEvent<SVGPathElement>
  ) => {
    if (e.shiftKey) {
      console.log("shift", included);
      if (included) {
        setScale(rotate(scale, scale.indexOf(i)));
        setRoot(i);
      }
    } else {
      setRoot(i);
    }
  };
  return (
    <div className={"container"}>
      <div className={"buttons"} style={{ "--s": `${containerSize}px` } as any}>
        <button style={fontStyle} onClick={setRandomRoot}>
          Randomize Root
        </button>
        <button style={fontStyle} onClick={setRandomScale}>
          Randomize Scale
        </button>
        <button style={fontStyle} onClick={setNotesToPlay}>
          {playing ? "Pause" : "Play"}
        </button>
      </div>
      <animated.div className={"necklace"}>
        {included.map(({ included, note }, i: number) => {
          let stroke = included ? highlightColor : lowLightColor;
          return (
            <svg className={"svg"}>
              <animated.path
                stroke={stroke}
                fill={i == mousedOver ? stroke : backgroundColor}
                strokeWidth={2}
                d={arcGen(i) as string}
                key={i}
                transform={svgTransform}
                onMouseEnter={() => setMouseOver(i)}
                onMouseLeave={() => setMouseOver(null)}
                onClick={handleClickOnPath(i, included)}
              />
            </svg>
          );
        })}
        <div className={"note-names"} style={noteNamesStyle}>
          {zip(noteNames, noteStyles).map(([name, style], i) => (
            <animated.a style={style} key={i}>
              {name}
            </animated.a>
          ))}
        </div>
      </animated.div>
    </div>
  );
}
