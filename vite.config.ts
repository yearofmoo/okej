import { defineConfig } from "vite";

export default async () => {
  return await defineConfig({
    test: {
      watch: false,
    },
    resolve: {
      extensions: [".mjs", ".js", ".ts", ".json"],
    },
  });
};
