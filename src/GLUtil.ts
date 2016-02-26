/**
 * Created by MIC on 2015/11/17.
 */

var $global = <any>window || <any>self || global || {};

/**
 * The class providing utility functions.
 */
export abstract class GLUtil {

    /**
     * Check whether a value is {@link undefined} or {@link null}.
     * @param value {*} The value to check.
     * @returns {Boolean} True if the value is {@link undefined} or {@link null}, and false otherwise.
     */
    static isUndefinedOrNull(value:any):boolean {
        return value === undefined || value === null;
    }

    /**
     * Check whether a value is {@link undefined}.
     * @param value {*} The value to check.
     * @returns {Boolean} True if the value is {@link undefined}, and false otherwise.
     */
    static isUndefined(value:any):boolean {
        return value === undefined;
    }

    /**
     * Check whether a value is a function.
     * @param value {*} The value to check.
     * @returns {Boolean} True if the value is a function, and false otherwise.
     */
    static isFunction(value:any):boolean {
        return typeof value === "function";
    }

    /**
     * Check whether a value is a class prototype.
     * @param value {*} The value to check.
     * @returns {Boolean} True if the value is a class definition, and false otherwise.
     * @remarks IE11 has a non-standard behavior to declare experimental features (e.g. Map) as functions,
     *          and tested features (e.g. WebGLRenderingContext) as objects.
     */
    static isClassDefinition(value:any):boolean {
        var typeCheck:boolean;
        if (typeof value === "function") {
            typeCheck = true;
        } else {
            var isIE11 = window.navigator.appVersion.indexOf("Trident/7.0") >= 0 && window.navigator.appVersion.indexOf("rv:11.0") >= 0;
            typeCheck = isIE11 && typeof value === "object";
        }
        var constructorCheck = (value && value.prototype ? value.prototype.constructor === value : false);
        return typeCheck && constructorCheck;
    }

    /**
     * Limit a number inside a range specified by min and max (both are reachable).
     * @param v {Number} The number to limit.
     * @param min {Number} The lower bound. Numbers strictly less than this bound will be set to the value.
     * @param max {Number} The upper bound. Numbers strictly greater than this bound will be set to this value.
     * @returns {Number} The limited value. If the original number is inside the specified range, it will not be
     * altered. Otherwise, it will be either min or max.
     */
    static limitInto(v:number, min:number, max:number):number {
        v < min && (v = min);
        v > max && (v = max);
        return v;
    }

    /**
     * Check whether a number is inside a range specified min a max (both are unreachable).
     * @param v {Number} The number to check.
     * @param min {Number} The lower bound.
     * @param max {Number} The upper bound.
     * @returns {Boolean} True if the number to check is strictly greater than min and strictly less than max, and
     * false otherwise.
     */
    static isValueBetweenNotEquals(v:number, min:number, max:number):boolean {
        return min < v && v < max;
    }

    /**
     * Check whether a number is inside a range specified min a max (both are reachable).
     * @param v {Number} The number to check.
     * @param min {Number} The lower bound.
     * @param max {Number} The upper bound.
     * @returns {Boolean} True if the number to check is not less than min and not greater than max, and
     * false otherwise.
     */
    static isValueBetweenEquals(v:number, min:number, max:number):boolean {
        return min <= v && v <= max;
    }

    /**
     * Generate a string based on the template, and provided values. This function acts similarly to the String.Format()
     * function in CLR.
     * @param format {String} The template string.
     * @param replaceWithArray {*[]} The value array to provide values for formatting.
     * @example
     * var person = { name: "John Doe", age: 20 };
     * console.log(_util.formatString("{0}'s age is {1}.", person.name, person.age);
     * @returns {String} The generated string, with valid placeholders replaced by values matched.
     */
    static formatString(format:string, ...replaceWithArray:any[]):string {
        var replaceWithArrayIsNull = GLUtil.isUndefinedOrNull(replaceWithArray);
        var replaceWithArrayLength = replaceWithArrayIsNull ? -1 : replaceWithArray.length;

        function __stringFormatter(matched:string):string {
            var indexString = matched.substring(1, matched.length - 1);
            var indexValue = parseInt(indexString);
            if (!replaceWithArrayIsNull && (0 <= indexValue && indexValue < replaceWithArrayLength)) {
                if (replaceWithArray[indexValue] === undefined) {
                    return "undefined";
                } else if (replaceWithArray[indexValue] === null) {
                    return "null";
                } else {
                    return replaceWithArray[indexValue].toString();
                }
            } else {
                return matched;
            }
        }

        var regex = /{[\d]+}/g;
        return format.replace(regex, __stringFormatter);
    }

    /**
     * Deeply clones an object. The cloned object has the exactly same values but no connection with the original one.
     * @param sourceObject {*} The object to be cloned.
     * @returns {*} The copy of original object.
     */
    static deepClone(sourceObject:boolean):boolean;
    static deepClone(sourceObject:string):string;
    static deepClone(sourceObject:number):number;
    static deepClone<T>(sourceObject:T[]):T[];
    static deepClone<T extends Object>(sourceObject:T):T;
    static deepClone<K, V>(sourceObject:Map<K, V>):Map<K, V>;
    static deepClone<T>(sourceObject:Set<T>):Set<T>;
    static deepClone<T extends Function>(sourceObject:T):T;
    static deepClone(sourceObject:any):any {
        if (sourceObject === undefined || sourceObject === null || sourceObject === true || sourceObject === false) {
            return sourceObject;
        }
        if (typeof sourceObject === "string" || typeof sourceObject === "number") {
            return sourceObject;
        }
        /* Arrays */
        if (Array.isArray(sourceObject)) {
            var tmpArray:any[] = [];
            for (var i = 0; i < sourceObject.length; ++i) {
                tmpArray.push(GLUtil.deepClone(sourceObject[i]));
            }
            return tmpArray;
        }
        /* ES6 classes. Chrome has implemented a part of them so they must be considered. */
        if ($global.Map !== undefined && sourceObject instanceof Map) {
            var newMap = new Map<any, any>();
            sourceObject.forEach((v:any, k:any) => {
                newMap.set(k, v);
            });
            return newMap;
        }
        if ($global.Set !== undefined && sourceObject instanceof Set) {
            var newSet = new Set<any>();
            sourceObject.forEach((v:any) => {
                newSet.add(v);
            });
            return newSet;
        }
        /* Classic ES5 functions. */
        if (sourceObject instanceof Function || typeof sourceObject === "function") {
            var sourceFunctionObject = <Function>sourceObject;
            var fn = (function ():Function {
                return function () {
                    return sourceFunctionObject.apply(this, arguments);
                }
            })();
            fn.prototype = sourceFunctionObject.prototype;
            for (var key in sourceFunctionObject) {
                if (sourceFunctionObject.hasOwnProperty(key)) {
                    (<any>fn)[key] = (<any>sourceFunctionObject)[key];
                }
            }
            return fn;
        }
        /* Classic ES5 objects. */
        if (sourceObject instanceof Object || typeof sourceObject === "object") {
            var newObject = Object.create(null);
            if (typeof sourceObject.hasOwnProperty === "function") {
                for (var key in sourceObject) {
                    if (sourceObject.hasOwnProperty(key)) {
                        newObject[key] = GLUtil.deepClone(sourceObject[key]);
                    }
                }
            } else {
                for (var key in sourceObject) {
                    newObject[key] = GLUtil.deepClone(sourceObject[key]);
                }
            }
            return newObject;
        }
        return undefined;
    }

    /**
     * Test whether a positive number is a power of 2.
     * @param positiveNumber {Number} The positive number to test.
     * @returns {Boolean} True if the number is a power of 2, and false otherwise.
     */
    static isPowerOfTwo(positiveNumber:number):boolean {
        var num = positiveNumber | 0;
        if (num != positiveNumber || isNaN(num) || !isFinite(num)) {
            return false;
        } else {
            return num > 0 && (num & (num - 1)) === 0;
        }
    }

    /**
     * Calculate the smallest power of 2 which is greater than or equals the given positive number.
     * @param positiveNumber {Number} The positive number as the basis.
     * @returns {Number} The smallest power of 2 which is greater than or equals the given positive number
     */
    static power2Roundup(positiveNumber:number):number {
        if (positiveNumber < 0)
            return 0;
        --positiveNumber;
        positiveNumber |= positiveNumber >>> 1;
        positiveNumber |= positiveNumber >>> 2;
        positiveNumber |= positiveNumber >>> 4;
        positiveNumber |= positiveNumber >>> 8;
        positiveNumber |= positiveNumber >>> 16;
        return positiveNumber + 1;
    }

    /**
     * Prints out a message with a stack trace.
     * @param message {String} The message to print.
     * @param [extra] {*} Extra information.
     */
    static trace(message:string, extra?:any):void {
        if (extra !== undefined) {
            console.info(message, extra);
        } else {
            console.info(message);
        }
        console.trace();
    }

    static requestAnimationFrame(f:FrameRequestCallback):number {
        return window.requestAnimationFrame(f);
    }

    static cancelAnimationFrame(handle:number):void {
        window.cancelAnimationFrame(handle);
    }

    static colorToCssSharp(color:number):string {
        color |= 0;
        return "#" + GLUtil.padLeft(color.toString(16), 6, "0");
    }

    static colorToCssRgba(color:number):string {
        color |= 0;
        var a = (color >> 24) & 0xff;
        var r = (color >> 16) & 0xff;
        var g = (color >> 8) & 0xff;
        var b = color & 0xff;
        return "rgba(" + [r, g, b, a].join(",") + ")";
    }

    static padLeft(str:string, targetLength:number, padWith:string):string {
        while (str.length < targetLength) {
            str = padWith + str;
        }
        if (str.length > targetLength) {
            str = str.substring(str.length - targetLength, str.length - 1);
        }
        return str;
    }

}