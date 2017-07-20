/**
 * Copyright 2017, Yahoo Holdings.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

/** @ignore */
const Async = require('async');
const EngSpritesmith = require('./eng-spritesmith.js');
const EngSvgsprite = require('./eng-svg-sprite.js');
const Files = require('./files.js');
const Util = require('./util.js');

/**
 * This function will write sprite json file
 * @private
 * @memberof ParallelSprites
 * @param {Object} sprite is sprite object
 * @param {Object} result is result object
 * @returns {void}
 */
const writeSpriteJson = (sprite, result) => {

    Files.writeFile(
        sprite.dest + '.json',
        Util.readableJsonString({
            coordinates: result.coordinates,
            width: result.properties.width,
            height: result.properties.height
        }),
        'Saving sprite json at:', (err) => {

            if (err) {
                Util.showErrorMsg(err);
                return;
            }
        });
};

/**
 * This function will save sprite file
 * @private
 * @memberof ParallelSprites
 * @param {Object} sprite is sprite object
 * @param {Object} result is result object
 * @returns {void}
 */
const saveSprite = (sprite, result) => {

    Files.writeFile(
        sprite.dest,
        result.image,
        'Saving sprite image at:', (err) => {

            if (err) {
                Util.showErrorMsg(err);
                return;
            }

        });
};

/**
 * This function will build sprite images, and return array of sprites details as callback ,
 * @memberof ParallelSprites
 * @param {Array} sprites is array of images files paths for the sprite
 * @param {Function} callback function
 * @returns {void}
 */
const buildSprites = (sprites, callback) => {

    const parallelSprites = [];

    for (const sprite of sprites) {

        // sort images files
        sprite.files = sprite.files.sort();

        // normalize padding option
        sprite.padding = sprite.padding || 0;

        parallelSprites.push((cb) => {

            let spriteEng;

            // check sprite is svg image
            if (sprite.svg) {
                // handle SVG images
                spriteEng = EngSvgsprite.run;
            }
            else {
                // NON-SVG images
                spriteEng = EngSpritesmith.run;
            }

            // run sprite engine
            spriteEng(sprite, (err, data) => {

                if (err) {
                    // call parallel callback
                    cb(err);
                    return;
                }

                // normalize x and y coordinates for the objects
                data.result.coordinates = Util.normalizeCoordinates(data.result.coordinates);

                if (Util.canDebug()) {
                    // write sprite json file, if its in debug mode
                    writeSpriteJson(data.sprite, data.result);
                }

                // save sprite image to dest
                saveSprite(data.sprite, data.result);

                // call parallel callback
                cb(err, {
                    spriteInfo: data.sprite,
                    result: data.result
                });
            });
        });
    }

    Async.parallel(parallelSprites, callback);
};

/** @namespace ParallelSprites */
module.exports = {
    buildSprites
};
