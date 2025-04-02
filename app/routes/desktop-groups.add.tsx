import {
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs
} from '@remix-run/node'
import {useNavigate} from '@remix-run/react'
import {invariant} from '@arcath/utils'

import {getPrisma} from '~/lib/prisma.server'
import {checkSession} from '~/lib/session'
import {INPUT_CLASSES, makeKey} from '~/lib/utils'
import {Page, FormElement, Actions} from '~/lib/ui'

export const loader = async ({request}: LoaderFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  return {}
}

export const action = async ({request}: ActionFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  const formData = await request.formData()

  const name = formData.get('name') as string | undefined

  invariant(name)

  const key = makeKey()

  const desktopGroup = await prisma.desktopAlertGroup.create({
    data: {name, key}
  })

  return redirect(`/desktop-groups/${desktopGroup.id}`)
}

const AddDay = () => {
  const navigate = useNavigate()

  return (
    <Page title="Add Desktop Group">
      <form method="post">
        <FormElement label="Name" helperText="The name of the desktop group">
          <input name="name" className={INPUT_CLASSES} />
        </FormElement>
        <Actions
          actions={[
            {
              label: 'Cancel',
              color: 'bg-stone-200',
              onClick: e => {
                e.preventDefault()
                navigate('/desktop-groups')
              }
            },
            {
              label: 'Add Desktop Group',
              color: 'bg-green-300'
            }
          ]}
        />
      </form>
    </Page>
  )
}

export default AddDay
