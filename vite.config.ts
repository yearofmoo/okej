import { resolve } from "path";
import { defineConfig } from "vite";

const PROD = process.env.PROD ? true : false;

export default async () => {
  return await defineConfig({
    test: {
      watch: false,
    },
    resolve: {
      extensions: [".mjs", ".js", ".ts", ".json"],
    },
    build: {
      minify: PROD,
      lib: {
        name: "okej",
        formats: ["es", "cjs"],
        fileName: (format) =>
          `${format == "es" ? "esm" : "cjs"}/index.${PROD ? "min." : ""}js`,
        entry: resolve(__dirname, "./index.ts"),
      },
    },
  });
};
