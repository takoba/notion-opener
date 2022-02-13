import { App as BoltApp, LogLevel, Receiver, ReceiverEvent, GenericMessageEvent } from '@slack/bolt'
import { StringIndexed } from '@slack/bolt/dist/types/helpers'
import { ConsoleLogger } from '@slack/logger'
import { WebClient } from '@slack/web-api'
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
  pages: { retrieve: jest.fn() },
  blocks: { retrieve: jest.fn() },
  databases: { retrieve: jest.fn() },
}
jest.mock('@notionhq/client', () => {
  return { Client: jest.fn().mockImplementation(() => mockNotionClient)}
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

  beforeAll(() => {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    // ;(<any>Client).request = jest.fn().mockImplementation(() => {
    //   const res = {}
    //   return Promise.resolve(res)
    // })
    // ;(<any>Client).pages = { retrieve: jest.fn() }
    // ;(<any>Client).blocks = { retrieve: jest.fn() }
    // ;(<any>Client).databases = { retrieve: jest.fn() }
    /* eslint-enable @typescript-eslint/no-explicit-any */
  })

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

    expect(mockWebClient.chat.postMessage).toHaveBeenCalledWith(expect.objectContaining({ text }))
  })
})
