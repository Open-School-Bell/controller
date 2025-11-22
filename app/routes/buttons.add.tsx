import {
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction
} from '@remix-run/node'
import {useLoaderData, useNavigate} from '@remix-run/react'
import {invariant} from '@arcath/utils'

import {getPrisma} from '~/lib/prisma.server'
import {makeKey, INPUT_CLASSES, pageTitle} from '~/lib/utils'
import {checkSession} from '~/lib/session'
import {Page, FormElement, Actions} from '~/lib/ui'
import {useTranslation} from '~/lib/i18n'
import {translate} from '~/lib/i18n.shared'
import {getRootI18n} from '~/lib/i18n.meta'

export const meta: MetaFunction = ({matches}) => {
  const {messages} = getRootI18n(matches)
  return [
    {
      title: pageTitle(
        translate(messages, 'buttons.metaTitle'),
        translate(messages, 'buttons.add.pageTitle')
      )
    }
  ]
}

export const loader = async ({request}: LoaderFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  const actions = await prisma.action.findMany({orderBy: {name: 'asc'}})

  return {actions}
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
  const action = formData.get('action') as string | undefined

  invariant(name)
  invariant(ip)
  invariant(action)

  const key = makeKey()

  const button = await prisma.actionButton.create({
    data: {name, key, ip, actionId: action}
  })

  return redirect(`/buttons/${button.id}`)
}

const AddButton = () => {
  const {actions} = useLoaderData<typeof loader>()
  const navigate = useNavigate()
  const {t} = useTranslation()

  return (
    <Page title={t('buttons.add.pageTitle')}>
      <form method="post">
        <FormElement
          label={t('buttons.form.name.label')}
          helperText={t('buttons.form.name.helper')}
        >
          <input name="name" className={INPUT_CLASSES} />
        </FormElement>
        <FormElement
          label={t('buttons.form.ip.label')}
          helperText={t('buttons.form.ip.helper')}
        >
          <input name="ip" className={INPUT_CLASSES} />
        </FormElement>
        <FormElement
          label={t('buttons.form.action.label')}
          helperText={t('buttons.form.action.helper')}
        >
          <select name="action" className={INPUT_CLASSES}>
            {actions.map(({id, name}) => {
              return (
                <option key={id} value={id}>
                  {name}
                </option>
              )
            })}
          </select>
        </FormElement>
        <Actions
          actions={[
            {
              label: t('button.cancel'),
              color: 'bg-stone-200',
              onClick: e => {
                e.preventDefault()
                navigate('/buttons')
              }
            },
            {label: t('buttons.add.submit'), color: 'bg-green-300'}
          ]}
        />
      </form>
    </Page>
  )
}

export default AddButton
