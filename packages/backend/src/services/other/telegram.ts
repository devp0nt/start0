import { getSomeEnv } from '@/backend/src/services/other/env.js'
import _ from 'lodash'
import { Telegraf } from 'telegraf'

const getTgDevBot = _.memoize(() => {
  const { TELEGRAM_BOT_DEV_TOKEN } = getSomeEnv(['TELEGRAM_BOT_DEV_TOKEN'])
  if (!TELEGRAM_BOT_DEV_TOKEN) {
    return { tgDevBot: null }
  }
  const tgDevBot = new Telegraf(TELEGRAM_BOT_DEV_TOKEN)
  return { tgDevBot }
})

export const sendMessageToAlertsChat = async (message: string) => {
  const { TELEGRAM_ALERTS_CHAT_ID } = getSomeEnv(['TELEGRAM_ALERTS_CHAT_ID'])
  if (!TELEGRAM_ALERTS_CHAT_ID) {
    return null
  }
  const { tgDevBot } = getTgDevBot()
  if (!tgDevBot) {
    return null
  }
  await tgDevBot.telegram.sendMessage(TELEGRAM_ALERTS_CHAT_ID, message, {
    parse_mode: 'HTML',
  })
  return null
}
