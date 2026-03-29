const { formatFiles, generateFiles, names } = require('@nx/devkit');
const { execSync } = require('node:child_process');
const { join } = require('node:path');

module.exports = async function (tree, options) {
  const n = names(options.name);
  const modulePath = `apps/backend/src/modules/${n.fileName}`;

  generateFiles(tree, join(__dirname, 'files'), modulePath, { ...n, tmpl: '' });

  if (options.graphql) {
    generateFiles(tree, join(__dirname, 'graphql-files'), modulePath, { ...n, tmpl: '' });
  }

  await formatFiles(tree);

  console.log(`\n✓ Module created at ${modulePath}/`);
  console.log(`  → Import ${n.className}Module in app.module.ts\n`);

  return () => {
    execSync(`npx prettier --write ${modulePath}`, {
      cwd: tree.root,
      stdio: 'inherit',
    });
  };
};
