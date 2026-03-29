import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { ProjectConfig } from '../types.js'

export async function wireClientIntegration(config: ProjectConfig) {
  const webDir = join(config.targetDir, 'apps', 'web')
  const webPkgPath = join(webDir, 'package.json')
  const pkg = JSON.parse(await readFile(webPkgPath, 'utf-8'))

  pkg.dependencies['@local/types'] = 'workspace:*'

  if (config.backend === 'nestjs-graphql') {
    pkg.dependencies['@apollo/client'] = '^3.13.0'
    pkg.dependencies['graphql'] = '^16.0.0'
    await writeFile(webPkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8')
    await setupApolloClient(config, webDir)
  } else {
    await writeFile(webPkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8')
  }
}

async function setupApolloClient(config: ProjectConfig, webDir: string) {
  await mkdir(join(webDir, 'src', 'lib'), { recursive: true })
  await mkdir(join(webDir, 'src', 'graphql'), { recursive: true })

  if (config.frontend === 'vite') {
    await writeFile(
      join(webDir, 'src', 'lib', 'apollo.ts'),
      apolloViteClient(),
      'utf-8',
    )
    await patchViteMain(webDir)
  } else if (config.frontend === 'nextjs') {
    await writeFile(
      join(webDir, 'src', 'lib', 'apollo.ts'),
      apolloNextClient(),
      'utf-8',
    )
    await writeFile(
      join(webDir, 'src', 'app', 'providers.tsx'),
      apolloNextProviders(),
      'utf-8',
    )
    await patchNextLayout(webDir)
  }
}

async function patchViteMain(webDir: string) {
  const mainPath = join(webDir, 'src', 'main.tsx')
  const content = await readFile(mainPath, 'utf-8')

  const patched = content
    .replace(
      `import { StrictMode } from 'react'`,
      `import { ApolloProvider } from '@apollo/client'\nimport { StrictMode } from 'react'\nimport { client } from './lib/apollo'`,
    )
    .replace(
      `<App />`,
      `<ApolloProvider client={client}>\n      <App />\n    </ApolloProvider>`,
    )

  await writeFile(mainPath, patched, 'utf-8')
}

async function patchNextLayout(webDir: string) {
  const layoutPath = join(webDir, 'src', 'app', 'layout.tsx')
  const content = await readFile(layoutPath, 'utf-8')

  const patched = content
    .replace(
      `import type { Metadata } from "next";`,
      `import type { Metadata } from "next";\nimport { Providers } from './providers';`,
    )
    .replace(`<body>`, `<body>\n        <Providers>`)
    .replace(`</body>`, `</Providers>\n      </body>`)

  await writeFile(layoutPath, patched, 'utf-8')
}

function apolloViteClient() {
  return `import { ApolloClient, InMemoryCache } from '@apollo/client'

export const client = new ApolloClient({
  uri: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/graphql',
  cache: new InMemoryCache(),
})
`
}

function apolloNextClient() {
  return `import { ApolloClient, InMemoryCache } from '@apollo/client'

export const client = new ApolloClient({
  uri: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/graphql',
  cache: new InMemoryCache(),
})
`
}

function apolloNextProviders() {
  return `'use client'

import { ApolloProvider } from '@apollo/client'
import { client } from '../lib/apollo'

export function Providers({ children }: { children: React.ReactNode }) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>
}
`
}
