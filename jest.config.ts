import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  preset: "ts-jest",
  testEnvironment: "node",
  testPathIgnorePatterns: [".d.ts", ".js"],
  verbose: true,
  testTimeout: 30000,
};
export default config;
