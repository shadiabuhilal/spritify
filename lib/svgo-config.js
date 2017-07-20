/**
 * Copyright 2017, Yahoo Holdings.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

/** @ignore */
const StringHash = require('string-hash');

// disabled svgo plugins
const disabledPlugins = [
    'removeHiddenElems',
    'removeEmptyText',
    'convertShapeToPath',
    'moveElemsAttrsToGroup',
    'moveGroupAttrsToElems',
    'collapseGroups',
    'removeEmptyContainers',
    'mergePaths',
    'removeXMLNS',
    'removeUselessDefs',
    'removeRasterImages',
    'transformsWithOnePath',
    'sortAttrs',
    'removeTitle',
    'removeDimensions',
    'removeAttrs',
    'removeElementsByAttr',
    'addClassesToSVGElement',
    'removeStyleElement',
    'addAttributesToSVGElement'
];

const getConfig = (svgFileName) => {

    const plugins = [];

    for (const name of disabledPlugins) {
        const plugin = {};
        plugin[name] = false;
        // add disabled plugin to plugins list
        plugins.push(plugin);
    }

    // add cleanupIDs plugin to create unique ids
    plugins.push({
        'cleanupIDs': {
            // create unique prefix for ids
            prefix: StringHash(svgFileName).toString(36) + '-'
        }
    });

    return {
        plugins
    };
};

module.exports = {
    getConfig
};
