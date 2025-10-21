import {
  type LoaderFunctionArgs,
  type MetaFunction,
  redirect
} from '@remix-run/node'
import {useNavigate, useLoaderData, Link} from '@remix-run/react'

import {getPrisma} from '~/lib/prisma.server'
import {checkSession} from '~/lib/session'
import {pageTitle} from '~/lib/utils'
import {Page, Actions} from '~/lib/ui'
import {useTranslation} from '~/lib/i18n'
import {translate} from '~/lib/i18n.shared'
import {getRootI18n} from '~/lib/i18n.meta'

export const meta: MetaFunction = ({matches}) => {
  const {messages} = getRootI18n(matches)
  return [{title: pageTitle(translate(messages, 'zones.metaTitle'))}]
}

export const loader = async ({request}: LoaderFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  const zones = await prisma.zone.findMany({
    include: {sounders: true, schedules: true},
    orderBy: {name: 'asc'}
  })

  return {zones}
}

const Zones = () => {
  const {zones} = useLoaderData<typeof loader>()
  const navigate = useNavigate()
  const {t} = useTranslation()

  return (
    <Page title={t('zones.titleWithCount', {count: zones.length})}>
      <div className="box mb-4">
        <table className="box-table">
          <thead>
            <tr>
              <th>{t('zones.table.zone')}</th>
              <th>{t('zones.table.sounders')}</th>
              <th>{t('zones.table.schedules')}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {zones.map(({id, name, sounders, schedules}) => {
              return (
                <tr key={id}>
                  <td>
                    <Link to={`/zones/${id}`}>{name}</Link>
                  </td>
                  <td className="text-center">{sounders.length}</td>
                  <td className="text-center">{schedules.length}</td>
                  <td>
                    <form method="post" action={`/zones/${id}/delete`}>
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
            label: t('zones.addButton'),
            color: 'bg-green-300',
            onClick: () => navigate('/zones/add')
          }
        ]}
      />
    </Page>
  )
}

export default Zones
