import React, {ReactElement} from 'react';
import stringToRegex, { regexRegex } from '../utils/stringToRegex';
import generateUUID from '../functions/generateUid';


export type JsxReplacements = {[stringOrRegex: string]: string|((...args: any[]) => string|ReactElement)}

export interface JsxReplaceConfig {
    text: string,
    replacements: JsxReplacements,
    maxReplacements?: number
    guid?: string,
    useDangerouslySetInnerHTML?: boolean
}

export default function jsxReplace(
    {
        text,
        replacements,
        maxReplacements = 20,
        guid = generateUUID(),
        useDangerouslySetInnerHTML = false
    }: JsxReplaceConfig
): Array<ReactElement|string> {
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
                const match = (result[arrayIdx].match(regex) as RegExpMatchArray);
                // @ts-ignore
                [matchValue] = match;
                matchIndex = match.index;
                matchLength = match[0].length;
            } else {
                matchValue = vars[i];
                matchLength = vars[i].length;
                matchIndex = result[arrayIdx].indexOf(vars[i]);
            }
            if (isReplacerFunction) {
                // @ts-ignore
                ReplaceElement = replacements[vars[i]]({
                    match: matchValue,
                    ...(isRegexKey ? { regex } : {}),
                    var: vars[i]
                });
            }
            // declare the new result array
            // @ts-ignore
            result = [
                ...result.slice(0, arrayIdx),
                ...(ReplaceElement && React.isValidElement(ReplaceElement)
                    ? [
                        result[arrayIdx].substring(0, matchIndex),
                        React.cloneElement(ReplaceElement, { key: `${guid}:${i}.${j}` }),
                        // jsx replacement
                        // @ts-ignore
                        result[arrayIdx].substring(matchIndex + matchLength)
                    ] : [
                        // string replacement
                        `${result[arrayIdx].substring(0, matchIndex)}${ReplaceElement}${result[arrayIdx].substring(
                            // @ts-ignore
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
                // @ts-ignore
                result[i] = <span dangerouslySetInnerHTML={{ __html: result[i] }}/>;
            }
        }
    }
    return result;
}