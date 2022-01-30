import { Client } from '@notionhq/client'
import {App, ContextBlock, DividerBlock, KnownBlock, SectionBlock} from '@slack/bolt'
import { URL } from 'url'

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
})

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
})


app.message(/(https?:\/\/(www\.)?notion\.so\/[A-z0-9\-_]+\/[A-z0-9\-_#?=&;]+)/, async ({ message, context, say}) => {
  console.debug("DEBUG: dump `message`", message)
  console.debug("DEBUG: dump `context`", context)

  const url = context.matches[0].replace(/&amp;/, '&')

  const parsedUrl = new URL(url)
  const parsePageIdFromPathname = (pathname: string) => pathname.replace(/^\/[0-9A-z\-_]+\//, '').split('-').splice(-1)[0]
  const page_id: string = parsedUrl.searchParams.get('p') !== null
    ? parsedUrl.searchParams.get('p') ?? parsePageIdFromPathname(parsedUrl.pathname)
    : parsePageIdFromPathname(parsedUrl.pathname)
  const block_id = parsedUrl.hash.slice(1)

  const page = await notion.pages.retrieve({ page_id })
  console.debug("DEBUG: dump `notion.pages.retrieve()`", { page_id }, page)
  const block = block_id ? await notion.blocks.retrieve({ block_id }) : null
  console.debug("DEBUG: dump `notion.blocks.retrieve()`", { block_id }, block)

  const blocks: KnownBlock[] = []
  blocks.push({
    type: "section",
    text: {
      type: "mrkdwn",
      // @ts-ignore
      text: `*<${url}|${page && Object.values(page.properties).find(elem => elem.id === 'title')?.title.find(elem => elem.plain_text !== undefined)?.plain_text}>*`,
    },
  } as SectionBlock)

  if (block !== null) {
    blocks.push({
      "type": "section",
      "text": {
        "type": "mrkdwn",
        // @ts-ignore
        "text": `${block[block.type].text.map(obj => obj.plain_text).join(' ') || 'content is unloaeded :cry:'}`,
      }
    } as SectionBlock)
  }
  blocks.push({
    "type": "divider"
  } as DividerBlock)
  blocks.push({
    "type": "context",
    "elements": [
      {
        "type": "mrkdwn",
        "text": "Posted by <https://github.com/takoba/notion-opener|notion-opener>"
      }
    ]
  } as ContextBlock)

  await say({
    // @ts-ignore
    thread_ts: message.thread_ts ?? null,
    attachments: [{
      blocks,
      fallback: `attachment failure. <${url}>`
    }]
  })
})

;(async () => {
  await app.start(process.env.PORT || 3000)
  console.info(`INFO: Bolt app is running!`, { app })
})()
