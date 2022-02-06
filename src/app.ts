import { Client } from '@notionhq/client'
import { ClientOptions as NotionClientOptions } from '@notionhq/client/build/src/Client'
import { GetBlockResponse, GetDatabaseResponse, GetPageResponse } from '@notionhq/client/build/src/api-endpoints'
import {
  App as BoltApp,
  AppOptions as BoltAppOptions,
  Context,
  ContextBlock,
  DividerBlock,
  KnownBlock,
  MessageEvent,
  SayFn,
  SectionBlock,
} from '@slack/bolt'
import { parseIdsFromNotionUrl } from './parser'

export type AppOptions = Pick<BoltAppOptions, 'token' | 'signingSecret' | 'receiver' | 'port'> &
  Pick<NotionClientOptions, 'auth'>

export type Props = {
  appOptions: AppOptions
}
const App = ({ appOptions }: Props) => {
  const app = new BoltApp(
    (({ token, signingSecret, port }: AppOptions) => ({ token, signingSecret, port }))(appOptions)
  )

  const notion = new Client((({ auth }: AppOptions) => ({ auth }))(appOptions))

  app.message(
    /(https?:\/\/(www\.)?notion\.so\/[A-z0-9\-_]+\/[A-z0-9\-_#?=&;]+)/,
    async ({ message, context, say }: { message: MessageEvent; context: Context; say: SayFn }) => {
      console.debug('DEBUG: dump `message`', message)
      console.debug('DEBUG: dump `context`', context)

      const url = context.matches[0].replace(/&amp;/, '&')
      const { page_id, block_id } = parseIdsFromNotionUrl(url)

      let page, database
      try {
        page = await notion.pages.retrieve({ page_id })
        console.debug('DEBUG: dump `notion.pages.retrieve()`', { page_id }, page)
      } catch (error) {
        console.error('ERROR: failed notion.pages.retrieve()', { error })

        try {
          database = await notion.databases.retrieve({ database_id: page_id })
          console.debug('DEBUG: dump `notion.databases.retrieve()`', { database_id: page_id }, database)
        } catch (error) {
          console.error('ERROR: failed notion.databases.retrieve()', { error })
          throw error
        }
      }

      const block: GetBlockResponse | { [key: string]: string | object | boolean } | null = block_id
        ? await notion.blocks.retrieve({ block_id })
        : null
      console.debug('DEBUG: dump `notion.blocks.retrieve()`', { block_id }, block)

      const object = page || (database as GetPageResponse | GetDatabaseResponse)

      const title = ((obj: GetPageResponse | GetDatabaseResponse) => {
        if (obj.object === 'page') {
          const titleProp = (
            ('properties' in obj ? Object.values(obj.properties) : []) as {
              type: string
              [key: string | symbol]: string | object | boolean | null
            }[]
          ).find((elem) => elem.type === 'title') as {
            id: 'title'
            type: 'title'
            title: { plain_text: string; [key: string | symbol]: string | object | boolean | null }[]
          }
          const titleObj = titleProp.title[0] ?? {}
          return titleObj && 'plain_text' in titleObj ? titleObj.plain_text : 'missing title :cry:'
        } else if (obj.object === 'database') {
          return (
            'title' in obj
              ? obj.title
              : (('title' in obj.properties ? obj.properties.title : []) as { type: string; plain_text: string }[])
          ).find((elem) => elem.type === 'text')?.plain_text
        }

        throw new Error(`Unexpected object. obj.object: ${'object' in obj && (obj as { object: string }).object}`)
      })(object)

      const blocks: KnownBlock[] = []
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*<${url}|${title}>*`,
        },
      } as SectionBlock)

      if (block !== null) {
        blocks.push({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `${
              (
                ('type' in block &&
                  (block.type as string) in block &&
                  (block[block.type as string] as { text: { plain_text: string }[] })) || { text: [] }
              )?.text
                .map((obj) => obj.plain_text)
                .join(' ') || 'content is unloaeded :cry:'
            }`,
          },
        } as SectionBlock)
      }
      blocks.push({
        type: 'divider',
      } as DividerBlock)
      blocks.push({
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: 'Posted by <https://github.com/takoba/notion-opener|notion-opener>',
          },
        ],
      } as ContextBlock)

      await say({
        thread_ts: 'thread_ts' in message ? message.thread_ts : undefined,
        attachments: [
          {
            blocks,
            fallback: `attachment failure. <${url}>`,
          },
        ],
      })
    }
  )

  return app
}

export default App
