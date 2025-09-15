import type { File0, Fs0 } from '@devp0nt/fs0'
import isEqual from 'lodash-es/isEqual.js'
import set from 'lodash-es/set.js'
import type { PackageJson as PackageJsonTypeFest } from 'type-fest'
import z from 'zod'
import type { Mono0Config } from './config'
import { Mono0Logger } from './logger'
import type { Mono0Unit } from './unit'
import { fixSlahes, omit } from './utils'

export class Mono0PackageJson {
  name?: string
  fs0: Fs0
  file0: File0
  config: Mono0Config
  settings: Mono0PackageJson.Settings
  value: Mono0PackageJson.ValueDefinition
  logger: Mono0Logger = Mono0Logger.create('packageJson')
  unit?: Mono0Unit

  private constructor({
    name,
    fs0,
    file0,
    config,
    settings,
    value,
    unit,
  }: {
    name?: string
    fs0: Fs0
    file0: File0
    config: Mono0Config
    settings: Mono0PackageJson.Settings
    value: Mono0PackageJson.ValueDefinition
    unit?: Mono0Unit
  }) {
    this.name = name
    this.fs0 = fs0
    this.file0 = file0
    this.config = config
    this.settings = settings
    this.value = value
    this.unit = unit
  }

  static create({
    name,
    definition,
    config,
    fs0,
    unit,
  }: {
    name?: string
    definition: Mono0PackageJson.DefinitionParsed
    config: Mono0Config
    fs0: Fs0
    unit?: Mono0Unit
  }) {
    const file0 = definition.path ? fs0.createFile0(definition.path) : fs0.createFile0('package.json')
    const value = definition.value
    return new Mono0PackageJson({
      name: name || definition.value.name,
      fs0,
      file0,
      config,
      settings: definition.settings,
      value,
      unit,
    })
  }

  async getCurrentValue() {
    if (!(await this.file0.isExists())) {
      return {} as Mono0PackageJson.Json
    }
    return await this.file0.readJson<Mono0PackageJson.Json>()
  }

  async getNewValue({ units }: { units: Mono0Unit[] }) {
    const currentValue = await this.getCurrentValue()
    const prevDeps = currentValue.dependencies || {}
    const prevDevDeps = currentValue.devDependencies || {}

    const mergedValue = Mono0PackageJson.mergeValue(currentValue, {
      name: this.name || currentValue.name,
      ...this.value,
    })

    if (this.settings.clearWorkspaces) {
      const pathToClear = this.settings.clearWorkspaces
      delete mergedValue[pathToClear]
    }

    if (this.settings.addWorkspaces) {
      const worksapcesPackages = units.map((unit) => this.file0.fs0.toRel(unit.packageJson.file0.path.dir))
      const pathToAdd = this.settings.addWorkspaces
      set(mergedValue, pathToAdd, worksapcesPackages)
    }

    if (this.settings.clearWorkspaceDeps) {
      currentValue.dependencies = Object.fromEntries(
        Object.entries(currentValue.dependencies || {}).filter(([key, value]) => value !== 'workspace:*'),
      )
    }

    const unit = this.unit

    if (this.settings.addWorkspaceDeps && unit?.deps.length) {
      if (!mergedValue.dependencies) {
        mergedValue.dependencies = {}
      }
      for (const dep of unit.deps) {
        mergedValue.dependencies[dep.unit.name] = 'workspace:*'
      }
    }

    const newDeps = mergedValue.dependencies
    const newDevDeps = mergedValue.devDependencies
    const depsChanged = !isEqual(prevDeps, newDeps) || !isEqual(prevDevDeps, newDevDeps)

    if (this.settings.clearExports) {
      mergedValue.exports = {}
    }

    const toExportsValue = (dir: string, basename: string, exts: string[]) => {
      exts = (exts.length ? exts : ['js']).map((ext) => ext.replace(/^\./, ''))
      if (exts.length === 1) {
        return fixSlahes(`${dir}/${basename}.${exts[0]}`)
      }
      return exts.map((ext) => fixSlahes(`${dir}/${basename}.${ext}`))
    }

    if (this.settings.addExportsFromDist && unit) {
      const addExportsFromDist = this.settings.addExportsFromDist
      const dirsPaths = unit.dirsPaths.map((dirPath) => ({
        relToPkg: this.file0.fs0.toRel(unit.getPathInDistByPathInSrc(dirPath), true),
        relToDist: unit.distFs0.toRel(unit.getPathInDistByPathInSrc(dirPath), true),
      }))
      const distPath = this.file0.fs0.toRel(unit.distFs0.cwd, true)
      const exports = {
        ...(unit.indexFile0 && addExportsFromDist.index
          ? {
              '.': {
                ...(addExportsFromDist.import
                  ? {
                      import: toExportsValue(distPath, unit.indexFile0.path.basename, addExportsFromDist.import),
                    }
                  : {}),
                ...(addExportsFromDist.types
                  ? {
                      types: toExportsValue(distPath, unit.indexFile0.path.basename, addExportsFromDist.types),
                    }
                  : {}),
                ...(addExportsFromDist.require
                  ? {
                      require: toExportsValue(distPath, unit.indexFile0.path.basename, addExportsFromDist.require),
                    }
                  : {}),
              },
            }
          : {}),
        ...(addExportsFromDist.dirs
          ? {
              ...Object.fromEntries(
                dirsPaths.map((dirPath) => [
                  fixSlahes(`${dirPath.relToDist}/*`),
                  {
                    ...(addExportsFromDist.import
                      ? {
                          import: toExportsValue(dirPath.relToPkg, '*', addExportsFromDist.import),
                        }
                      : {}),
                    ...(addExportsFromDist.types
                      ? {
                          types: toExportsValue(dirPath.relToPkg, '*', addExportsFromDist.types),
                        }
                      : {}),
                    ...(addExportsFromDist.require
                      ? {
                          require: toExportsValue(dirPath.relToPkg, '*', addExportsFromDist.require),
                        }
                      : {}),
                  },
                ]),
              ),
            }
          : {}),
      }
      mergedValue.exports = exports
    }

    if (this.settings.addExportsFromSrc && unit) {
      const addExportsFromSrc = this.settings.addExportsFromSrc
      const dirsPaths = unit.dirsPaths.map((dirPath) => ({
        relToPkg: this.file0.fs0.toRel(dirPath, true),
        relToSrc: unit.srcFs0.toRel(dirPath, true),
      }))
      const srcPath = this.file0.fs0.toRel(unit.srcFs0.cwd, true)
      const exports = {
        ...(unit.indexFile0 && addExportsFromSrc.index
          ? {
              '.': {
                ...(addExportsFromSrc.import
                  ? {
                      import: toExportsValue(srcPath, unit.indexFile0.path.basename, addExportsFromSrc.import),
                    }
                  : {}),
                ...(addExportsFromSrc.types
                  ? {
                      types: toExportsValue(srcPath, unit.indexFile0.path.basename, addExportsFromSrc.types),
                    }
                  : {}),
                ...(addExportsFromSrc.require
                  ? {
                      require: toExportsValue(srcPath, unit.indexFile0.path.basename, addExportsFromSrc.require),
                    }
                  : {}),
              },
            }
          : {}),
        ...(addExportsFromSrc.dirs
          ? {
              ...Object.fromEntries(
                dirsPaths.map((dirPath) => [
                  fixSlahes(`${dirPath.relToSrc}/*`),
                  {
                    ...(addExportsFromSrc.import
                      ? {
                          import: toExportsValue(dirPath.relToPkg, '*', addExportsFromSrc.import),
                        }
                      : {}),
                    ...(addExportsFromSrc.types
                      ? {
                          types: toExportsValue(dirPath.relToPkg, '*', addExportsFromSrc.types),
                        }
                      : {}),
                    ...(addExportsFromSrc.require
                      ? {
                          require: toExportsValue(dirPath.relToPkg, '*', addExportsFromSrc.require),
                        }
                      : {}),
                  },
                ]),
              ),
            }
          : {}),
      }
      mergedValue.exports = exports
    }

    const scriptsKeysToDelete = Object.entries(mergedValue.scripts || {})
      .filter(([key, value]) => value === null)
      .map(([key]) => key)
    for (const key of scriptsKeysToDelete) {
      delete mergedValue.scripts?.[key]
    }

    const valueChanged = !isEqual(currentValue, mergedValue)

    return { value: mergedValue, depsChanged, valueChanged }
  }

  async write({ units }: { units: Mono0Unit[] }) {
    const { value, depsChanged, valueChanged } = await this.getNewValue({ units })
    if (!valueChanged && !depsChanged) {
      return { depsChanged, valueChanged, value }
    }
    const sort = [
      'name',
      'version',
      'private',
      'description',
      'keywords',
      'license',
      'author',
      'contributors',
      'funding',
      'homepage',
      'repository',
      'bugs',
      'type',
      'sideEffects',
      'main',
      'module',
      'types',
      'typings',
      'exports',
      'files',
      'bin',
      'man',
      'directories',
      'scripts',
      'config',
      'dependencies',
      'peerDependencies',
      'peerDependenciesMeta',
      'optionalDependencies',
      'devDependencies',
      'bundleDependencies',
      'bundledDependencies',
      'engines',
      'engineStrict',
      'os',
      'cpu',
      'publishConfig',
      'overrides',
      'resolutions',
      'packageManager',
    ]
    await this.file0.writeJson(value, sort, true)
    return { depsChanged, valueChanged, value }
  }

  static mergeSettings(
    ...settings: [
      Mono0PackageJson.Settings | Mono0PackageJson.DefinitionSettings,
      ...Array<Mono0PackageJson.Settings | Mono0PackageJson.DefinitionSettings>,
    ]
  ): Mono0PackageJson.Settings {
    const filteredSettings = settings.filter(Boolean) as Array<
      Mono0PackageJson.Settings | NonNullable<Mono0PackageJson.DefinitionSettings>
    >
    return filteredSettings.reduce<Mono0PackageJson.Settings>((acc, setting) => {
      const parsedSetting = Mono0PackageJson.zDefinitionSettings.parse(setting)
      // biome-ignore lint/performance/noAccumulatingSpread: <x>
      return { ...acc, ...parsedSetting }
    }, {} as Mono0PackageJson.Settings)
  }

  static zDefinitionSettings = z
    .object({
      clearWorkspaces: z.union([z.boolean(), z.string()]).optional(),
      addWorkspaces: z.union([z.boolean(), z.string()]).optional(),
      clearWorkspaceDeps: z.boolean().optional(),
      addWorkspaceDeps: z.boolean().optional(),
      clearExports: z.boolean().optional(),
      addExportsFromDist: z
        .union([
          z.boolean(),
          z.object({
            index: z.boolean().default(true),
            dirs: z.boolean().default(true),
            import: z.union([z.boolean(), z.array(z.string())]).default(true),
            require: z.union([z.boolean(), z.array(z.string())]).default(false),
            types: z.union([z.boolean(), z.array(z.string())]).default(true),
          }),
        ])
        .optional(),
      addExportsFromSrc: z
        .union([
          z.boolean(),
          z.object({
            index: z.boolean().default(true),
            dirs: z.boolean().default(true),
            import: z.union([z.boolean(), z.array(z.string())]).default(true),
            require: z.union([z.boolean(), z.array(z.string())]).default(false),
            types: z.union([z.boolean(), z.array(z.string())]).default(true),
          }),
        ])
        .optional(),
    })
    .optional()
    .default({})
    .transform((val) => {
      return {
        ...omit(val, ['addExportsFromDist', 'addExportsFromSrc', 'clearWorkspaces', 'addWorkspaces']),
        ...(val.clearWorkspaces === undefined
          ? {}
          : {
              clearWorkspaces:
                val.clearWorkspaces === true
                  ? 'workspaces'
                  : val.clearWorkspaces === false
                    ? (false as const)
                    : val.clearWorkspaces,
            }),
        ...(val.addWorkspaces === undefined
          ? {}
          : {
              addWorkspaces:
                val.addWorkspaces === true
                  ? 'workspaces'
                  : val.addWorkspaces === false
                    ? (false as const)
                    : val.addWorkspaces,
            }),
        ...(val.addExportsFromDist === undefined
          ? {}
          : {
              addExportsFromDist:
                val.addExportsFromDist === false
                  ? (false as const)
                  : val.addExportsFromDist === true
                    ? { index: true, dirs: true, import: ['.js'], require: false as const, types: ['.d.ts'] }
                    : {
                        index: val.addExportsFromDist.index,
                        dirs: val.addExportsFromDist.dirs,
                        import: val.addExportsFromDist.import === true ? ['.js'] : val.addExportsFromDist.import,
                        require: val.addExportsFromDist.require === true ? ['.js'] : val.addExportsFromDist.require,
                        types: val.addExportsFromDist.types === true ? ['.d.ts'] : val.addExportsFromDist.types,
                      },
            }),
        ...(val.addExportsFromSrc === undefined
          ? {}
          : {
              addExportsFromSrc:
                val.addExportsFromSrc === false
                  ? (false as const)
                  : val.addExportsFromSrc === true
                    ? { index: true, dirs: true, import: ['.js'], require: false as const, types: ['.d.ts'] }
                    : {
                        index: val.addExportsFromSrc.index,
                        dirs: val.addExportsFromSrc.dirs,
                        import: val.addExportsFromSrc.import === true ? ['.js'] : val.addExportsFromSrc.import,
                        require: val.addExportsFromSrc.require === true ? ['.cjs'] : val.addExportsFromSrc.require,
                        types: val.addExportsFromSrc.types === true ? ['.d.ts'] : val.addExportsFromSrc.types,
                      },
            }),
      }
    })

  static zValueDefinition = z.looseObject({
    name: z.string().optional(),
    dependencies: z.record(z.string(), z.string().optional()).optional(),
    devDependencies: z.record(z.string(), z.string().optional()).optional(),
    exports: z
      .record(
        z.string(),
        z.record(z.string(), z.union([z.string(), z.record(z.string(), z.string()), z.array(z.string())])).optional(),
      )
      .optional(),
    scripts: z.record(z.string(), z.string().nullable()).optional(),
  })

  static zFullDefinition = z.object({
    path: z.string().optional(),
    value: Mono0PackageJson.zValueDefinition.optional().default({}),
    settings: Mono0PackageJson.zDefinitionSettings,
  })

  static zDefinition = z.union([Mono0PackageJson.zValueDefinition, Mono0PackageJson.zFullDefinition]).transform(
    (val) =>
      ('path' in val || 'value' in val
        ? {
            path: val.path,
            value: val.value,
            settings: Mono0PackageJson.zDefinitionSettings.parse(val.settings) || {},
          }
        : { path: undefined, value: val, settings: {} }) as Mono0PackageJson.FullDefinitionParsed,
  )

  static definitionDefault = {
    path: 'package.json',
    value: {},
    settings: {},
  } satisfies Mono0PackageJson.FullDefinition

  static mergeDefinitions(
    ...packageJsonsDefinitions: [
      Mono0PackageJson.Definition | undefined,
      ...Array<Mono0PackageJson.Definition | undefined>,
    ]
  ): Mono0PackageJson.FullDefinitionParsed {
    const packageJsonsDefinitionsFiltered = packageJsonsDefinitions.filter(Boolean) as Array<
      NonNullable<Mono0PackageJson.Definition>
    >
    return packageJsonsDefinitionsFiltered.reduce<Mono0PackageJson.FullDefinitionParsed>(
      (acc, packageJsonDefinition) => {
        const parsedPackageJsonDefinition = Mono0PackageJson.zDefinition.parse(packageJsonDefinition)
        return {
          path: parsedPackageJsonDefinition.path ?? acc.path,
          settings: Mono0PackageJson.mergeSettings(parsedPackageJsonDefinition.settings, acc.settings),
          value: Mono0PackageJson.mergeValue(parsedPackageJsonDefinition.value, acc.value),
        }
      },
      {} as Mono0PackageJson.FullDefinitionParsed,
    )
  }

  static mergeValue(
    ...packageJsonsValues: [
      Mono0PackageJson.Json | Mono0PackageJson.ValueDefinition | undefined,
      ...Array<Mono0PackageJson.Json | Mono0PackageJson.ValueDefinition | undefined>,
    ]
  ): Mono0PackageJson.ValueDefinition {
    const packageJsonsValuesFiltered = packageJsonsValues.filter(Boolean) as Array<
      NonNullable<Mono0PackageJson.Json | Mono0PackageJson.ValueDefinition>
    >
    return packageJsonsValuesFiltered.reduce((acc, packageJsonValue) => {
      return {
        // biome-ignore lint/performance/noAccumulatingSpread: <oh...>
        ...acc,
        ...packageJsonValue,
        ...(acc.dependencies || packageJsonValue.dependencies
          ? { dependencies: { ...acc.dependencies, ...packageJsonValue.dependencies } }
          : {}),
        ...(acc.devDependencies || packageJsonValue.devDependencies
          ? { devDependencies: { ...acc.devDependencies, ...packageJsonValue.devDependencies } }
          : {}),
        ...(acc.scripts || packageJsonValue.scripts
          ? { scripts: { ...acc.scripts, ...packageJsonValue.scripts } }
          : {}),
      }
    }, {} as any)
  }

  async getMeta({ units }: { units: Mono0Unit[] }) {
    return {
      path: this.file0.path.rel,
      value: (await this.getNewValue({ units })).value,
    }
  }
}

export namespace Mono0PackageJson {
  export type Json = PackageJsonTypeFest
  export type ValueDefinition = z.output<typeof Mono0PackageJson.zValueDefinition>
  // export type ValueDefinition = Json
  export type DefinitionSettings = Partial<z.input<typeof Mono0PackageJson.zDefinitionSettings>>
  export type Settings = z.output<typeof Mono0PackageJson.zDefinitionSettings>
  export type FullDefinition = {
    path: string
    value: Mono0PackageJson.ValueDefinition
    settings: Mono0PackageJson.DefinitionSettings
  }
  export type FullDefinitionParsed = z.output<typeof Mono0PackageJson.zFullDefinition>
  export type Definition = ValueDefinition | Partial<FullDefinition>
  export type DefinitionParsed = z.output<typeof Mono0PackageJson.zDefinition>
}
