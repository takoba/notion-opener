import { URL } from 'url'

const parsePageIdFromPathname = (pathname: string) =>
  pathname
    .replace(/^\/[0-9A-z\-_]+\//, '')
    .split('-')
    .splice(-1)[0]

const parseIdsFromNotionUrl = (url: string) => {
  const parsedUrl = new URL(url)

  const page_id: string =
    parsedUrl.searchParams.get('p') !== null
      ? parsedUrl.searchParams.get('p') ?? parsePageIdFromPathname(parsedUrl.pathname)
      : parsePageIdFromPathname(parsedUrl.pathname)
  const block_id = parsedUrl.hash.slice(1) || null

  return { page_id, block_id }
}

export { parsePageIdFromPathname, parseIdsFromNotionUrl }
