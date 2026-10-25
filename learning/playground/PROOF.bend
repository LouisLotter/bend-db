# Run: bend PROOF.bend
# Expected: ALL PROOFS CHECK
# Independent kernel recheck: bend PROOF.bend --verdict
# Lean 4.34.0 and Bend's cached kernel are installed; this check passes too.
import Base
import ./LAWS.bend as Laws

# Induction: zero is immediate; rewrite the successor case using the proof
# for its predecessor, then finish with reflexivity ({==}).
def Laws.add_zero(x):
  match x:
    case 0n:
      {==}
    case 1n+previous:
      %Laws.add_zero(previous) : {1n+Nat.add(previous, 0n) == 1n+_ : Nat}
      {==}
