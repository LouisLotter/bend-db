# Bend DB

A database built to understand databases, Bend 2, and proofs. Learning is the
primary goal. We are working through small runnable stages alongside
*Designing Data-Intensive Applications*, second edition.

## Two places to work

- **[db/](db/)** — the in-memory key-value store, examples, tests, laws, and proofs.
- **[learning/](learning/)** — explanations, design decisions, learning journal,
  setup experiments, and the interactive learning website.

Start with [lesson 1](learning/lessons/01-memory-store.md), then experiment in
the website. We assume some functional programming experience and no proof background.

```sh
make run          # eight observations of the Bend store
make check        # 16 native tests + 16 JavaScript tests + three kernel-checked laws
make site         # compile the actual Bend store into the learning website
make site-test    # check the browser adapter and generated content
make serve        # http://127.0.0.1:4173 — open in Google Chrome
```

Requirements: Bend 2.0.39, Clang, Make, Node.js, Python 3; Lean 4.34.0 for
BendTT's `--verdict` check. See [setup](learning/setup/README.md).
No npm packages are needed for the learning website.

## Current milestone

The store is a pure, newest-first history with natural-number keys and text
values. Writes add entries; reads scan until the first matching key. Deletion
adds a tombstone so older values cannot reappear. All store data is in memory.

We have proved three specific laws: an empty store has no values, a value can
be read immediately after writing it, and a key is missing immediately after
deleting it. This is not a proof of a complete database. Other-key preservation
is tested on examples and remains an open universal law.

The website includes a guided lesson, the real Bend store in a browser lab,
a proof walkthrough, the tracked design log, and an exportable personal notebook.
Browser notebook storage is separate from the Bend store; it is not a persistence
implementation for our database.

## How the work is preserved

This repository includes our database code, learning material, setup verification
record, original setup examples, and archived installer scripts. The upstream
compiler and installed toolchains are dependencies, not vendored project source.
The exact upstream revision is recorded in `learning/setup/installation-checks.json`.
Build outputs and personal browser notes are excluded from Git.

The GitHub repository is public. A hosted learning-site preview, when configured,
starts private. See [the website guide](learning/site/README.md) for rebuilding
and hosting without changing this repository's Git remote.
