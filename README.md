# Synex

## About 

Deterministic Multiplayer Game Engine using ECS and Predictive Rollback with Visualisation Tools.

![Screenshot of Synex](https://orikaru.net/dl/synex-demo.png)

> A screenshot of one of the game made, with many debug UI enabled.

This project was made for the "Projet d'Approfondissement" at HES-SO in 2022. While it works well enough for simple games (even in multiplayer, under some conditions), the main goal of this project was always to showcase ECS and predictive rollback, rather than making a good game engine.

Sync + ECS = Synex

## Installation

- Ensure you have a recent version of NodeJS installed. Tested on `v16.9.1`
- Run `npm install`

## Running

- `npm start` will build the project (in watch mode, so you can live reload)
- The project will be served on http://localhost:43223/views
- `fullscreen` contains one fullscreen instance of the game, `general-demo` contains two instances of the game and debug tools

## Deployment notes

- The `dist` folder can be statically hosted on a web server
- If the `dist` folder is not hosted in the root path of the web server, adapt the src of scripts in the `index.html` of the view you are deploying

## Making a game

- In `games` create a folder for your game
- Define components which are the data of your game (Transform, Sprite, etc.)
- Define systems which define how the data is updated
- Create a `metadata.ts` which load your components and systems and defines player inputs.
- Update the engine instantiation `index.ts` in the view you want to use with the name of your game
- Check how `magnet-bros` works to know what to put in your files
- Good luck!

## Running the game in real multiplayer

- Run `npm install` in ws-server
- Run `npx ts-node main.ts` to run the server
- By default, a local network adapter is used by the engine. In `network.ts` replace `LocalAdapter` by `WSAdapter`

## Dev notes

- Action broadcast *must* only be done in reaction to a local unsync'd player input or it will not work as intended at all!
- Broadcasted action must also check that they can be performed or players will be able to easily cheat
- Infinity and NaN are not serializable! They should not be used in components.
