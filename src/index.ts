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
import { safeLoad as parseYaml } from 'js-yaml'
import { ReactElement } from 'react'
const { renderToStaticMarkup } = require('react-dom/server')
import { readFile, writeFile } from 'rw'
import { promisify } from 'util'
const cloneDeep = require('clone-deep')
const findup = require('findup-sync')
const glob = require('glob')
const glob2base = require('glob2base')
const fspath = require('path')
const mkdirp = require('mkdirp')
const mockable = { mkdirp, writeFile }

const ROOT = 'src'
const SOURCE = 'content/**/*.y*(a)ml'
const TARGET = 'dist'
const ENCODING = 'utf8'

const PKG_JSON_PATH = findup('package.json', { cwd: __dirname })
const BABEL_CONFIG = require(PKG_JSON_PATH).babel
require('@babel/register')(BABEL_CONFIG)

export interface BuildSpec {
  command: string[]
  root: string
  source: string
  target: string
}

export interface Mockable {
  mkdirp: (path: string, cb: (err?: any, made?: string) => void) => void
  writeFile: (
    path: string,
    data: string,
    enc: string,
    cb: (err?: any) => void
  ) => void
}

export interface ElementSpec<P = any> {
  factory: (spec: ElementFactorySpec<P>) => ReactElement<P>
  props: P
  path: string
}

export interface ElementFactorySpec<P> {
  pages: ElementSpecMap
  props: P
  path: string
}

export interface ElementSpecMap {
  [path: string]: ElementSpec
}

export default function ({
  command,
  root = ROOT,
  source = SOURCE,
  target = TARGET,
  mkdirp = mockable.mkdirp,
  writeFile = mockable.writeFile
}: BuildSpec & Partial<Mockable>): Promise<void> {
  const base = fspath.resolve(root, glob2base(new glob.Glob(source)))
  return promisify(glob)(source, { cwd: fspath.resolve(root) })
    .then((paths: string[]) =>
      Promise.all(paths.map(importComponent)).then(toElementSpecMap)
    )
    .then((specs: ElementSpecMap) =>
      Promise.all(
        Object.keys(specs).map(path =>
          render(specs, path).then(command ? pipe : write)
        )
      ).then(() => void 0)
    )

  function importComponent (path: string): ElementSpec {
    const filename = fspath.resolve(root, path)
    return promisify(readFile)(filename, ENCODING)
      .then(raw => parseYaml(raw, { filename, onWarning }))
      .then(({ component, props }) =>
        import(fspath.resolve(root, component)).then(module => ({
          factory: module.default,
          path: fspath.relative(base, setExt('.html', filename)),
          props
        }))
      )
  }

  function render (pages: ElementSpecMap, path: string) {
    return Promise.resolve(pages[path])
      .then(({ factory, props }) => factory(cloneDeep({ pages, path, props })))
      .then(element => ({
        html: renderToStaticMarkup(element),
        path
      }))
  }

  /**
   * TODO pipe into command instead of file,
   * passing environment variables from context (e.g. $teet_path, etc.)
   */
  function pipe ({ html, path }: { html: string; path: string }) {
    return Promise.resolve()
  }

  function write ({ html, path }: { html: string; path: string }) {
    const filename = fspath.resolve(target, path)
    return promisify<string>(mkdirp)(fspath.dirname(filename)).then(() =>
      promisify<string, string, string>(writeFile)(filename, html, ENCODING)
    )
  }
}

function toElementSpecMap (specs: ElementSpec[]): ElementSpecMap {
  return specs.reduce(
    function (map, spec) {
      map[spec.path] = spec
      return map
    },
    {} as ElementSpecMap
  )
}

function setExt (ext: string, path: string) {
  const { root, dir, name } = fspath.parse(path)
  return fspath.format({ root, dir, base: name + ext, name, ext })
}

const onWarning = console.warn.bind(console, 'WARNING')
