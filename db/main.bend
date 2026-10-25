import Base
import ./store.bend as KV

def show(result: Maybe<&2, String>) -> String:
  match result:
    case None{}:
      "missing"
    case Some{value}:
      "found: [" ++ value ++ "]"

# + keeps a state usable by both a lookup and the next operation.
# Names db0, db1, ... make the successive states explicit.
def main() -> IO(Unit):
  +db0 = KV.empty()
  +db1 = KV.put(db0, 7n, "apple")
  +db2 = KV.put(db1, 9n, "pear")
  +db3 = KV.put(db2, 7n, "plum")
  +db4 = KV.delete(db3, 7n)
  +db5 = KV.put(db4, 7n, "")
  do IO<Unit>:
    IO.print("empty, get 7 -> " ++ show(KV.get(db0, 7n)))
    IO.print("put 7 apple, get 7 -> " ++ show(KV.get(db1, 7n)))
    IO.print("put 9 pear, get 7 -> " ++ show(KV.get(db2, 7n)))
    IO.print("put 7 plum, get 7 -> " ++ show(KV.get(db3, 7n)))
    IO.print("delete 7, get 7 -> " ++ show(KV.get(db4, 7n)))
    IO.print("after deletion, get 9 -> " ++ show(KV.get(db4, 9n)))
    IO.print("put 7 empty text, get 7 -> " ++ show(KV.get(db5, 7n)))
    IO.print("old state db1, get 7 -> " ++ show(KV.get(db1, 7n)))
