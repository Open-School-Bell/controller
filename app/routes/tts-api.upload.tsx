import {
  redirect,
  type ActionFunctionArgs,
  unstable_composeUploadHandlers,
  unstable_createFileUploadHandler,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData
} from '@remix-run/node'

import {getPrisma} from '~/lib/prisma.server'

export const action = async ({request}: ActionFunctionArgs) => {
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

  await unstable_parseMultipartFormData(request, uploadHandler)

  return {status: 'ok'}
}
