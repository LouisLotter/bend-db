# Bend DB: learning comes first

The primary goal is understanding database design, Bend 2, and its proof system,
while reading Designing Data-Intensive Applications, second edition.
The learner has some functional programming experience and is new to proofs.

- Work in small runnable lessons; explain choices and tradeoffs before adding sophistication.
- `db/` owns the executable store, runtime examples, laws, and proofs.
- `learning/` owns lessons, the journal, decisions, setup examples, and website.
- Update `learning/JOURNAL.md` and `learning/decisions.json` as work progresses.
  Explain new Bend syntax in the lesson. Rebuild the website after changes.
- Distinguish introduced, demonstrated, tested, proved, and confirmed understood.
  Never mark a concept understood without evidence from the learner's replies.
- Prefer inspectable code over optimization. Invite predictions and questions.
  Preserve the first lesson before changing its representation. Do not race ahead
  into persistence or concurrency without discussing the next learning step.
- Run `bend version` and read `bend guide` before unfamiliar Bend code;
  read `bend guide shaders` before parallel or graphical work.
- Do not weaken laws to hide bugs. No proof holes, unsafe code, or custom foreign
  functions in the verified core. Run `make check` after core/proof changes.
- Three current laws do not establish full database correctness. Describe their
  exact scope and the assumptions of the compiler, runtime, and proof translation.
- The browser lab imports the generated ES module from `db/store.bend`; do not
  replace it with a JavaScript reimplementation. Trace rendering is separate UI code.
- Personal notebook drafts are browser-local, exportable data. Never claim they
  are committed, synced, or part of the database's durability guarantees.
- Keep the GitHub repository canonical. Site hosting uses an isolated source
  export; never replace this repository's origin with the hosting remote.
- No generated binaries, toolchain checkouts, credentials, or local personal
  notebook data in Git. Setup installer snapshots are archival, not auto-run.

Verified toolchain on 2026-10-25: Bend 2.0.39, Lean 4.34.0, Clang 22.1.8,
Node.js 26.8.1. Use external Google Chrome for browser verification.
