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
import {
  PageFactory,
  PageSpec,
  ParsedYaml,
  Path,
  RenderedPage
} from './context'
import { KVMap } from './utils'
import {
  FactoryAction,
  createActionFactories,
  payload as _
} from 'basic-fsa-factories'

const events = createActionFactories({
  ADD: _<string>(),
  ADD_FACTORY: _<string>(),
  ADD_SPEC: _<string>(),
  BUILD: _<KVMap<PageSpec>>(),
  CHANGE: _<string>(),
  COMPLETE: _<void>(),
  ERROR: _<any>(),
  FACTORY: _<Readonly<{ path: string; factory: PageFactory }>>(),
  FATAL: _<any>(),
  NEXT: _<RenderedPage | Path>(),
  READY: _<void>(),
  SPEC: _<Readonly<{ path: string; spec: ParsedYaml }>>(),
  UNLINK: _<string>(),
  UNLINK_FACTORY: _<string>(),
  UNLINK_HTML: _<string>(),
  UNLINK_SPEC: _<string>(),
  UPDATE: _<RenderedPage[]>(),
  WATCH_FACTORY: _<string>(),
  WRITE: _<RenderedPage[]>()
})

export type Events = FactoryAction<typeof events>

export default events
