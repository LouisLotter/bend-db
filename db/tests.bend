# Concrete examples complement the universal laws in LAWS.bend.
import Base
import ./store.bend as KV

def same(a: Maybe<&2, String>, b: Maybe<&2, String>) -> Bool:
  match a b:
    case None{} None{}:
      True{}
    case Some{x} Some{y}:
      String.eq(x, y)
    case _ _:
      False{}

def report(ok: Bool, label: String) -> IO(Unit):
  match ok:
    case True{}:
      IO.print("PASS " ++ label)
    case False{}:
      IO.die(Unit, 1, "FAIL " ++ label)

def expect(label: String, got: Maybe<&2, String>, wanted: Maybe<&2, String>) -> IO(Unit):
  report(same(got, wanted), label)

def main() -> IO(Unit):
  +db0 = KV.empty()
  +db1 = KV.put(db0, 7n, "apple")
  +db2 = KV.put(db1, 9n, "pear")
  +db3 = KV.put(db2, 7n, "plum")
  +db4 = KV.delete(db3, 7n)
  do IO<Unit>:
    expect("empty lookup", KV.get(db0, 7n), None{})
    expect("zero is a valid key", KV.get(KV.put(db0, 0n, "zero"), 0n), Some{"zero"})
    expect("lookup at head", KV.get(db2, 9n), Some{"pear"})
    expect("lookup past a different key", KV.get(db2, 7n), Some{"apple"})
    expect("unknown key", KV.get(db2, 8n), None{})
    expect("latest write wins", KV.get(db3, 7n), Some{"plum"})
    expect("write preserves another key", KV.get(db3, 9n), Some{"pear"})
    expect("delete cannot resurrect an older value", KV.get(db4, 7n), None{})
    expect("delete preserves another key", KV.get(db4, 9n), Some{"pear"})
    expect("deleting an absent key preserves existing data", KV.get(KV.delete(db2, 99n), 7n), Some{"apple"})
    expect("repeated deletion stays missing", KV.get(KV.delete(db4, 7n), 7n), None{})
    expect("write after delete", KV.get(KV.put(db4, 7n, "cherry"), 7n), Some{"cherry"})
    expect("empty text is a value", KV.get(KV.put(db4, 7n, ""), 7n), Some{""})
    expect("older state remains usable", KV.get(db1, 7n), Some{"apple"})
    expect("key beyond the small literal range", KV.get(KV.put(db0, 300n, "large"), 300n), Some{"large"})
    expect("adjacent large key differs", KV.get(KV.put(db0, 300n, "large"), 301n), None{})
    IO.print("16 examples passed")
