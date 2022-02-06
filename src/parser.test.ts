import { parseIdsFromNotionUrl, parsePageIdFromPathname } from './parser'

describe('parsePageIdFromPathname', () => {
  test.each`
    pathname
    ${'0123456789abcdef0123456789abcdef'}
    ${'page-0123456789abcdef0123456789abcdef'}
    ${'a-some-page-0123456789abcdef0123456789abcdef'}
    ${'a_some_page-0123456789abcdef0123456789abcdef'}
  `('should parse page_id with "$pathname"', ({ pathname }) => {
    const actual = parsePageIdFromPathname(pathname)
    expect('0123456789abcdef0123456789abcdef').toEqual(actual)
  })
})

describe('parseIdsFromNotionUrl', () => {
  test.each`
    url                                                                                                                                       | page_id                               | block_id
    ${'https://www.notion.so/someproject/0123456789abcdef0123456789abcdef'}                                                                   | ${'0123456789abcdef0123456789abcdef'} | ${null}
    ${'https://www.notion.so/someproject/page-0123456789abcdef0123456789abcdef'}                                                              | ${'0123456789abcdef0123456789abcdef'} | ${null}
    ${'https://www.notion.so/someproject/a-some-page-0123456789abcdef0123456789abcdef'}                                                       | ${'0123456789abcdef0123456789abcdef'} | ${null}
    ${'https://www.notion.so/someproject/a_some_page-0123456789abcdef0123456789abcdef'}                                                       | ${'0123456789abcdef0123456789abcdef'} | ${null}
    ${'https://notion.so/someproject/0123456789abcdef0123456789abcdef'}                                                                       | ${'0123456789abcdef0123456789abcdef'} | ${null}
    ${'https://notion.so/someproject/0123456789abcdef0123456789abcdef?v=01234567890123456789abcdefabcdef'}                                    | ${'0123456789abcdef0123456789abcdef'} | ${null}
    ${'https://notion.so/someproject/0123456789abcdef0123456789abcdef?v=01234567890123456789abcdefabcdef&p=01234567890123456789012345678901'} | ${'01234567890123456789012345678901'} | ${null}
    ${'https://notion.so/someproject/0123456789abcdef0123456789abcdef#00112233445566778899aabbccddeeff'}                                      | ${'0123456789abcdef0123456789abcdef'} | ${'00112233445566778899aabbccddeeff'}
  `('should parse page_id with $url', ({ url, page_id, block_id }) => {
    const actual = parseIdsFromNotionUrl(url)
    expect(page_id).toEqual(actual.page_id)
    expect(block_id).toEqual(actual.block_id)
  })
})
