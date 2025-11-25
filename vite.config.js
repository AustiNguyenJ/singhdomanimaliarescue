/// <reference types="vitest" />
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    coverage: {
      provider: "v8", // can also use "istanbul"
      reporter: ["text", "html"],
      reportsDirectory: "./coverage",
      include: ["src/firebase/**"], // adjust to your code location
      exclude: ["**/__mocks__/**", "**/tests/**"]
    },
  },
});
