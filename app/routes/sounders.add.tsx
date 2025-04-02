import {
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction
} from '@remix-run/node'
import {useNavigate} from '@remix-run/react'
import {invariant} from '@arcath/utils'

import {getPrisma} from '~/lib/prisma.server'
import {makeKey, INPUT_CLASSES, pageTitle} from '~/lib/utils'
import {checkSession} from '~/lib/session'
import {Page, FormElement, Actions} from '~/lib/ui'

export const meta: MetaFunction = () => {
  return [{title: pageTitle('Sounders', 'Add')}]
}

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
  const ip = formData.get('ip') as string | undefined

  invariant(name)
  invariant(ip)

  const key = makeKey()

  const sounder = await prisma.sounder.create({data: {name, key}})

  return redirect(`/sounders/${sounder.id}`)
}

const AddSounder = () => {
  const navigate = useNavigate()

  return (
    <Page title="Add Sounder">
      <form method="post">
        <FormElement
          label="Name"
          helperText="The descriptive name of the sounder"
        >
          <input name="name" className={INPUT_CLASSES} />
        </FormElement>
        <FormElement
          label="IP"
          helperText="The IP address the controller can contact the sounder on."
        >
          <input name="ip" className={INPUT_CLASSES} />
        </FormElement>
        <Actions
          actions={[
            {
              label: 'Cancel',
              color: 'bg-stone-200',
              onClick: e => {
                e.preventDefault()
                navigate('/sounders')
              }
            },
            {label: 'Add Sounder', color: 'bg-green-300'}
          ]}
        />
      </form>
    </Page>
  )
}

export default AddSounder
