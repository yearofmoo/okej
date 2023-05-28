import { resolve } from "path";
import { defineConfig } from "vite";

export default async () => {
  return await defineConfig({
    test: {
      watch: false,
    },
    resolve: {
      extensions: [".mjs", ".js", ".ts", ".json"],
    },
    build: {
      minify: false,
      lib: {
        name: "okej",
        formats: ["es", "cjs"],
        fileName: (format) => `index.${format == "es" ? "esm" : "cjs"}.js`,
        entry: resolve(__dirname, "./index.ts"),
      },
    },
  });
};
