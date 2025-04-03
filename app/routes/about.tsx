import {
  type MetaFunction,
  type LoaderFunctionArgs,
  redirect
} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import {asyncForEach} from '@arcath/utils'
import semver from 'semver'

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
          .catch(() => resolve({version: '0.0.0', piperVersion: '0.0.0'}))
      })
      .catch(() => resolve({version: '0.0.0', piperVersion: '0.0.0'}))
  })

  const sounderLatest = await new Promise<string>(resolve => {
    fetch(
      'https://api.github.com/repos/Open-School-Bell/sounder/releases?per_page=1',
      {
        headers: {
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28'
        }
      }
    )
      .then(response => {
        response
          .json()
          .then(data => resolve(data[0].tag_name))
          .catch(() => resolve('error'))
      })
      .catch(() => resolve('error'))
  })

  const ttsLatest = await new Promise<string>(resolve => {
    fetch(
      'https://api.github.com/repos/Open-School-Bell/tts/releases?per_page=1',
      {
        headers: {
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28'
        }
      }
    )
      .then(response => {
        response
          .json()
          .then(data => resolve(data[0].tag_name))
          .catch(() => resolve('error'))
      })
      .catch(() => resolve('error'))
  })

  const controllerLatest = await new Promise<string>(resolve => {
    fetch(
      'https://api.github.com/repos/Open-School-Bell/controller/releases?per_page=1',
      {
        headers: {
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28'
        }
      }
    )
      .then(response => {
        response
          .json()
          .then(data => resolve(data[0].tag_name))
          .catch(() => resolve('error'))
      })
      .catch(() => resolve('error'))
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

  return {
    piperData,
    sounders,
    sounderVersions,
    sounderLatest,
    ttsLatest,
    controllerLatest
  }
}

export const meta: MetaFunction = () => {
  return [{title: pageTitle('About')}]
}

const About = () => {
  const {
    piperData,
    sounders,
    sounderVersions,
    sounderLatest,
    ttsLatest,
    controllerLatest
  } = useLoaderData<typeof loader>()

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
            <td
              className={`text-center ${semver.gt(controllerLatest, VERSION) ? 'bg-red-300' : ''}`}
            >
              {controllerLatest.replace('v', '')}
            </td>
            <td className="text-center">{RequiredVersions.controller}</td>
          </tr>
          <tr>
            <td>openschoolbell/tts</td>
            <td className="text-center">{piperData.version}</td>
            <td
              className={`text-center ${semver.gt(ttsLatest, piperData.version) ? 'bg-red-300' : ''}`}
            >
              {ttsLatest.replace('v', '')}
            </td>
            <td
              className={`text-center ${semver.gt(RequiredVersions.tts, piperData.version) ? 'bg-red-300' : ''}`}
            >
              {RequiredVersions.tts}
            </td>
          </tr>
          <tr>
            <td>piper</td>
            <td className="text-center">{piperData.piperVersion}</td>
            <td
              className={`text-center ${semver.gt(piperData.piperVersion, piperData.version) ? 'bg-red-300' : ''}`}
            >
              {piperData.piperVersion}
            </td>
            <td
              className={`text-center ${semver.gt(RequiredVersions.piper, piperData.version) ? 'bg-red-300' : ''}`}
            >
              {RequiredVersions.piper}
            </td>
          </tr>
          {sounders.map(({id, name}) => {
            return (
              <tr key={id}>
                <td>Sounder: {name}</td>
                <td className="text-center">{sounderVersions[id]}</td>
                <td
                  className={`text-center ${semver.gt(sounderLatest, sounderVersions[id]) ? 'bg-red-300' : ''}`}
                >
                  {sounderLatest.replace('v', '')}
                </td>
                <td
                  className={`text-center ${semver.gt(RequiredVersions.sounder, sounderVersions[id]) ? 'bg-red-300' : ''}`}
                >
                  {RequiredVersions.sounder}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </Page>
  )
}

export default About
