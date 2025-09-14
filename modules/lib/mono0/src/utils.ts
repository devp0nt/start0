import lodashOmit from "lodash-es/omit.js"

export const omit = <TObject extends Record<string, unknown>, TKeys extends keyof TObject>(
  obj: TObject,
  keys: TKeys[],
): Omit<TObject, TKeys> => {
  return lodashOmit(obj, keys)
}
