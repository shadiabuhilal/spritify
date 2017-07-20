/**
 * Copyright 2017, Yahoo Holdings.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */



/**
 * This function set css declaration (css property) object into the rule object (css class name)
 * @memberof CssDeclaration
 * @param {Object} rule is css rule object (call by refrance)
 * @param {String} propertyName is css property name
 * @param {Number} propertyIndex is css property index in the rule properties array
 * @param {String} value is css property value
 * @returns {void}
 */
const setDeclaration = (rule, propertyName, propertyIndex, value) => {

    // check if property exists, then update the existing property
    if (propertyIndex !== undefined && ~propertyIndex) {
        // set new declaration value by index 
        rule.declarations[propertyIndex].value = value;
        // exit the function
        return;
    }

    // add new declaration to the rule
    rule.declarations.push({
        type: 'declaration',
        property: propertyName,
        value
    });
};

/**
 * This function remove css declaration (css property) object from the rule object (css class name)
 * @memberof CssDeclaration
 * @param {Object} rule is css rule object (call by refrance)
 * @param {Number} propertyIndex is css property index in the rule properties array
 * @returns {void}
 */
const removeDeclaration = (rule,  propertyIndex) => {

    // check if property exists, then remove the existing property
    if (propertyIndex !== undefined && ~propertyIndex) {
        // remove the existing property by index
        rule.declarations.splice(propertyIndex, 1);
    }
};

/**
 * This function get initial image css properties object
 * @memberof CssDeclaration
 * @return {Object} of the initial image css properties object
 */
const getImageCssProperties = () => {

    const imageCssProperties = {
        'background-image': {
            hasImgSrc: true, // this css propery has background image url
            canBeOptimized: true // this css propery can be optimized (combine class names for the background images)
        },
        'background': {
            hasImgSrc: true, // this css propery has background image url
            canBeOptimized: true // this css propery can be optimized (combine class names for the background images)
        },
        'background-size': {
            canBeOptimized: true, // this css propery can be optimized (combine class names for the background images)
            value: (spriteInfo, imageInfo, cssInfo) => {

                // if the sprite image is inline and not optimize (combine class names for the background images)
                if (cssInfo.inline && !cssInfo.optimize) {
                    // calculate image background-size
                    return imageInfo.width + 'px ' + imageInfo.height + 'px';
                }

                // calculate sprite background-size
                return spriteInfo.width + 'px ' + spriteInfo.height + 'px';
            }
        },
        'background-repeat': {
            canBeOptimized: true, // this css propery can be optimized (combine class names for the background images)
            value: () => {
                return 'no-repeat';
            }
        },
        'background-position': {
            value: (spriteInfo, imageInfo, cssInfo) => {

                // if the sprite image is inline and not optimize (combine class names for the background images)
                if (cssInfo.inline && !cssInfo.optimize) {
                    return '0 0';
                }

                // normalize x position of the image
                const x = (imageInfo.x && (imageInfo.x + 'px')) || 0;
                // normalize y position of the image
                const y = (imageInfo.y && (imageInfo.y + 'px')) || 0;

                return x + ' ' + y;
            }
        },
        'width': {
            value: (spriteInfo, imageInfo) => {

                return imageInfo.width + 'px';
            }
        },
        'height': {
            value: (spriteInfo, imageInfo) => {

                return imageInfo.height + 'px';
            }
        }
    };

    return imageCssProperties;
};

/** @namespace CssDeclaration */
module.exports = {
    setDeclaration,
    removeDeclaration,
    getImageCssProperties
};
