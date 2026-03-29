const { formatFiles, generateFiles, names } = require('@nx/devkit');
const { execSync } = require('node:child_process');
const { join } = require('node:path');

module.exports = async function (tree, options) {
  const n = names(options.name);
  const resolverPath = `apps/backend/src/resolvers/${n.fileName}`;

  generateFiles(tree, join(__dirname, 'files'), resolverPath, { ...n, tmpl: '' });

  await formatFiles(tree);

  console.log(`\n✓ Resolver created at ${resolverPath}/`);
  console.log(`  → Import ${n.className}Module and register ${n.className}Resolver in your module\n`);

  return () => {
    execSync(`npx prettier --write ${resolverPath}`, {
      cwd: tree.root,
      stdio: 'inherit',
    });
  };
};
