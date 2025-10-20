import {
  type LoaderFunctionArgs,
  type MetaFunction,
  redirect
} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import {format} from 'date-fns'

import {pageTitle} from '~/lib/utils'
import {checkSession} from '~/lib/session'
import {Page} from '~/lib/ui'
import {getPrisma} from '~/lib/prisma.server'
import {useTranslation} from '~/lib/i18n'
import {translate} from '~/lib/i18n.shared'
import {getRootI18n} from '~/lib/i18n.meta'
import {MessageKey} from '~/locales'

export const meta: MetaFunction = ({matches}) => {
  const {messages} = getRootI18n(matches)
  return [{title: pageTitle(translate(messages, 'log.metaTitle'))}]
}

export const loader = async ({request}: LoaderFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  const logs = await prisma.log.findMany({orderBy: {time: 'desc'}})

  return {logs}
}

const Log = () => {
  const {logs} = useLoaderData<typeof loader>()
  const {t} = useTranslation()

  return (
    <Page title={t('log.pageTitle')}>
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
    </Page>
  )
}

export default Log

const translateLogMessage = (
  message: string,
  t: ReturnType<typeof useTranslation>['t']
) => {
  const trimmedMessage = message.trim()

  const staticMessages: Record<string, MessageKey> = {
    '🔓 Logged in': 'log.messages.loggedIn',
    '🔒 Bad password supplied': 'log.messages.badPassword',
    '🔐 Lockdown Start': 'log.messages.lockdownStart',
    '🔐 Lockdown End': 'log.messages.lockdownEnd'
  }

  const staticKey = staticMessages[trimmedMessage]
  if (staticKey) {
    return t(staticKey)
  }

  const newActionPrefix = 'New Action: '
  if (trimmedMessage.startsWith(newActionPrefix)) {
    const name = trimmedMessage.slice(newActionPrefix.length).trim()
    return t('log.messages.newAction', {name})
  }

  const deleteActionPrefix = 'Deleted action: '
  if (trimmedMessage.startsWith(deleteActionPrefix)) {
    const name = trimmedMessage.slice(deleteActionPrefix.length).trim()
    return t('log.messages.deletedAction', {name})
  }

  return message
}
