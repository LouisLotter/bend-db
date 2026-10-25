# Learning journal

## Purpose and working agreement

Understanding is the primary goal: databases and their design tradeoffs, Bend 2,
and its proof system. The user is reading *Designing Data-Intensive Applications*,
second edition, has some functional programming experience, and is new to proofs.
Their current chapter and preferred lesson length have not been established.

Build small working stages, explain choices, invite predictions, and record
discoveries. Keep tests, theorems, runtime assumptions, and future intentions
distinct. Do not treat a delivered explanation as confirmed understanding.

## 2026-10-25 — First in-memory store

### Decisions and reasons

| Decision | Reason and tradeoff |
| --- | --- |
| Numeric `Nat` keys, text values | The first equality proof uses simple structural induction. Text and byte keys remain a future design choice. |
| A newest-first linked history | Makes overwrite semantics visible. Writes add a node; lookup may walk the history. |
| `Maybe` for lookup results | Distinguishes absence from every valid string, including the empty string. |
| Tombstones for deletion | Stops old values from becoming visible again. Old entries remain allocated while reachable. |
| Pure state transitions | Makes before/after states explicit and lets the proofs refer directly to executable functions. |
| A deferred tail search | Avoids evaluating older history before knowing whether the head matched. |
| Sequential execution | Establishes operation semantics before adding scheduling or isolation questions. |
| A scripted demo and separate tests | Keeps the first lesson centered on storage behavior; parsing and networking can come later. |

The first useful distinction is logical versus physical state: key 7 has one
visible value while the representation can hold several historical writes.
A tombstone means logically absent, not physically removed. This memory history
is not a disk log, a WAL, or a durability guarantee.

### Concepts introduced

- Database basics: key/value association, overwrite, missing values, tombstones,
  sequential lookup, historical state, and the cost of retaining old versions.
- Bend: algebraic datatypes, `Data`, quantities and `+`, `Nat` literals,
  pattern matching, closures, pure functions, and an `IO` presentation layer.
- Proofs: universal quantification, equality propositions, reflexivity,
  structural induction, rewriting, and the distinction between tests and proofs.

These concepts have been introduced in code and notes. The user's understanding
of each is still to be discussed; no mastery is assumed.

### Verification record

Toolchain: Bend 2.0.39, Lean 4.34.0, Clang 22.1.8, Node.js 26.8.1.

- `make run`: native demo prints the expected eight state observations.
- `make test`: all 16 concrete examples pass on both native and JavaScript
  backends. They cover empty and unknown keys, overwrite, unrelated keys,
  tombstones, repeated deletion, re-insertion, empty text, retained old states,
  zero, and keys on either side of the small-literal conversion boundary.
- `bend PROOF.bend --verdict`: `ALL PROOFS CHECK`.

| Universal law proved | Scope |
| --- | --- |
| `empty_is_missing` | Every key is absent from the empty store. |
| `read_after_put` | For every prior store, key, and string, reading immediately after writing returns that string. |
| `read_after_delete` | For every prior store and key, reading immediately after deleting returns missing. |

There are no proof holes, unsafe annotations, or custom foreign functions in
the core or proofs. The printing/testing layer uses Base IO. The laws import
the actual core implementation, so editing it changes what must be proved.

The current laws do **not** universally establish preservation of other keys,
snapshot behavior, complexity, native backend correctness, or durability.
Some of those behaviors have concrete tests. A particularly revealing limitation:
`read_after_put` alone would allow a write to discard every unrelated key.

### Next discussion

Walk through the history and the one-line empty-store proof together. Use the
questions at the end of lesson 1 to distinguish “explained” from “understood.”
Then consider adding the missing other-key preservation law before changing
the representation. Persistence is a later milestone, not an automatic next step.

## 2026-10-25 — A home for the code and the learning process

The project now lives in `LouisLotter/bend-db`, with `db/` and `learning/` as
the two working areas. The original store, proofs, tests, setup examples, and
verification records are preserved. The compiler remains a pinned external
dependency; generated binaries are excluded from Git.

The website offers a guided lesson, a browser explorer calling the actual
Bend-compiled store, an empty-store proof walkthrough, nine explicit design
decisions, this journal, and a personal notebook. The lesson and journal are
rendered from tracked Markdown; decisions come from `decisions.json`.

Personal notes save only in the browser and can be exported as Markdown or
backed up/imported as JSON. They are not automatically pushed to GitHub.
Accepted insights should be reviewed and added to the tracked journal or
design log. The browser notebook is separate from database storage.

### Verification after the move

- The native demonstration still prints all eight expected observations.
- All 16 store examples pass on both native and JavaScript output.
- All three database laws pass `--verdict` in the new location.
- Five website tests pass, including 100 mixed operations compared with an
  independent Map model, trace/display agreement, Unicode and empty values,
  invalid key inputs, notebook backup validation, and generated content.
- Google Chrome checks: overwrites, tombstone deletion, stored empty text,
  pinned state, proof-step navigation, decision filtering, note saving and
  reload, and a downloaded JSON backup. The browser download-event wait
  timed out, but the resulting file was found and its content verified.
- Desktop and narrow-screen layouts were inspected; no page-level horizontal
  overflow was observed at the narrow viewport. JSON import validation is
  unit-tested; the file-picker import flow was not exercised in Chrome.

This is organizational and teaching work, not a new storage milestone. No
additional database properties have been proved and no learner mastery has
been inferred. The next discussion remains the history, tombstones, and the
empty-store proof, followed by the missing other-key preservation property.
