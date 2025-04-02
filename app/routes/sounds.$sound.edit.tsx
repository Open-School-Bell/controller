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

const {rename} = fs.promises

export const meta: MetaFunction<typeof loader> = ({data}) => {
  return [
    {title: pageTitle('Sounds', data ? data.sound.name : 'Sound', 'Edit')}
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

  return (
    <Page title="Edit Sound">
      <form method="post" encType="multipart/form-data">
        <FormElement label="Name" helperText="Descriptive name for the sound.">
          <input
            name="name"
            className={INPUT_CLASSES}
            defaultValue={sound.name}
          />
        </FormElement>
        <FormElement
          label="MP3 File"
          helperText="Supply a new MP3 to replace the existing one."
        >
          <input
            name="file"
            type="file"
            accept="audio/mp3"
            className={INPUT_CLASSES}
          />
        </FormElement>
        <FormElement
          label="Ringer Wire"
          helperText="Comma seperated list of seconds to operate the relay. ON,OFF,ON,OFF, e.g. 1,3,1,3. make sure to end with an off time."
        >
          Ringer Wire
          <input
            name="ringer-wire"
            className={INPUT_CLASSES}
            defaultValue={sound.ringerWire}
          />
        </FormElement>
        <Actions
          actions={[
            {
              label: 'Cancel',
              color: 'bg-stone-200',
              onClick: e => {
                e.preventDefault()
                navigate(`/sounds/${sound.id}`)
              }
            },
            {label: 'Edit Sound', color: 'bg-green-300'}
          ]}
        />
      </form>
    </Page>
  )
}

export default AddSound
