import {
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  unstable_composeUploadHandlers,
  unstable_createFileUploadHandler,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
  type MetaFunction
} from '@remix-run/node'
import {useLoaderData, useNavigate} from '@remix-run/react'
import {invariant} from '@arcath/utils'
import path from 'path'
import fs from 'fs'

import {getPrisma} from '~/lib/prisma.server'
import {checkSession} from '~/lib/session'
import {INPUT_CLASSES, pageTitle} from '~/lib/utils'
import {Page, FormElement, Actions} from '~/lib/ui'
import {useTranslation} from '~/lib/i18n'
import {translate} from '~/lib/i18n.shared'
import {getRootI18n} from '~/lib/i18n.meta'

const {rename} = fs.promises

export const meta: MetaFunction<typeof loader> = ({data, matches}) => {
  const {messages} = getRootI18n(matches)
  const name = data ? data.sound.name : translate(messages, 'sounds.detail.metaFallback')
  return [
    {
      title: pageTitle(
        translate(messages, 'sounds.metaTitle'),
        translate(messages, 'sounds.edit.metaTitle', {name})
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

  const sound = await prisma.audio.findFirstOrThrow({
    where: {id: params.sound}
  })

  return {sound}
}

export const action = async ({request, params}: ActionFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  const uploadHandler = unstable_composeUploadHandlers(
    unstable_createFileUploadHandler({
      maxPartSize: 50_000_000,
      directory: 'public/sounds/',
      file: ({filename}) => {
        return filename
      }
    }),
    unstable_createMemoryUploadHandler()
  )

  const formData = await unstable_parseMultipartFormData(request, uploadHandler)

  const name = formData.get('name') as string | undefined
  const fileData = formData.get('file') as any as {filepath: string} | undefined
  const ringerWire = formData.get('ringer-wire') as string | undefined

  invariant(name)

  if (fileData && fileData.filepath) {
    await rename(
      path.join(
        process.cwd(),
        'public',
        'sounds',
        path.basename(fileData.filepath)
      ),
      path.join(
        process.cwd(),
        'public',
        'sounds',
        `${params.sound}${path.extname(fileData.filepath)}`
      )
    )
  }

  const sound = await prisma.audio.update({
    where: {id: params.sound},
    data: {
      name,
      fileName:
        fileData && fileData.filepath
          ? `${params.sound}${path.extname(fileData.filepath)}`
          : undefined,
      ringerWire: ringerWire ? ringerWire : ''
    }
  })

  return redirect(`/sounds/${sound.id}`)
}

const AddSound = () => {
  const {sound} = useLoaderData<typeof loader>()
  const navigate = useNavigate()
  const {t} = useTranslation()

  return (
    <Page title={t('sounds.edit.pageTitle', {name: sound.name})}>
      <form method="post" encType="multipart/form-data">
        <FormElement
          label={t('sounds.form.name.label')}
          helperText={t('sounds.form.name.helper')}
        >
          <input
            name="name"
            className={INPUT_CLASSES}
            defaultValue={sound.name}
          />
        </FormElement>
        <FormElement
          label={t('sounds.form.file.label')}
          helperText={t('sounds.form.file.helperEdit')}
        >
          <input
            name="file"
            type="file"
            accept="audio/mp3"
            className={INPUT_CLASSES}
          />
        </FormElement>
        <FormElement
          label={t('sounds.form.ringer.label')}
          helperText={t('sounds.form.ringer.helper')}
        >
          <input
            name="ringer-wire"
            className={INPUT_CLASSES}
            defaultValue={sound.ringerWire}
          />
        </FormElement>
        <Actions
          actions={[
            {
              label: t('button.cancel'),
              color: 'bg-stone-200',
              onClick: e => {
                e.preventDefault()
                navigate(`/sounds/${sound.id}`)
              }
            },
            {label: t('button.saveChanges'), color: 'bg-green-300'}
          ]}
        />
      </form>
    </Page>
  )
}

export default AddSound
