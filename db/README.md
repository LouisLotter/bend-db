# The database

The first implementation is an in-memory, newest-first history.
Read the [guided lesson](../learning/lessons/01-memory-store.md) for the design.

| File | Role |
| --- | --- |
| `store.bend` | Pure `empty`, `put`, `get`, and `delete` operations |
| `main.bend` | Eight observations across successive states |
| `tests.bend` | 16 concrete behavioral checks |
| `LAWS.bend` | Three universal claims about those operations |
| `PROOF.bend` | Proofs importing the actual implementation |

Run `make run`, `make test`, `make proof`, or `make check` in this directory.
The test target runs native C and JavaScript output. The proof target uses
`--verdict` to recheck with BendTT's Lean-built kernel.

A write returns a state; it does not update a global variable. Keys are `Nat`,
values are `String`, and lookup returns `Maybe<&2, String>`. Missing values
and stored empty strings are different cases. There is no disk storage,
network server, index, compaction, concurrency, or transaction layer yet.
