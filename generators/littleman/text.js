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


Blockly.LittleMan['text_print'] = function(block) {
  // Print statement.
  var TEXT = block.getInputTargetBlock('TEXT');  
  var code = "";
  
  var address = Blockly.LittleMan.getAddress(TEXT);
  if (address == null) {
    //code += '\n' + Blockly.LittleMan.instruction1('// calculate message');
    code += Blockly.LittleMan.valueToCode(block, 'TEXT', Blockly.LittleMan.ORDER_ASSIGNMENT) || '0';
  } else {
    //code += '\n' + Blockly.LittleMan.instruction1('// load variable / constant');
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
