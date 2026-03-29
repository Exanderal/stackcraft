export type PackageManager = 'pnpm' | 'npm'
export type Frontend = 'vite' | 'nextjs'
export type Backend = 'nestjs-rest' | 'nestjs-graphql'
export type Database = 'postgres' | 'mysql'
export type Mobile = 'expo' | 'none'

export interface ProjectConfig {
  projectName: string
  frontend: Frontend
  backend: Backend
  database: Database
  mobile: Mobile
  packageManager: PackageManager
  targetDir: string
}
