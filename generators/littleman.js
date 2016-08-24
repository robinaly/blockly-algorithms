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
 * @fileoverview Helper functions for generating JavaScript for blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.LittleMan');

goog.require('Blockly.Generator');


/**
 * JavaScript code generator.
 * @type {!Blockly.Generator}
 */
Blockly.LittleMan = new Blockly.Generator('LittleMan');

/**
 * List of illegal variable names.
 * This is not intended to be a security feature.  Blockly is 100% client-side,
 * so bypassing this list is trivial.  This is intended to prevent users from
 * accidentally clobbering a built-in object or function.
 * @private
 */
Blockly.LittleMan.addReservedWords(
);

/**
 * Order of operation ENUMs.
 * https://developer.mozilla.org/en/JavaScript/Reference/Operators/Operator_Precedence
 */
Blockly.LittleMan.ORDER_ATOMIC = 0;           // 0 "" ...
Blockly.LittleMan.ORDER_NEW = 1.1;            // new
Blockly.LittleMan.ORDER_MEMBER = 1.2;         // . []
Blockly.LittleMan.ORDER_FUNCTION_CALL = 2;    // ()
Blockly.LittleMan.ORDER_INCREMENT = 3;        // ++
Blockly.LittleMan.ORDER_DECREMENT = 3;        // --
Blockly.LittleMan.ORDER_BITWISE_NOT = 4.1;    // ~
Blockly.LittleMan.ORDER_UNARY_PLUS = 4.2;     // +
Blockly.LittleMan.ORDER_UNARY_NEGATION = 4.3; // -
Blockly.LittleMan.ORDER_LOGICAL_NOT = 4.4;    // !
Blockly.LittleMan.ORDER_TYPEOF = 4.5;         // typeof
Blockly.LittleMan.ORDER_VOID = 4.6;           // void
Blockly.LittleMan.ORDER_DELETE = 4.7;         // delete
Blockly.LittleMan.ORDER_DIVISION = 5.1;       // /
Blockly.LittleMan.ORDER_MULTIPLICATION = 5.2; // *
Blockly.LittleMan.ORDER_MODULUS = 5.3;        // %
Blockly.LittleMan.ORDER_SUBTRACTION = 6.1;    // -
Blockly.LittleMan.ORDER_ADDITION = 6.2;       // +
Blockly.LittleMan.ORDER_BITWISE_SHIFT = 7;    // << >> >>>
Blockly.LittleMan.ORDER_RELATIONAL = 8;       // < <= > >=
Blockly.LittleMan.ORDER_IN = 8;               // in
Blockly.LittleMan.ORDER_INSTANCEOF = 8;       // instanceof
Blockly.LittleMan.ORDER_EQUALITY = 9;         // == != === !==
Blockly.LittleMan.ORDER_BITWISE_AND = 10;     // &
Blockly.LittleMan.ORDER_BITWISE_XOR = 11;     // ^
Blockly.LittleMan.ORDER_BITWISE_OR = 12;      // |
Blockly.LittleMan.ORDER_LOGICAL_AND = 13;     // &&
Blockly.LittleMan.ORDER_LOGICAL_OR = 14;      // ||
Blockly.LittleMan.ORDER_CONDITIONAL = 15;     // ?:
Blockly.LittleMan.ORDER_ASSIGNMENT = 16;      // = += -= *= /= %= <<= >>= ...
Blockly.LittleMan.ORDER_COMMA = 17;           // ,
Blockly.LittleMan.ORDER_NONE = 99;            // (...)

/**
 * List of outer-inner pairings that do NOT require parentheses.
 * @type {!Array.<!Array.<number>>}
 */
Blockly.LittleMan.ORDER_OVERRIDES = [
  // (foo()).bar -> foo().bar
  // (foo())[0] -> foo()[0]
  [Blockly.LittleMan.ORDER_FUNCTION_CALL, Blockly.LittleMan.ORDER_MEMBER],
  // (foo())() -> foo()()
  [Blockly.LittleMan.ORDER_FUNCTION_CALL, Blockly.LittleMan.ORDER_FUNCTION_CALL],
  // (foo.bar).baz -> foo.bar.baz
  // (foo.bar)[0] -> foo.bar[0]
  // (foo[0]).bar -> foo[0].bar
  // (foo[0])[1] -> foo[0][1]
  [Blockly.LittleMan.ORDER_MEMBER, Blockly.LittleMan.ORDER_MEMBER],
  // (foo.bar)() -> foo.bar()
  // (foo[0])() -> foo[0]()
  [Blockly.LittleMan.ORDER_MEMBER, Blockly.LittleMan.ORDER_FUNCTION_CALL],

  // !(!foo) -> !!foo
  [Blockly.LittleMan.ORDER_LOGICAL_NOT, Blockly.LittleMan.ORDER_LOGICAL_NOT],
  // a * (b * c) -> a * b * c
  [Blockly.LittleMan.ORDER_MULTIPLICATION, Blockly.LittleMan.ORDER_MULTIPLICATION],
  // a + (b + c) -> a + b + c
  [Blockly.LittleMan.ORDER_ADDITION, Blockly.LittleMan.ORDER_ADDITION],
  // a && (b && c) -> a && b && c
  [Blockly.LittleMan.ORDER_LOGICAL_AND, Blockly.LittleMan.ORDER_LOGICAL_AND],
  // a || (b || c) -> a || b || c
  [Blockly.LittleMan.ORDER_LOGICAL_OR, Blockly.LittleMan.ORDER_LOGICAL_OR]
];

/**
 * Allow for switching between one and zero based indexing for lists and text,
 * one based by default.
 */
Blockly.LittleMan.ONE_BASED_INDEXING = true;

Blockly.LittleMan.WHITE = '    ';

Blockly.LittleMan.CONST_COUNT = 0;

Blockly.LittleMan.LABEL_COUNT = 0;

Blockly.LittleMan.INDENT = '';

/**
 * Initialise the database of variable names.
 * @param {!Blockly.Workspace} workspace Workspace to generate code from.
 */
Blockly.LittleMan.init = function(workspace) {
  // Create a dictionary of definitions to be printed before the code.
  Blockly.LittleMan.definitions_ = Object.create(null);
  // Create a dictionary mapping desired function names in definitions_
  // to actual function names (to avoid collisions with user functions).
  Blockly.LittleMan.functionNames_ = Object.create(null);

  if (!Blockly.LittleMan.variableDB_) {
    Blockly.LittleMan.variableDB_ =
        new Blockly.Names(Blockly.LittleMan.RESERVED_WORDS_);
  } else {
    Blockly.LittleMan.variableDB_.reset();
  }

  var defvars = [];
  var variables = Blockly.Variables.allVariables(workspace);
  if (variables.length) {
    for (var i = 0; i < variables.length; i++) {
      defvars[i] = Blockly.LittleMan.instruction3(Blockly.LittleMan.variableDB_.getName(variables[i], Blockly.Variables.NAME_TYPE), "DAT", '0');
    }
  }
  defvars[defvars.length] = Blockly.LittleMan.instruction3('zero', "DAT", '0');
  defvars[defvars.length] = Blockly.LittleMan.instruction3('one', "DAT", '1');
  Blockly.LittleMan.definitions_['variables'] = defvars.join('\n');
  
};

/**
 * Prepend the generated code with the variable definitions.
 * @param {string} code Generated code.
 * @return {string} Completed code.
 */
Blockly.LittleMan.finish = function(code) {
  // Convert the definitions dictionary into a list.
  var definitions = [];
  for (var name in Blockly.LittleMan.definitions_) {
    definitions.push(Blockly.LittleMan.definitions_[name]);
  }
  // Clean up temporary data.
  delete Blockly.LittleMan.definitions_;
  delete Blockly.LittleMan.functionNames_;
  Blockly.LittleMan.variableDB_.reset();
  return code + '\n' + Blockly.LittleMan.instruction1('HLT') + '\n\n' + definitions.join('\n');
};

Blockly.LittleMan.instruction3 = function(label, inst, argument) {
  var ret = label;
  for (var i=0; i<15-label.length; i++) {
    ret += ' ';
  }
  ret += inst;
  for (var i=0; i<5-inst.length; i++) {
    ret += ' ';
  }
  ret += argument;
  return ret;
};
Blockly.LittleMan.instruction2 = function(inst, argument) {
  return Blockly.LittleMan.instruction3('', inst, argument);
};
Blockly.LittleMan.instruction1 = function(inst) {
  return Blockly.LittleMan.instruction3('', inst,'');
};
Blockly.LittleMan.makeTemp = function(init) {
  var const_idx = Blockly.LittleMan.CONST_COUNT;
  Blockly.LittleMan.CONST_COUNT++;
  var TAG = 'temp' + const_idx;
  Blockly.LittleMan.definitions_['%' + TAG] = Blockly.LittleMan.instruction3(TAG, 'DAT', init);
  return TAG;
};
Blockly.LittleMan.makeTempConst = function(init) {
  if (init == '1' || init == 1) {
    return 'one';
  }
  if (init == '0' || init == 0) {
    return 'zero';
  }
  return Blockly.LittleMan.makeTemp(init);
};

Blockly.LittleMan.getAddress = function(block) {
  if (block.type == 'math_number') {
    var val = parseFloat(block.getFieldValue('NUM'));
    return Blockly.LittleMan.makeTempConst(val);
  } else if (block.type == 'variables_get') {
    return Blockly.LittleMan.variableDB_.getName(block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  } else {
    return null;
  }
};


Blockly.LittleMan.getLabel = function(prefix) {
  var const_idx = Blockly.LittleMan.LABEL_COUNT;
  Blockly.LittleMan.LABEL_COUNT++;
  var TAG = prefix + const_idx;
  return TAG;
};

/**
 * Naked values are top-level blocks with outputs that aren't plugged into
 * anything.  A trailing semicolon is needed to make this legal.
 * @param {string} line Line of generated code.
 * @return {string} Legal line of code.
 */
Blockly.LittleMan.scrubNakedValue = function(line) {
  return line + ';\n';
};

/**
 * Encode a string as a properly escaped JavaScript string, complete with
 * quotes.
 * @param {string} string Text to encode.
 * @return {string} JavaScript string.
 * @private
 */
Blockly.LittleMan.quote_ = function(string) {
  // Can't use goog.string.quote since Google's style guide recommends
  // JS string literals use single quotes.
  string = string.replace(/\\/g, '\\\\')
                 .replace(/\n/g, '\\\n')
                 .replace(/'/g, '\\\'');
  return '\'' + string + '\'';
};

/**
 * Common tasks for generating JavaScript from blocks.
 * Handles comments for the specified block and any connected value blocks.
 * Calls any statements following this block.
 * @param {!Blockly.Block} block The current block.
 * @param {string} code The JavaScript code created for this block.
 * @return {string} JavaScript code with comments and subsequent blocks added.
 * @private
 */
Blockly.LittleMan.scrub_ = function(block, code) {
  var commentCode = '';
  // Only collect comments for blocks that aren't inline.
  if (!block.outputConnection || !block.outputConnection.targetConnection) {
    // Collect comment for this block.
    var comment = block.getCommentText();
    comment = Blockly.utils.wrap(comment, Blockly.LittleMan.COMMENT_WRAP - 3);
    if (comment) {
      if (block.getProcedureDef) {
        // Use a comment block for function comments.
        commentCode += '/**\n' +
                       Blockly.LittleMan.prefixLines(comment + '\n', ' * ') +
                       ' */\n';
      } else {
        commentCode += Blockly.LittleMan.prefixLines(comment + '\n', '// ');
      }
    }
    // Collect comments for all value arguments.
    // Don't collect comments for nested statements.
    for (var i = 0; i < block.inputList.length; i++) {
      if (block.inputList[i].type == Blockly.INPUT_VALUE) {
        var childBlock = block.inputList[i].connection.targetBlock();
        if (childBlock) {
          var comment = Blockly.LittleMan.allNestedComments(childBlock);
          if (comment) {
            commentCode += Blockly.LittleMan.prefixLines(comment, '// ');
          }
        }
      }
    }
  }
  var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  var nextCode = Blockly.LittleMan.blockToCode(nextBlock);
  return commentCode + code + nextCode;
};

/**
 * Gets a property and adjusts the value while taking into account indexing.
 * @param {!Blockly.Block} block The block.
 * @param {string} atId The property ID of the element to get.
 * @param {number=} opt_delta Value to add.
 * @param {boolean=} opt_negate Whether to negate the value.
 * @param {number=} opt_order The highest order acting on this value.
 * @return {string|number}
 */
Blockly.LittleMan.getAdjusted = function(block, atId, opt_delta, opt_negate,
    opt_order) {
  var delta = opt_delta || 0;
  var order = opt_order || Blockly.LittleMan.ORDER_NONE;
  if (Blockly.LittleMan.ONE_BASED_INDEXING) {
    delta--;
  }
  var defaultAtIndex = Blockly.LittleMan.ONE_BASED_INDEXING ? '1' : '0';
  if (delta > 0) {
    var at = Blockly.LittleMan.valueToCode(block, atId,
        Blockly.LittleMan.ORDER_ADDITION) || defaultAtIndex;
  } else if (delta < 0) {
    var at = Blockly.LittleMan.valueToCode(block, atId,
        Blockly.LittleMan.ORDER_SUBTRACTION) || defaultAtIndex;
  } else if (opt_negate) {
    var at = Blockly.LittleMan.valueToCode(block, atId,
        Blockly.LittleMan.ORDER_UNARY_NEGATION) || defaultAtIndex;
  } else {
    var at = Blockly.LittleMan.valueToCode(block, atId, order) ||
        defaultAtIndex;
  }

  if (Blockly.isNumber(at)) {
    // If the index is a naked number, adjust it right now.
    at = parseFloat(at) + delta;
    if (opt_negate) {
      at = -at;
    }
  } else {
    // If the index is dynamic, adjust it in code.
    if (delta > 0) {
      at = at + ' + ' + delta;
      var innerOrder = Blockly.LittleMan.ORDER_ADDITION;
    } else if (delta < 0) {
      at = at + ' - ' + -delta;
      var innerOrder = Blockly.LittleMan.ORDER_SUBTRACTION;
    }
    if (opt_negate) {
      if (delta) {
        at = '-(' + at + ')';
      } else {
        at = '-' + at;
      }
      var innerOrder = Blockly.LittleMan.ORDER_UNARY_NEGATION;
    }
    innerOrder = Math.floor(innerOrder);
    order = Math.floor(order);
    if (innerOrder && order >= innerOrder) {
      at = '(' + at + ')';
    }
  }
  return at;
};
