import {type LoaderFunctionArgs, type MetaFunction} from '@remix-run/node'
import {Link, useNavigate, useLoaderData} from '@remix-run/react'

import {getPrisma} from '~/lib/prisma.server'
import {pageTitle} from '~/lib/utils'
import {Page, Actions} from '~/lib/ui'
import {useTranslation} from '~/lib/i18n'
import {translate} from '~/lib/i18n.shared'
import {getRootI18n} from '~/lib/i18n.meta'

export const meta: MetaFunction = ({matches}) => {
  const {messages} = getRootI18n(matches)
  return [{title: pageTitle(translate(messages, 'desktopGroups.metaTitle'))}]
}

export const loader = async ({}: LoaderFunctionArgs) => {
  const prisma = getPrisma()

  const desktopGroups = await prisma.desktopAlertGroup.findMany({
    orderBy: {name: 'asc'}
  })

  return {desktopGroups}
}

const DesktopGroups = () => {
  const {desktopGroups} = useLoaderData<typeof loader>()
  const navigate = useNavigate()
  const {t} = useTranslation()

  return (
    <Page title={t('desktopGroups.titleWithCount', {count: desktopGroups.length})}>
      <div className="box mb-4">
        <table className="box-table">
          <thead>
            <tr>
              <th>{t('desktopGroups.table.name')}</th>
              <th>{t('desktopGroups.table.key')}</th>
            </tr>
          </thead>
          <tbody>
            {desktopGroups.map(({id, name, key}) => {
              return (
                <tr key={id}>
                  <td>
                    <Link to={`/desktop-groups/${id}`}>{name}</Link>
                  </td>
                  <td>{key}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <Actions
        actions={[
          {
            label: t('desktopGroups.addButton'),
            color: 'bg-green-300',
            onClick: () => navigate('/desktop-groups/add')
          }
        ]}
      />
    </Page>
  )
}

export default DesktopGroups
