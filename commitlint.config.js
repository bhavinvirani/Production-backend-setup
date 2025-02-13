module.exports = {
  extends: ["@commitlint/config-conventional", "@commitlint/cli"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "docs",
        "style",
        "refactor",
        "test",
        "chore",
        "revert",
        "ci",
        "build",
      ],
    ],
    "subject-case": [2, "always", ["sentence-case"]],
  },
};
