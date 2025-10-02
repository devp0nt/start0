export default {
  '*.{js,mjs,ts,tsx}': ['bun run format:base', 'bun run lint:base --fix'],
  '*.{json,jsonc,md,mdx,yaml,yml,css,scss,less}': ['bun run format:base'],
}
