import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { type GeneratorOptions, generatorHandler } from '@prisma/generator-helper'
import { isMatch, lowerFirst } from 'lodash'

const __dirname = path.dirname(new URL(import.meta.url).pathname)

generatorHandler({
  onManifest: (props) => ({
    defaultOutput: getDefaultOutputDir(),
    prettyName: 'Prisma0 Generator',
  }),
  onGenerate: async (options) => {
    const modelsOutputParts: string[] = []

    const modelsNames = options.dmmf.datamodel.models.map((m) => m.name)
    const modelsNamesTs = `export const names = ["${modelsNames.join('", "')}"];`
    modelsOutputParts.push(modelsNamesTs)

    const modelsIdsKeys = options.dmmf.datamodel.models.map((m) => `${lowerFirst(m.name)}Id`)
    const modelsIdsKeysTs = `export const idsKeys = ["${modelsIdsKeys.join('", "')}"];`
    modelsOutputParts.push(modelsIdsKeysTs)

    const modelsNamesWithCreatedAtNow = options.dmmf.datamodel.models
      .filter((m) => {
        const createdAtField = m.fields.find((f) => f.name === 'createdAt')
        if (!createdAtField) return false
        return isMatch(createdAtField, {
          type: 'DateTime',
          default: {
            name: 'now',
            args: [],
          },
        })
      })
      .map((m) => m.name)
    const modelsNamesWithCreatedAtNowTs = `export const namesWithCreatedAt = ["${modelsNamesWithCreatedAtNow.join('", "')}"];`
    modelsOutputParts.push(modelsNamesWithCreatedAtNowTs)

    const modelsNamesWithUpdatedAt = options.dmmf.datamodel.models
      .filter((m) => {
        const updatedAtField = m.fields.find((f) => f.name === 'updatedAt')
        if (!updatedAtField) return false
        return isMatch(updatedAtField, {
          type: 'DateTime',
          isUpdatedAt: true,
        })
      })
      .map((m) => m.name)
    const modelsNamesWithUpdatedAtTs = `export const namesWithUpdatedAt = ["${modelsNamesWithUpdatedAt.join('", "')}"];`
    modelsOutputParts.push(modelsNamesWithUpdatedAtTs)

    writeOutputContent(options, [['models.ts', withExportNamespace('Prisma0Models', modelsOutputParts)]])
  },
})

const getDefaultOutputDir = () => {
  return path.resolve(__dirname, 'generated/prisma0')
}

const withExportNamespace = (namespace: string, lines: string[]) => {
  return [`export namespace ${namespace} {`, ...lines.map((line) => `  ${line}`), `}`].join('\n')
}

const writeOutputContent = (options: GeneratorOptions, input: Array<[string, string]>) => {
  const outputDir = options.generator.output?.value || getDefaultOutputDir()
  mkdirSync(outputDir, { recursive: true })
  for (const [filename, content] of input) {
    const outputPath = path.resolve(outputDir, filename)
    writeFileSync(outputPath, content)
  }
}
