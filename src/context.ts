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
import { IGlob } from 'glob'
import { ReactElement } from 'react'

export interface Context {
  base: string
  cache: KVMap<string | false>
  factories: KVMap<ComponentFactory | false>
  glob: IGlob
  mkdirp: (path: string) => Promise<any>
  readFile: (path: string, enc: string) => Promise<string>
  root: string
  specs: KVMap<ParsedYaml | false>
  state: State
  target: string
  unlink: (path: string) => Promise<void>
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
  render: boolean
}

export interface ComponentFactory<P = any> {
  (spec: ComponentFactorySpec<P>): ReactElement<P>
}

export interface ComponentFactorySpec<P> extends Path {
  components: KVMap<ComponentSpec>
  props: P
  render: boolean
}

export interface ComponentSpec<P = any> extends Path {
  factory: ComponentFactory<P>
  props: P
  render: boolean
}

export interface RenderedComponent extends Path {
  html: string
}

export interface Path {
  path: string
}
