import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs'],
  target: 'node20',
  sourcemap: true,
  clean: true,
  dts: false,
  minify: false,
  splitting: false,
  shims: true,
  noExternal: [/.*/],
})
