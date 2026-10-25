# Compile: bend parallel.bend -o build/parallel
# Run: ./build/parallel +RTS --threads 1 --gpu off
# Run: ./build/parallel +RTS --threads 16 --gpu off
# Both runs print 1048576 (2^20). This is a smoke test, not a benchmark.
import Base

# + lets both branches reuse the depth; a b = ... forks the two calls.
def pow2(+depth: Nat) -> U32:
  match depth:
    case 0n:
      1
    case 1n+previous:
      a b = pow2(previous) pow2(previous)
      (a + b : U32)

def main() -> IO(Unit):
  IO.print(U32.show(pow2(20n)))
