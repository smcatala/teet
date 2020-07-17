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
import { Context, State } from './context'
import { Events } from './events'
import { ReducerSpecs } from 'funky-store/dist/utils'
import { KVMap, always } from './utils'
import { into, pokeProp, propCursor as within } from 'basic-cursors'

const inCache = within('cache')
const inFactories = within('factories')
const inSpecs = within('specs')

const invalidatePathEntry: <T>(
  entries: KVMap<false | T>,
  path: string
) => Pick<KVMap<false | T>, string> & Record<string, false> = (entries, path) =>
  pokeProp(path)(entries, false)

const setPathEntryFrom = <K extends string>(key: K) => <T>(
  entries: KVMap<false | T>,
  entry: { path: string } & { [key in K]: T }
) => pokeProp(entry.path)(entries, entry[key])

const reducers: Partial<ReducerSpecs<Context, Events>> = {
  ADD_FACTORY: inFactories(invalidatePathEntry),
  ADD_SPEC: inSpecs(invalidatePathEntry),
  FACTORY: inFactories(setPathEntryFrom('factory')),
  NEXT: inCache(setPathEntryFrom('html')),
  READY: into('state')(always(State.READY)),
  SPEC: inSpecs(setPathEntryFrom('spec')),
  UNLINK_FACTORY: inFactories(invalidatePathEntry),
  UNLINK_HTML: inCache(invalidatePathEntry),
  UNLINK_SPEC: inSpecs(invalidatePathEntry)
}

export default reducers
