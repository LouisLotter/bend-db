import Base
import ./store.bend as KV
import ./LAWS.bend as Laws

# The empty lookup computes to None, so both sides are the same expression.
def Laws.empty_is_missing(key):
  {==}

# A helper theorem: a natural number compares equal to itself.
# The orientation True == comparison lets % replace the comparison on the left
# of our final goals. Zero is immediate; successors reduce to predecessors.
def key_equals_itself(key: Nat) -> {True{} == Nat.is_eq(key, key) : Bool}:
  match key:
    case 0n:
      {==}
    case 1n+previous:
      key_equals_itself(previous)

# Unfolding get and put reaches choose. Replace its comparison with True;
# choose then returns Some{value}, whatever the older history contains.
def Laws.read_after_put(db, key, value):
  %key_equals_itself(key) : {KV.choose(_, Some{value}, u => KV.get(db, key)) == Some{value} : Maybe<&2, String>}
  {==}

# A deletion is the same argument, with None at the head of the history.
def Laws.read_after_delete(db, key):
  %key_equals_itself(key) : {KV.choose(_, None{}, u => KV.get(db, key)) == None{} : Maybe<&2, String>}
  {==}
