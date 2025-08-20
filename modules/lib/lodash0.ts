export const keys = <T extends string>(obj: Record<T, unknown>) => {
  return Object.keys(obj) as T[];
};

export const constKeys = <T extends string>(obj: Record<T, unknown>) => {
  const keys = Object.keys(obj) as T[];
  return keys as [T, ...T[]];
};
