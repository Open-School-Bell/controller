import {type MetaFunction, type LoaderFunctionArgs} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'

import {pageTitle} from '~/lib/utils'
import {Page} from '~/lib/ui'

import {VERSION, RequiredVersions} from '~/lib/constants'

export const loader = async ({}: LoaderFunctionArgs) => {
  const piperData = await new Promise<{
    version: string
    piperVersion: string
  }>(resolve => {
    fetch(`${process.env.TTS_API}/status`)
      .then(response => {
        response
          .json()
          .then(data => resolve(data))
          .catch(() => resolve({version: 'error', piperVersion: 'error'}))
      })
      .catch(() => resolve({version: 'error', piperVersion: 'error'}))
  })

  return {piperData}
}

export const meta: MetaFunction = () => {
  return [{title: pageTitle('About')}]
}

const About = () => {
  const {piperData} = useLoaderData<typeof loader>()

  return (
    <Page title="About">
      <table className="box-table">
        <thead>
          <tr>
            <th>Component</th>
            <th>Version</th>
            <th>Latest Version</th>
            <th>Required Version</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>openschoolbell/controller</td>
            <td className="text-center">{VERSION}</td>
            <td></td>
            <td>{RequiredVersions.controller}</td>
          </tr>
          <tr>
            <td>openschoolbell/tts</td>
            <td className="text-center">{piperData.version}</td>
            <td></td>
            <td>{RequiredVersions.tts}</td>
          </tr>
          <tr>
            <td>piper</td>
            <td className="text-center">{piperData.piperVersion}</td>
            <td></td>
            <td>{RequiredVersions.piper}</td>
          </tr>
        </tbody>
      </table>
    </Page>
  )
}

export default About
