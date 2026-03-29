import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('node:fs/promises', () => ({
  mkdir: vi.fn().mockResolvedValue(undefined),
  cp: vi.fn().mockResolvedValue(undefined),
  readdir: vi.fn().mockResolvedValue([]),
  readFile: vi.fn().mockResolvedValue(''),
  writeFile: vi.fn().mockResolvedValue(undefined),
}))

const CONFIG = {
  projectName: 'my-app',
  frontend: 'vite' as const,
  backend: 'nestjs-rest' as const,
  database: 'postgres' as const,
  packageManager: 'pnpm' as const,
  targetDir: '/tmp/my-app',
}

describe('scaffoldVite', () => {
  afterEach(() => vi.clearAllMocks())

  it('creates the apps/web directory', async () => {
    const { mkdir } = await import('node:fs/promises')
    const { scaffoldVite } = await import('../web-vite.js')

    await scaffoldVite(CONFIG)

    expect(mkdir).toHaveBeenCalledWith(
      expect.stringContaining('apps/web'),
      { recursive: true },
    )
  })

  it('copies the web-vite template into apps/web', async () => {
    const { cp } = await import('node:fs/promises')
    const { scaffoldVite } = await import('../web-vite.js')

    await scaffoldVite(CONFIG)

    expect(cp).toHaveBeenCalledWith(
      expect.stringContaining('web-vite'),
      expect.stringContaining('apps/web'),
      { recursive: true },
    )
  })
})
