module type ScaleType = {
  type t
  let toNotes: t => list<Note.t>
}
module Scale: ScaleType = {
  type t = {steps: Steps.t, root: Note.t}

  let rec toNotes = ({steps, root}: t): list<Note.t> =>
    switch steps {
    | A(steps) => steps->toNotesA(root)
    | B(steps) => steps->toNotesB(root)
    | Empty => list{}
    }
  and toNotesA = (steps: Steps.a, root: Note.t): list<Note.t> => {
    let tail = switch steps {
    | A1(b) => b->toNotesB(root->Note.next)
    | A11(b) => {
        let next = root->Note.next
        list{next, ...b->toNotesB(next->Note.next)}
      }
    }
    list{root, ...tail}
  }
  and toNotesB = (steps: Steps.b, root: Note.t): list<Note.t> => {
    let next = root->Note.next->Note.next
    let tail = switch steps {
    | B2(steps) => toNotes({steps: steps, root: next})
    | B23(steps) => {
        let tail = toNotes({steps: steps, root: next->Note.next})
        list{next, ...tail}
      }
    | B3(steps) => steps->toNotesA(next->Note.next)
    }
    list{root, ...tail}
  }
}
