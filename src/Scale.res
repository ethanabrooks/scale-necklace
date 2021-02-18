module type ScaleType = {
  type t
}
module Scale: ScaleType = {
  type t = {steps: Steps.t, root: Note.t}
}
