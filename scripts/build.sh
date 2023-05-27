# this will make sure the CWD is set to this file's directory
cd "$(dirname "$0")"
cd ..

VERSION=$(node -p "require('./package.json').version")
DESCRIPTION=$(node -p "require('./package.json').description")

echo "Building version $VERSION"

OUT_DIR=dist
TMP_DIR=tmp

# build the dev versions
pnpm vite build --outDir $TMP_DIR

# build the prod versions
PROD=true pnpm vite build

# copy the dev versions to the output directory
cp -r $TMP_DIR/* $OUT_DIR

# build the Typescript artifacts
pnpm tsc \
	--project tsconfig.json \
	--declaration \
	--emitDeclarationOnly

# copy the readme and package.json
cp README.md $OUT_DIR
cp package.dist.json $OUT_DIR/package.json

# replace VERSION inside the package.json
sed -i '' "s#VERSION#$VERSION#g" $OUT_DIR/package.json

# replace DESCRIPTION inside the package.json
sed -i '' "s#DESCRIPTION#$DESCRIPTION#g" $OUT_DIR/package.json

echo "Done!"