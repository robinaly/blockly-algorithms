/**
 * @license
 * Visual Blocks Language
 *
 * Copyright 2012 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Generating JavaScript for text blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.LittleMan.texts');

goog.require('Blockly.LittleMan');


Blockly.LittleMan['text'] = function(block) {
  // Text value.
  var code = Blockly.LittleMan.quote_(block.getFieldValue('TEXT'));
  return [code, Blockly.LittleMan.ORDER_ATOMIC];
};

Blockly.LittleMan['text_join'] = function(block) {
  // Create a string made up of any number of elements of any type.
  switch (block.itemCount_) {
    case 0:
      return ['\'\'', Blockly.LittleMan.ORDER_ATOMIC];
    case 1:
      var element = Blockly.LittleMan.valueToCode(block, 'ADD0',
          Blockly.LittleMan.ORDER_NONE) || '\'\'';
      var code = 'String(' + element + ')';
      return [code, Blockly.LittleMan.ORDER_FUNCTION_CALL];
    case 2:
      var element0 = Blockly.LittleMan.valueToCode(block, 'ADD0',
          Blockly.LittleMan.ORDER_NONE) || '\'\'';
      var element1 = Blockly.LittleMan.valueToCode(block, 'ADD1',
          Blockly.LittleMan.ORDER_NONE) || '\'\'';
      var code = 'String(' + element0 + ') + String(' + element1 + ')';
      return [code, Blockly.LittleMan.ORDER_ADDITION];
    default:
      var elements = new Array(block.itemCount_);
      for (var i = 0; i < block.itemCount_; i++) {
        elements[i] = Blockly.LittleMan.valueToCode(block, 'ADD' + i,
            Blockly.LittleMan.ORDER_COMMA) || '\'\'';
      }
      var code = '[' + elements.join(',') + '].join(\'\')';
      return [code, Blockly.LittleMan.ORDER_FUNCTION_CALL];
  }
};

Blockly.LittleMan['text_append'] = function(block) {
  // Append to a variable in place.
  var varName = Blockly.LittleMan.variableDB_.getName(
      block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  var value = Blockly.LittleMan.valueToCode(block, 'TEXT',
      Blockly.LittleMan.ORDER_NONE) || '\'\'';
  return varName + ' = String(' + varName + ') + String(' + value + ');\n';
};

Blockly.LittleMan['text_length'] = function(block) {
  // String or array length.
  var text = Blockly.LittleMan.valueToCode(block, 'VALUE',
      Blockly.LittleMan.ORDER_FUNCTION_CALL) || '\'\'';
  return [text + '.length', Blockly.LittleMan.ORDER_MEMBER];
};

Blockly.LittleMan['text_isEmpty'] = function(block) {
  // Is the string null or array empty?
  var text = Blockly.LittleMan.valueToCode(block, 'VALUE',
      Blockly.LittleMan.ORDER_MEMBER) || '\'\'';
  return ['!' + text + '.length', Blockly.LittleMan.ORDER_LOGICAL_NOT];
};

Blockly.LittleMan['text_indexOf'] = function(block) {
  // Search the text for a substring.
  var operator = block.getFieldValue('END') == 'FIRST' ?
      'indexOf' : 'lastIndexOf';
  var substring = Blockly.LittleMan.valueToCode(block, 'FIND',
      Blockly.LittleMan.ORDER_NONE) || '\'\'';
  var text = Blockly.LittleMan.valueToCode(block, 'VALUE',
      Blockly.LittleMan.ORDER_MEMBER) || '\'\'';
  var code = text + '.' + operator + '(' + substring + ')';
  // Adjust index if using one-based indices.
  if (Blockly.LittleMan.ONE_BASED_INDEXING) {
    return [code + ' + 1', Blockly.LittleMan.ORDER_ADDITION];
  }
  return [code, Blockly.LittleMan.ORDER_FUNCTION_CALL];
};

Blockly.LittleMan['text_charAt'] = function(block) {
  // Get letter at index.
  // Note: Until January 2013 this block did not have the WHERE input.
  var where = block.getFieldValue('WHERE') || 'FROM_START';
  var textOrder = (where == 'RANDOM') ? Blockly.LittleMan.ORDER_NONE :
      Blockly.LittleMan.ORDER_MEMBER;
  var text = Blockly.LittleMan.valueToCode(block, 'VALUE',
      textOrder) || '\'\'';
  switch (where) {
    case 'FIRST':
      var code = text + '.charAt(0)';
      return [code, Blockly.LittleMan.ORDER_FUNCTION_CALL];
    case 'LAST':
      var code = text + '.slice(-1)';
      return [code, Blockly.LittleMan.ORDER_FUNCTION_CALL];
    case 'FROM_START':
      var at = Blockly.LittleMan.getAdjusted(block, 'AT');
      // Adjust index if using one-based indices.
      var code = text + '.charAt(' + at + ')';
      return [code, Blockly.LittleMan.ORDER_FUNCTION_CALL];
    case 'FROM_END':
      var at = Blockly.LittleMan.getAdjusted(block, 'AT', 1, true);
      var code = text + '.slice(' + at + ').charAt(0)';
      return [code, Blockly.LittleMan.ORDER_FUNCTION_CALL];
    case 'RANDOM':
      var functionName = Blockly.LittleMan.provideFunction_(
          'textRandomLetter',
          ['function ' + Blockly.LittleMan.FUNCTION_NAME_PLACEHOLDER_ +
              '(text) {',
           '  var x = Math.floor(Math.random() * text.length);',
           '  return text[x];',
           '}']);
      var code = functionName + '(' + text + ')';
      return [code, Blockly.LittleMan.ORDER_FUNCTION_CALL];
  }
  throw 'Unhandled option (text_charAt).';
};

/**
 * Returns an expression calculating the index into a string.
 * @private
 * @param {string} stringName Name of the string, used to calculate length.
 * @param {string} where The method of indexing, selected by dropdown in Blockly
 * @param {string=} opt_at The optional offset when indexing from start/end.
 * @return {string} Index expression.
 */
Blockly.LittleMan.text.getIndex_ = function(stringName, where, opt_at) {
  if (where == 'FIRST') {
    return '0';
  } else if (where == 'FROM_END') {
    return stringName + '.length - 1 - ' + opt_at;
  } else if (where == 'LAST') {
    return stringName + '.length - 1';
  } else {
    return opt_at;
  }
};

Blockly.LittleMan['text_getSubstring'] = function(block) {
  // Get substring.
  var text = Blockly.LittleMan.valueToCode(block, 'STRING',
      Blockly.LittleMan.ORDER_FUNCTION_CALL) || '\'\'';
  var where1 = block.getFieldValue('WHERE1');
  var where2 = block.getFieldValue('WHERE2');
  if (where1 == 'FIRST' && where2 == 'LAST') {
    var code = text;
  } else if (text.match(/^'?\w+'?$/) ||
      (where1 != 'FROM_END' && where1 != 'LAST' &&
      where2 != 'FROM_END' && where2 != 'LAST')) {
    // If the text is a variable or literal or doesn't require a call for
    // length, don't generate a helper function.
    switch (where1) {
      case 'FROM_START':
        var at1 = Blockly.LittleMan.getAdjusted(block, 'AT1');
        break;
      case 'FROM_END':
        var at1 = Blockly.LittleMan.getAdjusted(block, 'AT1', 1, false,
            Blockly.LittleMan.ORDER_SUBTRACTION);
        at1 = text + '.length - ' + at1;
        break;
      case 'FIRST':
        var at1 = '0';
        break;
      default:
        throw 'Unhandled option (text_getSubstring).';
    }
    switch (where2) {
      case 'FROM_START':
        var at2 = Blockly.LittleMan.getAdjusted(block, 'AT2', 1);
        break;
      case 'FROM_END':
        var at2 = Blockly.LittleMan.getAdjusted(block, 'AT2', 0, false,
            Blockly.LittleMan.ORDER_SUBTRACTION);
        at2 = text + '.length - ' + at2;
        break;
      case 'LAST':
        var at2 = text + '.length';
        break;
      default:
        throw 'Unhandled option (text_getSubstring).';
    }
    code = text + '.slice(' + at1 + ', ' + at2 + ')';
  } else {
    var at1 = Blockly.LittleMan.getAdjusted(block, 'AT1');
    var at2 = Blockly.LittleMan.getAdjusted(block, 'AT2');
    var getIndex_ = Blockly.LittleMan.text.getIndex_;
    var wherePascalCase = {'FIRST': 'First', 'LAST': 'Last',
      'FROM_START': 'FromStart', 'FROM_END': 'FromEnd'};
    var functionName = Blockly.LittleMan.provideFunction_(
        'subsequence' + wherePascalCase[where1] + wherePascalCase[where2],
        ['function ' + Blockly.LittleMan.FUNCTION_NAME_PLACEHOLDER_ +
        '(sequence' +
        // The value for 'FROM_END' and'FROM_START' depends on `at` so
        // we add it as a parameter.
        ((where1 == 'FROM_END' || where1 == 'FROM_START') ? ', at1' : '') +
        ((where2 == 'FROM_END' || where2 == 'FROM_START') ? ', at2' : '') +
        ') {',
          '  var start = ' + getIndex_('sequence', where1, 'at1') + ';',
          '  var end = ' + getIndex_('sequence', where2, 'at2') + ' + 1;',
          '  return sequence.slice(start, end);',
          '}']);
    var code = functionName + '(' + text +
        // The value for 'FROM_END' and 'FROM_START' depends on `at` so we
        // pass it.
        ((where1 == 'FROM_END' || where1 == 'FROM_START') ? ', ' + at1 : '') +
        ((where2 == 'FROM_END' || where2 == 'FROM_START') ? ', ' + at2 : '') +
        ')';
  }
  return [code, Blockly.LittleMan.ORDER_FUNCTION_CALL];
};

Blockly.LittleMan['text_changeCase'] = function(block) {
  // Change capitalization.
  var OPERATORS = {
    'UPPERCASE': '.toUpperCase()',
    'LOWERCASE': '.toLowerCase()',
    'TITLECASE': null
  };
  var operator = OPERATORS[block.getFieldValue('CASE')];
  var textOrder = operator ? Blockly.LittleMan.ORDER_MEMBER :
      Blockly.LittleMan.ORDER_NONE;
  var text = Blockly.LittleMan.valueToCode(block, 'TEXT',
      textOrder) || '\'\'';
  if (operator) {
    // Upper and lower case are functions built into JavaScript.
    var code = text + operator;
  } else {
    // Title case is not a native JavaScript function.  Define one.
    var functionName = Blockly.LittleMan.provideFunction_(
        'textToTitleCase',
        ['function ' + Blockly.LittleMan.FUNCTION_NAME_PLACEHOLDER_ +
            '(str) {',
         '  return str.replace(/\\S+/g,',
         '      function(txt) {return txt[0].toUpperCase() + ' +
            'txt.substring(1).toLowerCase();});',
         '}']);
    var code = functionName + '(' + text + ')';
  }
  return [code, Blockly.LittleMan.ORDER_FUNCTION_CALL];
};

Blockly.LittleMan['text_trim'] = function(block) {
  // Trim spaces.
  var OPERATORS = {
    'LEFT': ".replace(/^[\\s\\xa0]+/, '')",
    'RIGHT': ".replace(/[\\s\\xa0]+$/, '')",
    'BOTH': '.trim()'
  };
  var operator = OPERATORS[block.getFieldValue('MODE')];
  var text = Blockly.LittleMan.valueToCode(block, 'TEXT',
      Blockly.LittleMan.ORDER_MEMBER) || '\'\'';
  return [text + operator, Blockly.LittleMan.ORDER_FUNCTION_CALL];
};

Blockly.LittleMan['text_print'] = function(block) {
  // Print statement.
  var TEXT = block.getInputTargetBlock('TEXT');  
  var code = "";
  
  var address = Blockly.LittleMan.getAddress(TEXT);
  if (address == null) {
    code += '\n' + Blockly.LittleMan.instruction1('// calculate message');
    code += Blockly.LittleMan.valueToCode(block, 'TEXT', Blockly.LittleMan.ORDER_ASSIGNMENT) || '0';
  } else {
    code += '\n' + Blockly.LittleMan.instruction1('// load variable / constant');
    code += '\n' + Blockly.LittleMan.instruction2('LDA', address);
  }
  code += '\n' + Blockly.LittleMan.instruction1('OUT');
  return code;
};

Blockly.LittleMan['text_prompt_ext'] = function(block) {
  var addressInput = Blockly.LittleMan.makeTemp('0');
  var code = '\n' + Blockly.LittleMan.instruction1('INP');
  return [code, Blockly.LittleMan.ORDER_FUNCTION_CALL];
};

Blockly.LittleMan['text_prompt'] = Blockly.LittleMan['text_prompt_ext'];
