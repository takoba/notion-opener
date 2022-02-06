import App, { AppOptions, Props } from './app'

const appOptions: AppOptions = {
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  port: Number(process.env.PORT) || 3000,
  auth: process.env.NOTION_TOKEN,
}

App({ appOptions } as Props)
