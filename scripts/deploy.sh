# this will make sure the CWD is set to this file's directory
cd "$(dirname "$0")"
cd ..

# exit when any command fails
set -e

VERSION=$(node -p "require('./package.json').version")
VERSION_DIST=$(node -p "require('./dist/package.json').version")

if [ "$VERSION" != "$VERSION_DIST" ]; then
	echo "Version mismatch between package.json and dist/package.json"
	echo "package.json: $VERSION"
	echo "dist/package.json: $VERSION_DIST"
	echo "please run 'pnpm run build' to update the dist files"
	exit 1
fi

echo "looks good to publish version $VERSION"
cd dist/

echo "publishing to npm..."
pnpm publish --access public