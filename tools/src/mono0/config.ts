import { Fs0 } from "@ideanick/tools/fs0"
import z from "zod"

export class Mono0Config {
  fs0: Fs0
  projectName: string
  corePackagesDefinitions: Mono0Config.CorePackageDefinition[]
  modulesGlob: string

  private constructor(input: {
    fs0: Fs0
    projectName: string
    corePackagesDefinitions: Mono0Config.CorePackageDefinition[]
    modulesGlob: string
  }) {
    this.fs0 = input.fs0
    this.projectName = input.projectName
    this.corePackagesDefinitions = input.corePackagesDefinitions
    this.modulesGlob = input.modulesGlob
  }

  static async get({ cwd }: { cwd?: string } = {}) {
    const configFile = await Fs0.findUpFile(".mono0rc.json", { cwd })
    if (!configFile) {
      throw new Error("mono0rc.json not found")
    }

    const configDefinitionRaw = await configFile.importFresh()
    const configDefinitionParsed = Mono0Config.zDefinition.safeParse(configDefinitionRaw)
    if (!configDefinitionParsed.success) {
      throw new Error("Invalid .mono0rc.json", {
        cause: configDefinitionParsed.error,
      })
    }

    const configDefinition = configDefinitionParsed.data
    const input = {
      fs0: configFile.fs0,
      projectName: configDefinition.project.name,
      corePackagesDefinitions: Object.entries(configDefinition.packages.core).map(([name, { alias, path }]) => {
        return {
          name,
          alias,
          path: configFile.fs0.toAbs(path),
        }
      }),
      modulesGlob: configDefinition.packages.modules.glob,
    }
    return new Mono0Config(input)
  }

  static zDefinition = z.object({
    project: z.object({
      name: z.string(),
    }),
    packages: z.object({
      core: z.record(
        z.string(),
        z.object({
          alias: z.string(),
          path: z.string(),
        }),
      ),
      modules: z.object({
        glob: z.string(),
      }),
    }),
  })
}

export namespace Mono0Config {
  export type Definition = {
    project: {
      name: string
    }
    packages: {
      core: {
        [key: string]: {
          alias: string
          path: string
        }
      }
      modules: {
        glob: string
      }
    }
  }
  export type CorePackageDefinition = {
    name: string
    alias: string
    path: string
  }
}
