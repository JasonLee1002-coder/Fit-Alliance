/** Prepend basePath to public folder asset paths */
export const pub = (path: string) =>
  `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}${path}`
