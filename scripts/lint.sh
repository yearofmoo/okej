# this will make sure the CWD is set to this file's directory
cd "$(dirname "$0")"
cd ..

# exit when any command fails
set -e

# Run TS Linting
pnpm tsc --noEmit

# Run ESLint
ARGS=""
if [[ $FIX ]]; then
  ARGS="--fix"
fi

pnpm eslint $ARGS --ext .ts ./index.ts ./src ./vite.config.js

echo "Linting complete! Looks good."
