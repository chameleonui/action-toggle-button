
build: components index.js
	@component build

example: components index.js
	@component build --dev -c -o build -n build -u chameleon-stylus-plugin && stylus stylus/example.styl -o ./

components: component.json
	@component install --dev

clean:
	rm -fr build components template.js

.PHONY: clean
