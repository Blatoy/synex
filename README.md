# Deterministic Multiplayer Game Engine using ECS and Predictive Rollback with Visualisation Tools

## About

Made for the PA project at HES-SO. 2022

## Setup

`npm install`


## Running

Build in watch mode and run with `npm start`. Everything required should be hosted on localhost:8080


## Deployment notes

If the `dist` folder is not hosted as the root path, adapt the src of scripts in the `index.html` of the view you are deploying.


## Dev notes

- Action broadcast *must* only be done in reaction to a local unsync'd player input or it will not work as intended at all!
- Broadcasted action must also check that they can be performed or players will be able to easily cheat
- Infinity and NaN are not serializable! They should not be used in components.