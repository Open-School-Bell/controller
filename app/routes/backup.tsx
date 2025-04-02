import {
  type ActionFunctionArgs,
  type MetaFunction,
  type LoaderFunctionArgs,
  redirect
} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import path from 'path'
import {mkdirp} from 'mkdirp'
import AdmZip from 'adm-zip'
import {format} from 'date-fns'
import fs from 'fs'

import {checkSession} from '~/lib/session'
import {INPUT_CLASSES, pageTitle} from '~/lib/utils'
import {Page} from '~/lib/ui'

export const meta: MetaFunction = () => {
  return [{title: pageTitle('Backups')}]
}

const BACKUPS_DIR = path.join(process.cwd(), 'public', 'backups')
const SOUNDS_PATH = path.join(process.cwd(), 'public', 'sounds')
const DB_PATH = path.join(
  process.cwd(),
  'prisma',
  process.env.DATABASE_URL!.replace('file:.', '')
)

export const loader = async ({request}: LoaderFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  await mkdirp(BACKUPS_DIR)

  const backupsDir = path.join(process.cwd(), 'public', 'backups')
  const files = await fs.promises.readdir(backupsDir)

  return {files}
}

export const action = async ({request}: ActionFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  await mkdirp(BACKUPS_DIR)

  const zip = new AdmZip()

  zip.addLocalFile(DB_PATH, 'database')
  await new Promise<void>(resolve => {
    zip.addLocalFolderAsync(SOUNDS_PATH, () => resolve(), 'sounds')
  })

  const fileDate = format(new Date(), 'yyyy-MM-dd-HH-mm')

  await zip.writeZipPromise(path.join(BACKUPS_DIR, `backup-${fileDate}.zip`))

  return {}
}

const Backups = () => {
  const {files} = useLoaderData<typeof loader>()

  return (
    <Page title="Backups">
      <div className="grid grid-cols-2 gap-8">
        <div className="box">
          <form method="post">
            <input
              type="submit"
              value="Create Backup"
              className={INPUT_CLASSES}
            />
          </form>
        </div>
        <div className="box">
          <ul>
            {files.map(fileName => {
              return (
                <li key={fileName}>
                  <a href={`/backups/${fileName}`}>{fileName}</a>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </Page>
  )
}

export default Backups
