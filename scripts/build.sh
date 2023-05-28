# this will make sure the CWD is set to this file's directory
cd "$(dirname "$0")"
cd ..

# exit when any command fails
set -e

VERSION=$(node -p "require('./package.json').version")
DESCRIPTION=$(node -p "require('./package.json').description")

echo "Building version $VERSION"

OUT_DIR=dist
TMP_DIR=tmp

# build the prod versions
pnpm vite build

# build the Typescript artifacts
pnpm tsc --emitDeclarationOnly --declaration --declarationDir $TMP_DIR
pnpm dts-bundle \
  --name okej \
  --main ./$TMP_DIR/index.d.ts \
  --outputAsModuleFolder false \
  --out types.d.ts
cp $TMP_DIR/types.d.ts $OUT_DIR/index.d.ts

# copy the readme and package.json
cp README.md $OUT_DIR
cp package.dist.json $OUT_DIR/package.json

# replace VERSION inside the package.json
sed -i '' "s#VERSION#$VERSION#g" $OUT_DIR/package.json

# replace DESCRIPTION inside the package.json
sed -i '' "s#DESCRIPTION#$DESCRIPTION#g" $OUT_DIR/package.json

echo "Done!"
