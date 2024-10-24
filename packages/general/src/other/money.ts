import { createMoneyThings } from 'svag-money'
import type { z } from 'zod'

export const { toMoney, zCurrency, zAmountIntegerWithDecimalsLimited, integerWithDecimalsToAmountString } =
  createMoneyThings({
    currencies: ['usd'],
    defaultSymbolPosition: 'before',
    defaultSymbolDelimiter: '',
  })
export type Currency = z.output<typeof zCurrency>
