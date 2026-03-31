# Pixel Desktop Pet World

`Pixel Desktop Pet World` is an Electron desktop pet app that places small pixel companions on your desktop overlay. You can add multiple pets, drag them around, switch their display, and let them show short encouraging slogans while they wander.

## Features

- desktop overlay pet scene
- up to 3 active pets at once
- draggable pets
- multi-display selection
- positive slogan toggle
- control panel for world settings and pet management
- pixel character roster with variants

## Available Characters

- Samoyed
- Fat Orange Cat
- Demon
- Holy Knight
- Dragon

Each character includes color variants and its own slogan pool.

## Tech Stack

- Electron
- HTML
- CSS
- JavaScript

## Project Structure

```text
main.js
preload.js
src/
  common/
  config/
  control/
  main/
  overlay/
```

## Run Locally

```bash
npm install
npm start
```

## How It Works

- `main.js` wires together the Electron app, overlay window, control panel window, tray, and IPC handlers.
- `src/overlay/` renders the desktop pet scene and drag interactions.
- `src/control/` contains the control panel UI for adding pets and changing world settings.
- `src/main/` manages pet state, movement, displays, tray behavior, and slogans.
- `src/config/` stores character definitions and slogan pools.

## Current Scope

This project is focused on a local desktop experience. It does not currently include:

- pet persistence between app restarts
- sound effects
- complex AI behaviors
- save/export settings

## Possible Improvements

- save pet state and positions
- add more animations and moods
- add sound or ambient effects
- support more interaction types like feeding or petting
- package the app for Windows distribution

## License

MIT

## Author

Created by Ives Tan Kian Hang.
