open Belt

type rec aSteps =
  | A1(bSteps)
  | A11(bSteps)
and bSteps =
  | B2(t)
  | B23(t)
  | B3(aSteps)
and t = A(aSteps) | B(bSteps) | Empty

let rec getAStepss = (len: int): list<aSteps> => {
  if len <= 1 {
    list{}
  } else {
    let a1Stepss = getBStepss(len - 1)->List.map(s => A1(s))
    let a11Stepss = getBStepss(len - 2)->List.map(s => A11(s))
    List.concat(a1Stepss, a11Stepss)
  }
}
and getBStepss = (len: int): list<bSteps> => {
  if len <= 0 {
    list{}
  } else {
    let b2Stepss = getStepss(len - 1)->List.map(s => B2(s))
    let b23Stepss = getStepss(len - 2)->List.map(s => B23(s))
    let b3Stepss = getAStepss(len - 1)->List.map(s => B3(s))
    List.concatMany([b2Stepss, b23Stepss, b3Stepss])
  }
}
and getStepss = (len: int): list<t> => {
  if len <= 0 {
    list{}
  } else {
    let aStepss = getAStepss(len)->List.map(s => A(s))
    let bStepss = getBStepss(len)->List.map(s => B(s))
    List.concat(aStepss, bStepss)
  }
}

let rec hasDoubleHalfSteps = (steps: t): bool => {
  switch steps {
  | A(steps) => hasDoubleHalfStepsA(steps)
  | B(steps) => hasDoubleHalfStepsB(steps)
  | Empty => false
  }
}
and hasDoubleHalfStepsA = (steps: aSteps): bool => {
  switch steps {
  | A1(steps) => hasDoubleHalfStepsB(steps)
  | A11(_) => true
  }
}
and hasDoubleHalfStepsB = (steps: bSteps): bool => {
  switch steps {
  | B2(steps)
  | B23(steps) =>
    hasDoubleHalfSteps(steps)
  | B3(steps) => hasDoubleHalfStepsA(steps)
  }
}

let rec hasAug2nd = (steps: t): bool => {
  switch steps {
  | A(steps) => hasAug2ndA(steps)
  | B(steps) => hasAug2ndB(steps)
  | Empty => false
  }
}
and hasAug2ndA = (steps: aSteps): bool => {
  switch steps {
  | A1(steps)
  | A11(steps) =>
    hasAug2ndB(steps)
  }
}
and hasAug2ndB = (steps: bSteps): bool => {
  switch steps {
  | B2(steps) => hasAug2nd(steps)
  | B23(_) => true
  | B3(steps) => hasAug2ndA(steps)
  }
}
