#!/usr/bin/env node
/**
 * @license MIT
 * @author Stephane M. Catala <stephane@zenyway.com>
 *
 * Copyright (C) 2019, Stephane M. Catala <stephane@zenyway.com>
 *
 * Permission is hereby granted, free of charge,
 * to any person obtaining a copy of this software
 * and associated documentation files (the "Software"),
 * to deal in the Software without restriction,
 * including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice
 * shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
 * THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE
 * OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
const minimist = require('minimist')
const path = require('path')
const teet = require('../')

var argv = minimist(process.argv.slice(2), {
  string: ['target', 'root', 'source'],
  alias: { d: 'target', h: 'help', r: 'root', s: 'source' }
})

if (argv.help) {
  fs.createReadStream(path.resolve('./usage.txt')).pipe(process.stdout)
  exit()
}

const spec = {
  root: argv.root,
  source: argv.source,
  target: argv.target
}

teet(spec)
  .then(() => exit())
  .catch(exit)

function exit (err) {
  if (!err) {
    process.exitCode = 0
  } else {
    console.error('ERROR', err)
    process.exitCode = 1
  }
  process.exit()
}
