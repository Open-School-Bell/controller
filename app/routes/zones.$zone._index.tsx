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

export const meta: MetaFunction<typeof loader> = ({data}) => {
  return [{title: pageTitle('Zones', data ? data.zone.name : 'View Zone')}]
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

  return (
    <Page title={zone.name}>
      <div className="box mb-4">
        <h2>Sounders</h2>
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
            label: 'Back',
            color: 'bg-stone-200',
            onClick: () => navigate('/zones')
          },
          {
            label: 'Edit Zone',
            color: 'bg-blue-300',
            onClick: () => navigate(`/zones/${zone.id}/edit`)
          }
        ]}
      />
    </Page>
  )
}

export default Zone
