import { createErroryThings } from 'errory'

export const {
  toErrory,
  Errory,
  ErroryExpected,
  ErroryOccupied,
  ErroryUnexpected,
  ErroryAccessDenied,
  ErroryNotFound,
  ErroryUnactivated,
  ErroryUnauthorized,
} = createErroryThings({
  codesDefinition: {
    unauthorized: {
      expected: true,
      httpStatus: 'UNAUTHORIZED',
      message: 'Authorization required',
    },
    unactivated: {
      expected: true,
      httpStatus: 'FORBIDDEN',
      message: 'Please activate your account',
    },
    notFound: {
      expected: true,
      httpStatus: 'NOT_FOUND',
      message: 'Not found',
    },
    accessDenied: {
      expected: true,
      httpStatus: 'FORBIDDEN',
      message: 'Access denied',
    },
    occupied: {
      expected: true,
      httpStatus: 'FORBIDDEN',
      message: 'Already occupied',
    },
  },
})
