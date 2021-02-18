type t =
  | A
  | As
  | B
  | C
  | Cs
  | D
  | Ds
  | E
  | F
  | Fs
  | G
  | Gs

let sharpName = (note: t) => {
  switch note {
  | A => "a"
  | As => "a♯"
  | B => "b"
  | C => "c"
  | Cs => "c♯"
  | D => "d"
  | Ds => "d♯"
  | E => "e"
  | F => "f"
  | Fs => "f♯"
  | G => "g"
  | Gs => "g♯"
  }
}

let flatName = (note: t) => {
  switch note {
  | A => "a"
  | As => "b♭"
  | B => "b"
  | C => "c"
  | Cs => "d♭"
  | D => "d"
  | Ds => "e♭"
  | E => "e"
  | F => "f"
  | Fs => "g♭"
  | G => "g"
  | Gs => "a♭"
  }
}
