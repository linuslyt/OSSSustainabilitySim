# Frontend

@linuslyt

## Dev setup

1. From `frontend/`: run `npm install`
2. Set up Prettier in VSCode:

   a. Install official Prettier and ESLint VSCode extensions

   b. Append the following to the VSCode's `settings.json`:

   ```JSON
   "editor.formatOnSave": true,
   "files.autoSaveWhenNoErrors": true,
   "files.autoSaveWorkspaceFilesOnly": true,
   "eslint.validate": ["javascript", "javascriptreact", "typescript",   "typescriptreact"],
   "prettier.requireConfig": true,
   "editor.codeActionsOnSave": {
       "source.fixAll.eslint": "explicit",
       "source.organizeImports": "always",
       "source.fixAll": "explicit"
   },
   "[javascriptreact]": {
       "editor.defaultFormatter": "esbenp.prettier-vscode"
   },
   ```

   Files should now autoformat on save and before commits.

3. To start server, run `npm run dev`
