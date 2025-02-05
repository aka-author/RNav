// * * ** *** ***** ******** ************* *********************
// Product:     Reader and Navigator Kit
// Part:        Front-End JS library
// Module:      utils.js                                  (\(\
// Func:        Auxilliary functions                      (^.^)  
// * * ** *** ***** ******** ************* *********************

/**
 * Provides service functions and utilities as static methods.
 * 
 * @class
 */

class RNav_Utils {

  // UUID and other identifiers

  /**
   * Generates an UUID of the type 4.
   * 
   * @returns {string} - A new UUID of the type 4.
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
   * Represents a UUID to a short form.
   * 
   * @param {string} uuid - A UUID represented in a standard form. 
   * @returns {string} - A UUID represented in a short form.
   */

  static compressUUID(uuid) {
    const hex = uuid.replace(/-/g, '');
    const compressed = this.baseConvert(hex, 16, 62); // Convert from base-16 to base-62
    return compressed.padStart(16, '0');
  }
      
  /**
   * Repairs a UUID form the short form to the standard form. 
   *  
   * @param {string} compressed - A UUID represented in the short form.  
   * @returns {string} - A UUID represented in the standard form. 
   */

  static decompressUUID(compressed) {
    const hex = this.baseConvert(compressed, 62, 16); // Convert from base-62 to base-16
    const uuid = hex.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
    return uuid;
  }
    
    
  // Strings

  /**
   * Normalizes the first character in a string
   *
   * @param {string} str - The input string to be processed.
   
   */

  static dry(str) {
    return str.trim().replace(/\s+/g, ' ');
  }

  /**
   * Capitalizes the first character in a string
   *
   * @param {string} str - The input string to be processed.
   
   */

  static capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Extracts the substring that precedes the first occurrence of a specified
   * separator in a given string.
   *
   * @param {string} str - The input string to be parsed.
   * @param {string} separ - The separator used to determine the boundary 
   * between the extracted substring and the remaining portion of the 
   * input string.
   * @returns {string} - The extracted substring from the beginning of the 
   * input string up to the first occurrence of the separator.
   */

  static substringBefore(str, separ) {
  
    const separIndex = str.indexOf(separ);

    if (separIndex !== -1) 
      return str.substring(0, separIndex);

    return str;
  }

  /**
   * Extracts the substring that follows the first occurrence of a specified
   * separator in a given string.
   *
   * @param {string} str - The input string to be parsed.
   * @param {string} separ - The separator used to determine the boundary 
   * between the beginning of the input string and the extracted substring.
   * @returns {string} - The substring following the first occurrence of 
   * the separator until the end of the input string.
   */

  static substringAfter(str, separ) {

    const separIndex = str.indexOf(separ);
  
    if (separIndex !== -1) 
      return str.substring(separIndex + separ.length);
  
    return "";
  }


  // Style strings and other strings of this kind

  /**
   * Validates a string as a CSS-like style definition.
   * 
   * @param {string} styleString - An input string to be validates.  
   * @returns {boolean} - true is the input string is a valid CSS-like style
   *  definition, otherwise false.
   */

  static isValidStyleString(styleString) {
    
    let pattern = /^([a-zA-Z-]+)\s*:\s*([^;]+)(;\s*[a-zA-Z-]+\s*:\s*[^;]+)*\s*;?$/;
  
    return pattern.test(styleString);
  }

  /**
   * Extracts property values from a CSS-like style definition. 
   * 
   * @param {string} styleString - An input CSS-like style definition. 
   * @returns {Object} - A dictionary of property values. 
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
   * Returns a regulae expression for detecting numbers.
   * 
   * @requires {Regexp} - A regular expression for detecting numbers. 
   */

  static getNumberRegexp() {
    return /[-+]?(\d+(\.\d*)?|\.\d+)([eE][-+]?\d+)?/;
  }

  /**
   * Extracts a numeric value from a string representing a value 
   * with dimension.
   *
   * @param {string} dimValue - The input string representing a value 
   * with dimension.
   * @returns {number} - A numeric value extracted from the input string.
   */

  static extractNumber(dimValue) {

    const match = dimValue.match(RNav_Utils.getNumberRegexp());
  
    if (match) {
      const parsedValue = parseFloat(match[0]);
      return Number.isInteger(parsedValue) ? parseInt(match[0]) : parsedValue;
    }
  
    return NaN;
  }
    
  /**
   * Extracts a dimension unit from a string representing a value 
   * with dimension.
   * 
   * @param {string} dimValue - The input string representing a value 
   * with dimension.
   * @returns {string} - A measure unit denotation extracted from 
   * the input string or empty string if no unit is found. 
   */

  static extractUnit(dimValue) {
    const numberPart = dimValue.match(RNav_Utils.getNumberRegexp())[0];
    return dimValue.slice(numberPart.length);
  }


  // Datatypes and objects

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
   * Checks whether a class with a certain name exists.
   * 
   * @param {string} className - A class name to be checked. 
   * @returns {boolean} - true if a class with the imput name is defined,
   * otherwise returns false. 
   */

  static classExists(className) {
    return !!className;
  }

  /**
   * Checks whether Matrix(row, column) is defined.
   * 
   * @param {Array|Object} - A matrix to be checked. 
   * @param {*} primary - A row index or a row key.
   * @param {*} secondary - A column index of a column key.
   * @returns {boolean} - true if matrix[primary, secondary] exists, 
   * otherwise returns false.
   */

  static matrixExists(matrix, primary, secondary) {
    return !!matrix[primary] ? !!matrix[primary][secondary] : false;
  }


  // Debugging 

  /**
   * Reports the current script file name and the line number. 
   * 
   * @returns {Object} - An object containing the script file name and the line number.
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

}
