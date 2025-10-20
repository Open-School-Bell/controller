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
import {useTranslation} from '~/lib/i18n'
import {translate} from '~/lib/i18n.shared'
import {getRootI18n} from '~/lib/i18n.meta'

export const meta: MetaFunction = ({matches}) => {
  const {messages} = getRootI18n(matches)
  return [
    {
      title: pageTitle(
        translate(messages, 'sounders.metaTitle'),
        translate(messages, 'sounders.add.pageTitle')
      )
    }
  ]
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
  const {t} = useTranslation()

  return (
    <Page title={t('sounders.add.pageTitle')}>
      <form method="post">
        <FormElement
          label={t('sounders.form.name.label')}
          helperText={t('sounders.form.name.helper')}
        >
          <input name="name" className={INPUT_CLASSES} />
        </FormElement>
        <FormElement
          label={t('sounders.form.ip.label')}
          helperText={t('sounders.form.ip.helper')}
        >
          <input name="ip" className={INPUT_CLASSES} />
        </FormElement>
        <Actions
          actions={[
            {
              label: t('button.cancel'),
              color: 'bg-stone-200',
              onClick: e => {
                e.preventDefault()
                navigate('/sounders')
              }
            },
            {label: t('sounders.add.submit'), color: 'bg-green-300'}
          ]}
        />
      </form>
    </Page>
  )
}

export default AddSounder
