const parsePageIdFromPathname = (pathname: string) =>
  pathname
    .replace(/^\/[0-9A-z\-_]+\//, '')
    .split('-')
    .splice(-1)[0]

export { parsePageIdFromPathname }
