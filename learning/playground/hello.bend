# Run: bend hello.bend
# Compile: bend hello.bend -o build/hello
import Base

def main() -> IO(Unit):
  IO.print("Hello from Bend 2!")
