/** @jsx createElement */
import { createElement } from 'react'
import { dirname, relative } from 'path'

export default function ({ pages, path, props: { title, header } }) {
  delete pages[path]
  const paths = Object.keys(pages).map(target =>
    relative(dirname(path), dirname(target))
  )
  return (
    <html lang='en'>
      <head>
        <title>{title}</title>
      </head>
      <body>
        <h1>{header}</h1>
        <ul>
          {paths.map((path, index) => (
            <li>
              <a key={index} href={path}>
                {path}
              </a>
            </li>
          ))}
        </ul>
      </body>
    </html>
  )
}
