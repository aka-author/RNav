// * * ** *** ***** ******** ************* *********************
// Product:     Kit for Web-based Interactive Stand-alone Help
// Part:        Front-End JS library
// Module:      utils.js                                  (\(\
// Func:        Auxilliary functions                      (^.^)  
// * * ** *** ***** ******** ************* *********************

/**
 * Provides a collection of utility functions for various operations
 * such as string manipulation, mathematical conversions, date-time processing, 
 * debugging, and more. 
 *
 * @class
 */
class kwish_Utils {

  static STATIC_OPTIONS = {};

  // UUID and other identifiers

  static idCount = 0;

  /**
   * Returns the next sequential ID and increments the internal counter.
   * 
   * This method provides a simple way to generate unique sequential IDs within the application.
   * Each call to this method returns the current value of the internal counter and then
   * increments it for the next call.
   * 
   * @return The current value of the internal ID counter before incrementing
   */
  static getNextIdCount() {
    return kwish_Utils.idCount++;
  }

  /**
   * Generates a version 4 UUID (randomly generated).
   * 
   * @returns {string} A new UUID (version 4) in a standard format.
   */
  static getUUID4() {

      let dt = new Date().getTime();
      let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      let r = (dt + Math.random()*16)%16 | 0;
      dt = Math.floor(dt/16);
      return (c=='x' ? r :(r&0x3|0x8)).toString(16);
      });

      return uuid;
  }

  /**
   * Converts a number from one numerical base to another.
   *
   * @param {string} number - The number to convert, provided as a string.
   * @param {number} fromBase - The original numerical base.
   * @param {number} toBase - The target numerical base.
   * @returns {string} The converted number in the new base.
   * @throws {Error} If the input contains an invalid digit for the specified base.
   */
  static baseConvert(number, fromBase, toBase) {
      const digits = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const fromDigits = digits.slice(0, fromBase);
      const toDigits = digits.slice(0, toBase);
      let converted = '';
    
      let value = BigInt('0');
      let multiplier = BigInt('1');
    
      for (let i = number.length - 1; i >= 0; i--) {
        const digit = fromDigits.indexOf(number[i]);
        if (digit === -1) {
          throw new Error(`Invalid digit: ${number[i]}`);
        }
        value += BigInt(digit) * multiplier;
        multiplier *= BigInt(fromBase);
      }
    
      while (value > BigInt('0')) {
        converted = toDigits[value % BigInt(toBase)] + converted;
        value /= BigInt(toBase);
      }
    
      return converted;
  }

  /**
   * Converts a standard UUID to a shorter format using base-62 encoding.
   *
   * @param {string} uuid - The original UUID in standard format.
   * @returns {string} The compressed UUID in base-62 format.
   */
  static compressUUID(uuid) {
    const hex = uuid.replace(/-/g, '');
    const compressed = this.baseConvert(hex, 16, 62); // Convert from base-16 to base-62
    return compressed.padStart(16, '0');
  }
      
  /**
   * Restores a compressed UUID back to its standard format.
   * 
   * @param {string} compressed - The UUID in compressed format.
   * @returns {string} The restored UUID in standard format.
   */
  static decompressUUID(compressed) {
    const hex = this.baseConvert(compressed, 62, 16); // Convert from base-62 to base-16
    const uuid = hex.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
    return uuid;
  }
    
  /**
   * Generates a short identifier prefixed with "i".
   * 
   * @returns {string} A short identifier based on a compressed UUID.
   */
  static getShortId() {
    return `i${kwish_Utils.compressUUID(kwish_Utils.getUUID4())}`;
  }

  // Strings

  /**
   * Trims and normalizes spacing in a string by replacing multiple spaces with a single space.
   *
   * @param {string} str - The input string.
   * @returns {string} The normalized string.
   */
  static dry(str) {
    return str.trim().replace(/\s+/g, ' ');
  }

  /**
   * Capitalizes the first character of a string.
   *
   * @param {string} str - The input string.
   * @returns {string} The modified string with its first character capitalized.
   */
  static capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Converts the first character of a string to lowercase.
   *
   * @param {string} str - The input string.
   * @returns {string} The modified string with its first character in lowercase.
   */
  static decapitalizeFirst(str) {
    return str.charAt(0).toLowerCase() + str.slice(1);
  }

  /**
   * Extracts the substring before the first occurrence of a separator.
   *
   * @param {string} str - The input string.
   * @param {string} separ - The separator.
   * @returns {string} The substring before the separator, or the full string if the separator is not found.
   */
  static substringBefore(str, separ) {
  
    const separIndex = str.indexOf(separ);

    if (separIndex !== -1) 
      return str.substring(0, separIndex);

    return str;
  }

  /**
   * Extracts the substring before the last occurrence of a separator.
   *
   * @param {string} str - The input string.
   * @param {string} separ - The separator.
   * @returns {string} The substring before the last occurrence of the separator.
   */
  static substringBeforeLast(str, separ) {
    const separIndex = str.lastIndexOf(separ);
    return separIndex !== -1 ? str.substring(0, separIndex) : str;
  }

  /**
   * Extracts the substring after the first occurrence of a separator.
   *
   * @param {string} str - The input string.
   * @param {string} separ - The separator.
   * @returns {string} The substring after the separator, or an empty string if not found.
   */
  static substringAfter(str, separ) {

    const separIndex = str.indexOf(separ);
  
    if (separIndex !== -1) 
      return str.substring(separIndex + separ.length);
  
    return "";
  }

  /**
   * Extracts the substring after the last occurrence of a separator.
   *
   * @param {string} str - The input string.
   * @param {string} separ - The separator.
   * @returns {string} The substring after the last occurrence of the separator.
   */
  static substringAfterLast(str, separ) {
    const separIndex = str.lastIndexOf(separ);
    return separIndex !== -1 ? str.substring(separIndex + separ.length) : str;
  } 

  /**
   * Converts a camelCase or PascalCase string into a snake_case string.
   * 
   * This function inserts an underscore (`_`) before each uppercase letter that follows a lowercase letter 
   * or another uppercase letter in a different word boundary.
   * 
   * @param {string} str - The camelCase or PascalCase input string.
   * @returns {string} - The converted string in snake_case format.
   */
  static camelToSnake(str) {

    if (!str) return '';

    return str
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2') // Handles abbreviations correctly
        .replace(/([a-z\d])([A-Z])/g, '$1_$2')     // Handles normal camelCase words
        .toLowerCase();
  }

  /**
   * Removes the "kwish_" prefix from a string if present.
   * 
   * @param str The string to process
   * @return The string with the class prefix removed if it was present, otherwise the original string
   */
  static dernav(str) {
    const prefix = `${kwish_Utils.substringBefore(this.name, '_')}_`;
    return str.startsWith(prefix) ? str.slice(prefix.length) : str;
  }

  /**
   * Removes a specified prefix from a string if present.
   * 
   * @param str The string to process
   * @param prefix The prefix to remove, if undefined the function will remove everything before and including the first underscore
   * @return The string with the prefix removed if present, otherwise the original string
   */
  static deprefix(str, prefix = undefined) {

    if (!!prefix) {
      return str.startsWith(prefix) ? kwish_Utils.substringAfter(str, prefix) : str;
    }

    return str.includes('_') ? kwish_Utils.substringAfter(str, '_') : str;
  }

  // Date and time 

  /**
   * Gets the current time in milliseconds since January 1, 1970, 00:00:00 UTC.
   * 
   * @return The current timestamp in milliseconds
   */
  static getCurrTime() {
    return new Date().getTime();
  }

  // Style strings and other strings of this kind

  /**
   * Validates a string as a CSS-like style definition.
   * 
   * @param styleString The input string to be validated
   * @return true if the input string is a valid CSS-like style definition, otherwise false
   */
  static isValidStyleString(styleString) {
    
    let pattern = /^([a-zA-Z-]+)\s*:\s*([^;]+)(;\s*[a-zA-Z-]+\s*:\s*[^;]+)*\s*;?$/;
  
    return pattern.test(styleString);
  }

  /**
  * Extracts property values from a CSS-like style definition.
  * 
  * @param styleString The input CSS-like style definition
  * @return A dictionary of property values
  */
  static parseStyle(styleString) {

    var styleObj = {};

    if(!styleString) return styleObj;
  
    var declarations = styleString.split(';');
  
    for (var i = 0; i < declarations.length; i++) {
      var declaration = declarations[i].trim();
  
      var colonIndex = declaration.indexOf(':');
      if (colonIndex !== -1) {
        var property = declaration.substring(0, colonIndex).trim();
        var value = declaration.substring(colonIndex + 1).trim();
  
        if (!isNaN(value)) {
          value = parseFloat(value);
        }
  
        if (value === 'true') {
          value = true;
        } else if (value === 'false') {
          value = false;
        }
  
        styleObj[property] = value;
      }
    }
  
    return styleObj;
  }

  // Values and units

  /**
   * Returns a regular expression for detecting numbers.
   * 
   * @return A regular expression for detecting numbers
   */
  static getNumberRegexp() {
    return /[-+]?(\d+(\.\d*)?|\.\d+)([eE][-+]?\d+)?/;
  }

  /**
   * Extracts a numeric value from a string representing a value with dimension.
   * 
   * @param dimValue The input string representing a value with dimension
   * @return A numeric value extracted from the input string
   */
  static extractNumber(dimValue) {

    const match = dimValue.match(kwish_Utils.getNumberRegexp());
  
    if (match) {
      const parsedValue = parseFloat(match[0]);
      return Number.isInteger(parsedValue) ? parseInt(match[0]) : parsedValue;
    }
  
    return NaN;
  }

  /**
   * Extracts the unit of measurement from a dimension string.
   * 
   * This function identifies and removes the numeric portion from the input string,
   * returning the remaining part as the unit of measurement.
   * 
   * @param {string} dimValue - The input string containing a numeric value followed by a unit.
   * @returns {string} - The extracted unit of measurement. Returns an empty string if no unit is found.
   * @throws {TypeError} - Throws an error if the input is not a string or does not contain a numeric value.
   */
  static extractUnit(dimValue) {
    const numberPart = dimValue.match(kwish_Utils.getNumberRegexp())[0];
    return dimValue.slice(numberPart.length);
  }

  // Data types and objects

  /**
   * Checks whether the given value is a function.
   *
   * @param {*} probableFunc - The value to check.
   * @returns {boolean} - Returns true if the given value is a function, otherwise false.
   */
  static isFunc(probableFunc) {
      return typeof probableFunc === 'function';
  }

  /**
   * Checks whether an object has at least one own property.
   *
   * @param {Object} obj - The object to check.
   * @returns {boolean} True if the object has at least one own property, otherwise false.
   */
  static hasProps(obj) {
    return Object.keys(obj).length > 0;
  }

  /**
   * Determines whether an object is non-null, of type 'object', and has at least one own property.
   *
   * @param {Object} obj - The object to check.
   * @returns {boolean} True if the object is a non-null object and has properties, otherwise false.
   */
  static isUsefulObj(obj) {
    if (!obj) return false;
    return typeof obj === 'object' && kwish_Utils.hasProps(obj);
  }

  /**
   * Retrieves the first own property value of an object.
   *
   * @param {Object} obj - The object to retrieve a property from.
   * @returns {*} The value of the first own property, or undefined if the object has no properties.
   */
  static getOneProp(obj) {
    return obj[Object.keys(obj)[0]];
  }

  /**
   * Retrieves all property names, including inherited ones, from an object.
   *
   * @param {Object} obj - The object whose properties will be retrieved.
   * @returns {string[]} An array containing all property names found in the object's prototype chain.
   */
  static getAllPropNames(obj) {
    let props = new Set();

    while (obj) {
        Object.getOwnPropertyNames(obj).forEach(prop => props.add(prop));
        obj = Object.getPrototypeOf(obj);
    }

    return [...props];
  }

  /**
   * Merges multiple property records into a single object.
   *
   * @param {...Object} propsRecs - One or more objects whose properties will be merged.
   * @returns {Object} A new object containing merged properties from all provided objects.
   */
  static mergeProps(...propsRecs) {

    const mergedPropsRec = {};

    for (const propsRec of propsRecs) {
      if (!!propsRec) {
        for (const propName of Object.keys(propsRec)) {
          mergedPropsRec[propName] = propsRec[propName];
        }
      }
    }

    return mergedPropsRec;
  }

  /**
   * Verifies whether an object has at least one property.
   * 
   * @param {Object} obj - The input object to be checked.  
   * @returns {boolean} - true if the imput object has at least one property,
   * otherwise returns false. 
   */
  static isNotEmpty(obj) {
    return Object.keys(obj).length > 0; 
  }

  /**
   * Determines if a class with a given name exists.
   * 
   * @param {string} className - The name of the class to check.
   * @returns {boolean} True if a class with the specified name is defined, otherwise false.
   */
  static classExists(className) {
    return !!className;
  }

  /**
   * Retrieves all property names from a class, including inherited ones.
   * 
   * @param {Function} classObject - The class whose properties will be retrieved.
   * @returns {string[]} An array containing all property names found in the class's prototype chain.
   */
  static allClassPropertyNames(classObject) {

    let properties = new Set(); 
    let proto = classObject.prototype;

    while (proto && proto !== Object.prototype) {
        Object.getOwnPropertyNames(proto).forEach(prop => properties.add(prop));
        proto = Object.getPrototypeOf(proto); 
    }

    return Array.from(properties);
  }

  /**
   * Retrieves all method names from a class, including inherited ones.
   * 
   * @param {Function} classObject - The class whose methods will be retrieved.
   * @returns {string[]} An array containing all method names found in the class's prototype chain.
   */
  static allClassMethodNames(classObject) {
    const propNames = kwish_Utils.allClassPropertyNames(classObject);
    return propNames.filter(p => typeof classObject.prototype[p] === 'function');
  }


  /**
   * Checks whether a specific element in a matrix exists.
   * 
   * @param {Array|Object} matrix - The matrix to be checked.
   * @param {*} primary - A row index or a row key.
   * @param {*} secondary - A column index or a column key.
   * @returns {boolean} - True if matrix[primary][secondary] exists, otherwise false.
   */
  static matrixExists(matrix, primary, secondary) {
    return !!matrix[primary] ? !!matrix[primary][secondary] : false;
  }

  /**
   * Creates a two-dimensional matrix filled with a specified value.
   * 
   * @param {number} m - Number of rows.
   * @param {number} n - Number of columns.
   * @param {*} v - The value to fill the matrix with.
   * @returns {Array<Array<*>>} - A two-dimensional array representing the matrix.
   */
  static getMatrix(m, n, v) {
    return Array.from({length: m}, () => Array(n).fill(v));
  }

  // Debugging 

  /**
   * Retrieves the filename and line number of the caller's caller.
   * 
   * @returns {Object} - An object containing the script file name and line number.
   */
  static getCallerOfCallerInfo() {

    const ccInfo = {
        "fileName" : "",
        "lineNumber": ""
    };

    try {
        throw new Error();
    } catch (error) {
        const stackLines = error.stack.split('\n');

        if(!stackLines[4]) return ccInfo; 

        const callerOfCallerLine = stackLines[4].trim();

        const match = /\((.*):(\d+):\d+\)$/.exec(callerOfCallerLine);

        if(!match) return ccInfo;

        ccInfo["fileName"] = match[1];
        ccInfo["lineNumber"] = match[2];
        
        return ccInfo;
    }
  }

  /**
   * Recursively processes an object, applying a parsing function to its properties.
   * 
   * @param {Object|Array} inObj - The input object or array to be parsed.
   * @param {Function} parseFunc - The function to apply to each property.
   * @param {string} [path=""] - The current path within the object hierarchy.
   * @returns {Object|Array} - The processed object or array.
   */
  static parseObject(inObj, parseFunc, path = '') {
    if (typeof inObj !== 'object' || inObj === null) return parseFunc(inObj, path);

    let outObj = Array.isArray(inObj) ? [] : {};

    for (const [key, value] of Object.entries(inObj)) {
        const newPath = Array.isArray(inObj) ? `${path}[${key}]` : `${path}/${key}`;
        let processedValue = parseFunc(value, newPath);

        if (processedValue === Symbol.for('parse')) {
            outObj[key] = kwish_Utils.parseObject(value, parseFunc, newPath);
        } else {
            outObj[key] = processedValue;
        }
    }

    return outObj;
  }

}
