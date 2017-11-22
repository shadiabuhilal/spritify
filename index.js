#!/usr/bin/env node
/**
 * Copyright 2017, Yahoo Holdings.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

const Util = require('./lib/util.js');

//Catch uncaught exceptions
/* istanbul ignore next */
process.on('uncaughtException', (err) => {

    // handle the error safely
    Util.showErrorMsg(err);
});

/** @ignore */
const Files = require('./lib/files.js');
const ParallelSprites = require('./lib/parallel-sprites.js');
const ParallelCss = require('./lib/parallel-css.js');
const UnusedImages = require('./lib/unused-images.js');


/**
 * This function show error message in the console and forward the error callback
 * @private
 * @param {Object} err The error Object
 * @param {Function} callback function
 * @returns {void}
 */
const errorCallback = (err, callback) => {

    // show error message in the console
    Util.showErrorMsg(err);

    callback(err);
};

/**
 * This function create image sprite(s) from images and update css file(s) with new image sprite(s) details.
 * @memberof Spritify
 * @param {Object} params object
 * @param {Function} callback function
 * @returns {void}
 */
const build = (params, callback) => {

    // set and normalize options
    Util.setBuildOptions(params);

    // show start message in the console
    Util.startMsg();

    // get all images files paths that will be used for the sprites
    Files.getSpriteImagesFiles(params.sprites, (err, spritesData) => {

        if (err) {
            // error callback
            errorCallback(err, callback);
            return;
        }

        // build sprite images from images info
        ParallelSprites.buildSprites(spritesData, (err, sprites) => {

            if (err) {
                // error callback
                errorCallback(err, callback);
                return;
            }

            if (params.css === undefined) {
                // show end message in the console
                Util.endMsg();
                // no need to update css, call success callback
                callback();
                return;
            }

            // update css files with the new sprite images
            ParallelCss.updateCss(params.css, sprites, (err) => {

                // check and show the unused images
                UnusedImages.checkImages(sprites);

                // show end message in the console
                Util.endMsg();

                if (err) {
                    // error callback
                    errorCallback(err, callback);
                    return;
                }

                // success callback
                callback();
            });
        });

    });
};

/** @namespace Spritify */
module.exports = {
    build
};
