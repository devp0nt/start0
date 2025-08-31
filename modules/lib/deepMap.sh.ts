import cloneDeep from "lodash/cloneDeep.js"
import isArray from "lodash/isArray.js"
import isObject from "lodash/isObject.js"

// TODO: add path array
// TODO: add path array

type ReplaceFn = ({ path, key, value }: { path: string; key: string; value: Value }) => Value
type Value = Object | number | string | boolean | null | undefined | Function | Symbol | any[]

const recursion = ({
  input,
  replaceFn,
  seens,
  pathStartsWith,
  parentKey,
}: {
  input: Value
  replaceFn: ReplaceFn
  seens: Array<WeakSet<any>>
  pathStartsWith: string
  parentKey: string
}): Value => {
  if (["object", "function", "symbol"].includes(typeof input) && input !== null && seens.length) {
    if (seens.every((seen) => seen.has(input))) {
      return "!!!CIRCULAR!!!"
    } else {
      seens.find((seen) => !seen.has(input))?.add(input)
    }
  }
  const result = replaceFn({
    path: pathStartsWith.replace(/\.$/, ""),
    key: parentKey,
    value: input,
  })
  if (!result) {
    return result
  }
  if (isArray(result)) {
    return result.map((item, index) =>
      recursion({
        input: item,
        replaceFn,
        seens,
        pathStartsWith: `${pathStartsWith}${index}.`,
        parentKey: index.toString(),
      }),
    )
  }
  if (isObject(result)) {
    const object: any = {}
    for (const [key, value] of Object.entries(result)) {
      object[key] = recursion({
        input: value,
        replaceFn,
        seens,
        pathStartsWith: `${pathStartsWith}${key}.`,
        parentKey: key,
      })
    }
    return object
  }
  return result
}

export const deepMap = <T = Value>(
  input: Value,
  replaceFn: ReplaceFn,
  {
    clone = true,
    maxSeenCount = 3,
  }: {
    clone?: boolean
    maxSeenCount?: number
  } = {},
): T => {
  // const seens = [new WeakSet(), new WeakSet(), new WeakSet()]
  const seens = Array.from({ length: maxSeenCount }, () => new WeakSet())
  const clonedInput = clone ? cloneDeep(input) : input
  const mappedObject = recursion({
    input: clonedInput,
    replaceFn,
    seens,
    pathStartsWith: "",
    parentKey: "",
  })
  return mappedObject as T
}
