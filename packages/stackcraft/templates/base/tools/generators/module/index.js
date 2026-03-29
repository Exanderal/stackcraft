const { formatFiles, generateFiles, names } = require('@nx/devkit');
const { execSync } = require('node:child_process');
const { join } = require('node:path');

module.exports = async function (tree, options) {
  const n = names(options.name);
  const modulePath = `apps/backend/src/modules/${n.fileName}`;

  generateFiles(
    tree,
    join(__dirname, 'files'),
    modulePath,
    { ...n, tmpl: '' },
  );

  if (options.crud) {
    generateFiles(
      tree,
      join(__dirname, 'crud-files'),
      `apps/backend/src/api/${n.fileName}`,
      { ...n, tmpl: '' },
    );
  }

  await formatFiles(tree);

  console.log(`\n✓ Module created at ${modulePath}/`);
  console.log(`  → Import ${n.className}Module in app.module.ts\n`);

  if (options.crud) {
    console.log(`✓ Controller created at apps/backend/src/api/${n.fileName}/`);
    console.log(`  → Add ${n.className}Controller to a module and import ${n.className}Module there\n`);
  }

  return () => {
    const targets = [modulePath];
    if (options.crud) targets.push(`apps/backend/src/api/${n.fileName}`);

    execSync(`npx prettier --write ${targets.join(' ')}`, {
      cwd: tree.root,
      stdio: 'inherit',
    });
  };
};
