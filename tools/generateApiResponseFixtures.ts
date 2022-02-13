import { writeFile } from 'fs/promises'
import * as path from 'path'
import { Client } from '@notionhq/client'
import { GetBlockResponse, GetDatabaseResponse, GetPageResponse } from '@notionhq/client/build/src/api-endpoints'

type RequestParamType = 'page' | 'database' | 'block'
type RequestParam = {
  type: RequestParamType
  id: string
}
const requestParams: RequestParam[] = [
  { type: 'page', id: '0044fa85dd0a45e9878be0cfca4b2349' },
]

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
})

;(async () => {
  Promise.all(
    requestParams.map(
      async (param): Promise<[RequestParam, GetPageResponse | GetDatabaseResponse | GetBlockResponse]> => {
        let req
        switch (param.type) {
          case 'page':
            const page_id = param.id
            req = await notion.pages.retrieve({ page_id })
            break
          case 'database':
            const database_id = param.id
            req = await notion.databases.retrieve({ database_id })
            break
          case 'block':
            const block_id = param.id
            req = await notion.blocks.retrieve({ block_id })
            break
        }
        return [param, req]
      }
    )
  ).then(async (values: [RequestParam, GetPageResponse | GetDatabaseResponse | GetBlockResponse][]) => {
    Promise.all<void>(
      values.map(async (value) => {
        const [param, data] = value
        console.log({ param, data })

        const distPath = path.resolve(`./src/__fixtures__/${param.type}_${param.id}.json`)
        const jsonTxt = JSON.stringify(data)
        return await writeFile(distPath, jsonTxt)
      })
    ).then(() => process.exit(0))
  })
})()
