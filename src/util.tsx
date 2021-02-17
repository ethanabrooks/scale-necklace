import { notes } from "./notes";
import { hasAug2nd, hasDoubleHalfSteps, patterns } from "./scales";

export const highlightColor = "#fca311";
export const foregroundColor = "#e5e5e5";
export const lowlightColor = "#999999";
export const playingColor = "#ff4136";
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

export function mod(a: number, b: number) {
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

export const randomSteps = (
  patterns: Steps[],
  aug2ndProb: number,
  doubleHalfStepsProb: number
): Steps | null => {
  const aug2ndPatterns = patterns.filter(hasAug2nd);
  const noAug2ndPatterns = patterns.filter((s) => !hasAug2nd(s));
  let patternSubset: Steps[];
  const useAug2nd =
    (100 * Math.random() < aug2ndProb || noAug2ndPatterns.length === 0) &&
    aug2ndPatterns.length > 0;
  if (useAug2nd) {
    if (aug2ndProb === 0) {
      alert("No adjacent scale without augmented seconds.");
    }
    patternSubset = aug2ndPatterns;
  } else if (noAug2ndPatterns.length > 0) {
    patternSubset = noAug2ndPatterns;
  } else {
    return null;
  }
  const doubleHalfStepPatterns = patternSubset.filter(hasDoubleHalfSteps);
  const noDoubleHalfStepPatterns = patternSubset.filter(
    (s) => !hasDoubleHalfSteps(s)
  );
  if (
    (100 * Math.random() < doubleHalfStepsProb ||
      noDoubleHalfStepPatterns.length === 0) &&
    doubleHalfStepPatterns.length > 0
  ) {
    if (doubleHalfStepsProb === 0) {
      alert("No adjacent scale without double half steps.");
    }
    return randomChoice(doubleHalfStepPatterns);
  } else if (noDoubleHalfStepPatterns.length > 0) {
    return randomChoice(noDoubleHalfStepPatterns);
  } else {
    return null;
  }
};

export function prob(predicate: (scale: Steps) => boolean) {
  return (100 * patterns.filter(predicate).length) / patterns.length;
}
