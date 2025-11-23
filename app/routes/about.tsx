import {
  type MetaFunction,
  type LoaderFunctionArgs,
  redirect
} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import {asyncForEach, nl2br} from '@arcath/utils'
import semver from 'semver'
import fs from 'fs'
import path from 'path'

import {pageTitle} from '~/lib/utils'
import {Page} from '~/lib/ui'
import {VERSION, RequiredVersions} from '~/lib/constants'
import {getRedis} from '~/lib/redis.server.mjs'
import {getPrisma} from '~/lib/prisma.server'
import {checkSession} from '~/lib/session'
import {useTranslation} from '~/lib/i18n'
import {translate} from '~/lib/i18n.shared'
import {getRootI18n} from '~/lib/i18n.meta'

const {readFile} = fs.promises

export const loader = async ({request}: LoaderFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const piperData = await new Promise<{
    version: string
    piperVersion: string
    pythonVersion: string
  }>(resolve => {
    fetch(`${process.env.TTS_API}/status.json`)
      .then(response => {
        response
          .json()
          .then(data => resolve(data))
          .catch(() =>
            resolve({
              version: '0.0.0',
              piperVersion: '0.0.0',
              pythonVersion: '0.0.0'
            })
          )
      })
      .catch(() => {
        resolve({
          version: '0.0.0',
          piperVersion: '0.0.0',
          pythonVersion: '0.0.0'
        })
      })
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

  const buttonLatest = await new Promise<string>(resolve => {
    fetch(
      'https://api.github.com/repos/Open-School-Bell/action-button/releases?per_page=1',
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

  const buttons = await prisma.actionButton.findMany({
    select: {id: true, name: true},
    orderBy: {name: 'asc'}
  })

  const buttonVersions: {[buttonId: string]: string} = {}

  await asyncForEach(buttons, async ({id}) => {
    const version = await redis.get(`osb-button-version-${id}`)

    buttonVersions[id] = version ? version : '0.0.0'
  })

  const license = (
    await readFile(path.join(process.cwd(), 'LICENSE'))
  ).toString()

  return {
    piperData,
    sounders,
    sounderVersions,
    sounderLatest,
    buttons,
    buttonVersions,
    buttonLatest,
    ttsLatest,
    controllerLatest,
    license
  }
}

export const meta: MetaFunction = ({matches}) => {
  const {messages} = getRootI18n(matches)
  return [{title: pageTitle(translate(messages, 'about.title'))}]
}

const About = () => {
  const {
    piperData,
    sounders,
    sounderVersions,
    sounderLatest,
    buttons,
    buttonVersions,
    buttonLatest,
    ttsLatest,
    controllerLatest,
    license
  } = useLoaderData<typeof loader>()
  const {t} = useTranslation()

  return (
    <Page title={t('about.title')}>
      <table className="box-table">
        <thead>
          <tr>
            <th>{t('about.table.component')}</th>
            <th>{t('about.table.version')}</th>
            <th>{t('about.table.latest')}</th>
            <th>{t('about.table.required')}</th>
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
              className={`text-center ${semver.gt(piperData.piperVersion, piperData.piperVersion) ? 'bg-red-300' : ''}`}
            >
              {piperData.piperVersion}
            </td>
            <td
              className={`text-center ${semver.gt(RequiredVersions.piper, piperData.piperVersion) ? 'bg-red-300' : ''}`}
            >
              {RequiredVersions.piper}
            </td>
          </tr>
          {sounders.map(({id, name}) => {
            return (
              <tr key={id}>
                <td>{`Sounder: ${name}`}</td>
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
          {buttons.map(({id, name}) => {
            return (
              <tr key={id}>
                <td>{`Button: ${name}`}</td>
                <td className="text-center">{buttonVersions[id]}</td>
                <td
                  className={`text-center ${semver.gt(buttonLatest, buttonVersions[id]) ? 'bg-red-300' : ''}`}
                >
                  {buttonLatest.replace('v', '')}
                </td>
                <td
                  className={`text-center ${semver.gt(RequiredVersions.button, buttonVersions[id]) ? 'bg-red-300' : ''}`}
                >
                  {RequiredVersions.button}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <div
        className="box text-gray-600"
        dangerouslySetInnerHTML={{__html: nl2br(license)}}
      />
    </Page>
  )
}

export default About
