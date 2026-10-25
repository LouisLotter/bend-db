# Specifications: read these before the proof implementations.
import Base
import ./store.bend as KV

# Any key is missing from a newly created store.
law empty_is_missing:
  for key: Nat
  {KV.get(KV.empty(), key) == None{} : Maybe<&2, String>}

# Any key, value, and previous store: reading a write gives that value.
law read_after_put:
  for db: KV.Store
  for key: Nat
  for value: String
  {KV.get(KV.put(db, key, value), key) == Some{value} : Maybe<&2, String>}

# Any previous store: deleting a key makes that key missing.
law read_after_delete:
  for db: KV.Store
  for key: Nat
  {KV.get(KV.delete(db, key), key) == None{} : Maybe<&2, String>}
