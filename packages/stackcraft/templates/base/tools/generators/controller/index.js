const { formatFiles, generateFiles, names } = require('@nx/devkit');
const { execSync } = require('node:child_process');
const { join } = require('node:path');

module.exports = async function (tree, options) {
  const n = names(options.name);
  const controllerPath = `apps/backend/src/api/${n.fileName}`;

  generateFiles(tree, join(__dirname, 'files'), controllerPath, { ...n, tmpl: '' });

  await formatFiles(tree);

  console.log(`\n✓ Controller created at ${controllerPath}/`);
  console.log(`  → Import ${n.className}Module and register ${n.className}Controller in your module\n`);

  return () => {
    execSync(`npx prettier --write ${controllerPath}`, {
      cwd: tree.root,
      stdio: 'inherit',
    });
  };
};
