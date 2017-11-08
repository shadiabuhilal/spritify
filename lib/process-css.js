/**
 * Copyright 2017, Yahoo Holdings.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

/** @ignore */
const CssDeclaration = require('./css-declaration.js');
const ProcessBgImg = require('./process-bg-img.js');
const CssRule = require('./css-rule.js');
const Util = require('./util.js');

/**
 * This function will update css rules recursively with the sprites details for the current css file
 * @memberof ProcessCss
 * @param {Array} rules is Array of css rule objects
 * @param {Array} sprites is array of sprites objects
 * @param {Object} cssInfo is current css details object
 * @param {Object} optimizeRules is object to hold the rules that needs to be optimized, call by refrance
 * @return {Array} Array of the updates css rule objects
 */
const updateCssRulesRecursively = (rules, sprites, cssInfo, optimizeRules) => {

    // set default value for optimize option if not set
    if (cssInfo.optimize === undefined) {
        cssInfo.optimize = true;
    }

    let ruleIndex = -1;

    for (const rule of rules) {

        ruleIndex += 1;

        // get image css properties for this css rule (class name).
        const imageCssProperties = CssDeclaration.getImageCssProperties();

        // get previous css rule object
        const prevRule = rules[ruleIndex - 1];

        // check for spritify ignore comment rule
        if (prevRule && prevRule.comment && prevRule.comment.match(Util.ignoreRegex)) {
            // get spritify ignore comment rule location in the css file
            const propertyLocation = rule.position.start;
            // show spritify ignore comment rule location in console
            Util.showIgnoredRulesMsg(rule.selectors, cssInfo.src, propertyLocation.line, propertyLocation.column);
            // skip this rule object and go to the next rule object
            continue;
        }

        // check if there is any sub rules for this rule object e.g: css media query
        if (rule.rules) {
            // make recursive call to handle sub rules
            rule.rules = updateCssRulesRecursively(rule.rules, sprites, cssInfo, optimizeRules);
            // skip this rule object and go to the next rule object
            continue;
        }

        // check if this rule object don't have any declarations (css properties)
        if (!rule.declarations) {
            // skip this rule object and go to the next rule object
            continue;
        }

        // process background image image if exists
        const processBgImgObj = ProcessBgImg.process({
            rules,
            sprites,
            cssInfo,
            optimizeRules,
            rule,
            ruleIndex,
            imageCssProperties
        });

        // check if this rule don't have background image
        if (!processBgImgObj.hasSpriteImg) {
            // skip this rule object and go to the next rule object
            continue;
        }

        // get background image data
        const imgObj = processBgImgObj.imgObj;

        // get retina value for background image
        const retina = imgObj.retina;

        // calculate retina sprite background image specs if the image is retina
        const spriteSpec = retina ? Util.getRetenaSpec(imgObj.sprite.properties, retina) : imgObj.sprite.properties;
        // calculate retina background image specs if the image is retina
        const imgSpec = retina ? Util.getRetenaSpec(imgObj.coordinates, retina) : imgObj.coordinates;

        // array of css properties that needs to be deleted from the current rule
        const cssDeletePropertiesIndexes = [];

        // array of css properties names
        const cssPropertyNames = Object.keys(imageCssProperties);

        for (const cssPropertyName of cssPropertyNames) {

            // css property object
            const imageCssProperty = imageCssProperties[cssPropertyName];

            // check css rules if it can be optimized
            if (cssInfo.optimize && imageCssProperty.canBeOptimized) {
                // add prepare css property index so it can be deleted from the current rule for optimizion
                cssDeletePropertiesIndexes.push(imageCssProperty.index);
                // skip any other checks for this css property
                continue;
            }

            // check if css property is not background image url
            if (!imageCssProperty.hasImgSrc) {
                // update css property with the new value
                CssDeclaration.setDeclaration(rule, cssPropertyName, imageCssProperty.index, imageCssProperty.value(spriteSpec, imgSpec, cssInfo));
            }
        }

        // check css can if it can be optimized
        if (cssInfo.optimize) {
            // sort the deleted properties indexes in descending order,
            // so it can delete property by index in the loop.
            cssDeletePropertiesIndexes.sort((a, b) => {
                return b - a;
            });

            for (const cssDeletePropertyIndex of cssDeletePropertiesIndexes) {

                // delete property by property index
                CssDeclaration.removeDeclaration(rule,  cssDeletePropertyIndex);
            }
        }
    }

    return rules;
};

/**
 * This function will optimoize css rules by combining css class names in one css rule to hold the common css properties
 * @memberof ProcessCss
 * @param {Array} rules is array of css rule objects
 * @param {Object} optimizeRules is object of the rules to be optimoized
 * @return {Array} array of the updates optimoize css rule objects
 */
const optimoizeCssRules = (rules, optimizeRules) => {

    const optimizeRulesKeys = Object.keys(optimizeRules);

    for (const spriteImageUrl of optimizeRulesKeys) {

        const optimizeRule = optimizeRules[spriteImageUrl];

        // create optimoize css rule by combining css class names in one css rule to hold the common css properties
        const rule = CssRule.createNewRule(optimizeRule.selectors, [
            {
                name: 'background-image',
                value: optimizeRule.bgImageValue
            },
            {
                name: 'background-size',
                value: optimizeRule.bgSizeValue
            },
            {
                name: 'background-repeat',
                value: 'no-repeat'
            }
        ]);

        // insert optimoize css rule object in to the top of rules array
        optimizeRule.rules.splice(optimizeRule.optimizeRuleIndex, 0, rule);
    }

    return rules;
};

/**
 * This function will update css rules with the sprites details for the current css file
 * @memberof ProcessCss
 * @param {Array} rules is array of css rule objects
 * @param {Array} sprites is array of sprites objects
 * @param {Object} cssInfo is current css details object
 * @return {Array} array of the updates css rule objects
 */
const updateCssRules = (rules, sprites, cssInfo) => {

    const optimizeRules = {};

    // update css rules recursively with the sprites details for the current css file
    rules = updateCssRulesRecursively(rules, sprites, cssInfo, optimizeRules);

    if (cssInfo.optimize) {
        // optimoize css rules by combining css class names in one css rule to hold the common css properties
        rules = optimoizeCssRules(rules, optimizeRules);
    }

    return rules;
};

/** @namespace ProcessCss */
module.exports = {
    updateCssRules
};
