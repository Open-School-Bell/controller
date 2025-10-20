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
import {trigger} from '~/lib/trigger'
import {useTranslation} from '~/lib/i18n'
import {translate} from '~/lib/i18n.shared'
import {getRootI18n} from '~/lib/i18n.meta'

export const meta: MetaFunction = ({matches}) => {
  const {messages} = getRootI18n(matches)
  return [
    {
      title: pageTitle(
        translate(messages, 'actions.title'),
        translate(messages, 'actions.add.pageTitle')
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

  const sounds = await prisma.audio.findMany({orderBy: {name: 'asc'}})

  return {sounds}
}

export const action = async ({request}: ActionFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  const formData = await request.formData()

  const name = formData.get('name') as string | undefined
  const icon = formData.get('icon') as string | undefined
  const action = formData.get('action') as string | undefined
  const sound = formData.get('sound') as string | undefined

  invariant(name)
  invariant(icon)
  invariant(action)
  invariant(sound)

  const newAction = await prisma.action.create({
    data: {name, icon, action, audioId: sound}
  })

  void trigger(`New Action: ${name}`, 'newAction')

  return redirect(`/actions/${newAction.id}`)
}

const AddAction = () => {
  const {sounds} = useLoaderData<typeof loader>()
  const navigate = useNavigate()
  const {t} = useTranslation()

  return (
    <Page title={t('actions.add.pageTitle')}>
      <form method="post">
        <FormElement
          label={t('actions.form.name.label')}
          helperText={t('actions.form.name.helper')}
        >
          <input name="name" className={INPUT_CLASSES} />
        </FormElement>
        <FormElement
          label={t('actions.form.icon.label')}
          helperText={t('actions.form.icon.helper')}
        >
          <input name="icon" className={INPUT_CLASSES} />
        </FormElement>
        <FormElement
          label={t('actions.form.type.label')}
          helperText={t('actions.form.type.helper')}
        >
          <select name="action" className={INPUT_CLASSES}>
            <option value="broadcast">{t('actions.types.broadcast')}</option>
            <option value="lockdown">{t('actions.types.lockdown')}</option>
          </select>
        </FormElement>
        <FormElement
          label={t('actions.form.sound.label')}
          helperText={t('actions.form.sound.helper')}
        >
          <select name="sound" className={INPUT_CLASSES}>
            {sounds.map(({id, name}) => {
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
              onClick: e => {
                e.preventDefault()
                navigate('/actions')
              },
              color: 'bg-stone-200'
            },
            {label: t('button.add'), color: 'bg-green-300'}
          ]}
        />
      </form>
    </Page>
  )
}

export default AddAction
