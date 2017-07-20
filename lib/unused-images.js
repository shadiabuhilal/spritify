/**
 * Copyright 2017, Yahoo Holdings.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

/** @ignore */
const Util = require('./util.js');

/**
 * This function will show the show unused images warn in the console
 * @memberof UnusedImages
 * @param {Array} sprites is array of sprite objects
 * @returns {void}
 */
const checkImages = (sprites) => {

    for (const sprite of sprites) {

        const imagesPaths = Object.keys(sprite.result.coordinates);

        for (const imagePath of imagesPaths) {

            // check if the image is not used
            if (!sprite.result.coordinates[imagePath].used) {
                // show  unused image warn in the console
                Util.showUnusedImageWarn(
                    imagePath,
                    sprite.spriteInfo.dest);
            }

        }
    }
};

/** @namespace UnusedImages */
module.exports = {
    checkImages
};
