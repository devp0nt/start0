import { createEmailDefinition } from '@/backend/src/services/other/emails/index.js'

export const saleEmail = createEmailDefinition<{ product: string }>({
  name: 'sale',
  subject: 'Sale',
  template: ({ product }) => `Sale, ${product}!`,
  previewVariables: { product: 'product123' },
})
