import { App as BoltApp } from '@slack/bolt'
import App, { AppOptions, Props } from './app'

const appOptions: AppOptions = {
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  port: Number(process.env.PORT) || 3000,
  auth: process.env.NOTION_TOKEN,
}

const app: BoltApp = App({ appOptions } as Props)

;(async () => {
  await app.start()
  console.info(`INFO: Bolt app is running!`, { app })
})()
