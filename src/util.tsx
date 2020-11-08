import React from "react";
import { notes } from "./notes";
import { hasAug2nd, hasDoubleHalfSteps, patterns } from "./scales";

export const highlightColor = getComputedStyle(
  document.documentElement
).getPropertyValue("--hl");
export const foregroundColor = getComputedStyle(
  document.documentElement
).getPropertyValue("--fg");
export const lowlightColor = getComputedStyle(
  document.documentElement
).getPropertyValue("--ll");
export const playingColor = getComputedStyle(
  document.documentElement
).getPropertyValue("--pl");
export type Steps = number[];
export type Indices = number[];
export type State = { loaded: false } | { loaded: true; notesToPlay: Steps };
export type Action =
  | { type: "reset" }
  | { type: "nextNote" }
  | { type: "play"; notes: Indices };
export function randomNumber(n: number): number {
  return Math.floor(Math.random() * n);
}

export function randomChoice<X>(array: X[]): X {
  return array[randomNumber(array.length)];
}

export function rotate<X>(array: X[], start: number) {
  let modStart = mod(start, array.length);
  return array.slice(modStart).concat(array.slice(0, modStart));
}

function mod(a: number, b: number) {
  return ((a % b) + b) % b;
}

export function modNotes(a: number) {
  return mod(a, notes.length);
}

export function cumSum(array: number[], start = 0) {
  return array.reduce(
    (soFar: Indices, n: number) => soFar.concat(soFar[soFar.length - 1] + n),
    [start]
  );
}
// useNearestModulo returns a value minimizing the distance traveled around a
// circle. It always satisfies useNearestModulo(P, M) % M = P.
//
// useNearestModulo(P', M) = Q' such that Q' % M = P' but minimizing |Q' - Q|,
// where Q is the return value from the previous call. The returned value Q' is
// then used as the Q for the next call, and so forth.
//
// In the code below, P' is pp and Q' is qq.
//
// Example (sequence of calls):
//   useNearestModulo( 0, 12) =  0
//   useNearestModulo(10, 12) = -2
//   useNearestModulo( 3, 12) =  3
//   useNearestModulo( 7, 12) =  7
//   useNearestModulo(10, 12) = 10
export function useNearestModulo(pp: number, m: number): number {
  const q = React.useRef<number | null>(null);

  // If the function hasn't been called yet, just return P' which satisfies
  // P' % M = P', but record it as Q for the next call.
  if (q.current == null) {
    q.current = pp;
    return pp;
  }

  // Calculate Q' that gets as close to Q as possible while satisfying
  // Q' % M = P'.
  const qq = Math.round((q.current - pp) / m) * m + pp;
  q.current = qq;
  return qq;
}

export const randomSteps = (
  patterns: Steps[],
  aug2ndProb: number,
  doubleHalfStepsProb: number
): Steps | null => {
  const patternSubset: Steps[] = patterns
    .filter(
      100 * Math.random() < aug2ndProb ? hasAug2nd : (s: Steps) => !hasAug2nd(s)
    )
    .filter(
      100 * Math.random() < doubleHalfStepsProb
        ? hasDoubleHalfSteps
        : (s: Steps) => !hasDoubleHalfSteps(s)
    );
  if (patternSubset.length > 0) {
    return randomChoice(patternSubset);
  }
  return null;
};

export function prob(predicate: (scale: Steps) => boolean) {
  return (100 * patterns.filter(predicate).length) / patterns.length;
}
