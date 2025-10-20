import {
  type MetaFunction,
  type LoaderFunctionArgs,
  redirect
} from '@remix-run/node'
import {Link, useLoaderData} from '@remix-run/react'
import {formatDistance} from 'date-fns'
import {enUS, pl} from 'date-fns/locale'

import {getPrisma} from '~/lib/prisma.server'
import {checkSession} from '~/lib/session'
import {pageTitle} from '~/lib/utils'
import {getSetting} from '~/lib/settings.server'
import {Page} from '~/lib/ui'
import {useTranslation} from '~/lib/i18n'
import {translate} from '~/lib/i18n.shared'
import {getRootI18n} from '~/lib/i18n.meta'

export const loader = async ({request}: LoaderFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  const sounders = await prisma.sounder.findMany({orderBy: {name: 'asc'}})

  const lockdownMode = await getSetting('lockdownMode')

  return {sounders, lockdownMode}
}

export const meta: MetaFunction = ({matches}) => {
  const {messages} = getRootI18n(matches)
  return [{title: pageTitle(translate(messages, 'dashboard.pageTitle'))}]
}

export default function Index() {
  const {sounders, lockdownMode} = useLoaderData<typeof loader>()
  const {t, locale} = useTranslation()
  const dateLocale = locale === 'pl' ? pl : enUS

  return (
    <Page title={t('dashboard.pageTitle')}>
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
          className={`box ${lockdownMode === '0' ? 'bg-green-300' : 'bg-red-300'}`}
        >
          <p>
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
            <button className="bg-gray-300 p-2 rounded-xl shadow-sm cursor-pointer">
              {t(
                lockdownMode === '0'
                  ? 'dashboard.lockdown.button.enable'
                  : 'dashboard.lockdown.button.disable'
              )}
            </button>
          </form>
        </div>
      </div>
    </Page>
  )
}
