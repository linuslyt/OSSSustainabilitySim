# Frontend

## Dev setup

1. From `frontend/`: run `npm install`
2. (For devs only) Set up Prettier in VSCode:

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

3. To start frontend, run `npm run dev` and navigate to `localhost:5173`. Note that this port is mandatory due to the CORS policy set for the Django backend.

## Dashboard usage walkthrough


![Usage walkthrough video](https://github.com/user-attachments/assets/b6cf1151-023c-4fe8-a18e-5439b3fd02c3)

(For a full resolution walkthrough video, see `images/walkthrough.mov`.)

1. Select a project from the dropdown in the top left. You can type a project name and it will show you autocompleted matches.

2. View historical prediction values in the center forecast graph, plotted in orange. Mouse over individual markers to reveal a tooltip with the precise prediction value.

3. Create a change period using the dropdown selectors in the bottom left panel. This will populate the feature editor table.

4. Simulate changes to features for the selected month range as necessary.

   1. Action buttons allow resetting defined changes, copying a percentage change to all months in the selected change period, and inspecting the selected feature on the line graph on the bottom right.

   2. When a change is defined or updated, the bottom right graph will switch to the corresponding feature. In this graph, historical feature values are plotted in green, and changed (simulated) values are plotted in yellow.

5. Repeat Steps 3-4 for as many changes and/or change periods as necessary. The list of change periods will become scrollable if it is too long. To switch between change periods, click on the corresponding chip.

   1. To delete all changes for the selected period, click the `x` button on the selected change period.

6. Click the `SIMULATE` button to generate new sustainability predictions. These are the forecasts for the historical data modified by your defined changes.

   1. The simulated predictions will be plotted in blue on the center graph. Mouse over the markers for tooltips, as with the original markers.

   2. Click the reset icon to the right of the `SIMULATE` button to reset the center plot.
