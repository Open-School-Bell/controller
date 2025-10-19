import {
  type LoaderFunctionArgs,
  type MetaFunction,
  redirect
} from '@remix-run/node'
import {useLoaderData, Link, useNavigate} from '@remix-run/react'

import {getPrisma} from '~/lib/prisma.server'
import {checkSession} from '~/lib/session'
import {pageTitle} from '~/lib/utils'
import {Page, Actions} from '~/lib/ui'
import {useTranslation} from '~/lib/i18n'
import {translate} from '~/lib/i18n.shared'
import {getRootI18n} from '~/lib/i18n.meta'

export const meta: MetaFunction = ({matches}) => {
  const {messages} = getRootI18n(matches)
  return [{title: pageTitle(translate(messages, 'actions.title'))}]
}

export const loader = async ({request}: LoaderFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  const actions = await prisma.action.findMany({orderBy: {name: 'asc'}})

  return {actions}
}

const ActionsPage = () => {
  const {actions} = useLoaderData<typeof loader>()
  const navigate = useNavigate()
  const {t} = useTranslation()
  const typeLabels: Record<string, string> = {
    broadcast: t('actions.types.broadcast'),
    lockdown: t('actions.types.lockdown')
  }

  return (
    <Page title={t('actions.titleWithCount', {count: actions.length})}>
      <div className="box mb-4">
        <table className="box-table">
          <thead>
            <tr>
              <th>{t('actions.table.action')}</th>
              <th>{t('actions.table.type')}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {actions.map(({id, name, action}) => {
              return (
                <tr key={id}>
                  <td className="text-center">
                    <Link to={`/actions/${id}`}>{name}</Link>
                  </td>
                  <td className="text-center">
                    {typeLabels[action] ? typeLabels[action] : action}
                  </td>
                  <td className="text-center">
                    <form method="post" action={`/actions/${id}/delete`}>
                      <button className="cursor-pointer">🗑️</button>
                    </form>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <Actions
        actions={[
          {
            label: t('actions.buttons.add'),
            color: 'bg-green-300',
            onClick: () => navigate('/actions/add')
          }
        ]}
      />
    </Page>
  )
}

export default ActionsPage
