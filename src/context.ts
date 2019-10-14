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
import { KVMap } from './utils'
import { FSWatcher } from 'chokidar'
import { ReactElement } from 'react'

export interface Context {
  base: string
  factories: KVMap<PageFactory | false>
  mkdirp: (path: string) => Promise<any>
  cache: KVMap<string | false>
  readFile: (path: string, enc: string) => Promise<string>
  root: string
  specs: KVMap<ParsedYaml | false>
  state: State
  target: string
  unlink: (path: string) => Promise<void>
  watcher: FSWatcher
  watch: boolean
  writeFile: (path: string, data: string, enc: string) => Promise<void>
}

export enum State {
  INITIAL_SCAN = 'INITIAL_SCAN',
  READY = 'READY'
}

export interface ParsedYaml<P = any> {
  factory: string
  props: P
}

export interface PageFactory<P = any> {
  (spec: PageFactorySpec<P>): ReactElement<P>
}

export interface PageFactorySpec<P> extends Path {
  pages: KVMap<PageSpec>
  props: P
}

export interface PageSpec<P = any> extends Path {
  factory: PageFactory<P>
  props: P
}

export interface RenderedPage extends Path {
  html: string
}

export interface Path {
  path: string
}
