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

import {getPrisma} from '~/lib/prisma.server'

export const loader = async ({params}: LoaderFunctionArgs) => {
  const prisma = getPrisma()

  const sound = await prisma.audio.findFirstOrThrow({
    where: {id: params.sound}
  })

  return {sound}
}

export const action = async ({request, params}: ActionFunctionArgs) => {
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

  const sound = await prisma.audio.update({
    where: {id: params.sound},
    data: {
      name,
      fileName: fileData!.filepath
        ? path.basename(fileData!.filepath)
        : undefined,
      ringerWire: ringerWire ? ringerWire : ''
    }
  })

  return redirect(`/sounds/${sound.id}`)
}

const AddSound = () => {
  const {sound} = useLoaderData<typeof loader>()

  return (
    <div>
      <h2>Add Sound</h2>
      <form method="post" encType="multipart/form-data">
        <label>
          Name
          <input
            name="name"
            className="border border-gray-200 rounded-md p-2"
            defaultValue={sound.name}
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
            defaultValue={sound.ringerWire}
          />
        </label>
        <input type="submit" value="Update" />
      </form>
    </div>
  )
}

export default AddSound
