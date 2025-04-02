import {
  type MetaFunction,
  type LoaderFunctionArgs,
  redirect
} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import {asyncForEach} from '@arcath/utils'

import {pageTitle} from '~/lib/utils'
import {Page} from '~/lib/ui'
import {VERSION, RequiredVersions} from '~/lib/constants'
import {getRedis} from '~/lib/redis.server.mjs'
import {getPrisma} from '~/lib/prisma.server'
import {checkSession} from '~/lib/session'

export const loader = async ({request}: LoaderFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

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

  const prisma = getPrisma()
  const redis = getRedis()

  const sounders = await prisma.sounder.findMany({
    select: {id: true, name: true},
    orderBy: {name: 'asc'}
  })

  const sounderVersions: {[sounderId: string]: string} = {}

  await asyncForEach(sounders, async ({id}) => {
    const version = await redis.get(`osb-sounder-version-${id}`)

    sounderVersions[id] = version ? version : '0.0.0'
  })

  return {piperData, sounders, sounderVersions}
}

export const meta: MetaFunction = () => {
  return [{title: pageTitle('About')}]
}

const About = () => {
  const {piperData, sounders, sounderVersions} = useLoaderData<typeof loader>()

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
          {sounders.map(({id, name}) => {
            return (
              <tr key={id}>
                <td>Sounder: {name}</td>
                <td className="text-center">{sounderVersions[id]}</td>
                <td></td>
                <td>{RequiredVersions.sounder}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </Page>
  )
}

export default About
