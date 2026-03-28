export type PackageManager = 'pnpm' | 'npm'
export type Frontend = 'vite' | 'nextjs'
export type Backend = 'nestjs-rest'

export interface ProjectConfig {
  projectName: string
  frontend: Frontend
  backend: Backend
  packageManager: PackageManager
  targetDir: string
}
