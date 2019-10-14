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
import { Context, State, PageFactory, PageSpec, ParsedYaml } from './context'
import events, { Events } from './events'
import { TriggerSpecs } from 'funky-store/dist/utils'
import { KVMap, setExt } from './utils'
import * as fspath from 'path'

const buildWhenReadyAndBuildable = ({ base, factories, root, specs, state }) =>
  isReadyAndBuildable(state, specs, factories) &&
  events.BUILD(
    getPages(
      fspath.relative(root, base),
      specs as KVMap<ParsedYaml>,
      factories as KVMap<PageFactory>
    )
  )

const triggers: Partial<TriggerSpecs<Context, Events>> = {
  ADD: ({ factories }, path) =>
    (path in factories ? events.ADD_FACTORY : events.ADD_SPEC)(path),
  FACTORY: buildWhenReadyAndBuildable,
  SPEC: (context, { spec: { factory } }) => [
    buildWhenReadyAndBuildable(context),
    !(factory in context.factories) && events.WATCH_FACTORY(factory)
  ],
  UNLINK: ({ factories }, path) =>
    (path in factories ? events.UNLINK_FACTORY : events.UNLINK_SPEC)(path),
  UNLINK_HTML: (_, path) => events.NEXT({ path }),
  UNLINK_SPEC: ({ base, root }, path) =>
    events.UNLINK_HTML(
      getRelativeTargetPath(fspath.relative(root, base), path)
    ),
  UPDATE: ({ cache, watch }, [update, ...updates]) =>
    !update && !updates.length
      ? watch
        ? false
        : events.COMPLETE()
      : cache[update.path] === update.html
      ? events.UPDATE(updates)
      : events.WRITE([update, ...updates]),
  WATCH_FACTORY: (_, path) => events.UNLINK_FACTORY(path),
  WRITE: (_, [update]) => events.NEXT(update)
}
triggers.CHANGE = triggers.ADD

function isReadyAndBuildable (
  state: State,
  specs: KVMap<ParsedYaml | false>,
  factories: KVMap<PageFactory | false>
): boolean {
  return state === State.READY && isAllParsed(specs, factories)
}

function isAllParsed (
  specs: KVMap<ParsedYaml | false>,
  factories: KVMap<PageFactory | false>
): boolean {
  for (const path of Object.keys(specs)) {
    const spec = specs[path]
    if (!spec || !factories[spec.factory]) return false
  }
  return true
}

function getPages (
  base: string, // relative to root
  specs: KVMap<ParsedYaml<any>>,
  factories: KVMap<PageFactory<any>>
): KVMap<PageSpec> {
  const pages = Object.create(null)
  for (const sourcePath of Object.keys(specs)) {
    const spec = specs[sourcePath]
    const factory = factories[spec.factory]
    const path = getRelativeTargetPath(base, sourcePath)
    pages[path] = { factory, path, props: spec.props }
  }
  return pages
}

function getRelativeTargetPath (base: string, path: string) {
  return setExt('.html', fspath.relative(base, path))
}

export default triggers
