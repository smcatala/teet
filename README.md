# teet

[![NPM](https://nodei.co/npm/teet.png?compact=true)](https://nodei.co/npm/teet/)

teet static websites from jsx and yaml, no strings attached.

# Generate a static website from YAML and JSX

first off, `teet` makes as few assumptions as possible,
focusing on rendering HTML files from YAML and JSX files where it is told to,
and remaining as flexible as possible.

## project structure

`teet` will map the directory structure of the source [YAML](https://en.wikipedia.org/wiki/YAML/)
files to that of the output HTML files.
the directory structure of the source [YAML](https://en.wikipedia.org/wiki/YAML/) files
should therefore reflect the structure of the resulting website.
apart from that, `teet` makes no further assumptions on where files are located.

`teet` operates from a configurable source `root` folder.
it will look for all [YAML](https://en.wikipedia.org/wiki/YAML/) files in that `root` folder
that match a `source` glob string.

the `root` folder defaults to `src/`,
and the `source` file glob to `content/**/*.y*(a)ml`.

for example, with the default settings,
the source directory could be set up as follows:

- a `components/` folder for the [JSX](https://reactjs.org/docs/jsx-in-depth.html)
  layout files,
- a `content/` directory for the [YAML](https://en.wikipedia.org/wiki/YAML/) content files.

```
src
├── components
│   └── page.jsx
└── content
    ├── about
    │   ├── en
    │   │   └── index.yml
    │   └── fr
    │       └── index.yml
    ├── en
    │   └── index.yml
    └── fr
        └── index.yml
```

`teet` will map the directory structure under the base path of the `source` glob
(`content/` in this example)
to that of its output in a specifiable `target` directory, `dist` by default:

```
dist
├── about
│   ├── en
│   │   └── index.html
│   └── fr
│       └── index.html
├── en
│   └── index.html
└── fr
    └── index.html
```

## YAML

each [YAML](https://en.wikipedia.org/wiki/YAML) file specifies
the HTML page it maps to. in the above example,
`src/content/en/index.yml` specifies and maps to `dist/en/index.html`.

`src/content/en/index.yml`

```yaml
# path of the JSX component factory this page is rendered with.
# - absolute from the project's source `root` (by default `src/`)
# - or relative from this file's directory, e.g. `../../components/page`
factory: components/page

# props supplied to the JSX component factory.
props:
  title: Teet static websites
  body: |
    # JSX & YAML
    Design your website's pages with JSX and specify their content with YAML
```

[YAML](https://en.wikipedia.org/wiki/YAML/) files are parsed to page description objects
`{ factory, path, props }`,
which include the JSX component `factory` from the referenced JSX file,
the parsed `props`, and the `path` of the target HTML file,
relative to the `target` directory (`dist/` in this example).

there is no restriction on which properties `props` may contain:
whatever the factory requires.

## JSX

[JSX](https://reactjs.org/docs/jsx-in-depth.html) files expose
a component factory as default export.
These factories return a React Element from the page description object
they receive. `teet` renders the resulting React Elements into the HTML
of the pages.

`src/components/page.jsx`:

```jsx
/** @jsx createElement */
import { createElement } from 'react'
import marked from 'marked'
import { dirname, relative, sep } from 'path'

/**
 * the default export is the JSX component factory.
 * it expects a page description object consisting of the following properties:
 * - `pages`: a map of `path` to { factory, path, props }
 *   page description objects for all YAML-specified pages,
 *   where `factory` is the page's component factory (like this one).
 * - `path`: the path of the target html file, relative to the `target` folder.
 * - `props`: parsed from the YAML file
 */
export default function ({ pages, path, props }) {
  // this example factory is synchronous, but it doesn't have to be:
  // it could also be async, i.e. return a Promise,
  // e.g. to fetch additional content from the filesystem or an API
  return <Page path={path} {...props} />
}

// in this example, we adopt the convention that html files are hosted
// in their corresponding locale directory.
// alternatively, the locale could simply also have been specified
// in the props from the YAML file.
const locale = path =>
  dirname(path)
    .split(sep)
    .pop()

function Page ({ body, path, title }) {
  const lang = locale(path)
  const links = Object.keys(pages)
    .filter(target => target !== path && locale(target) === lang)
    .map(target => ({
      href: relative(dirname(path), dirname(target)),
      label: pages[target].props.title
    }))
  return (
    <html lang={lang}>
      <head>
        <title>{title}</title>
        <meta charSet='UTF-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1.0' />
      </head>
      <body>
        {marked(body) /* markdown support is easy to add */}
        <footer>
          <ul>
            {links.map(({ href, label }, index) => (
              <li>
                <a key={index} href={href}>
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </footer>
      </body>
    </html>
  )
}
```

Although the above code might unsettle beginners
because it adds plenty of javascript to the HTML,
it does not have to be that way:
JSX allows beginners to start with mostly raw HTML, and once confident,
incrementally add javascript to enhance the page's configurability.

JSX is now so widely adopted that documentation and examples abound on the web.

## HTML output

`teet` calls the JSX component factories referenced in each YAML file
with the `props` parsed from those as detailed [above](#JSX),
and renders the returned components to the destination HTML files.

example output from `teet`:\
`dist/en/index.html`

```
<html lang="en"><head><title>Teet static websites</title><meta charSet="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/></head><body><h1>JSX & YAML</h1><p>Design your website's pages with JSX and specify their content with YAML</p><footer><ul><li><a href="../about/en">About Teet</a></li></ul></footer></body></html>
```

## assets

`teet` limits itself to rendering the JSX and YAML files
to their destination HTML files.
assets such as the site manifest or images should be handled separately.

for example, the manifest could be placed in `src/assets/manifest.json`
and copied together with other assets from that directory into `dist/assets`,
e.g. with a simple `npm` script in the build process:

```bash
mkdirp dist/assets && cpx "src/assets/**" dist/assets
```

a corresponding `<link>` tag could accordingly be added inside the `<head>`
of the `Page` component:

```jsx
<link rel='manifest' href={relative(dirname(path), 'assets/image.png')} />
```

## CSS

likewise, `teet` does not prescribe how to handle CSS.
in this example, CSS could be added as component-scoped classes
with tools such as [TypeStyle](https://typestyle.github.io/).

Or it could use [Bootstrap](https://getbootstrap.com/),
e.g. by adding the [CSS RSI link](https://www.bootstrapcdn.com/)
into the `<head>` of the `Page` component.

## markdown

finally, as shown in this example,
[Markdown](https://github.github.com/gfm/#what-is-markdown-) support
is easy to add in the JSX component factories,
e.g. with [marked](https://www.npmjs.com/package/marked).
how `markdown` is parsed from the `props` is therefore fully configurable.

# Usage

install from npm in your project directory,
typically as a [DevDependency](https://docs.npmjs.com/specifying-dependencies-and-devdependencies-in-a-package-json-file)

```bash
npm i -D teet
```

`teet` is available both as CLI command and as [NodeJS](https://nodejs.org) module.

`root`, `source` glob, and `target` directory are configurable.

## CLI

```
teet [OPTIONS]

OPTIONS
  -d, --target  target directory
                default 'dist'
  -h, --help    output this usage text
  -r, --root    source root directory
                default 'src'
  -s, --source  glob of source files to compile, relative to source root
                default 'content/**/*.y*(a)ml'
```

## Node API

import as ES module

```js
import teet from 'teet'
```

or as CommonJS module

```js
const teet = require('teet')
```

`teet` is compiled from [TypeScript](https://www.typescriptlang.org/),
so it exposes corresponding type definitions, useful for coding.

```ts
import { ReactElement } from 'react'
export default function (spec: BuildSpec): Promise<void>
export interface BuildSpec {
  command: string[]
  root: string
  source: string
  target: string
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
```

# Why

because [Gatsby](https://gatsbyjs.org) et al. are way too bloated,
and so is their output HTML.

unless the JSX component factories explicitly add it to their output,
HTML from `teet` does not include any javascript,
or for that matter [React](https://reactjs.org).

the resulting static website hence works as expected, without JS.
for many websites and blogs, that's sufficient, and it's best practice.
Again, the factories can add client-side frameworks if required,
but `teet` won't do it by default.

and also because `teet` is only around 60 lines of easily maintainable code
building on hand-picked robust and well-maintained popular dependencies,

and also because its documentation is concise.

# Name

a simple single syllable nomen that was still available on npm
(which is not easy these days)
and is tricky to pronounce properly, like 'sheet'.

# MIT License

Copyright 2019, Stephane M. Catala

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
