import React from 'react';
import stringToRegex, { regexRegex } from '../_internal/stringToRegex';
import generateUUID from '../functions/generateUid';

/**
 * @param {string} text
 * @param {Object.<string, string|function>} replacements
 * @param {number} [maxReplacements=20]
 * @param {string} [guid]
 * @param {boolean} [useDangerouslySetInnerHTML=false]
 * @returns {string[]|JSXElement[]|*[]}
 */
export default function jsxReplace(
    {
        text,
        replacements,
        maxReplacements = 20,
        guid = generateUUID(),
        useDangerouslySetInnerHTML = false
    }
) {
    const vars = Object.keys(replacements);
    let result = [text];
    // for every entry in "replacements"
    for (let i = 0; i < vars.length; i += 1) {
        // check whether the key is a regex
        const isRegexKey = regexRegex.test(vars[i]);
        const regex = stringToRegex(vars[i]);
        // for every match of the current replacement
        for (let j = 0;
             j < maxReplacements
             && result.find((m) => (chayns.utils.isString(m) && (isRegexKey
                                                                 ? regex.test(m)
                                                                 : m.includes(vars[i]))));
             j++) {
            // get the current index in the array to work with
            const arrayIdx = result.findIndex((m) => (chayns.utils.isString(m) && (isRegexKey
                                                                                   ? regex.test(m)
                                                                                   : m.includes(vars[i]))));
            // calculate data like the regex match if it's a regex or whether the replacement is a string or jsx
            let matchValue;
            let matchIndex;
            let matchLength;
            const isReplacerFunction = chayns.utils.isFunction(replacements[vars[i]]);
            let ReplaceElement;
            if (isRegexKey) {
                const match = result[arrayIdx].match(regex);
                [matchValue] = match;
                matchIndex = match.index;
                matchLength = match[0].length;
            } else {
                matchValue = vars[i];
                matchLength = vars[i].length;
                matchIndex = result[arrayIdx].indexOf(vars[i]);
            }
            if (isReplacerFunction) {
                ReplaceElement = replacements[vars[i]]({
                    match: matchValue,
                    ...(isRegexKey ? { regex } : {}),
                    var: vars[i]
                });
            }
            // declare the new result array
            result = [
                ...result.slice(0, arrayIdx),
                ...(ReplaceElement && React.isValidElement(ReplaceElement)
                    ? [
                        // jsx replacement
                        result[arrayIdx].substring(0, matchIndex),
                        React.cloneElement(ReplaceElement, { key: `${guid}:${i}.${j}` }),
                        result[arrayIdx].substring(matchIndex + matchLength)
                    ] : [
                        // string replacement
                        `${result[arrayIdx].substring(0, matchIndex)}${ReplaceElement}${result[arrayIdx].substring(
                            matchIndex + matchLength
                        )}`
                    ]),
                ...result.slice(arrayIdx + 1)
            ];
        }
    }
    if (useDangerouslySetInnerHTML) {
        for (let i = 0; i < result.length; i += 1) {
            if (chayns.utils.isString(result[i])) {
                // eslint-disable-next-line react/no-danger
                result[i] = <span dangerouslySetInnerHTML={{ __html: result[i] }}/>;
            }
        }
    }
    return result;
}