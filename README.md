# teet

[![NPM](https://nodei.co/npm/teet.png?compact=true)](https://nodei.co/npm/teet/)

teet static websites from jsx and yaml, no strings attached.

JSX files export a component factory:\
`src/components/homepage/index.jsx`:

```jsx
/** @jsx createElement */
import { createElement } from 'react'
import marked from 'marked'
import { relative } from 'path'

/**
 * `pages` is a map of `path` to { factory, path, props } page objects
 *   of all YAML-specified pages,
 *   where `factory` is the page's component factory (like this one)
 */
export default function ({ pages, path, props }) {
  // this example factory is sync, but it doesn't have to be:
  // it could also be async, i.e. return a Promise,
  // e.g. to fetch additional content from the filesystem or an API
  return <HomePage path={path} {...props} />
}

function HomePage ({ body, path, title }) {
  const lang = path.split('/').pop()
  return (
    <html lang={lang}>
      <head>
        <title>{title}</title>
        <meta charSet='UTF-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1.0' />
        <link rel='manifest' href={relative(path, '/assets/manifest.json')} />
      </head>
      <body>{marked(body)}</body>
    </html>
  )
}
```

YAML files are self-explanatory:\
`src/content/en/index.yaml`

```yaml
# path of the JSX component factory this page is instantiated from.
# - absolute from the project's source root (by default `src/`)
# - or relative from this file's directory, e.g. `../../components/homepage`
factory: components/homepage
props:
  title: Teet static websites
  body: |
    # JSX & YAML
    Design your website's pages with JSX and specify their content with YAML
```

output from `teet`:\
`dist/en/index.html`

```
<html lang="en"><head><title>Teet static websites</title><meta charSet="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/><link rel="manifest" href="../assets/manifest.json"/></head><body><h1>JSX & YAML</h1><p>Design your website's pages with JSX and specify their content with YAML</p></body></html>
```

# API v1

source root, source glob, and target directory are configurable.

## CLI

```
teet [OPTIONS]

OPTIONS
  -d, --target  target directory
                default 'dist'
  -r, --root    source root directory
                default 'src'
  -s, --source  glob of source files to compile, relative to source root
                default 'content/**/*.yml'
```

# MIT License

Copyright 2019, Stephane M. Catala

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
