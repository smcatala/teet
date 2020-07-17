# teet

[![NPM](https://nodei.co/npm/teet.png?compact=true)](https://nodei.co/npm/teet/)

teet static websites from jsx and yaml, no strings attached.

# Generate a static website from YAML and JSX

first off, `teet` makes as few assumptions as possible,
focusing on rendering HTML files
from [FAILSAFE_SCHEMA YAML](http://www.yaml.org/spec/1.2/spec.html#id2802346)
and JSX files.

## Project structure

`teet` will map the directory structure of the source [YAML](https://en.wikipedia.org/wiki/YAML/)
files declared as pages to that of the output HTML files.
the directory structure of the source [YAML](https://en.wikipedia.org/wiki/YAML/)
page files should therefore reflect the structure of the resulting website.
apart from that, `teet` makes no further assumptions on where files are located.

`teet` operates from a configurable source `root` folder.
it will look for all [YAML](https://en.wikipedia.org/wiki/YAML/) files
in that `root` folder that match a `source` glob string.

the `root` folder defaults to `src/`,
and the `source` file glob to `content/**/*.y*(a)ml`.

for example, with the default settings,
the source directory could be set up as follows:

- a `layouts/` folder for the [JSX](https://reactjs.org/docs/jsx-in-depth.html)
  layout files,
- a `content/` directory for the [YAML](https://en.wikipedia.org/wiki/YAML/)
  content files.

```
src
├── layouts
│   ├── header.jsx
│   ├── footer.jsx
│   └── page.jsx
└── content
    ├── about
    │   ├── en
    │   │   └── index.yml
    │   └── fr
    │       └── index.yml
    ├── en
    │   └── index.yml
    ├── fr
    │   └── index.yml
    └── lib
        ├── header
        │   ├── en.yml
        │   └── fr.yml
        └── footer
            ├── en.yml
            └── fr.yml
```

`teet` will map the directory structure of page files
under the base path of the `source` glob (`content/` in this example)
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

in the above example, files in the `lib/` folder are not specified as pages
(more on that in the following section).
hence the resulting `dist` structure does not include a `lib/` sub-directory.
the corresponding `header` and `footer` components are however rendered into
the pages that integrate them.

## YAML

each [YAML](https://en.wikipedia.org/wiki/YAML) file specifies
the content of an HTML component it maps to.

- by default, the resulting component is available for integration
  in any other component and can be referenced by its relative path
  in the `source` file glob.
- additionally, HTML components that are specifically declared as a page are
  rendered to a corresponding HTML file in the `target` directory:
  in the above example, `src/content/en/index.yml` maps to `dist/en/index.html`,
  and specifies its content.

`src/content/en/index.yml`

```yaml
# path of the JSX component factory this page is rendered with.
# - absolute from the project's source `root` (by default `src/`)
# - or relative from this file's directory, e.g. `../../layouts/page`
factory: layouts/page

# render to `target` folder, i.e. this component is a page component.
# if absent or `false`, this component is merely available to other components,
# referred by its relative path in the `source` glob.
render: true

# props supplied to the JSX component factory.
props:
  title: Teet static websites
  body: |
    # JSX & YAML
    Design your website's layout with JSX and specify its content with YAML
```

[YAML](https://en.wikipedia.org/wiki/YAML/) files are parsed
to component description objects `{ factory, path, props, render }`,
which include the JSX component `factory` from the referenced JSX file,
the parsed `props` and `render` entries,
and a `path` that uniquely references this component,
e.g. `en` for `src/content/en/index.yml` in the above example.
the `path` is essentially the `dirname` of the file relative to the `source` glob,
concatenated with the `basename` excluding its `extension` if not `index`.

there is no restriction on which properties `props` may contain:
whatever the factory requires.
However, Yaml syntax is purposefully restricted to
the [FAILSAFE_SCHEMA](http://www.yaml.org/spec/1.2/spec.html#id2802346),
i.e. lists, maps and strings:
let the factory choose how to safely interpret each prop,
e.g. markdown, dates, etc.

## JSX

[JSX](https://reactjs.org/docs/jsx-in-depth.html) files are referenced
by [YAML](https://en.wikipedia.org/wiki/YAML/) files.
they generate a page's layout, i.e. its HTML.

[JSX](https://reactjs.org/docs/jsx-in-depth.html) files expose
a component factory as default export.
These factories return a React Element from the component description object
they receive. `teet` renders the resulting React Elements into the HTML
of the pages.

`src/layouts/page.jsx`:

```jsx
/** @jsx createElement */
import { createElement } from 'react'
import marked from 'marked'
import { dirname, relative, sep } from 'path'
import { renderComponent } from 'teet'

/**
 * the default export is the JSX component factory.
 * it expects a component description object consisting of the following properties:
 * - `components`: a map of `path` to { factory, path, props, render }
 *   component description objects for all YAML-specified components,
 *   where `factory` is the component's factory (like this one).
 * - `path`: the path of this component relative to the `source` glob,
 *   excluding its basename extension and even its basename if it is `index`.
 * - `props`: object parsed from the YAML file
 * - `render`: boolean parsed from the YAML file
 */
export default function ({ components, path, props }) {
  const header = renderComponent(components, 'lib/header')
  /* this example factory is synchronous, but it doesn't have to be:
   * it could also be async, i.e. return a Promise that resolves to an Element,
   * e.g. to fetch additional content from the filesystem or an API
   */
  return <Page path={path} header={header} {...props} />
}

/**
 * in this example, we adopt the convention that html files are hosted
 * in their corresponding locale directory.
 * alternatively, the locale could simply also have been specified
 * in the props from the YAML file.
 */
const locale = path =>
  dirname(path)
    .split(sep)
    .pop()

function Page ({ body, header, path, title }) {
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
because it mixes plenty of javascript with the HTML,
it does not have to be that way:
JSX allows beginners to start with mostly raw HTML, and once confident,
incrementally add javascript to enhance the page's configurability.

JSX is now so widely adopted that documentation and examples abound on the web.

## HTML output

`teet` calls the JSX component factories referenced in each YAML file
with the `props` parsed from those as detailed [above](#JSX),
and renders the returned layouts to the destination HTML files.

example output from `teet`:\
`dist/en/index.html`

```
<html lang="en"><head><title>Teet static websites</title><meta charSet="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/></head><body><h1>JSX & YAML</h1><p>Design your website's pages with JSX and specify their content with YAML</p><footer><ul><li><a href="../about/en">About Teet</a></li></ul></footer></body></html>
```

## Assets

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

## Markdown

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
  -d, --debug   log debug output to console
  -h, --help    output this usage text
  -o, --target  target directory
                default 'dist'
  -r, --root    source root directory
                default 'src'
  -s, --source  glob of source files to compile, relative to source root
                default 'content/**/*.y*(a)ml'
  -w, --watch   rebuild on changes in source files
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
and exposes the following type definitions:

```ts
export default function (opts?: Partial<BuildSpec>): Promise<void>

export interface BuildSpec {
  debug: boolean
  observer: Observer<RenderedPage | Path>
  root: string
  source: string
  target: string
  watch: boolean
}

export interface Observer<T> {
  complete: () => void
  error: (err?: any) => void
  next: (val?: T) => void
}

export interface RenderedPage extends Path {
  html: string
}
export interface Path {
  path: string
}
```

# Why

because [Gatsby](https://gatsbyjs.org) et al. are way too bloated,
and so is their output HTML, for simple static sites.

unless the JSX component factories explicitly add it to their output,
HTML from `teet` does not include any javascript,
or for that matter [React](https://reactjs.org).

the resulting static website hence works without JS:
for many websites and blogs, that's sufficient.
the factories can add client-side frameworks if required,
but `teet` won't do it by default.

and also because its documentation is concise and it gets out of your way.

# Name

a simple single syllable nomen that was still available on npm
(not easy these days).

# Mention

if you like or use this project for your websites,
consider starring it on GitHub,
or mentioning it in your project's documentation or README,
or why not even on the websites themselves ?

# MIT License

Copyright 2019, Stephane M. Catala

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
