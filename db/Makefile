BEND ?= bend
NODE ?= node
export BEND_NO_TELEMETRY = 1

.PHONY: run test proof check

build:
	mkdir -p build

build/demo: main.bend store.bend | build
	$(BEND) main.bend -o $@

build/tests: tests.bend store.bend | build
	$(BEND) tests.bend -o $@

build/tests.js: tests.bend store.bend | build
	$(BEND) tests.bend -o $@

run: build/demo
	./build/demo +RTS --threads 1 --gpu off

test: build/tests build/tests.js
	./build/tests +RTS --threads 1 --gpu off
	$(NODE) build/tests.js

proof:
	$(BEND) PROOF.bend --verdict

check: test
	$(BEND) PROOF.bend --verdict
