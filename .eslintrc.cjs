module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "import"],
  extends: ["eslint:recommended","plugin:@typescript-eslint/recommended","plugin:import/recommended","plugin:import/typescript","prettier"],
  rules: { "import/order": ["error", { "newlines-between": "always" }] },
  settings: {
    "import/resolver": {
      typescript: {
        project: ["./tsconfig.base.json"],
      },
    },
  },
  ignorePatterns: ["dist", "node_modules"]
};
