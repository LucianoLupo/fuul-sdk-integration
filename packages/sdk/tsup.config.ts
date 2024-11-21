import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  clean: true,
  external: ["react"],
  treeshake: true,
  sourcemap: true,
  splitting: false,
  outDir: "dist",
  // Important for React components
  loader: {
    ".tsx": "tsx",
  },
});
