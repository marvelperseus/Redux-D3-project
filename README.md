
## Prerequisites

You will need [NodeJS](https://nodejs.org/en/) and [Yarn (JS)](https://yarnpkg.com/en/) installed on your machine to build

## Setup

First install all the modules required by package.json

`yarn install`

## Dev Environment

`yarn start`

This will open port 3000 and your default browser. Changes made in code will auto-update in the browser as you work

`yarn test` and `yarn test:watch`

Both will run the [Enzyme](https://airbnb.io/enzyme/) unit tests via [Jest](https://jestjs.io/). With the watch option, it will re-run the tests anytime the code changes.

## Build 

`yarn build`

This creates a minified version of the app

`yarn installer`

Using the output of `yarn build`, this will assemble the stand-alone electron app based on your machine's OS in a folder under `release-builds` named `belmont-graphview-[ARCH]`, where [ARCH] is your machine's OS (darwin-x64 for MacOS, for example).

Note: you might want to also install [electron-packager](https://www.christianengvall.se/electron-packager-tutorial/) as a global module too.

## Application Layout

* `app` ReactJS code, the entry point being `app/index.js`
* `app/actions` actions used with Redux
* `app/api` axios AJAX calls (used to load JSON files like the color map)
* `app/Components` React JSX components
* `app/css` home of CSS and SASS files
* `app/d3` all the D3 classes
* `app/reducers` Redux code for AJAX processing
* `app/saga` Redux/Saga middleware for AJAX processing
* `app/utils` utilities to help process data
* `public` the main index.html
* `public/data` data files used by the application
* `webpack` the webpack config executed via the commands in package.json
* `etc` misc reference assets
* `test` unit test folder
* `test/enzyme` [Enzyme](https://airbnb.io/enzyme/) unit tests
* `enzymeconfig.js` Config file for the Enzyme tests
* `electronApp/main.js` ElectronJS installer configuration
* `.vscode` if using Microsoft [Visual Studio Code](https://code.visualstudio.com) (which is awesome) this will set preferences
* `.eslintrc` JavaScript formatting preferences, enforced during builds
* `package.json` Used by yarn (or npm) to assemble the node_modules directory and execute commands



