import { describe, expect, it, vi } from 'vitest'

const mockReadFile = vi.fn()

vi.mock('node:fs/promises', () => ({
  readFile: mockReadFile,
}))

const { loadConfig } = await import('../config.js')

function withFile(content: unknown) {
  mockReadFile.mockResolvedValue(JSON.stringify(content))
}

describe('loadConfig — here field', () => {
  it('accepts here: true', async () => {
    withFile({ here: true })
    const cfg = await loadConfig('stackcraft.config.json')
    expect(cfg.here).toBe(true)
  })

  it('accepts here: false', async () => {
    withFile({ here: false })
    const cfg = await loadConfig('stackcraft.config.json')
    expect(cfg.here).toBe(false)
  })

  it('accepts missing here', async () => {
    withFile({ name: 'my-app' })
    const cfg = await loadConfig('stackcraft.config.json')
    expect(cfg.here).toBeUndefined()
  })

  it('rejects here as a string', async () => {
    withFile({ here: 'true' })
    await expect(loadConfig('stackcraft.config.json')).rejects.toThrow('"here" must be a boolean')
  })

  it('rejects here as a number', async () => {
    withFile({ here: 1 })
    await expect(loadConfig('stackcraft.config.json')).rejects.toThrow('"here" must be a boolean')
  })
})
