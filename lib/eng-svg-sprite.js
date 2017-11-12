/**
 * Copyright 2017, Yahoo Holdings.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

/** @ignore */
const Async = require('async');
const SVGO = require('svgo');
const NodeUtil = require('util');
const Path = require('path');
const Util = require('./util.js');
const SvgoConfig = require('./svgo-config.js');

const layouts = ['top-down', 'left-right'];
const xmlDeclaration = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>';
const svgXmlns = 'xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"';
const svgOpenTag = '<svg width="%d" height="%d" viewBox="0 0 %d %d" %s>';
const svgCloseTag = '</svg>';
const svgRegex = {
    svgOpenTag: /^<svg\s/i,
    findY: /(^<svg[^>]*)(y="\d")/i,
    findX: /(^<svg[^>]*)(x="\d")/i
};

/**
 * This function will return the svg image X and Y positions based on the sprite image
 * @private
 * @memberof EngSvgSprite
 * @param {Array} svgSprites is object of width and height for svg images in sprite image
 * @param {Number} index of the svg image object
 * @param {Number} offset between images in the sprite image
 * @param {Boolean} isVertical is flag for sprite image is vertical or not
 * @return {Object} object with svg image X and Y position
 */
const getSvgImageXY = (svgSprites, index, offset, isVertical) => {

    let x = 0;
    let y = 0;

    for (let i = 0; i < index; i++) {
        // calculate X position for current svg image object
        x += svgSprites[i].width + (isVertical ? 0 : offset);
        // calculate Y position for current svg image object
        y += svgSprites[i].height + (isVertical ? offset : 0);
    }

    return {
        x,
        y
    };
};

/**
 * This function will prepare svg sprite image
 * @private
 * @memberof EngSvgSprite
 * @param {Object} result object, call by refrance
 * @param {Array} coordinates is array coordinate of objects, call by refrance
 * @param {Number} offset between images
 * @param {Boolean} isVertical is flag for sprite image is vertical or not
 * @returns {void}
 */
const prepareSvgSprite = (result, coordinates, offset, isVertical) => {

    // init sprite width
    result.properties.width = 0;
    // init sprite height
    result.properties.height = 0;

    // init svg sprite content
    let svgSprite = '';

    let index = -1;
    const maxIndex = coordinates.length - 1;

    for (const coordinate of coordinates) {

        index += 1;

        let svgImagePosition = '';

        const padding = (index === maxIndex ? 0 : offset);

        if (isVertical) {
            // calculate sprite height
            result.properties.height += coordinate.height + padding;
            // calculate sprite width
            result.properties.width = Math.max(result.properties.width, coordinate.width);
            // set Y position of svg image
            svgImagePosition = 'y="' + coordinate.y + '"';
            // reset X position of svg image
            coordinate.x = 0;
        }
        else {
            // calculate sprite width
            result.properties.width += coordinate.width + padding;
            // calculate sprite height
            result.properties.height = Math.max(result.properties.height, coordinate.height);
            // set X position of svg image
            svgImagePosition = 'x="' + coordinate.x + '"';
            // reset Y position of svg image
            coordinate.y = 0;
        }

        // get raw svg image
        let svgImage = coordinate._svgContent;

        // remove x position from svg image if exists
        svgImage = svgImage.replace(svgRegex.findX, '$1');
        // remove y position from svg image if exists
        svgImage = svgImage.replace(svgRegex.findY, '$1');
        // add new position to svg image
        svgImage = svgImage.replace(svgRegex.svgOpenTag, '<svg ' + svgImagePosition + ' ');

        // add svg image to sprite image content
        svgSprite += svgImage;
    }

    // get sprite image width
    const width = result.properties.width;
    // get sprite image height
    const height = result.properties.height;

    // start building sprite image
    // adding xml declaration
    result.image = xmlDeclaration;
    // adding svg wrapper open tag
    result.image += NodeUtil.format(svgOpenTag, width, height, width, height, svgXmlns);
    // adding svg images string
    result.image += svgSprite;
    // adding svg wrapper close tag
    result.image += svgCloseTag;
};

/**
 * This function will build svg sprite image
 * @private
 * @memberof EngSvgSprite
 * @param {Object} sprite object
 * @param {Object} result object
 * @param {Function} callback function
 * @returns {void}
 */
const buildSvgSprite = (sprite, result, callback) => {

    const offset = sprite.padding;

    const isVertical = sprite.layout === 'top-down';

    const filesPaths = Object.keys(result.coordinates);

    const parallelSvg = [];

    const svgSprites = [];

    const parseSvgo = (filePath, cb) => {

        // get image coordinate object
        const coordinate = result.coordinates[filePath];

        // use SVGO to clean and optimize svg image file
        const svgo = new SVGO(SvgoConfig.getConfig(Path.basename(filePath)));

        svgo.optimize(coordinate._svgContent.toString()).then((res) => {

            // get svg image width
            const width = parseInt(res.info.width, 10);
            // get svg image height
            const height = parseInt(res.info.height, 10);

            // set svg raw Content
            coordinate._svgContent = res.data;

            // get latest index of svg image array for the sprite
            const index = svgSprites.length;
            // add new object with image dimensions to the svg image array,
            // this will use it to know the order of the images and to know the positions.
            svgSprites.push({
                width,
                height
            });

            // get svg image X and Y postions based on the sprite image.
            const svgImageXY = getSvgImageXY(svgSprites, index, offset, isVertical);

            // set coordinate object properties
            coordinate.svg = true;
            coordinate.inline = Util.getInline(coordinate._svgContent, true);
            coordinate.x = svgImageXY.x;
            coordinate.y = svgImageXY.y;
            coordinate.width = width;
            coordinate.height = height;

            // call parallel callback
            cb(null, coordinate);
        }).catch(/* istanbul ignore next */(err) => {
            // call parallel callback
            cb(err);
            return;
        });
    };

    for (const filePath of filesPaths) {
        parallelSvg.push((cb) => {
            parseSvgo(filePath, cb);
        });
    }

    Async.parallel(parallelSvg, (err, coordinates) => {

        /* istanbul ignore if */
        if (err) {
            callback(err);
            return;
        }

        // prepare svg sprite
        prepareSvgSprite(result, coordinates, offset, isVertical);

        // set inline image for the sprite image
        result.properties.inline = Util.getInline(result.image, true);

        callback(err, {
            sprite,
            result
        });
    });
};

/**
 * This function will run spritesmith engine
 * @memberof EngSvgSprite
 * @param {Object} sprite object
 * @param {Function} callback function
 * @returns {void}
 */
const run = (sprite, callback) => {

    // normalize layout option
    if (!~layouts.indexOf(sprite.layout)) {
        sprite.layout = layouts[0];
    }

    // initialize sprite result object
    const result = Util.initSpriteResultObj();

    // set inline images for each image in the sprite image
    Util.setInlineImages(sprite.files, result.coordinates, true, (err) => {
        /* istanbul ignore if */
        if (err) {
            callback(err);
            return;
        }
        // build svg sprite image
        buildSvgSprite(sprite, result, callback);
    });
};

/** @namespace EngSvgSprite */
module.exports = {
    run
};
