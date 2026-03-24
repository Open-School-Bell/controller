import {
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction
} from '@remix-run/node'
import {useLoaderData, useNavigate} from '@remix-run/react'
import {invariant} from '@arcath/utils'

import {getPrisma} from '~/lib/prisma.server'
import {INPUT_CLASSES, pageTitle} from '~/lib/utils'
import {checkSession} from '~/lib/session'
import {Page, FormElement, Actions} from '~/lib/ui'
import {useTranslation} from '~/lib/i18n'
import {translate} from '~/lib/i18n.shared'
import {getRootI18n} from '~/lib/i18n.meta'
import {SequenceBuilder} from '~/lib/sequence-builder'

export const meta: MetaFunction<typeof loader> = ({matches, data}) => {
  const {messages} = getRootI18n(matches)
  const name = data?.action.name ?? ''

  return [
    {
      title: pageTitle(
        translate(messages, 'actions.title'),
        translate(messages, 'actions.edit.metaTitle', {name})
      )
    }
  ]
}

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  const action = await prisma.action.findFirstOrThrow({
    where: {id: params.action}
  })

  const sounds = await prisma.audio.findMany({orderBy: {name: 'asc'}})

  return {sounds, action}
}

export const action = async ({params, request}: ActionFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  const formData = await request.formData()

  const name = formData.get('name') as string | undefined
  const icon = formData.get('icon') as string | undefined
  const action = formData.get('action') as string | undefined
  const data = formData.get('data') as string | undefined

  invariant(name)
  invariant(icon)
  invariant(action)
  invariant(data)

  await prisma.action.update({
    where: {id: params.action},
    data: {name, icon, action, data}
  })

  return redirect(`/actions/${params.action}`)
}

const AddAction = () => {
  const {sounds, action} = useLoaderData<typeof loader>()
  const navigate = useNavigate()
  const {t} = useTranslation()

  return (
    <Page title={t('actions.edit.pageTitle', {name: action.name})}>
      <form method="post">
        <FormElement
          label={t('actions.form.name.label')}
          helperText={t('actions.form.name.helper')}
        >
          <input
            name="name"
            className={INPUT_CLASSES}
            defaultValue={action.name}
          />
        </FormElement>
        <FormElement
          label={t('actions.form.icon.label')}
          helperText={t('actions.form.icon.helper')}
        >
          <input
            name="icon"
            className={INPUT_CLASSES}
            defaultValue={action.icon}
          />
        </FormElement>
        <FormElement
          label={t('actions.form.type.label')}
          helperText={t('actions.form.type.helper')}
        >
          <select
            name="action"
            className={INPUT_CLASSES}
            defaultValue={action.action}
          >
            <option value="broadcast">{t('actions.types.broadcast')}</option>
            <option value="lockdown">{t('actions.types.lockdown')}</option>
          </select>
        </FormElement>
        <SequenceBuilder
          sounds={sounds}
          initialQueue={action.data === '' ? [] : JSON.parse(action.data)}
          name="data"
          label={t('actions.form.sequence.label')}
          helperText={t('actions.form.sequence.helper')}
        />
        <Actions
          actions={[
            {
              label: t('button.cancel'),
              onClick: e => {
                e.preventDefault()
                navigate(`/actions/${action.id}`)
              },
              color: 'bg-stone-200'
            },
            {label: t('button.save'), color: 'bg-green-300'}
          ]}
        />
      </form>
    </Page>
  )
}

export default AddAction
