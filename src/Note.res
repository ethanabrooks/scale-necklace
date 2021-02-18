type ga = GA
type g = G(ga)
type fg = FG(g)
type f = F(fg)
type e = E(f)
type de = DE(e)
type d = D(de)
type cd = CD(d)
type c = C(cd)
type b = B(c)
type ab = AB(b)
type a = A(ab)

let ga: ga = GA
let g: g = G(ga)
let fg: fg = FG(g)
let f: f = F(fg)
let e: e = E(f)
let de: de = DE(e)
let d: d = D(de)
let cd: cd = CD(d)
let c: c = C(cd)
let b: b = B(c)
let ab: ab = AB(b)
let a: a = A(ab)

type t =
  | A(a)
  | AB(ab)
  | B(b)
  | C(c)
  | CD(cd)
  | D(d)
  | DE(de)
  | E(e)
  | F(f)
  | FG(fg)
  | G(g)
  | GA(ga)

let next = (note: t): t => {
  switch note {
  | A(A(n)) => AB(n)
  | AB(AB(n)) => B(n)
  | B(B(n)) => C(n)
  | C(C(n)) => CD(n)
  | CD(CD(n)) => D(n)
  | D(D(n)) => DE(n)
  | DE(DE(n)) => E(n)
  | E(E(n)) => F(n)
  | F(F(n)) => FG(n)
  | FG(FG(n)) => G(n)
  | G(G(n)) => GA(n)
  | GA(GA) => A(a)
  }
}

let prev = (note: t): t => {
  switch note {
  | AB(n) => A(A(n))
  | B(n) => AB(AB(n))
  | C(n) => B(B(n))
  | CD(n) => C(C(n))
  | D(n) => CD(CD(n))
  | DE(n) => D(D(n))
  | E(n) => DE(DE(n))
  | F(n) => E(E(n))
  | FG(n) => F(F(n))
  | G(n) => FG(FG(n))
  | GA(n) => G(G(n))
  | A(_) => GA(GA)
  }
}

let rec index = (note: t): int => {
  switch note {
  | A(_) => 0
  | note => 1 + note->prev->index
  }
}

let ga: t = GA(GA)
let g: t = G(g)
let fg: t = FG(fg)
let f: t = F(f)
let e: t = E(e)
let de: t = DE(de)
let d: t = D(d)
let cd: t = CD(cd)
let c: t = C(c)
let b: t = B(b)
let ab: t = AB(ab)
let a: t = A(a)

let octave = index(ga)

let sharpName = (note: t) => {
  switch note {
  | A(_) => "a"
  | AB(_) => "a♯"
  | B(_) => "b"
  | C(_) => "c"
  | CD(_) => "c♯"
  | D(_) => "d"
  | DE(_) => "d♯"
  | E(_) => "e"
  | F(_) => "f"
  | FG(_) => "f♯"
  | G(_) => "g"
  | GA(_) => "g♯"
  }
}

let flatName = (note: t) => {
  switch note {
  | A(_) => "a"
  | AB(_) => "b♭"
  | B(_) => "b"
  | C(_) => "c"
  | CD(_) => "d♭"
  | D(_) => "d"
  | DE(_) => "e♭"
  | E(_) => "e"
  | F(_) => "f"
  | FG(_) => "g♭"
  | G(_) => "g"
  | GA(_) => "a♭"
  }
}
