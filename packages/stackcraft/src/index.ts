#!/usr/bin/env node
import { create } from './create/index.js'
import { add } from './add/index.js'

const [, , command, ...args] = process.argv

async function main() {
  if (command === 'add') {
    await add(args)
  } else {
    await create()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
