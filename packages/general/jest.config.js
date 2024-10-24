import { pathsToModuleNameMapper } from 'ts-jest'
import { readFileSync } from 'fs'
const tsconfigData = JSON.parse(readFileSync('./tsconfig.json'))

/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  passWithNoTests: true,
  verbose: true,
  moduleNameMapper: pathsToModuleNameMapper(tsconfigData.compilerOptions.paths, {
    prefix: '<rootDir>/',
    useESM: true,
  }),
}
