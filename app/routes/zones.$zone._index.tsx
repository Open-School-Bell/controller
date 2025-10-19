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

export const meta: MetaFunction<typeof loader> = ({data, matches}) => {
  const {messages} = getRootI18n(matches)
  const name = data
    ? data.zone.name
    : translate(messages, 'zones.detail.metaFallback')
  return [{title: pageTitle(translate(messages, 'zones.metaTitle'), name)}]
}

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  const zone = await prisma.zone.findFirstOrThrow({
    where: {id: params.zone},
    include: {sounders: {include: {sounder: true}}}
  })

  return {zone}
}

const Zone = () => {
  const {zone} = useLoaderData<typeof loader>()
  const navigate = useNavigate()
  const {t} = useTranslation()

  return (
    <Page title={zone.name}>
      <div className="box mb-4">
        <h2>{t('zones.detail.soundersTitle')}</h2>
        <ul>
          {zone.sounders.map(({sounder}) => {
            return (
              <li key={sounder.id}>
                <Link to={`/sounders/${sounder.id}`}>{sounder.name}</Link>
              </li>
            )
          })}
        </ul>
      </div>
      <Actions
        actions={[
          {
            label: t('button.back'),
            color: 'bg-stone-200',
            onClick: () => navigate('/zones')
          },
          {
            label: t('zones.detail.editButton'),
            color: 'bg-blue-300',
            onClick: () => navigate(`/zones/${zone.id}/edit`)
          }
        ]}
      />
    </Page>
  )
}

export default Zone
