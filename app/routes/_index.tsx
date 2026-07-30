import {
  type MetaFunction,
  type LoaderFunctionArgs,
  redirect
} from '@remix-run/node'
import {Link, useLoaderData} from '@remix-run/react'
import {formatDistance, format} from 'date-fns'
import {enUS, pl} from 'date-fns/locale'

import {getPrisma} from '~/lib/prisma.server'
import {checkSession} from '~/lib/session'
import {pageTitle} from '~/lib/utils'
import {getSettings} from '~/lib/settings.server'
import {Page} from '~/lib/ui'
import {useTranslation} from '~/lib/i18n'
import {translate} from '~/lib/i18n.shared'
import {getRootI18n} from '~/lib/i18n.meta'
import {useLivePageData} from '~/lib/hooks/use-live-data'
import {translateLogMessage} from './log'

export const loader = async ({request}: LoaderFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  const sounders = await prisma.sounder.findMany({orderBy: {name: 'asc'}})
  const buttons = await prisma.actionButton.findMany({orderBy: {name: 'asc'}})
  const logs = await prisma.log.findMany({orderBy: {time: 'desc'}, take: 10})

  const {lockdownMode, workerLastSeen, ttsLastSeen, siteName} =
    await getSettings([
      'lockdownMode',
      'workerLastSeen',
      'ttsLastSeen',
      'siteName'
    ])

  return {
    sounders,
    lockdownMode,
    buttons,
    logs,
    workerLastSeen,
    ttsLastSeen,
    siteName
  }
}

export const meta: MetaFunction = ({matches}) => {
  const {messages} = getRootI18n(matches)
  return [{title: pageTitle(translate(messages, 'dashboard.pageTitle'))}]
}

export default function Index() {
  const {
    sounders,
    lockdownMode,
    buttons,
    logs,
    workerLastSeen,
    ttsLastSeen,
    siteName
  } = useLoaderData<typeof loader>()
  const {t, locale} = useTranslation()
  const dateLocale = locale === 'pl' ? pl : enUS
  useLivePageData()

  return (
    <Page title={`${t('dashboard.pageTitle')} - ${siteName}`} wide>
      <div className="grid grid-cols-2 gap-4">
        <div className="box">
          <h2>{t('dashboard.devices')}</h2>
          <table className="box-table">
            <thead>
              <tr>
                <th className="p-2">{t('dashboard.table.name')}</th>
                <th className="p-2">{t('dashboard.table.status')}</th>
                <th className="p-2">{t('dashboard.table.lastSeen')}</th>
              </tr>
            </thead>
            <tbody>
              {sounders.map(({id, name, lastCheckIn}) => {
                return (
                  <tr key={id}>
                    <td>
                      <Link to={`/sounders/${id}`}>{name}</Link>
                    </td>
                    <td className="text-center">
                      {new Date().getTime() / 1000 -
                        lastCheckIn.getTime() / 1000 <
                      65
                        ? '🟢'
                        : '🔴'}
                    </td>
                    <td>
                      {formatDistance(lastCheckIn, new Date(), {
                        addSuffix: true,
                        locale: dateLocale
                      })}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div
          className={`box text-center ${lockdownMode === '0' ? 'bg-green-300' : 'bg-red-300'}`}
        >
          <p className="mt-2">
            {t('dashboard.lockdown.message', {
              status: t(
                lockdownMode === '0'
                  ? 'dashboard.lockdown.status.disabled'
                  : 'dashboard.lockdown.status.enabled'
              )
            })}
          </p>
          <form
            action="/lockdown/trigger"
            method="post"
            onSubmit={e => {
              if (
                !confirm(
                  t(
                    lockdownMode === '0'
                      ? 'dashboard.lockdown.confirmEnable'
                      : 'dashboard.lockdown.confirmDisable'
                  )
                )
              ) {
                e.preventDefault()
              }
            }}
          >
            <button
              className={`bg-gray-300 p-2 rounded-xl shadow-sm cursor-pointer mt-4 ${lockdownMode === '1' ? 'bg-green-300' : 'bg-red-300'}`}
            >
              {t(
                lockdownMode === '0'
                  ? 'dashboard.lockdown.button.enable'
                  : 'dashboard.lockdown.button.disable'
              )}
            </button>
          </form>
        </div>
        <div className="box">
          <h2>{t('dashboard.buttons')}</h2>
          <table className="box-table">
            <thead>
              <tr>
                <th className="p-2">{t('dashboard.table.name')}</th>
                <th className="p-2">{t('dashboard.table.status')}</th>
                <th className="p-2">{t('dashboard.table.lastSeen')}</th>
              </tr>
            </thead>
            <tbody>
              {buttons.map(({id, name, lastCheckIn}) => {
                return (
                  <tr key={id}>
                    <td>
                      <Link to={`/buttons/${id}`}>{name}</Link>
                    </td>
                    <td className="text-center">
                      {new Date().getTime() / 1000 -
                        lastCheckIn.getTime() / 1000 <
                      65
                        ? '🟢'
                        : '🔴'}
                    </td>
                    <td>
                      {formatDistance(lastCheckIn, new Date(), {
                        addSuffix: true,
                        locale: dateLocale
                      })}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="box">
          <h2>{t('dashboard.log')}</h2>
          <table className="box-table">
            <thead>
              <tr>
                <th>{t('log.columns.time')}</th>
                <th>{t('log.columns.message')}</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(({id, message, time}) => {
                return (
                  <tr key={id}>
                    <td className="text-center">
                      {format(time, 'dd/MM/yy HH:mm')}
                    </td>
                    <td>{translateLogMessage(message, t)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="box">
          <h2>{t('dashboard.services')}</h2>
          <table className="box-table">
            <thead>
              <tr>
                <th className="p-2">{t('dashboard.table.name')}</th>
                <th className="p-2">{t('dashboard.table.status')}</th>
                <th className="p-2">{t('dashboard.table.lastSeen')}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{t('dashboard.services.background')}</td>
                <td className="text-center">
                  {new Date().getTime() / 1000 -
                    new Date(JSON.parse(workerLastSeen)).getTime() / 1000 <
                  65
                    ? '🟢'
                    : '🔴'}
                </td>
                <td>
                  {formatDistance(JSON.parse(workerLastSeen), new Date(), {
                    addSuffix: true,
                    locale: dateLocale
                  })}
                </td>
              </tr>
              <tr>
                <td>{t('dashboard.services.tts')}</td>
                <td className="text-center">
                  {new Date().getTime() / 1000 -
                    new Date(JSON.parse(ttsLastSeen)).getTime() / 1000 <
                  65
                    ? '🟢'
                    : '🔴'}
                </td>
                <td>
                  {formatDistance(JSON.parse(ttsLastSeen), new Date(), {
                    addSuffix: true,
                    locale: dateLocale
                  })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Page>
  )
}
