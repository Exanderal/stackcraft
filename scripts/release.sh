#!/usr/bin/env bash
set -e

BUMP=${1:-patch}

if [[ ! "$BUMP" =~ ^(patch|minor|major)$ ]]; then
  echo "Usage: ./scripts/release.sh [patch|minor|major]"
  echo "  patch  — bug fixes (default)"
  echo "  minor  — new features"
  echo "  major  — breaking changes"
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PKG_DIR="$ROOT_DIR/packages/stackcraft"

cd "$ROOT_DIR"

echo ""
echo "▶ Building..."
pnpm --filter @exanderal/stackcraft build

echo ""
echo "▶ Running unit tests..."
pnpm --filter @exanderal/stackcraft test

echo ""
echo "▶ Running E2E test..."
node "$PKG_DIR/scripts/e2e.mjs"

echo ""
echo "▶ Bumping version ($BUMP)..."
cd "$PKG_DIR"
npm version "$BUMP" --no-git-tag-version
NEW_VERSION=$(node -p "require('./package.json').version")
cd "$ROOT_DIR"

echo ""
echo "▶ Publishing v$NEW_VERSION..."
cd "$PKG_DIR"
npm publish --access public

echo ""
echo "✓ Published @exanderal/stackcraft@$NEW_VERSION"
echo ""
echo "  Don't forget to commit and tag:"
echo "  git add packages/stackcraft/package.json"
echo "  git commit -m \"v$NEW_VERSION\""
echo "  git tag v$NEW_VERSION"
echo "  git push && git push --tags"
echo ""
