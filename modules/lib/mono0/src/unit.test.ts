import { describe, expect, it } from 'bun:test'
import { Mono0Unit } from './unit'

describe('Mono0Unit', () => {
  describe('.parseMatchString', () => {
    it('simple', () => {
      expect(Mono0Unit.parseMatchString('test')).toEqual({ name: 'test', tagsInclude: [], tagsExclude: [] })
    })
    it('with tags', () => {
      expect(Mono0Unit.parseMatchString('#backend,#lib')).toEqual({
        name: undefined,
        tagsInclude: ['backend', 'lib'],
        tagsExclude: [],
      })
    })
    it('with tags exclude', () => {
      expect(Mono0Unit.parseMatchString('!#site')).toEqual({ name: undefined, tagsInclude: [], tagsExclude: ['site'] })
    })
  })
})
