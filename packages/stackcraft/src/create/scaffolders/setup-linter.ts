import { rm, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { ProjectConfig } from '../types.js'

export async function setupLinter(config: ProjectConfig) {
  if (config.linter !== 'biome') return

  await addBiomeToRoot(config)
  await writeBiomeConfig(config)
  await stripApp(config, 'backend', NESTJS_ESLINT_DEPS, NESTJS_FILES, NESTJS_SCRIPT_OVERRIDES)

  if (config.frontend === 'vite') {
    await stripApp(config, 'web', VITE_ESLINT_DEPS, VITE_FILES, VITE_SCRIPT_OVERRIDES)
  } else if (config.frontend === 'nextjs') {
    await stripApp(config, 'web', NEXTJS_ESLINT_DEPS, [], NEXTJS_SCRIPT_OVERRIDES)
  }

  if (config.mobile === 'expo') {
    await stripApp(config, 'mobile', [], [], EXPO_SCRIPT_OVERRIDES)
  }
}

async function addBiomeToRoot(config: ProjectConfig) {
  const pkgPath = join(config.targetDir, 'package.json')
  const pkg = JSON.parse(await readFile(pkgPath, 'utf-8'))
  pkg.devDependencies['@biomejs/biome'] = '^1.9.0'
  await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8')
}

async function writeBiomeConfig(config: ProjectConfig) {
  const biome = {
    $schema: 'https://biomejs.dev/schemas/1.9.0/schema.json',
    vcs: { enabled: true, clientKind: 'git', useIgnoreFile: true },
    files: { ignoreUnknown: false },
    formatter: { enabled: true, indentStyle: 'space', indentWidth: 2 },
    linter: { enabled: true, rules: { recommended: true } },
    javascript: {
      formatter: { quoteStyle: 'single', trailingCommas: 'all', semicolons: 'always' },
    },
    organizeImports: { enabled: true },
  }
  await writeFile(
    join(config.targetDir, 'biome.json'),
    JSON.stringify(biome, null, 2) + '\n',
    'utf-8',
  )
}

async function stripApp(
  config: ProjectConfig,
  appName: string,
  depsToRemove: string[],
  filesToRemove: string[],
  scriptOverrides: Record<string, string | null>,
) {
  const appDir = join(config.targetDir, 'apps', appName)

  for (const file of filesToRemove) {
    await rm(join(appDir, file), { force: true })
  }

  const pkgPath = join(appDir, 'package.json')
  const pkg = JSON.parse(await readFile(pkgPath, 'utf-8'))

  for (const dep of depsToRemove) {
    delete pkg.dependencies?.[dep]
    delete pkg.devDependencies?.[dep]
  }

  for (const [script, value] of Object.entries(scriptOverrides)) {
    if (value === null) {
      delete pkg.scripts[script]
    } else {
      pkg.scripts[script] = value
    }
  }

  await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8')
}

const NESTJS_ESLINT_DEPS = [
  '@eslint/eslintrc',
  '@eslint/js',
  'eslint',
  'eslint-config-prettier',
  'eslint-plugin-prettier',
  'prettier',
  'typescript-eslint',
]

const NESTJS_FILES = ['eslint.config.mjs', '.prettierrc']

const NESTJS_SCRIPT_OVERRIDES: Record<string, string | null> = {
  lint: 'biome check .',
  format: null,
}

const VITE_ESLINT_DEPS = [
  '@eslint/js',
  'eslint',
  'eslint-plugin-react-hooks',
  'eslint-plugin-react-refresh',
  'globals',
  'typescript-eslint',
]

const VITE_FILES = ['eslint.config.js']

const VITE_SCRIPT_OVERRIDES: Record<string, string | null> = {
  lint: 'biome check .',
}

const NEXTJS_ESLINT_DEPS: string[] = []

const NEXTJS_SCRIPT_OVERRIDES: Record<string, string | null> = {
  lint: 'biome check .',
}

const EXPO_SCRIPT_OVERRIDES: Record<string, string | null> = {
  lint: 'biome check .',
}
