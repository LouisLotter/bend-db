# A property covering every natural number, rather than individual test cases.
# The proof lives in PROOF.bend. Check both with: bend PROOF.bend
import Base

law add_zero:
  for x: Nat
  {Nat.add(x, 0n) == x : Nat}
