import {
  redirect,
  type ActionFunctionArgs,
  unstable_composeUploadHandlers,
  unstable_createFileUploadHandler,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
  type LoaderFunctionArgs
} from '@remix-run/node'
import {invariant} from '@arcath/utils'
import path from 'path'
import fs from 'fs'

import {getPrisma} from '~/lib/prisma.server'
import {checkSession} from '~/lib/session'

const {rename} = fs.promises

export const loader = async ({request}: LoaderFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  return
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
  return (
    <div>
      <h2>Add Sound</h2>
      <form method="post" encType="multipart/form-data">
        <label>
          Name
          <input
            name="name"
            className="border border-gray-200 rounded-md p-2"
          />
        </label>
        <label>
          MP3
          <input
            name="file"
            type="file"
            accept="audio/mp3"
            className="border border-gray-200 rounded-md p-2"
          />
        </label>
        <label>
          Ringer Wire
          <input
            name="ringer-wire"
            className="border border-gray-200 rounded-md p-2"
          />
        </label>
        <input type="submit" value="Add" />
      </form>
    </div>
  )
}

export default AddSound
