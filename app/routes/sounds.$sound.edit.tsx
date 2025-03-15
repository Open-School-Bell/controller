import {
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  unstable_composeUploadHandlers,
  unstable_createFileUploadHandler,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData
} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import {invariant} from '@arcath/utils'
import path from 'path'
import fs from 'fs'

import {getPrisma} from '~/lib/prisma.server'
import {checkSession} from '~/lib/session'
import {INPUT_CLASSES} from '~/lib/utils'

const {rename} = fs.promises

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

  return (
    <div className="box">
      <h2>Edit Sound</h2>
      <form method="post" encType="multipart/form-data">
        <label>
          Name
          <input
            name="name"
            className={INPUT_CLASSES}
            defaultValue={sound.name}
          />
        </label>
        <label>
          MP3
          <input
            name="file"
            type="file"
            accept="audio/mp3"
            className={INPUT_CLASSES}
          />
        </label>
        <label>
          Ringer Wire
          <input
            name="ringer-wire"
            className={INPUT_CLASSES}
            defaultValue={sound.ringerWire}
          />
        </label>
        <input
          type="submit"
          value="Update"
          className={`${INPUT_CLASSES} mt-2 bg-green-300`}
        />
      </form>
    </div>
  )
}

export default AddSound
