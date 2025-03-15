import {type MetaFunction, type LoaderFunctionArgs} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'

import {pageTitle} from '~/lib/utils'

import {VERSION} from '~/lib/constants'

export const loader = async ({}: LoaderFunctionArgs) => {
  const piperResponse = await fetch(`${process.env.TTS_API}/status`)

  const piperData = (await piperResponse.json()) as {
    version: string
    piperVersion: string
  }

  return {piperData}
}

export const meta: MetaFunction = () => {
  return [{title: pageTitle('About')}]
}

const About = () => {
  const {piperData} = useLoaderData<typeof loader>()

  return (
    <div className="border border-gray-300 p-2">
      <h1>About</h1>
      <table>
        <thead>
          <tr>
            <th>Component</th>
            <th>Version</th>
            <th>Latest Version</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>openschoolbell/controller</td>
            <td className="text-center">{VERSION}</td>
            <td></td>
          </tr>
          <tr>
            <td>openschoolbell/tts</td>
            <td className="text-center">{piperData.version}</td>
            <td></td>
          </tr>
          <tr>
            <td>piper</td>
            <td className="text-center">{piperData.piperVersion}</td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default About
