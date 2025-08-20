import lodashOmit from "lodash/omit.js";

export const omit = <TObject extends Object, TKeys extends keyof TObject>(
  obj: TObject,
  keys: TKeys[]
): Omit<TObject, TKeys> => {
  return lodashOmit(obj, keys);
};

export const keys = <T extends string>(obj: Record<T, unknown>) => {
  return Object.keys(obj) as T[];
};

export const constKeys = <T extends string>(obj: Record<T, unknown>) => {
  const keys = Object.keys(obj) as T[];
  return keys as [T, ...T[]];
};
