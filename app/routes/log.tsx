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
                <td>{message}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </Page>
  )
}

export default Log
