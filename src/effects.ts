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
import { Context, RenderedPage, PageSpec } from './context'
import events, { Events } from './events'
import { EffectSpecs } from 'funky-store/dist/utils'
import {
  KVMap,
  basicDeepClone,
  isFunction,
  isString,
  rejectOnThrow
} from './utils'
import { safeLoad as parseYaml, FAILSAFE_SCHEMA } from 'js-yaml'
import * as fspath from 'path'
import { renderToStaticMarkup } from 'react-dom/server'
const ENCODING = 'utf8'

const findup = require('findup-sync')
const PKG_JSON_PATH = findup('package.json', { cwd: __dirname })
const BABEL_CONFIG = require(PKG_JSON_PATH).babel
require('@babel/register')(BABEL_CONFIG)

const YAML_PARSER_SPECS = {
  onWarning: console.warn.bind(console, 'WARNING'),
  schema: FAILSAFE_SCHEMA // support only strings, arrays and plain objects
}

const effects: Partial<EffectSpecs<Context, Events>> = {
  async ADD_FACTORY ({ root, watch }, path) {
    try {
      const file = require.resolve(fspath.resolve(root, path))
      if (watch) {
        delete require.cache[file]
      }
      const factory = require(file).default
      if (!isFunction(factory)) {
        throw new Error(`factory missing default export: ${path}`)
      }
      return events.FACTORY({ path, factory })
    } catch (err) {
      return events.ERROR(err)
    }
  },
  async ADD_SPEC ({ readFile, root }, path) {
    try {
      const raw = await readFile(fspath.resolve(root, path), ENCODING)
      const { factory, props } = await parseYaml(raw, {
        ...YAML_PARSER_SPECS,
        filename: path
      })
      if (!isString(factory)) {
        throw new Error(`spec missing factory reference: ${path}`)
      }
      return events.SPEC({
        path,
        spec: {
          factory: fspath.relative(
            root,
            require.resolve(fspath.resolve(root, factory.valueOf()))
          ),
          props
        }
      })
    } catch (err) {
      return events.ERROR(err)
    }
  },
  BUILD: (_, pages) =>
    renderPages(pages)
      .then(events.UPDATE)
      .catch(events.ERROR),
  async UNLINK_HTML ({ target, unlink }, path) {
    try {
      const file = fspath.join(fspath.resolve(target), path)
      await unlink(file)
      return events.NEXT({ path })
    } catch (err) {
      return events.ERROR(err)
    }
  },
  WATCH_FACTORY: ({ watcher }, path) => void watcher.add(path),
  WRITE: ({ mkdirp, target, writeFile }, [update, ...updates]) =>
    write(mkdirp, writeFile, fspath.resolve(target, update.path), update.html)
      .then(() => events.UPDATE(updates))
      .catch(events.FATAL) // crash when fail to write
}

/**
 * throws if any page throws when rendered
 */
function renderPages (pages: KVMap<PageSpec>): Promise<RenderedPage[]> {
  return Promise.all(Object.keys(pages).map(path => renderPage(pages, path)))
}

function renderPage (
  pages: KVMap<PageSpec>,
  path: string
): Promise<RenderedPage> {
  return Promise.resolve(pages[path])
    .then(
      rejectOnThrow(({ factory, props }) =>
        factory(basicDeepClone({ pages, path, props }))
      )
    )
    .then(
      rejectOnThrow(element => ({
        html: renderToStaticMarkup(element) as string,
        path
      }))
    )
}

function write (
  mkdirp: (path: string) => Promise<any>,
  writeFile: (path: string, data: string, enc: string) => Promise<void>,
  path: string,
  html: string
): Promise<void> {
  return mkdirp(fspath.dirname(path)).then(() =>
    writeFile(path, html, ENCODING)
  )
}

export default effects
