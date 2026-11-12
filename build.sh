#!/bin/sh
# Assemble public/ from src/. Usage: ./build.sh
set -e
cd "$(dirname "$0")"
rm -rf public && mkdir -p public/data public/vendor
cp src/curriculum.js src/concepts.js src/meta.js src/formulas.js src/themes.js src/depth.js public/data/
cp src/engine.js src/graph.js src/app.js src/style.css public/
V=$(cat src/*.js src/style.css src/index.html | sha1sum | cut -c1-10)
sed "s/__V__/$V/g" src/index.html > public/index.html
cp vendor/d3.min.js public/vendor/
for f in public/*.js public/data/*.js; do node --check "$f"; done
echo "built $V"
