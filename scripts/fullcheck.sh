# this will make sure the CWD is set to this file's directory
cd "$(dirname "$0")"
cd ..

# exit when any command fails
set -e

pnpm format:check
pnpm lint
pnpm test