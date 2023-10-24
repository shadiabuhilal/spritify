# spritify

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
![Build Status](https://github.com/shadiabuhilal/spritify/actions/workflows/push-workflows.yml/badge.svg)

<img align="right" src="https://gist.githubusercontent.com/shadiabuhilal/0b78455279255437c25ff497592b935e/raw/a532a1724f5d7f21cee5067fff54bffb43338fbe/spritify-logo.png" alt="spritify" style="height: 50px;"/>

SPRITIFY is a node.js package to create [image sprite(s)][image-sprite] from images and update css file(s) with new image sprite(s) details.
<br /><br />
<img src="https://gist.githubusercontent.com/shadiabuhilal/0b78455279255437c25ff497592b935e/raw/0aaede65d739649a3f96a2a198b437eabd2f2d26/icon-home.png" style="height: 35px;" /> <img src="https://gist.github.com/shadiabuhilal/0b78455279255437c25ff497592b935e/raw/9b3b0e9ded7f18e5fa24cc4d66c6348907e1e575/plus.png" style="height: 35px;"> <img src="https://gist.github.com/shadiabuhilal/0b78455279255437c25ff497592b935e/raw/0aaede65d739649a3f96a2a198b437eabd2f2d26/icon-info.jpg" style="height: 35px;" /> <img src="https://gist.github.com/shadiabuhilal/0b78455279255437c25ff497592b935e/raw/9b3b0e9ded7f18e5fa24cc4d66c6348907e1e575/plus.png" style="height: 35px;"> <img src="https://gist.github.com/shadiabuhilal/0b78455279255437c25ff497592b935e/raw/352bb8ce1737b212e520470cb9d51641d84342df/icon-settings.png" style="height: 35px;" /> 
<img src="https://gist.github.com/shadiabuhilal/0b78455279255437c25ff497592b935e/raw/9b3b0e9ded7f18e5fa24cc4d66c6348907e1e575/equal.png" style="height: 35px;"> <img src="https://gist.github.com/shadiabuhilal/0b78455279255437c25ff497592b935e/raw/352bb8ce1737b212e520470cb9d51641d84342df/sprite-image.png" style="height: 35px;" />
<br />


## Features:
- Create image sprite(s), and search for `background`, `background-image` css properties in the css file, and update the value with the new sprite image url and dimension by adding/overwrite css properties like 
`background-size`, `background-position`, `width` ...etc.

- Option to optimize sprite css by comine class names to one `background-image` css property.

- Supports SVG sprites.

- Supports Retina sprites.

- Can inline sprites using base64 encoding.

- Can check for unused images in the sprite(s).

- Can check for missing images, by searching for image path in the `background`, `background-image` css properties and can't find the image.

- Can be used in [grunt][grunt], [gulp][gulp] or any build tool.

<img src="https://gist.github.com/shadiabuhilal/0b78455279255437c25ff497592b935e/raw/aade12e88b67a1b8a0538fab0141be5c0b5ee7c8/spritify-console-log.png?n=1" alt="spritify console log" />


## Demo
Clone or download [Spritify example][spritify-example-url] repo and run it.

## Install
```bash
npm install spritify --save-dev
```
OR
```bash
npm install -g spritify
```

### CLI
```bash
Usage:
  spritify [OPTIONS] [ARGS]


Options:
  -h, --help : Help
  -v, --version : Version
  -c CONFIG, --config=CONFIG : JSON Config file path (It should be relative path)
  -s SRC, --src=SRC : Source directory of the images for the sprite image (It should be relative path).
  -d DEST, --dest=DEST : Destination file path of the sprite image (It should be relative path).
  -l LAYOUT, --layout=LAYOUT : layout of the sprite image e.g: 'top-down', 'left-right'.
  -p PADDING, --padding=PADDING : Padding pixels around the sprite image. e.g: 10.
  -svg, --svg : Flag to build svg sprite image
```

### CLI usage example
```bash
./node_modules/.bin/spritify -c CONFIG/FILE/PATH.json
```
OR create only image sprite
```bash
./node_modules/.bin/spritify -s SOURCE/DIRECTORY/PATH/ -d DESTINATION/FILE/PATH.png -p 15 -l left-right
```
OR create only svg image sprite
```bash
./node_modules/.bin/spritify -s SOURCE/DIRECTORY/PATH/ -d DESTINATION/FILE/PATH.svg -svg
```

### CLI config file schema example
```JSON
{
    "css": [
        {
            "src": "__tests__/fixtures/css/style-a.css",
            "dest": "build/css/style-a.css"
        },
        {
            "optimize": false,
            "inline": true,
            "src": "__tests__/fixtures/css/style-inline.css",
            "dest": "build/css/style-inline.css"
        },
        {
            "optimize": false,
            "src": "__tests__/fixtures/css/style-svg-a.css",
            "dest": "build/css/style-svg-a.css"
        }
    ],
    "sprites": [
        {
            "layout": "top-down",
            "src": [
                "public/images/common",
                "public/images/other-icons"
            ],
            "dest": "build/img/sprite-site.png",
            "relative": "../img"
        },
        {
            "padding": 10,
            "layout": "top-down",
            "src": "__tests__/fixtures/img/icons",
            "dest": "build/images/sprite.png",
            "relative": "../images"
        },
        {
            "retina": 2,
            "src": "__tests__/fixtures/img/icons@2x",
            "dest": "build/images/sprite@2x.png",
            "relative": "../images"
        },
        {
            "svg": true,
            "src": "__tests__/fixtures/img/svg",
            "dest": "build/images/sprite-svg.svg",
            "relative": "../images"
        }
    ]
}
```

## Programatic usage
```js
const Spritify = require('spritify');
Spritify.build(params, callback);
```

### Programatic usage example
```js
/* 
    File: ./bin/run-spritify.js
    Run: node ./bin/run-spritify.js
*/
const Spritify = require('spritify');

const params = {
    debug: true,
    showIgnoredRules: true,
    css: [
        {
            optimize: false,
            inline: true,
            src: 'public/stylesheets/site.css',
            dest: 'build/css/site.css'
        },
        {
            src: 'build/css/theme.css',
            dest: 'build/css/theme.css'
        }
    ],
    sprites: [
        {
            layout: 'top-down',
            src: [
                'public/images/common',
                'public/images/other-icons'
            ],
            dest: 'build/img/sprite-site.png',
            relative: '../img'
        },
        {
            layout: 'top-down',
            src: 'public/images/icons',
            dest: 'build/img/sprite.png',
            relative: '../img'
        },
        {
            padding: 15,
            retina: 2,
            layout: 'left-right',
            src: 'public/img/icons@2x',
            dest: 'build/img/sprite@2x.png',
            relative: '../img'
        },
        {
            svg: true,
            src: 'public/img/svg',
            dest: 'build/img/svg-sprite.svg',
            relative: '../img'
        }
    ]
};

Spritify.build(params, (err) => {

    if (err) {
        console.error(err.stack || err);
        return;
    }
});

```

## Spritify CSS Directives
| NAME     | Syntax                   | Description                                             |
|----------|--------------------------|---------------------------------------------------------|
| Ignore   | `/* spritify: ignore */` | Ignore statement, to ignore css rule or css declaration |


## Documentation

### Spritify.build(params, callback)
Generates sprite(s) based on the provided images, and search for `background`, `background-image` css properties in the css files based on the provided css, and it will update the value(s) with the new sprite image(s) and dimensions by adding/overwrite 
`background-size`, `background-position`, `width` ...etc.


__params `Object`:__

| NAME               | TYPE                 | DEFAULT | REQUIRED | DESCRIPTION                       |
|--------------------|----------------------|---------|----------|-----------------------------------|
| `css`              | `Array` of [`Objects`](#css-obj) |         |    YES   | Array of spritify css object.     |
| `sprites`          | `Array` of [`Objects`](#sprites-obj) |         |    YES   | Array of spritify sprites object. |
| `debug`            | `Boolean`            | `false` |    NO    | Option to show debug info.        |
| `showIgnoredRules` | `Boolean`            | `false` |    NO    | Option to show ignored css rules. |


__callback `Function`:__

> Is a callback function which should have signature `function (err)`, `err` is `Error`|`null`.




__<a name="css-obj"></a>css object:__

| NAME        | TYPE          | DEFAULT | REQUIRED | DESCRIPTION                                                                                 |
|-------------|---------------|---------|----------|---------------------------------------------------------------------------------------------|
| `src`       | `String`      |         |    YES   | Source path of the css file.                                                                |
| `dest`      | `String`      |         |    YES   | Destination path of the css file.                                                           |
| `optimize`  | `Boolean`     | `true`  |    NO    | Option to optimize sprite css by comine class names to one `background-image` css property. |
| `inline`    | `Boolean`     | `false` |    NO    | Option inline sprites using base64 encoded.                                                 |


__<a name="sprites-obj"></a>sprites object:__

| NAME        | TYPE                                  | DEFAULT       | REQUIRED | DESCRIPTION                                                                                 |
|-------------|---------------------------------------|---------------|----------|---------------------------------------------------------------------------------------------|
| `src`       | `String` Or `Array` of `Strings`      |               |    YES   | Source directory path(s) of the images.                                                     |
| `dest`      | `String`                              |               |    YES   | Destination path of the sprite file.                                                        |
| `relative`  | `String`                              |               |    YES   | Relative destination directory path of the sprite in the css file.                          |
| `svg`       | `Boolean`                             | `false`       |    NO    | Option to create svg sprite for svg images.                                                 |
| `padding`   | `Number`                              | `0`           |    NO    | Option to add more padding around the images in the css.                                    |
| `retina`    | `Number`                              | `1`           |    NO    | Option to support retina images by setting value. *e.g: to use 2X retina, set `retina: 2`*. |
| `layout`    | `String`                              | `binary-tree` |    NO    | Option to pack images with. please [layouts table](#layouts).                               |
| `engine`    | `String`                              | `pixelsmith`  |    NO    | Option to use different engine for [spritesmith][spritesmith-url].                          |


__<a name="layouts"></a>[Layouts][layouts-url]__

|         `top-down`        |          `left-right`         |         `diagonal`        |           `alt-diagonal`          |          `binary-tree`          |
|---------------------------|-------------------------------|---------------------------|-----------------------------------|---------------------------------|
| ![top-down][top-down-img] | ![left-right][left-right-img] | ![diagonal][diagonal-img] | ![alt-diagonal][alt-diagonal-img] | ![binary-tree][binary-tree-img] |



## License

Copyright 2017, Yahoo Holdings.

Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.


[npm-image]: https://badge.fury.io/js/spritify.svg
[npm-url]: https://npmjs.org/package/spritify
[downloads-image]: https://img.shields.io/npm/dm/spritify.svg
[downloads-url]: https://npmjs.org/package/spritify

[image-sprite]: https://www.w3schools.com/css/css_image_sprites.asp
[spritify-example-url]: https://github.com/shadiabuhilal/spritify-example
[grunt]: https://www.npmjs.com/package/grunt
[gulp]: https://www.npmjs.com/package/gulp

[spritesmith-url]: https://github.com/Ensighten/spritesmith#engines
[layouts-url]: https://github.com/twolfson/layout
[top-down-img]: https://raw.githubusercontent.com/twolfson/layout/2.0.2/docs/top-down.png
[left-right-img]: https://raw.githubusercontent.com/twolfson/layout/2.0.2/docs/left-right.png
[diagonal-img]: https://raw.githubusercontent.com/twolfson/layout/2.0.2/docs/diagonal.png
[alt-diagonal-img]: https://raw.githubusercontent.com/twolfson/layout/2.0.2/docs/alt-diagonal.png
[binary-tree-img]: https://raw.githubusercontent.com/twolfson/layout/2.0.2/docs/binary-tree.png
