/** @jsx createElement */
import { createElement } from 'react'
import { dirname, relative } from 'path'
import Sub from './sub'

export default function ({ components, path, props: { title, header } }) {
  delete components[path]
  const paths = Object.keys(components).map(target =>
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
        <Sub path={path} />
      </body>
    </html>
  )
}
