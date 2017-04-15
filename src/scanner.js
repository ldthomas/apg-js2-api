// This module reads the input grammar file and does a preliminary analysis
//before attempting to parse it into a grammar object.
// See:<br> `abnf/input-analysis-grammar.bnf`<br>for the grammar file this parser is based on.
//
// It has two primary functions.
// - verify the character codes - no non-printing ASCII characters
// - catalog the lines - create an array with a line object for each line.
// The object carries information about the line number and character length which is used
// by the parser generator primarily for error reporting.
module.exports = function(chars, errors, strict, trace) {
  "use strict";
  var thisFileName = "scanner.js: ";
  var apglib = require("apg-lib");
  var grammar = new (require("./scanner-grammar.js"))();
  var callbacks = require("./scanner-callbacks").callbacks;
  
  /* Scan the grammar for character code errors and catalog the lines. */
  var lines = [];
  var parser = new apglib.parser();
  parser.ast = new apglib.ast();
  parser.ast.callbacks = callbacks;
  if (trace) {
    if (trace.traceObject !== "traceObject") {
      throw new TypError(thisFileName + "trace argument is not a trace object");
    }
    parser.trace = trace;
  }

  /* parse the input SABNF grammar */
  var test = parser.parse(grammar, 'file', chars);
  if (test.success !== true) {
    errors.push({
      line : 0,
      char : 0,
      msg : "syntax analysis error analyzing input SABNF grammar"
    });
    return;
  }
  var data = {
    lines : lines,
    lineNo : 0,
    errors : errors,
    strict : (strict ? true : false)
  };

  /* translate (analyze) the input SABNF grammar */
  parser.ast.translate(data);
  return lines;
}
