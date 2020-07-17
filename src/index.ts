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
import { Context, Path, RenderedComponent, State } from './context'
import effects, { renderComponent } from './effects'
import events, { Events } from './events'
import reducers from './reducers'
import triggers from './triggers'
import createStore from 'funky-store'
import {
  concatEffectFactories,
  createReducer,
  createEffectFactory,
  createTrigger
} from 'funky-store/dist/utils'
import { Observer, isFunction } from './utils'
import * as chokidar from 'chokidar'
import { FSWatcher, WatchOptions } from 'chokidar'
import * as fs from 'fs'
import { Glob } from 'glob'
import * as fspath from 'path'
import { promisify } from 'util'
const findup = require('findup-sync')
const glob2base = require('glob2base')
const rw = require('rw')

const ROOT = 'src'
const SOURCE = 'content/**/*.y*(a)ml'
const TARGET = 'dist'

const PKG_JSON_PATH = findup('package.json', { cwd: __dirname })
const BABEL_CONFIG = require(PKG_JSON_PATH).babel
require('@babel/register')(BABEL_CONFIG)

export { renderComponent }

export interface BuildSpec {
  debug: boolean
  observer: Observer<RenderedComponent | Path>
  root: string
  source: string
  target: string
  watch: boolean
}

export interface Mockable {
  getWatcher: (paths: string | string[], opts?: WatchOptions) => FSWatcher
  mkdirp: (path: string) => Promise<any>
  readFile: (path: string, enc: string) => Promise<string>
  unlink: (path: string) => Promise<void>
  writeFile: (path: string, data: string, enc: string) => Promise<void>
}

export default function (
  {
    debug,
    observer: { complete, error, next } = {} as Observer<
      RenderedComponent | Path
    >,
    root = ROOT,
    source = SOURCE,
    target = TARGET,
    watch
  } = {} as Partial<BuildSpec>,
  {
    getWatcher = chokidar.watch,
    mkdirp = promisify<string, void>(require('mkdirp')),
    readFile = promisify<string, string, string>(rw.readFile),
    unlink = promisify<string>(fs.unlink),
    writeFile = promisify<string, string, string, void>(rw.writeFile)
  } = {} as Partial<Mockable>
): Promise<void> {
  const cwd = fspath.resolve(root)
  const glob = new Glob(source, { cwd })
  const base = fspath.resolve(cwd, glob2base(glob))
  const watcher = getWatcher('.', { cwd })

  return new Promise<void>(function (resolve, reject) {
    const dispatch = createStore<Context, Events>(
      createReducer(reducers, {
        base,
        cache: Object.create(null),
        factories: Object.create(null),
        glob,
        mkdirp,
        readFile,
        root,
        specs: Object.create(null),
        state: State.INITIAL_SCAN,
        target,
        unlink,
        watch,
        writeFile
      }),
      concatEffectFactories(
        createEffectFactory(effects),
        createEffectFactory({
          COMPLETE () {
            try {
              watcher.close()
              complete && complete()
              resolve()
            } catch (_err) {
              reject(_err)
            }
          },
          FATAL (_, err) {
            try {
              watcher.close()
              error && error(err)
              reject(err)
            } catch (_err) {
              reject(_err)
            }
          }
        }),
        isFunction(next) &&
          createEffectFactory<Context, Events>({
            NEXT: (_, payload) => next(payload)
          }),
        debug &&
          (() => (
            { glob, mkdirp, readFile, unlink, writeFile, ...state },
            action
          ) => {
            console.log('ACTION:', action)
            console.log('STATE:', state)
          })
      ),
      createTrigger(triggers)
    )
    watcher
      .on('add', path => dispatch(events.ADD(path)))
      .on('change', path => dispatch(events.CHANGE(path)))
      .on('ready', () => dispatch(events.READY()))
      .on('unlink', path => dispatch(events.UNLINK(path)))
  })
}
