export type PackageManager = 'pnpm' | 'npm'
export type Frontend = 'vite' | 'nextjs'
export type Backend = 'nestjs-rest'
export type Database = 'postgres' | 'mysql'

export interface ProjectConfig {
  projectName: string
  frontend: Frontend
  backend: Backend
  database: Database
  packageManager: PackageManager
  targetDir: string
}
