import {
  type LoaderFunctionArgs,
  type MetaFunction,
  redirect
} from '@remix-run/node'
import {useLoaderData, useNavigate, Link} from '@remix-run/react'

import {getPrisma} from '~/lib/prisma.server'
import {checkSession} from '~/lib/session'
import {pageTitle} from '~/lib/utils'
import {Page, Actions} from '~/lib/ui'
import {useTranslation} from '~/lib/i18n'
import {translate} from '~/lib/i18n.shared'
import {getRootI18n} from '~/lib/i18n.meta'

export const meta: MetaFunction = ({matches}) => {
  const {messages} = getRootI18n(matches)
  return [{title: pageTitle(translate(messages, 'sounds.metaTitle'))}]
}

export const loader = async ({request}: LoaderFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  const sounds = await prisma.audio.findMany({orderBy: {name: 'asc'}})

  return {sounds}
}

const Sounds = () => {
  const {sounds} = useLoaderData<typeof loader>()
  const navigate = useNavigate()
  const {t} = useTranslation()

  return (
    <Page
      title={t('sounds.titleWithCount', {count: sounds.length})}
      helpLink="/docs/configuration/sound/"
    >
      <div className="box mb-4">
        <table className="box-table">
          <thead>
            <tr>
              <th>{t('sounds.table.name')}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sounds.map(({id, name}) => {
              return (
                <tr key={id}>
                  <td>
                    <Link to={`/sounds/${id}`}>{name}</Link>
                  </td>
                  <td>
                    <form method="post" action={`/sounds/${id}/delete`}>
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
            label: t('sounds.addButton'),
            color: 'bg-green-300',
            onClick: () => navigate('/sounds/add')
          },
          {
            label: t('sounds.addTtsButton'),
            color: 'bg-green-300',
            onClick: () => navigate('/sounds/add-tts')
          }
        ]}
      />
    </Page>
  )
}

export default Sounds
