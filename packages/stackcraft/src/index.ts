#!/usr/bin/env node
import { create } from './create/index.js'
import { add } from './add/index.js'

const [, , command, ...args] = process.argv
const fullMode = process.argv.includes('--full')

async function main() {
  if (command === 'add') {
    await add(args)
  } else {
    await create(fullMode)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
