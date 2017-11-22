/**
 * Copyright 2017, Yahoo Holdings.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

/** @ignore */
const Fs = require('fs');
const Async = require('async');
const RecursiveReaddir = require('recursive-readdir');
const Path = require('path');
const Mkdirp = require('mkdirp');
const Util = require('./util.js');

// list of supported image extensions
const imageExtensions = ['.png', '.jpeg', '.jpg', '.gif'];

/**
 * This function will ignore Files based on the supported image extensions list
 * @private
 * @param {String} file path
 * @param {Object} stats of file stats object
 * @param {Boolean} isSvg is image flag if it's svg image
 * @returns {void}
 */
const ignoreFilesFilter = (file, stats, isSvg) => {

    const sprite = this; // eslint-disable-line

    // check if a file is a directory
    if (stats.isDirectory()) {
        // don't ignore the directory
        return false;
    }

    // normalize file extension name
    const extname = Path.extname(file).toLowerCase();

    if (isSvg) {
        // check file extension is svg image extension
        return extname !== '.svg';
    }

    // check file extension is supported in the image extensions list
    return !~imageExtensions.indexOf(extname);
};

/**
 * This function will get all image files paths that will be used for the current sprite item
 * @memberof Files
 * @param {Object} sprite is sprite objects
 * @param {Function} callback function
 * @returns {void}
 */
const getSrcImagesFiles = (sprite, callback) => {

    // normalize src
    if (!Array.isArray(sprite.src)) {
        sprite.src = [sprite.src];
    }

    const parallel = [];

    for (const src of sprite.src) {
        parallel.push((cb) => {
            // read directory files of the sprite source directory recursively
            RecursiveReaddir(Path.join(Util.cwd, src), [(file, stats) => {
                // wrapper function to pass svg flag to the filter
                return ignoreFilesFilter(file, stats, sprite.svg);
            }], (err, files) => {

                if (err) {
                    // call parallel callback
                    cb(err);
                    return;
                }

                // sort files
                files = files.sort();

                // normalize files array by replaceing cwd with relative directory `.`
                files = files.map((value) => {
                    return value.replace(Util.cwd + '/', '');
                });

                // call parallel callback
                cb(err, files);
            });
        });
    }

    Async.parallel(parallel, callback);
};

/**
 * This function will get all image files paths that will be used for the sprites
 * @memberof Files
 * @param {Array} sprites is array of sprite objects
 * @param {Function} callback function
 * @returns {void}
 */
const getSpriteImagesFiles = (sprites, callback) => {

    const parallel = [];

    for (const sprite of sprites) {
        parallel.push((cb) => {
            getSrcImagesFiles(sprite, (err, spriteSrcs) => {
                sprite.files = [];
                while (spriteSrcs.length) {
                    sprite.files = sprite.files.concat(spriteSrcs.shift());
                }
                // call parallel callback
                cb(err, sprite);
            });
        });
    }

    Async.parallel(parallel, callback);
};

/**
 * This function will write file content
 * @memberof Files
 * @param {String} dest is destination file path
 * @param {String} content is file content
 * @param {String} msg is console message
 * @param {Function} callback function
 * @returns {void}
 */
const writeFile = (dest, content, msg, callback) => {

    // get destination directory path
    const desDir = Path.dirname(Path.join(Util.cwd, dest));

    // show info message in the console
    Util.showInfoMsg(msg, dest);

    // create directory for destination directory
    Mkdirp(desDir, (err) => {

        if (err) {
            callback(err);
            return;
        }

        // write file content
        Fs.writeFile(dest, content, (err) => {

            callback(err);
        });
    });
};

/**
 * This function will read file content
 * @memberof Files
 * @param {String} src is source file path
 * @param {String} msg is console message
 * @param {Function} callback function
 * @returns {void}
 */
const readFile = (src, msg, callback) => {

    // source file path
    const srcPath = Path.join(Util.cwd, src);

    // show info message in the console
    Util.showInfoMsg(msg, srcPath);

    // read file content
    Fs.readFile(srcPath, 'utf8', (err, content) => {

        callback(err, content);
    });
};

/**
 * This function will build relative url
 * @memberof Files
 * @param {...args} args is relative url parts string
 * @return {String} relative url string
 */
const buildRelativeUrl = (...args) => {

    const lastIndex = args.length - 1;

    return args.map((value, i) => {

        if (lastIndex !== i && !value.endsWith('/')) {
            return value + '/';
        }
        return value;
    }).join('');
};

/** @namespace Files */
module.exports = {
    getSpriteImagesFiles,
    writeFile,
    readFile,
    buildRelativeUrl
};
