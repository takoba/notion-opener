import { parsePageIdFromPathname } from './parser'

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
