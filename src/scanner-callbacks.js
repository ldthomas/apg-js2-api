/* AST translation callback functions used to analyze the lines. */
var apglib = require("apg-lib");
var id = apglib.ids;
function semLine(state, chars, phraseIndex, phraseCount, data) {
  if (state == id.SEM_PRE) {
    data.endLength = 0;
    data.textLength = 0;
    data.invalidCount = 0;
  } else {
    data.lines.push({
      lineNo : data.lines.length,
      beginChar : phraseIndex,
      length : phraseCount,
      textLength : data.textLength,
      endType : data.endType,
      invalidChars : data.invalidCount
    });
  }
  return id.SEM_OK;
}
function semLineText(state, chars, phraseIndex, phraseCount, data) {
  if (state == id.SEM_PRE) {
    data.textLength = phraseCount;
  }
  return id.SEM_OK;
}
function semLastLine(state, chars, phraseIndex, phraseCount, data) {
  if (state == id.SEM_PRE) {
    data.endLength = 0;
    data.textLength = 0;
    data.invalidCount = 0;
  } else {
    if(data.strict){
      data.lines.push({
        lineNo : data.lines.length,
        beginChar : phraseIndex,
        length : phraseCount,
        textLength : phraseCount,
        endType : "none",
        invalidChars : data.invalidCount
      });
      data.errors.push({
        line : data.lineNo,
        char : phraseIndex + phraseCount,
        msg : "no line end on last line - strict ABNF specifies CRLF(\\r\\n, \\x0D\\x0A)"
      });
    }else{
      /* add a line ender */
      chars.push(10);
      data.lines.push({
        lineNo : data.lines.length,
        beginChar : phraseIndex,
        length : phraseCount+1,
        textLength : phraseCount,
        endType : "LF",
        invalidChars : data.invalidCount
      });
    }
  }
  return id.SEM_OK;
}
function semInvalid(state, chars, phraseIndex, phraseCount, data) {
  if (state == id.SEM_PRE) {
    data.errors.push({
      line : data.lineNo,
      char : phraseIndex,
      msg : "invalid character found '\\x" + apglib.utils.charToHex(chars[phraseIndex]) + "'"
    });
  }
  return id.SEM_OK;
}
function semEnd(state, chars, phraseIndex, phraseCount, data) {
  if (state == id.SEM_POST) {
    data.lineNo += 1;
  }
  return id.SEM_OK;
}
function semLF(state, chars, phraseIndex, phraseCount, data) {
  if (state == id.SEM_PRE) {
    data.endType = "LF";
    if (data.strict) {
      data.errors.push({
        line : data.lineNo,
        char : phraseIndex,
        msg : "line end character LF(\\n, \\x0A) - strict ABNF specifies CRLF(\\r\\n, \\x0D\\x0A)"
      });
    }
  }
  return id.SEM_OK;
}
function semCR(state, chars, phraseIndex, phraseCount, data) {
  if (state == id.SEM_PRE) {
    data.endType = "CR";
    if (data.strict) {
      data.errors.push({
        line : data.lineNo,
        char : phraseIndex,
        msg : "line end character CR(\\r, \\x0D) - strict ABNF specifies CRLF(\\r\\n, \\x0D\\x0A)"
      });
    }
  }
  return id.SEM_OK;
}
function semCRLF(state, chars, phraseIndex, phraseCount, data) {
  if (state == id.SEM_PRE) {
    data.endType = "CRLF";
  }
  return id.SEM_OK;
}
var callbacks = [];
callbacks["line"] = semLine;
callbacks["line-text"] = semLineText;
callbacks["last-line"] = semLastLine;
callbacks["invalid"] = semInvalid;
callbacks["end"] = semEnd;
callbacks["lf"] = semLF;
callbacks["cr"] = semCR;
callbacks["crlf"] = semCRLF;
exports.callbacks = callbacks;