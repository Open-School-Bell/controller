import {
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction
} from '@remix-run/node'
import {useLoaderData, useNavigate} from '@remix-run/react'
import {invariant} from '@arcath/utils'

import {getPrisma} from '~/lib/prisma.server'
import {checkSession} from '~/lib/session'
import {pageTitle, INPUT_CLASSES} from '~/lib/utils'
import {Page, FormElement, Actions} from '~/lib/ui'

export const meta: MetaFunction = () => {
  return [{title: pageTitle('Zones', 'Edit')}]
}

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  const zone = await prisma.zone.findFirstOrThrow({where: {id: params.zone}})

  return {zone}
}

export const action = async ({request, params}: ActionFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  const formData = await request.formData()

  const name = formData.get('name') as string | undefined

  invariant(name)

  const zone = await prisma.zone.update({
    where: {id: params.zone},
    data: {name}
  })

  return redirect(`/zones/${zone.id}`)
}

const AddZone = () => {
  const {zone} = useLoaderData<typeof loader>()
  const navigate = useNavigate()

  return (
    <Page title="Edit Zone">
      <form method="post">
        <FormElement label="Name" helperText="Descriptive name for the zone.">
          <input
            name="name"
            className={INPUT_CLASSES}
            defaultValue={zone.name}
          />
        </FormElement>
        <Actions
          actions={[
            {
              label: 'Cancel',
              color: 'bg-stone-200',
              onClick: e => {
                e.preventDefault()
                navigate(`/zones/${zone.id}`)
              }
            },
            {label: 'Edit Zone', color: 'bg-green-300'}
          ]}
        />
      </form>
    </Page>
  )
}

export default AddZone
