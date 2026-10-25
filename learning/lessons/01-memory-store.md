# A database built to learn

We are learning database design, Bend 2, and proofs alongside *Designing
Data-Intensive Applications*, second edition. The first milestone is a small
in-memory key-value store whose implementation we can read completely.

Start with the trace below, then read `store.bend`, then the first law and proof.
The [learning journal](../JOURNAL.md) records our decisions, checks, and open questions.
The user has some functional programming experience and is new to proofs.

## Run the lesson

From the repository root, first run `cd db`:

```sh
make run     # compile and run the step-by-step demo
make test    # 16 concrete examples on native C and JavaScript backends
make proof   # check all three laws with the BendTT kernel
make check   # run examples, then the kernel check
```

Prerequisites: Bend 2.0.39, Clang, Make, Node.js, and Lean 4.34.0 for the
kernel check. These versions were verified in the original development environment. The Makefile disables Bend's
optional update check during these commands. For a quick direct run:

```sh
bend main.bend
bend PROOF.bend --verdict
```

The demo is a scripted sequence of operations in one process. It is not an
interactive server. Every invocation starts fresh; no database data is saved.

## The contract before the representation

A key identifies a value. Our keys are natural numbers (`0n`, `7n`, `9n`),
and our values are strings (`"apple"`). For this milestone:

- `empty()` creates a store with no visible keys.
- `put(db, key, value)` returns the state after writing a value.
- `get(db, key)` returns either `Some{value}` or `None{}`.
- `delete(db, key)` returns a state in which that key is missing.

A later write replaces the *visible* value. An absent-key deletion is allowed.
An empty string is a valid value: `Some{""}` differs from `None{}`. Using a
separate missing case avoids reserving a perfectly valid value as a sentinel.

Operations are pure functions. Each update takes a state and returns a state;
there is no global mutable database. The names `db0`, `db1`, and so on in the
demo make these transitions explicit. If a caller retains an old state, it
can still read that state. That is a property of this functional representation,
not a transaction or an MVCC implementation.

## Our first physical representation

The store is a linked history, newest entry first:

```text
put 7 "apple"  ->  (7, Some{"apple"}) -> End
put 9 "pear"   ->  (9, Some{"pear"}) -> (7, Some{"apple"}) -> End
put 7 "plum"   ->  (7, Some{"plum"}) -> (9, Some{"pear"}) -> (7, Some{"apple"}) -> End
```

`get(7)` scans from the front and stops at the first matching key. It returns
`"plum"`. The old `"apple"` entry still exists but is hidden by the newer write.

This is our first distinction between a **logical view** and a **physical
representation**. Logically, key 7 has one value. Physically, its write history
has two entries. The history lives only in memory; it is not a durable log.

The Bend datatype is:

```bend
type Store is Data:
  End{}
  Entry{key: Nat, value: Maybe<&2, String>, rest: Store}
```

`End{}` is the end of the chain. `Entry{...}` contains a key, an optional
value, and the rest of the chain. These are the two cases that `get` matches.
`is Data` permits sharing a store. `Maybe<&2, String>` makes the optional
string shareable too; the quantity `&2` means reusable.

We chose `Nat` keys because their zero/successor structure makes the first
equality proof small enough to follow. The `n` suffix distinguishes a natural
number from a default `U32` literal. This is a teaching choice; text or byte
keys are a later design decision. The theory's naturals are unbounded, but the
installed native runtime caps `Nat` at `2^48 - 1`.

## Deletion records absence

Deleting 7 adds a **tombstone**, an entry whose value is `None{}`:

```text
(7, None{}) -> (7, Some{"plum"}) -> (9, Some{"pear"}) -> (7, Some{"apple"}) -> End
```

The first matching entry still wins. `get(7)` returns `None{}` immediately.
Continuing past the tombstone would incorrectly resurrect `"plum"`.

This operation removes the key from the logical view. It does not reclaim the
memory occupied by its history. A later `put(7, "cherry")` adds a new entry in
front of the tombstone and makes the key visible again.

## Reading the Bend code

`put` and `delete` each construct one `Entry`. Read them first in `store.bend`.
Then read `get`, which matches the store:

1. At `End`, it returns `None`.
2. At an `Entry`, it compares the requested key with that entry's key.
3. A match returns the entry's optional value. A mismatch searches `rest`.

Bend matches parameters rather than arbitrary computed expressions. We pass
the computed Boolean comparison to a small helper, `choose`, which matches
`True{}` or `False{}`.

The final argument `u => get(rest, key)` is a **closure** that postpones the
remaining search. `choose` calls it with `Unit{}` only after a mismatch.
Passing the result of `get(rest, key)` directly would evaluate that search
before the choice in a compiled program. This distinction matters because
Bend's compiled execution is strict. `u` is unused; `Unit` supplies the empty
argument needed to call the closure.

In `get(db: Store, +key: Nat)`, the `+` permits using `key` both in the
comparison and in the remaining search. Bend normally allows a binding to be
used at most once. In the demo, `+db1` similarly lets us both read that state
and use it to make the next one. This expresses permission to share a value;
it does not promise a full deep copy on each use.

## Our first proof

A runtime test checks selected inputs. A law states a property for every input
named by its `for` lines. Here is the first law in `LAWS.bend`:

```bend
law empty_is_missing:
  for key: Nat
  {KV.get(KV.empty(), key) == None{} : Maybe<&2, String>}
```

Read it as: **for every natural-number key, looking it up in an empty store
returns missing.** The `==` here is a proposition to prove, not a Boolean test.
The type after `:` says what kind of values are being compared.

Its entire proof is:

```bend
def Laws.empty_is_missing(key):
  {==}
```

Why does this work? Expand the left side using our definitions:

```text
get(empty(), key)
= get(End{}, key)
= None{}
```

Both sides now have the same form. `{==}` is **reflexivity**, evidence that an
expression equals itself. It is not an unchecked assertion. The checker
accepts it only when the two sides compute to the same term. No specific key
was selected, so the reasoning covers every key.

## The next two proofs

`read_after_put` states that any write can be read back, for any prior store,
key, and string. `read_after_delete` states that deleting any key makes it
missing, whatever history preceded it.

Both operations add a matching entry at the front. Their proofs need the
helper fact that a key compares equal to itself. We prove that by **induction**:

- Zero compared with zero reduces to true.
- Comparing two successors reduces to comparing their predecessors, where
  we use the same proof on the smaller natural number.

The pattern `1n+previous` means “a successor whose predecessor is `previous`.”
It is different syntax from the reuse annotation `+key`.

In `PROOF.bend`, the helper's equality is oriented as `True == comparison`.
The `%` rewrite has an explicit goal template, with `_` marking the location
to replace. Bend's rewrite turns a goal containing the equality's right side
into one containing its left side. The Boolean test becomes `True`, `choose`
returns the newest entry, and `{==}` finishes. This is a useful second reading;
understanding the empty-store proof is enough for the first pass.

`--verdict` additionally checks the translated definitions and proofs with
BendTT's Lean-built kernel. It does not prove the native compiler or runtime
correct. The runtime tests exercise the compiled implementations separately.

## Costs and current boundaries

Let `n` be the number of historical writes and deletions in a store.

| Operation | Representation-level work |
| --- | --- |
| `put` | Add one entry at the head |
| `delete` | Add one tombstone at the head |
| `get` | Compare up to `n` keys, stopping at the first match |
| Retain the current store | Keep its history and referenced values reachable |

These count data-structure operations, not complete runtime timings: key
comparison, allocation, sharing, and reclamation have their own costs. Repeated
writes to one key grow the history even though only one key is visible.

There is no persistence, compaction, index, concurrency, network protocol, or
transaction implementation in this milestone. Each would introduce a new
design question. The next useful proof would show that a write leaves every
different key unchanged; for now, we test examples of that property.

## Questions to try before changing anything

1. After `put 7 "apple"`, `put 7 "plum"`, and `delete 7`, what would happen
   if deletion only removed the front entry?
2. Why can't an empty string stand in for “missing”?
3. If we write the same key a million times, how many visible keys and how
   many history entries are there?
4. Does `read_after_put` alone prevent an implementation from discarding every
   other key? Which additional property would we need?

## Files and references

- `store.bend`: the entire pure implementation, 34 lines including comments.
- `main.bend`: a trace through successive states, including an older snapshot.
- `tests.bend`: 16 concrete examples; a failing example exits with status 1.
- `LAWS.bend`: three universal claims.
- `PROOF.bend`: proofs of those claims and the key-equality helper.
- `learning/JOURNAL.md`: the continuing learning journal and verification record.
- [Bend guide](https://github.com/bendlang/bend/blob/295e996574573e3a88827b1cf7045b437333c8f0/guide/GUIDE.md): quantities, closures, matching, laws, and proofs.
- [Base library](https://github.com/bendlang/bend/blob/295e996574573e3a88827b1cf7045b437333c8f0/bend2/base.bend): `Nat.cmp`, `Nat.is_eq`, and `Maybe`.
- [Runtime limits](https://github.com/bendlang/bend/blob/295e996574573e3a88827b1cf7045b437333c8f0/WONTFIX.txt): the Nat cap and evaluation differences.
