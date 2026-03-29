import { cp, readFile, readdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const TEXT_EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs',
  '.json', '.css', '.html', '.md',
  '.yaml', '.yml', '.env',
  '.gitignore', '.prettierrc', '.eslintrc', '.mjs',
])

function isTextFile(name: string): boolean {
  const dotIndex = name.lastIndexOf('.')
  const ext = dotIndex !== -1 ? name.slice(dotIndex) : name
  return TEXT_EXTENSIONS.has(ext) || name.startsWith('.')
}

async function substituteVars(dir: string, vars: Record<string, string>) {
  const entries = await readdir(dir, { withFileTypes: true })

  await Promise.all(
    entries.map(async (entry) => {
      const fullPath = join(dir, entry.name)
      if (entry.isDirectory()) {
        await substituteVars(fullPath, vars)
      } else if (entry.isFile() && isTextFile(entry.name)) {
        let content = await readFile(fullPath, 'utf-8')
        for (const [key, value] of Object.entries(vars)) {
          content = content.replaceAll(`{{${key}}}`, value)
        }
        await writeFile(fullPath, content, 'utf-8')
      }
    }),
  )
}

export async function copyTemplate(
  src: string,
  dest: string,
  vars: Record<string, string>,
) {
  await cp(src, dest, { recursive: true })
  await substituteVars(dest, vars)
}
