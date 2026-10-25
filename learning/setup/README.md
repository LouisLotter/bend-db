# Setup record — 2026-10-25

The original development environment is Arch-based Linux. These versions were
installed and exercised, not promised compatible with every future release:

| Tool | Version | Purpose |
| --- | --- | --- |
| Bend | 2.0.39 | Check and compile the store |
| Lean | 4.34.0 | Build/run the BendTT proof kernel used by `--verdict` |
| Elan | 4.2.4 | Manage the Lean toolchain |
| Clang | 22.1.8 | Compile generated C |
| Node.js | 26.8.1 | Run generated JavaScript and build the learning site |

The upstream compiler was cloned separately from
[bendlang/bend](https://github.com/bendlang/bend) at
`295e996574573e3a88827b1cf7045b437333c8f0`. It stays a dependency rather than
being copied into this learning repository. Bend's installed binary reports
`bend 2.0.39`. The release installer verified its download's SHA-256 checksum.

`bend-install.sh` is the unmodified installer snapshot retrieved from
https://bend-lang.com/install.sh. `elan-init.sh` is the unmodified installer
snapshot from https://raw.githubusercontent.com/leanprover/elan/master/elan-init.sh.
They are archived for provenance; the build does not execute them. Consult
[the Bend repository](https://github.com/bendlang/bend) and
[Elan's instructions](https://github.com/leanprover/elan) for a fresh installation.
The installer snapshots follow their upstream defaults and do not pin versions.

The installed tools should be on PATH. Check them before building:

```sh
bend version
lean --version
clang --version
node --version
make --version
python3 --version
```

`installation-checks.json` preserves the observed results with local home paths
replaced by portable placeholders. `lean-verdict-check.log` records the initial
kernel recheck. These are historical evidence, not a replacement for rerunning
`make check` after a change.

## Original experiments

From `learning/playground/`:

```sh
mkdir -p build
bend hello.bend -o build/hello
./build/hello +RTS --threads 1 --gpu off
bend parallel.bend -o build/parallel
./build/parallel +RTS --threads 1 --gpu off
./build/parallel +RTS --threads 16 --gpu off
bend PROOF.bend --verdict
```

The parallel example produced `1048576` with either CPU thread count. That is
an agreement check, not a performance benchmark. GPU/CUDA was not configured
or tested. The arithmetic proof establishes `Nat.add(x, 0n) == x` for every
natural number. A deliberately false proof was also rejected during setup.
