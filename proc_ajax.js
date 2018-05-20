var problemID = "01_01_01_01"; // notation: week_section_subsection_questionNumber

//default code:
function revert() {
  editor.setValue("background(0\);\ntext(\"hello world!\",20,50\);");
}

function storeInput() {
  code = state.default;
  correctedness = state.selectedChoice;
  if (code.length == 0) { 
    return;
  } else {
   var code = code.replace("+", "%2B");
   var code = code.replace("++", "%2B%2B");
	var code = code.replace("+++", "%2B%2B%2B"); //fixes a bug in php with parsing '+'
  var xmlhttp = new XMLHttpRequest();
  var outgoing = JSON.stringify({"problemID":problemID,"code":code, "correctedness":correctedness});
  xmlhttp.open("GET", "proc_ajax.php?json="+outgoing, true);
  xmlhttp.send();
}
}

(function(global) {

  var canvas = document.getElementById('sketch'),
  code = document.getElementById('code'),
  output = document.getElementById('output'),
  instance = null;

  function createCanvas() {
    // Make a new canvas, in case we're switching from 2D to 3D contexts.
    var container = document.getElementById('sketch-container');
    var sketch = document.getElementById('sketch');
    container.removeChild(sketch);

    sketch = document.createElement('canvas');
    sketch.id = 'sketch';
    container.appendChild(sketch);

    return sketch;
  }

  function waitForExit() {
    var checkbox = document.getElementById('expect-exit-callback');
    if (!checkbox) {
      return false;
    }
    return checkbox.checked || checkbox.value;
  }

  global.runSketch = function(callback) {
    state.default = code.value;
    gradeIncoming();
    storeInput();
    document.getElementById("output").innerHTML ="";
    try {
      output.value = '';
      canvas = createCanvas();
      var sketch = Processing.compile(code.value);

      if (callback) {
        if (!/exit\(\);/.test(code.value)) {
          throw "exit() not found in sketch. Add the exit() command, and re-run the sketch.";
        }
        sketch.onExit = callback;
        instance = new Processing(canvas, sketch);
      } else {
        instance = new Processing(canvas, sketch);
      }
    } catch (e) {
     var value = "Error:\n" + e.toString();
     document.getElementById("output").innerHTML ="<br><br>" + value + "<br>";
   }
 };


}(window));

var state = {
  default: '',
  selectedChoice: 'incorrect'
},
channel;

function gradeIncoming(){
  var i;
  var j=0;
  var s = [];
  var lines =  state.default.split("\n");
  for (i = 0; i < lines.length; i++) {
    // check if the text function has been called, do checks.
    var test = lines[i].search("text");
    if (test != -1){
      var test1 = lines[i].split("\"");
      if ((test1[1] == "i'm a coder") || (test1[1] == "I'm a coder") || (test1[1] == "i'm a coder!") || (test1[1] == "I'm a coder!") || (test1[1] == "i'm a coder.") || (test1[1] == "I'm a coder.")){
        state.selectedChoice = "correct";
      }
      else {
        state.selectedChoice = "incorrect";
      }	
    }
    else{
      state.selectedChoice = "incorrect";
    }
  }
}

var JSInputDemo = (function() {
  'use strict';
  // on dom loaded
  function getGrade() {
    // The following return value may or may not be used to grade server-side.
    // If getState and setState are used, then the Python grader also gets access
    // to the return value of getState and can choose it instead to grade.
    runSketch();
    return JSON.stringify(state.selectedChoice);
  }

  function getState() {
    // Returns the current state (which can be used for grading).
    return JSON.stringify(state);
  }

    // This function will be called with 1 argument when JSChannel is not used,
    // 2 otherwise. In the latter case, the first argument is a transaction
    // object that will not be used here
    // (see http://mozilla.github.io/jschannel/docs/)

    function setState() {
      var stateString = arguments.length === 1 ? arguments[0] : arguments[1];
      state = JSON.parse(stateString);
      editor.setValue(state.default);
    }

  // Establish a channel only if this application is embedded in an iframe.
  // This will let the parent window communicate with this application using
  // RPC and bypass SOP restrictions.
  if (window.parent !== window) {
    channel = Channel.build({
      window: window.parent,
      origin: '*',
      scope: 'JSInput'
    });

    channel.bind('getGrade', getGrade);
    channel.bind('getState', getState);
    channel.bind('setState', setState);
  }

  return {
    getState: getState,
    setState: setState,
    getGrade: getGrade
  };
}());
