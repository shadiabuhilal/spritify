/**
 * Copyright 2017, Yahoo Holdings.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */



/** @ignore */
const Spritesmith = require('spritesmith');
const Util = require('./util.js');

const layouts = ['top-down', 'left-right', 'diagonal', 'alt-diagonal', 'binary-tree'];

/**
 * This function will run spritesmith engine
 * @memberof EngSpritesmith
 * @param {Object} sprite object
 * @param {Function} callback function
 * @returns {void}
 */
const run = (sprite, callback) => {

    // normalize layout option
    if (!~layouts.indexOf(sprite.layout)) {
        sprite.layout = layouts[0];
    }

    // set spritesmith config object
    Spritesmith.run({
        src: sprite.files,
        padding: sprite.padding,
        algorithm: sprite.layout,
        engine: sprite.engine
    }, (err, result) => {

        if (err) {
            callback(err);
            return;
        }

        // set inline images for each image in the sprite image
        Util.setInlineImages(sprite.files, result.coordinates, false, (err) => {

            /* istanbul ignore if */
            if (err) {
                callback(err);
                return;
            }

            // set inline image for the sprite image
            result.properties.inline = Util.getInline(result.image, false);

            callback(err, {
                sprite,
                result
            });
        });

    });

};

/** @namespace EngSpritesmith */
module.exports = {
    run
};
