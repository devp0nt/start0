// import { normalizeBankCard, normalizeEmail, normalizePhone, validateBankCardByLuhn, validatePhone } from 'svag-utils'
import { normalizeEmail, normalizePhone } from 'svag-utils'
import { z } from 'zod'

export const zStringRequired = z
  .string({
    message: 'Required',
    required_error: 'Required',
  })
  .min(1, 'Required')
// .max(3_000, 'Too long value')
export const zStringOptional = z
  .string()
  // .max(3_000, 'Too long value')
  .optional()
export const zStringOptionalNullable = zStringOptional.nullable()
export const zEmptyStringOrNull = z.union([z.literal(''), z.null(), z.undefined()])
export const zPasswordRequired = z
  .string({})
  .min(8, 'Password must be at least 8 characters')
  .max(1000, 'Password is too long')
  .regex(
    // should contain at least one digit
    /\d/,
    'Password must contain at least one digit'
  )
  .regex(
    // should contain at least one lowercase letter
    /[a-zа-я]/,
    'Password must contain at least one lowercase letter'
  )
  .regex(
    // should contain at least one uppercase letter
    /[A-ZА-Я]/,
    'Password must contain at least one uppercase letter'
  )
  .regex(
    // should contain at least one special character
    /[^a-zA-Zа-яА-Я\d]/,
    'Password must contain at least one special character'
  )
export const zEmailRequired = zStringRequired.email('Incorrect e-mail').transform((val) => normalizeEmail(val))
export const zEmailOptionalNullable = z.union([zEmptyStringOrNull, zEmailRequired]).transform((val) => val || null)
export const zUrlRequired = zStringRequired.url('Incorrect URL')
export const zPhoneRequired = zStringRequired
  .regex(
    // allow numbers, spaces, dashes, brackets, plus sign
    /^[\d\s-()+]+$/,
    'Invalid phone number'
  )
  .superRefine((val, ctx) => {
    const phone = val.replace(/\D/g, '')
    if (phone.startsWith('7') || phone.startsWith('8')) {
      if (phone.length !== 11) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Invalid phone number',
        })
      }
    } else {
      if (phone.length < 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Invalid phone number',
        })
      }
      // if (!validatePhone(phone)) {
      //   ctx.addIssue({
      //     code: z.ZodIssueCode.custom,
      //     message: 'Invalid phone number',
      //   })
      // }
    }
  })
  .transform((val) => normalizePhone(val))
export const zPhoneOptionalNullable = z.union([zEmptyStringOrNull, zPhoneRequired]).transform((val) => val || null)

export const zPasswordsMustBeTheSame =
  (passwordFieldName: string, passwordAgainFieldName: string) => (val: any, ctx: z.RefinementCtx) => {
    if (val[passwordFieldName] !== val[passwordAgainFieldName]) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Passwords must be the same',
        path: [passwordAgainFieldName],
      })
    }
  }
