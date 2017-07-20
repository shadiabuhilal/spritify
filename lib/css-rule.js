/**
 * Copyright 2017, Yahoo Holdings.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

/**
 * This function creates new css rule object
 * @memberof CssRule
 * @param {Array} selectors is array of selector strings
 * @param {Object} imageCssProperties is css properties object
 * @return {Object} new css rule object
 */
const createNewRule = (selectors, imageCssProperties) => {

    // initialize new rule object
    const newRule = {
        type: 'rule',
        selectors,
        declarations: []
    };

    // set css rule declarations
    for (const imageCssProperty of imageCssProperties) {
        // add css rule declaration
        newRule.declarations.push({
            type: 'declaration',
            property: imageCssProperty.name,
            value: imageCssProperty.value
        });
    }

    return newRule;
};

/** @namespace CssRule */
module.exports = {
    createNewRule
};
