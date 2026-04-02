#!/usr/bin/env node
import { create } from './create/index.js'
import { add } from './add/index.js'
import { init } from './init/index.js'

const [, , command, ...args] = process.argv
const fullMode = process.argv.includes('--full')

const configFlagIndex = process.argv.indexOf('--config')
const configPath = configFlagIndex !== -1 ? process.argv[configFlagIndex + 1] : undefined

async function main() {
  if (command === 'add') {
    await add(args)
  } else if (command === 'init') {
    await init()
  } else {
    await create({ fullMode, configPath })
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
