/**
 * Copyright 2017, Yahoo Holdings.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */



/** @ignore */
const Path = require('path');
const Files = require('./files.js');
const Util = require('./util.js');

/**
 * This function will process css background image rules and update background image value 
 * @memberof ProcessCss
 * @param {Object} args is object that contains (rules, sprites, cssInfo, optimizeRules, rule, ruleIndex, imageCssProperties) call by refrance
 * @return {Object} Object contains (hasSpriteImg, imgObj)
 */
const process = (args) => {

    // set args to local variables
    const rules = args.rules;
    const sprites = args.sprites;
    const cssInfo = args.cssInfo;
    const optimizeRules = args.optimizeRules;
    const rule = args.rule;
    const ruleIndex = args.ruleIndex;
    const imageCssProperties = args.imageCssProperties;

    let imgObj;

    let hasSpriteImg = false;

    let declarationIndex = -1;

    for (const declaration of rule.declarations) {

        declarationIndex += 1;

        // get image css property object is not undefined
        const imageCssProperty = imageCssProperties[declaration.property];

        // check image css property object
        if (!imageCssProperty) {
            // skip this declaration
            continue;
        }

        // set image css property index in the rule, so it can be used for optimization and easy access
        imageCssProperty.index = declarationIndex;

        // check if image css property has not image url
        if (!imageCssProperty.hasImgSrc) {
            // skip this declaration
            continue;
        }

        // get normalize image path object
        const normalizeImagePathObj = Util.getNormalizeImagePathObj(declaration.value, cssInfo);

        // check if normalize path is undefined
        if (!(normalizeImagePathObj && normalizeImagePathObj.imagePath)) {
            // skip this declaration
            continue;
        }

        // get property location in the css file
        const propertyLocation = declaration.position.start;

        // get previous property object
        const prevDeclaration = rule.declarations[declarationIndex - 1];

        // check if spritify ignore comment exists
        if (prevDeclaration && prevDeclaration.comment && prevDeclaration.comment.match(Util.ignoreRegex)) {
            // show ignored rules warn message in the console
            Util.showIgnoredRulesMsg(rule.selectors, cssInfo.src, propertyLocation.line, propertyLocation.column);
            // skip this declaration
            continue;
        }

        // get image object by path
        imgObj = Util.getImageObjByPath(sprites, normalizeImagePathObj.imagePath);

        // check if image object by path is undefined
        if (!imgObj) {
            // show can't find image warn message in the console
            Util.showCantFindImageWarn(
                normalizeImagePathObj.prefix + normalizeImagePathObj.imagePath,
                cssInfo.src,
                propertyLocation.line,
                propertyLocation.column,
                rule.selectors);
            // skip this declaration
            continue;
        }

        // build sprite image relative url
        const spriteImageUrl = Files.buildRelativeUrl(
            imgObj.info.relative,
            Path.basename(imgObj.info.dest));

        let spriteBgImage = spriteImageUrl;

        // set has sprite image flag
        hasSpriteImg = true;

        // check if css sprite is using inline option
        if (cssInfo.inline) {
            // inline sprite image in the css and check optimize option
            spriteBgImage = cssInfo.optimize ? imgObj.sprite.properties.inline : imgObj.coordinates.inline;
        }

        // prepare sprite background image value
        spriteBgImage = 'url(\'' + spriteBgImage + '\')';

        // check if css optimize option
        if (cssInfo.optimize) {
            // get refrance optimize rule to optimize rules object
            const optRule = optimizeRules[spriteImageUrl] = optimizeRules[spriteImageUrl] || {};
            // add css selectors to optimize rule object
            optRule.selectors = (optRule.selectors || []).concat(rule.selectors);
            // set rules refrance to optimize rule object
            optRule.rules = rules;
            // get sprite spec
            const spriteSpec = imgObj.retina ? Util.getRetenaSpec(imgObj.sprite.properties, imgObj.retina) : imgObj.sprite.properties;
            // set background size value to optimize rule object
            optRule.bgSizeValue = spriteSpec.width + 'px ' + spriteSpec.height + 'px';
            // set background image value to optimize rule object
            optRule.bgImageValue = spriteBgImage;
            // set optimize rule index value if it is undefined to optimize rule object,
            // this will help to know the index location of the new optimized rule in the rules array
            optRule.optimizeRuleIndex = optRule.optimizeRuleIndex === undefined ? ruleIndex : optRule.optimizeRuleIndex;
        }

        // set background image declaration value
        declaration.value = spriteBgImage;
    }

    return  {
        hasSpriteImg,
        imgObj
    };
};

/** @namespace ProcessBgImg */
module.exports = {
    process
};
