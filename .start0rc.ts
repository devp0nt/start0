

export const Start0Config = {
  project: {
    name: "ideanick",
  },
  packages: {
    apps: {
      backend: {
        name: "backend",
        alias: "ba",
        dir: "./apps/backend",
      },
      site: {
        name: "site",
        alias: "si",
        dir: "./apps/site",
      }
    },
    modules: {
      dirGlob: "./modules/*",
    },
    tools: {
      name: "tools",
      alias: "to",
      dir: "./tools",
    },
  }
} satisfies Start0Config

type Start0Config = {
  project: {
    name: string
  }
  packages: {
    apps: {
      [key: string]: {
        name: string
        alias: string
        dir: string
      }
    }
    modules: {
      dirGlob: string
    }
    tools: {
      name: string
      alias: string
      dir: string
    }
  }
}