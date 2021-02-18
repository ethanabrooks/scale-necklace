open Belt

type rec a =
  | A1_
  | A1(b)
  | A11(b)
and b =
  | B2(t)
  | B23(t)
  | B3(a)
and t = A(a) | B(b) | Empty

let rec getA = (len: int): list<a> => {
  if len <= 0 {
    list{}
  } else {
    let a1_ = list{A1_}
    let a1 = getB(len - 1)->List.map(s => A1(s))
    let a11 = getB(len - 2)->List.map(s => A11(s))
    List.concatMany([a1_, a1, a11])
  }
}
and getB = (len: int): list<b> => {
  if len <= 0 {
    list{}
  } else {
    let b2 = get(len - 1)->List.map(s => B2(s))
    let b23 = get(len - 2)->List.map(s => B23(s))
    let b3 = getA(len - 1)->List.map(s => B3(s))
    List.concatMany([b2, b23, b3])
  }
}
and get = (len: int): list<t> => {
  if len <= 0 {
    list{}
  } else {
    let aSteps = getA(len)->List.map(s => A(s))
    let bSteps = getB(len)->List.map(s => B(s))
    List.concat(aSteps, bSteps)
  }
}

let rec hasDoubleHalfSteps = (steps: t): bool => {
  switch steps {
  | A(steps) => hasDoubleHalfStepsA(steps)
  | B(steps) => hasDoubleHalfStepsB(steps)
  | Empty => false
  }
}
and hasDoubleHalfStepsA = (steps: a): bool => {
  switch steps {
  | A1_ => false
  | A1(steps) => hasDoubleHalfStepsB(steps)
  | A11(_) => true
  }
}
and hasDoubleHalfStepsB = (steps: b): bool => {
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
and hasAug2ndA = (steps: a): bool => {
  switch steps {
  | A1_ => false
  | A1(steps)
  | A11(steps) =>
    hasAug2ndB(steps)
  }
}
and hasAug2ndB = (steps: b): bool => {
  switch steps {
  | B2(steps) => hasAug2nd(steps)
  | B23(_) => true
  | B3(steps) => hasAug2ndA(steps)
  }
}
