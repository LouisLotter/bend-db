.PHONY: run check test proof site site-test serve
run check test proof:
	$(MAKE) -C db $@
site:
	node learning/site/scripts/build.mjs
site-test: site
	node --test learning/site/tests/*.test.mjs
serve: site
	python3 -m http.server 4173 --bind 127.0.0.1 --directory learning/site/dist
