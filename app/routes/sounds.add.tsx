import {
  redirect,
  type ActionFunctionArgs,
  unstable_composeUploadHandlers,
  unstable_createFileUploadHandler,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
  type MetaFunction,
  type LoaderFunctionArgs
} from '@remix-run/node'
import {useNavigate} from '@remix-run/react'
import {invariant} from '@arcath/utils'
import path from 'path'
import fs from 'fs'

import {getPrisma} from '~/lib/prisma.server'
import {checkSession} from '~/lib/session'
import {INPUT_CLASSES, pageTitle} from '~/lib/utils'
import {Page, FormElement, Actions} from '~/lib/ui'

const {rename} = fs.promises

export const meta: MetaFunction<typeof loader> = () => {
  return [{title: pageTitle('Sounds', 'Add Sound')}]
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
  const ringerWire = formData.get('ringer-wire') as string | undefined
  const fileData = formData.get('file') as any as {filepath: string} | undefined

  invariant(name)
  invariant(fileData)

  const sound = await prisma.audio.create({
    data: {
      name,
      fileName: path.basename(fileData.filepath),
      ringerWire: ringerWire ? ringerWire : ''
    }
  })

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
      `${sound.id}${path.extname(fileData.filepath)}`
    )
  )

  await prisma.audio.update({
    where: {id: sound.id},
    data: {fileName: `${sound.id}${path.extname(fileData.filepath)}`}
  })

  return redirect(`/sounds/${sound.id}`)
}

const AddSound = () => {
  const navigate = useNavigate()

  return (
    <Page title="Add Sound">
      <form method="post" encType="multipart/form-data">
        <FormElement label="Name" helperText="Descriptive name for the sound.">
          <input name="name" className={INPUT_CLASSES} />
        </FormElement>
        <FormElement
          label="MP3 File"
          helperText="The MP3 file to be used as the sound."
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
          <input name="ringer-wire" className={INPUT_CLASSES} />
        </FormElement>
        <Actions
          actions={[
            {
              label: 'Cancel',
              color: 'bg-stone-200',
              onClick: e => {
                e.preventDefault()
                navigate('/sounds')
              }
            },
            {label: 'Add Sound', color: 'bg-green-300'}
          ]}
        />
      </form>
    </Page>
  )
}

export default AddSound
