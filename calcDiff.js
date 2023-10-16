function splitWords(text) {

  const input = document.createElement('p');
  const output = [];
  const sel = window.getSelection();

  input.textContent = text.replace(/ /g, ' !!! ');
  input.style.cssText = 'position: absolute; top: -100px; ';
  document.body.appendChild(input);
  sel.collapse(input, 0);
  var start = 0;
  var end = 0;

  while(end < input.textContent.length) {
    sel.modify('extend', 'forward', 'word');
    end = sel.focusOffset;
    output.push(
      input
        .textContent
        .substring(start, end)
        .trim()
    );
    start = end;
  }

  document.body.removeChild(input);
  return output;

}

function cleanupText(txt) {
  return txt
    .replace(/  +/g, ' ')
    .replace(/^\s+|\s+$/g, '')
    .split('\n');
}

function compareWords() {

  const selectedElems = document.querySelectorAll('.selected');
  const lineCompare = document.getElementById('lineCompare');
  
  if (selectedElems.length === 3) {
    
    const wordDiff = patienceDiffPlus(
      splitWords( selectedElems[0].textContent ),
      splitWords( selectedElems[1].textContent )
    );
    
    var diffWords = '';
    wordDiff.lines.forEach(o => {
      if (o.line.trim() === '!!!') {
        diffWords += ' ';
      } else if (o.bIndex < 0 && o.moved) {
        diffWords += `<span class="remove">${o.line}</span>`;
      } else if (o.moved) {
        diffWords += `<span class="add">${o.line}</span>`;
      } else if (o.aIndex < 0) {
        diffWords += `<span class="add">${o.line}</span>`;
      } else if (o.bIndex < 0) {
        diffWords += `<span class="remove">${o.line}</span>`;
      } else {
        diffWords += o.line;
      }

    });
    
    lineCompare.innerHTML = '<b>Compare words results: </b><br />' + diffWords;
    
  } else {
    lineCompare.innerHTML = '<b>Select two lines to compare words.</b>';
  }

}

function calcDiff(evt) {
  const a = cleanupText( document.getElementById('a').value );
  const b = cleanupText( document.getElementById('b').value );
  const diff = patienceDiffPlus(a , b);
  
  var diffLines = '';
  diff.lines.forEach(o => {
    if (o.bIndex < 0 && o.moved) {
      diffLines += `<p class="remove">${o.line}</p>`;
    } else if (o.moved) {
      diffLines += `<p class="add">${o.line}</p>`;
    } else if (o.aIndex < 0) {
      diffLines += `<p class="add">${o.line}</p>`;
    } else if (o.bIndex < 0) {
      diffLines += `<p class="remove">${o.line}</p>`;
    } else {
      diffLines += `<p>${o.line}</p>`;
    }
  });
  diffLines += '<div id="lineCompare" contenteditable><b>Select two lines to compare words.</b></div>';
  document.getElementById("diff").innerHTML = diffLines;
  
  document
    .querySelectorAll('p.add, p.remove')
    .forEach( elem => {

      elem.addEventListener(
        'mouseover',
        evt => elem.classList.add('over'),
      );

      elem.addEventListener(
        'mouseout',
        evt => elem.classList.remove('over'),
      );

      elem.addEventListener(
        'mouseup',
        evt => {
          const elem = evt.target;
          if (elem.classList.contains('selected')) {
            elem.classList.remove('selected');
          } else {
            elem.classList.add('selected');
          }
          compareWords();
        },
      );

    }
  );
  
}

(function init() {
  addEventListener(
    'load',
    evt => {
      document
        .getElementById('a')
        .addEventListener('input', calcDiff);
      document
        .getElementById('b')
        .addEventListener('input', calcDiff);
    },
  )
})();
