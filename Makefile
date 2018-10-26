CWD := $(shell pwd)
BIN := node_modules/.bin
BUDO := budo
PORT := 3005

BROWSERIFY := $(BIN)/browserify
BROWSERIFY_TRANSFORM := -t babelify
BROWSERIFY_TRANSFORM_PRODUCTION := $(BROWSERIFY_TRANSFORM) -t uglifyify -t rollupify

BUDO_DIRS += --dir public

.PHONY: default
default:
	@echo "Nothing to make"

.PHONY: browser-dev
browser-dev: node_modules
	$(BUDO) browser/index.js -P -p $(PORT) $(BUDO_DIRS) --live -- $(BROWSERIFY_TRANSFORM) --debug

.PHONY: browser
browser: public/index.js

public/index.js: $(wildcard browser/* browser/*/* browser/*/*/* browser/*/*/*)
	rm -rf public/index.js
	$(BROWSERIFY) $(BROWSERIFY_TRANSFORM_PRODUCTION) browser > public/index.js

node_modules:
	npm install
