import { App as BoltApp, LogLevel, Receiver, ReceiverEvent, GenericMessageEvent } from '@slack/bolt'
import { StringIndexed } from '@slack/bolt/dist/types/helpers'
import { ConsoleLogger } from '@slack/logger'
import { WebClient } from '@slack/web-api'
import page_0044fa85dd0a45e9878be0cfca4b2349_json from './__fixtures__/page_0044fa85dd0a45e9878be0cfca4b2349.json'
import App, { AppOptions, Props } from './app'

const metadataResult: { user_id: string; bot_id: string } = {
  user_id: 'Uxxxxxxxx',
  bot_id: 'Bxxxxxxxx',
}
const mockWebClient = {
  chat: { postMessage: jest.fn() },
  auth: { test: () => Promise.resolve(metadataResult) },
}
jest.mock('@slack/web-api', () => {
  return {
    WebClient: jest.fn().mockImplementation(() => mockWebClient),
    addAppMetadata: jest.fn(),
  }
})
const mockNotionClient = {
  pages: { retrieve: jest.fn().mockImplementation(() => page_0044fa85dd0a45e9878be0cfca4b2349_json) },
  blocks: { retrieve: jest.fn() },
  databases: { retrieve: jest.fn() },
}
jest.mock('@notionhq/client', () => {
  return { Client: jest.fn().mockImplementation(() => mockNotionClient) }
})

class FakeReceiver implements Receiver {
  private app: BoltApp | undefined

  public init(app: BoltApp): void {
    this.app = app
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public start = (...param: any[]): Promise<unknown> => Promise.resolve([...param])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public stop = (...param: any[]): Promise<unknown> => Promise.resolve([...param])

  public async send(body: StringIndexed): Promise<ReceiverEvent> {
    const event: ReceiverEvent = {
      body: { event: body },
      ack: jest.fn(),
    }
    await this.app?.processEvent(event)

    return event
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const logStacks: { type: string; msg: any }[] = []
class FakeConsoleLogger extends ConsoleLogger {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  debug(...msg: any[]) {
    logStacks.push({ type: LogLevel.DEBUG, msg })
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  info(...msg: any[]) {
    logStacks.push({ type: LogLevel.INFO, msg })
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  warn(...msg: any[]) {
    logStacks.push({ type: LogLevel.WARN, msg })
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error(...msg: any[]) {
    logStacks.push({ type: LogLevel.ERROR, msg })
  }
}

const auth = 'secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
const token = 'xoxp-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
const signingSecret = '0123456789abcdefghijklmnopqrstuvwxyz'

describe('App', () => {
  let receiver: FakeReceiver
  let app: BoltApp
  let mockedWebClient: WebClient

  beforeEach(() => {
    receiver = new FakeReceiver()

    const appOptions: AppOptions = { token, signingSecret, auth, receiver, developerMode: true }
    app = App({ appOptions } as Props)

    mockedWebClient = new WebClient(token)
    app.client = mockedWebClient
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(<any>app).logger = new FakeConsoleLogger()
  })

  test('should be response normally', async () => {
    await app.start()

    const text = 'https://www.notion.so/takoba/takoba-0044fa85dd0a45e9878be0cfca4b2349'
    const eventBody: GenericMessageEvent = {
      type: 'message',
      channel_type: 'channel',
      subtype: undefined,
      text,
      ts: '0000000000.000000',
      event_ts: '0000000000.000000',
      user: 'UUSERID',
      channel: 'CCHANNELID',
    }
    await receiver.send(eventBody as StringIndexed)
    console.debug(logStacks)

    const expected = {
      attachments: [
        {
          blocks: [
            { text: { text: `*<${text}|takoba>*`, type: 'mrkdwn' }, type: 'section' },
            { type: 'divider' },
            {
              elements: [{ text: `Posted by <https://github.com/takoba/notion-opener|notion-opener>`, type: 'mrkdwn' }],
              type: 'context',
            },
          ],
          fallback: `attachment failure. <${text}>`,
        },
      ],
      channel: eventBody.channel,
      thread_ts: undefined,
      token,
    }
    expect(mockWebClient.chat.postMessage).toHaveBeenCalledWith(expected)
  })
})
