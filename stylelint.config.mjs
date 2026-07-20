export default {
  ignoreFiles: ["**/node_modules/**", "**/dist/**", "**/coverage/**"],
  rules: {
    "custom-property-pattern": "^(?:vf|udg)-[a-z0-9]+(?:-[a-z0-9]+)*$",
    "declaration-block-no-duplicate-properties": true,
    "property-no-unknown": [true, { ignoreProperties: ["/^--/"] }]
  }
};
