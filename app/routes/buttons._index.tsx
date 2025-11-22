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
  return [{title: pageTitle(translate(messages, 'buttons.metaTitle'))}]
}

export const loader = async ({request}: LoaderFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  const buttons = await prisma.actionButton.findMany({
    orderBy: {name: 'asc'},
    include: {action: true}
  })

  return {buttons}
}

const Sounders = () => {
  const {buttons} = useLoaderData<typeof loader>()
  const navigate = useNavigate()
  const {t} = useTranslation()

  return (
    <Page
      title={t('buttons.titleWithCount', {count: buttons.length})}
      helpLink="/docs/configuration/buttons/"
    >
      <div className="box mb-4">
        <table className="box-table">
          <thead>
            <tr>
              <th>{t('buttons.table.device')}</th>
              <th>{t('buttons.table.action')}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {buttons.map(({id, name, action}) => {
              return (
                <tr key={id}>
                  <td>
                    <Link to={`/sounders/${id}`}>{name}</Link>
                  </td>
                  <td>
                    <Link to={`/actions/${action.id}`}>{action.name}</Link>
                  </td>
                  <td>
                    <form
                      method="post"
                      action={`/buttons/${id}/delete`}
                      onSubmit={e => {
                        if (!confirm(t('buttons.deleteConfirmation', {name}))) {
                          e.preventDefault()
                        }
                      }}
                    >
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
            label: t('buttons.addButton'),
            color: 'bg-green-300',
            onClick: () => navigate('/buttons/add')
          }
        ]}
      />
    </Page>
  )
}

export default Sounders
