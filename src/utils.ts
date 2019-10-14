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
import * as fspath from 'path'

export interface Observer<T> {
  complete: () => void
  error: (err?: any) => void
  next: (val?: T) => void
}

export interface KVMap<V> {
  [key: string]: V
}

export function rejectOnThrow<F extends Function> (fn: F) {
  return (function (...args: any) {
    let result
    try {
      result = fn(...args)
    } catch (err) {
      return Promise.reject(err)
    }
    return Promise.resolve(result)
  } as Function) as F
}

export function always<T> (value?: T) {
  return function (): T {
    return value
  }
}

export function setExt (ext: string, path: string) {
  const { root, dir, name } = fspath.parse(path)
  return fspath.format({ root, dir, base: name + ext, name, ext })
}

/**
 * deep clone into arrays and plain objects.
 * shallow clone everything else
 */
export function basicDeepClone (val: any) {
  return Array.isArray(val)
    ? deepCloneArray(val)
    : isPlainObject(val)
    ? deepClonePlainObject(val)
    : val
}

function deepCloneArray (arr) {
  let i = arr.length
  const clone = new Array(i)
  while (i--) {
    clone[i] = basicDeepClone(arr[i])
  }
  return clone
}

function deepClonePlainObject (obj: any) {
  const clone = Object.create(null)
  for (let key in obj) {
    clone[key] = basicDeepClone(obj[key])
  }
  return clone
}

export function isPlainObject (val) {
  return isObject(val) && !!val && toString.call(val) === '[object Object]'
}

export function isFunction (v: any): v is Function {
  return typeof v === 'function'
}

export function isObject (v: any): v is object {
  return typeof v === 'object'
}

export function isUndefined (v: any): v is void {
  return typeof v === 'undefined'
}

export function isString (v: any): v is String | string {
  return typeof (v && v.valueOf()) === 'string'
}
