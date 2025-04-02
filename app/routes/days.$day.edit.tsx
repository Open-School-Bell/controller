import {
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs
} from '@remix-run/node'
import {useNavigate, useLoaderData} from '@remix-run/react'
import {invariant} from '@arcath/utils'

import {getPrisma} from '~/lib/prisma.server'
import {checkSession} from '~/lib/session'
import {Page, FormElement, Actions} from '~/lib/ui'
import {INPUT_CLASSES} from '~/lib/utils'

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  const dayType = await prisma.dayType.findFirstOrThrow({
    where: {id: params.day}
  })

  return {dayType}
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

  await prisma.dayType.update({
    where: {id: params.day},
    data: {name}
  })

  return redirect(`/calendar`)
}

const AddDay = () => {
  const {dayType} = useLoaderData<typeof loader>()
  const navigate = useNavigate()

  return (
    <Page title="Edit Day">
      <form method="post">
        <FormElement label="Name" helperText="Descriptive name for the day.">
          <input
            name="name"
            className={INPUT_CLASSES}
            defaultValue={dayType.name}
          />
        </FormElement>
        <Actions
          actions={[
            {
              label: 'Cancel',
              color: 'bg-stone-200',
              onClick: e => {
                e.preventDefault()
                navigate('/calendar')
              }
            },
            {
              label: 'Edit Day',
              color: 'bg-green-300'
            }
          ]}
        />
      </form>
    </Page>
  )
}

export default AddDay
