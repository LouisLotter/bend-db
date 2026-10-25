# Lesson 1: a newest-first history in memory.
import Base

# None is a deletion marker; Some{""} is a stored empty string.
type Store is Data:
  End{}
  Entry{key: Nat, value: Maybe<&2, String>, rest: Store}

def empty() -> Store:
  End{}

# Each write adds one entry. Older entries remain behind it.
def put(db: Store, key: Nat, value: String) -> Store:
  Entry{key, Some{value}, db}

def delete(db: Store, key: Nat) -> Store:
  Entry{key, None{}, db}

# A closure postpones the rest of the search until a mismatch.
# Bend matches parameters, so the computed comparison is passed to this helper.
def choose(found: Bool, value: Maybe<&2, String>, later: Unit -> Maybe<&2, String>) -> Maybe<&2, String>:
  match found:
    case True{}:
      value
    case False{}:
      later(Unit{})

# The first matching entry wins, including a deletion marker.
def get(db: Store, +key: Nat) -> Maybe<&2, String>:
  match db:
    case End{}:
      None{}
    case Entry{stored_key, value, rest}:
      choose(Nat.is_eq(key, stored_key), value, u => get(rest, key))
