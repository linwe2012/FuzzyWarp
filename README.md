![IMG](https://img.shields.io/badge/React-js-61daf8?logo=react)
![IMG](https://img.shields.io/badge/Render%20Engine-Three.js-049EF4?labelColor=bbbbbb&logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAUhJREFUOI2V07tLHWEQBfDfVYkgllpYBG0Eq4AYrGKhdoKg1yZ9ihRi779gWovEJgQbxcdVEG18oCISEkKQICpCUEkTDAoSBcFXsXNxuVxhPbCcM8zOmflm96vEDjrQjd/455mYCK7HT+yhgKEsxRW4Dj2MT/iFPC5wiiV8xKunDGbxLZ4xVEeuHe/C6EPoQ8zhfdEgF3yEr6jEfzRgFIuYRx++4E/kL9CJ2qJBIcaGfdxhF8dowg3G4zgL6I1jrRcnmQxexRtMR/wSf/E93unH5zB7m95FHidojXg+eAWvPX6pQdyiRxkcYEqy1Bmsxfilhl3polxKz2Ig9DbqJP/FGRpxjxFslusuusNG8Ewqd4SWckVVKT2BK9SUTLcs2c15OYNcSbwV3V6gGZeSO3ItIwopvZ2loKokvgv+gbasXdMYkNzGzHgAnsxNPK0NfZMAAAAASUVORK5CYII=) 

![IMG](https://img.shields.io/badge/Typescript-tsx-222222?labelColor=007ACC&logo=typescript)  [![IMG](https://img.shields.io/badge/Youtube-Demo-222222?labelColor=ff0000&logo=youtube)](https://youtu.be/KCKw1l-7f_s) [![IMG](https://img.shields.io/badge/Play%20with-online%20Demo-222222?logo=github)](https://linwe2012.github.io/FuzzyWarp)

Implements Fuzzy Warp algorithm with Typescript + React.

This project is my 3rd course project for the course Computer Animations at ZJU. All projects are listed below:
- Lab 1: [Spline](https://github.com/linwe2012/Spline) 
- Lab 2: [Free form deformation](https://github.com/linwe2012/FreeFormDeformation)
- Lab 3: Fuzzy Shape warp (This project)

The original paper can be found on IEEE: [A fuzzy approach to digital image warping](https://ieeexplore.ieee.org/abstract/document/511850)

Or you can download the [pdf](docs/FuzzyApproach.pdf) from this repo directly.

**Try [Online Demo hosted on Github Pages](https://linwe2012.github.io/FuzzyWarp/)**

Video Demo (Click to see full video on Youtube):

[![Demo](https://j.gifs.com/4QBO57.gif)](https://youtu.be/KCKw1l-7f_s)


## Description


The project implements a fuzzy warp algorithm for animating transitions between 2 polygons.
The polygons can have a different number of vertices and do not have to be convex. The algorithm will find matching between vertices by building a 2D similarity matrix containing similarity measures for each pair of vertices from both polygons.
A monotonic path that has a max element sum is found via dynamic programming in the matrix. The path will give vertex correspondence for the polygon.
Each vertex with its neighboring vertices will form a triangle, providing the transform matrix from starting polygon to ending polygon.
The animation is done by interpolating translation and rotation decomposed from the transform matrix.
I used three.js for a 2D visualization because it provides a framework for playing animations.


This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app). You need to install [Node.js](https://nodejs.org/en/) & [Yarn](https://classic.yarnpkg.com/en/docs/install) to run it.

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
