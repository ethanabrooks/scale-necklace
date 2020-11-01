import { flatten, zip } from "fp-ts/lib/Array";
import { NUM_NOTES } from "./notes";
import { Steps } from "./util";

type AScale = { head: [1]; tail: B } | { head: [1, 1]; tail: B };
type BScale =
  | { head: [2]; tail: C }
  | { head: [2, 3]; tail: C }
  | { head: [3]; tail: A };
type CScale = A | B | null;

type A = { tag: "A"; scale: AScale };
type B = { tag: "B"; scale: BScale };
type C = { tag: "C"; scale: CScale };

function AScales(len: number): A[] {
  if (len <= 1) {
    return [];
  }
  return flatten<AScale>([
    BScales(len - 1).map((b: B) => ({ head: [1], tail: b })),
    BScales(len - 2).map((b: B) => ({ head: [1, 1], tail: b })),
  ]).map((a: AScale) => ({ tag: "A", scale: a }));
}

function BScales(len: number): B[] {
  if (len <= 0) {
    return [];
  }
  return flatten<BScale>([
    AScales(len - 3).map((a: A): BScale => ({ head: [3], tail: a })),
    CScales(len - 2).map((c: C) => ({ head: [2], tail: c })),
    CScales(len - 5).map((c: C) => ({ head: [2, 3], tail: c })),
  ]).map((b: BScale) => ({ tag: "B", scale: b }));
}

function CScales(len: number): C[] {
  if (len < 0) {
    return [];
  } else if (len === 0) {
    return [{ tag: "C", scale: null }];
  } else {
    return flatten<A | B>([AScales(len), BScales(len)]).map((c: CScale) => ({
      tag: "C",
      scale: c,
    }));
  }
}

function getStepsA(a: A): Steps {
  const head: Steps = a.scale.head;
  if (a.scale.tail === null) {
    return head;
  }
  return head.concat(getStepsB(a.scale.tail));
}

function getStepsB(b: B): Steps {
  const head: Steps = b.scale.head;
  switch (b.scale.tail.tag) {
    case "A":
      return head.concat(getStepsA(b.scale.tail));
    case "C":
      return head.concat(getStepsC(b.scale.tail));
  }
}

function getStepsC(c: C): Steps {
  if (c.scale === null) {
    return [];
  }
  switch (c.scale.tag) {
    case "A":
      return getStepsA(c.scale);
    case "B":
      return getStepsB(c.scale);
  }
}

function hasDoubleHalfSteps(scale: Steps): boolean {
  return zip(scale, scale.slice(1)).some(([a, b]) => a === 1 && b === 1);
}

function hasAug2nd(scale: Steps): boolean {
  return scale.some((s) => s === 3);
}

const allPatterns: Steps[] = CScales(NUM_NOTES).map(getStepsC);

export const patterns = [
  [
    allPatterns.filter((p) => !hasDoubleHalfSteps(p) && !hasAug2nd(p)),
    allPatterns.filter((p) => hasDoubleHalfSteps(p) && !hasAug2nd(p)),
  ],
  [
    allPatterns.filter((p) => !hasDoubleHalfSteps(p) && hasAug2nd(p)),
    allPatterns.filter((p) => hasDoubleHalfSteps(p) && hasAug2nd(p)),
  ],
];

export const percentHasDoubleHalfSteps =
  (100 * allPatterns.filter(hasDoubleHalfSteps).length) / allPatterns.length;
export const percentHasAug2nd =
  (100 * allPatterns.filter(hasAug2nd).length) / allPatterns.length;
