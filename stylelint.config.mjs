export default {
  ignoreFiles: ["**/node_modules/**", "**/dist/**", "**/coverage/**"],
  rules: {
    "custom-property-pattern": "^(?:vf|udg)-[a-z0-9]+(?:-[a-z0-9]+)*$",
    "selector-class-pattern": [
      "^(?:vf(?:-(?:docs|playground|fixture|consumer))?|udg)(?:-[a-z0-9]+)*(?:__[a-z0-9]+(?:-[a-z0-9]+)*)?(?:--[a-z0-9]+(?:-[a-z0-9]+)*)?$",
      {
        message: "CSS classes must use an approved VyrnForge prefix: vf-, vf-docs-, vf-playground-, vf-fixture-, vf-consumer-, or udg-."
      }
    ],
    "declaration-block-no-duplicate-properties": true,
    "property-no-unknown": [true, { ignoreProperties: ["/^--/"] }]
  }
};
