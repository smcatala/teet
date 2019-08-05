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
const teet = require('..')
const { dirname, join, relative } = require('path')
const test = require('tape')

const ROOT = join(__dirname, 'fixture')
const TARGET = join(__dirname, 'dist')
const TARGET_FILES = {
  'index.html':
    '<html lang="en"><head><title>A test page</title></head><body><h1>This is a test</h1><ul><li><a href="about">about</a></li></ul></body></html>',
  'about/index.html':
    '<html lang="en"><head><title>Another test page</title></head><body><h1>this is another test</h1><ul><li><a href="..">..</a></li></ul></body></html>'
}
const TARGET_DIRS = Object.keys(TARGET_FILES)
  .map(path => dirname(join(TARGET, path)))
  .sort()

test('teet generates target html files from source JSX and YAML files', t => {
  const calls = {}
  t.plan(2)
  teet({
    root: ROOT,
    target: TARGET,
    mkdirp: nodeAsyncSpy('mkdirp'),
    writeFile: nodeAsyncSpy('writeFile')
  })
    .then(function () {
      t.deepEqual(
        calls.mkdirp.map(([path]) => path).sort(),
        TARGET_DIRS,
        'it creates the required folders for each target file path'
      )
      t.deepEqual(
        calls.writeFile.reduce((files, [path, html]) => {
          files[relative(TARGET, path)] = html
          return files
        }, {}),
        TARGET_FILES,
        'it stores the correctly generated HTML in each target file'
      )
    })
    .catch(() => t.fail())

  function nodeAsyncSpy (name) {
    return function (...args) {
      const cb = args.pop()
      calls[name] = append(calls[name], args)
      cb(null)
    }
  }
})

function append (a = [], b = []) {
  return a.concat([b])
}
