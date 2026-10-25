# The learning website

**[Open the hosted learning notebook](https://bend-db-learning-20261025.mossy-sloth-6666.chatgpt.site)**

Published privately on 2026-10-25 (version 1). Access is restricted to the
owner; the site uses the normal ChatGPT sign-in flow. Local preview needs no
sign-in. The hosting service confirmed successful deployment; authenticated
hosted-page inspection remains pending account-selection approval.

A dependency-free static site with a lesson, an interactive explorer, a proof
walkthrough, a versioned design log and journal, and a personal browser notebook.

From the repository root:

```sh
make site           # compile Bend, copy assets, render tracked learning Markdown
make site-test      # verify real Bend/JS interop, traces, note backups, content
make serve          # build and serve at http://127.0.0.1:4173
```

Open the local URL in **Google Chrome**. Stop the server with Ctrl-C.
The source is `src/`; `scripts/build.mjs` writes the ignored `dist/` directory.
The build needs Bend 2.0.39 and Node.js. Serving locally also needs Python 3.
There are no npm dependencies or external font requests.

## One implementation

`store.mjs` is compiled directly from `../../db/store.bend`. It is not a separate
JavaScript implementation. The browser buttons call the generated pure exports.
`lab.mjs` renders the physical history and derives the logical view; its tests
compare mixed operations with an independent JavaScript Map model.

The diagram is a representation trace, not instrumentation of the compiler.
The UI and compiler are outside our three proved database laws. Explorer limits
(200 writes, keys up to a million, 500 characters per value) keep the lesson
readable; they do not define the store's general contract.

## Update the teaching material

- Edit `../lessons/01-memory-store.md` for the long explanation.
- Edit `../JOURNAL.md` for verified progress and open questions.
- Edit `../decisions.json` for accepted decisions, alternatives, and consequences.
- Edit `src/index.html` for guided prompts and proof-step framing; `src/app.js`
  owns the interactive proof steps. Keep these consistent with `db/PROOF.bend`.
- Rebuild with `make site`; do not edit generated `dist/` files.

The small Markdown renderer supports the subset used by these documents: headings,
paragraphs, lists, tables, fenced code, emphasis, and links. Raw HTML is escaped.

## Notes are browser-local

The personal notebook uses `localStorage` under `bend-db.notebook.v1`. Drafts
save separately. Export Markdown for discussion or versioning; export JSON for
backup and import. Imports merge entries and reject conflicting IDs. There is
no automatic repository sync, account backend, or sharing of notebook data.
A local preview and a hosted site have different origins and separate notes.
Transfer notes between them by exporting and importing JSON. Export before
clearing browser data. If storage fails, the UI reports that notes are in memory.

Reviewed insights can be added to the tracked journal or decisions file. A
personal reflection is not automatically evidence of mastery or an accepted
project decision. Notebook storage is unrelated to database durability.

## Hosting

The `.openai/hosting.json` manifest identifies the private hosted preview.
The canonical repository is `LouisLotter/bend-db`. To publish with Sites, build
and verify here, then copy this site's source, manifest, generated `dist/`, the
learning inputs, and database source into an isolated hosting checkout. Run `node learning/site/scripts/export.mjs /tmp/bend-db-site-export` from the
repository root, choosing a new destination each time. This creates the isolated
export with a complete source snapshot and the static output. The
Sites source helper manages that separate remote. Never run it against this
repository root or replace the GitHub origin. Do not include `.git`, credentials,
local notebook data, or installed toolchains in the export.

Any static host can serve `dist/`. Only that directory needs to be served;
all page navigation uses URL fragments and needs no special routing rules.
