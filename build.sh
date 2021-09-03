#!/bin/bash

rm -fr build
mkdir build

VERSION=0.0.1
if [[ $GITHUB_REF == refs/tags/* ]]; then
    VERSION=${GITHUB_REF#refs/tags/}
    echo "Release name: $VERSION"
    sed -i "s/0.0.1-snapshot/$VERSION/g" manifest.json
fi

# Use terser to minify scripts
echo "Minifying js files..."
docker run --rm -v $PWD:/data node:14-alpine sh -c "npm i -g terser && find /data -path '/data/utils' -prune -o -name '*.js' | sed -E 's/.*/terser -c -m -o \0.minified \0 \&\& mv \0.minified \0/' | sh"
echo "Done"

echo "Building archive..."
zip -r build/kdpd-${VERSION}.zip images utils manifest.json *.js
echo "Done"

ls -l build
