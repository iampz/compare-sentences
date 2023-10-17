(function calcDiff() {

  function diffHtml(args={}) {
    
    var results = [];
    
    if (!args.sentences) {
      results.push('<p class="alert">Input both sentences to compare.</p>');
    } else if (!args.isDiff && !args.canCompare) {
      results.push('<p class="alert">No differeces in both sentences.</p>');
    } else {
      if (!args.canCompare) {
        results.push('<p class="alert">Differeces detected.</p>');
      } else {
        if (args.linesSelected !== 2)
          results.push('<p class="alert">Differeces detected, select two lines to compare words.</p>');
        if (args.linesSelected === 2)
          results.push(
            '<p class="alert">Compare words results:</p>',
            `<p id="diffContent" contenteditable>${args.diffWords}</p>`,
          );
      }
      if (args.linesSelected)
        results.push('<button id="diffClear">Deselect all lines</button>');
      if (args.wrapDiv)
        results = ['<div id="lineCompare">', ...results, '</div>'];
    }
    
    return results.join('');

  }

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
      .replace(/^\s+|\s+$/g, '');
  }

  function deselect() {
    const selectedElems = document.querySelectorAll('#diff .selected');
    selectedElems.forEach(
      elem => elem.classList.remove('selected')
    );
    wordDiff();
  }

  function wordDiff() {

    const selectedElems = document.querySelectorAll('#diff .selected');
    const lineCompare = document.getElementById('lineCompare');
    
    if (selectedElems.length === 2) {
      
      const wDiff = patienceDiffPlus(
        splitWords( selectedElems[0].textContent ),
        splitWords( selectedElems[1].textContent )
      );
      
      var diffWords = '';
      wDiff.lines.forEach(o => {
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
      
    }
    
    lineCompare.innerHTML = diffHtml({
      sentences: true,
      isDiff: true,
      canCompare: true,
      linesSelected: selectedElems.length,
      diffWords: diffWords,
    });
    
    const diffClear = document.getElementById('diffClear');
    if (diffClear) diffClear.addEventListener('click', deselect);
    
  }

  function lineDiff(evt) {
    
    const a = cleanupText( document.getElementById('a').value );
    const b = cleanupText( document.getElementById('b').value );

    if (!a && !b) {
      document.getElementById('diff').innerHTML = diffHtml();
      return false;
    }
    
    var diffLines = '';
    var diffMatrix = [0,0];
    const diff = patienceDiffPlus(
      a.split('\n'),
      b.split('\n'),
    );

    diff.lines.forEach(o => {
      if (o.line) {
        if (o.bIndex < 0 && o.moved) {
          diffLines += `<p class="remove">${o.line}</p>`;
          diffMatrix[0] = 1;
        } else if (o.moved) {
          diffLines += `<p class="add">${o.line}</p>`;
          diffMatrix[1] = 1;
        } else if (o.aIndex < 0) {
          diffLines += `<p class="add">${o.line}</p>`;
          diffMatrix[1] = 1;
        } else if (o.bIndex < 0) {
          diffLines += `<p class="remove">${o.line}</p>`;
          diffMatrix[0] = 1;
        } else {
          diffLines += `<p>${o.line}</p>`;
        }
      }
    });
    
    diffLines += '<hr class="separator" />' + diffHtml({
      sentences: true,
      isDiff: diffMatrix[0] || diffMatrix[1],
      canCompare: diffMatrix[0] && diffMatrix[1],
      wrapDiv: true,
    });
          
    document.getElementById('diff').innerHTML = diffLines;
    
    if (diffMatrix[0] && diffMatrix[1]) {

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
              wordDiff();
            },
          );

        });
      
    }
    
  }

  (function init() {

    const a = document.getElementById('a');
    const b = document.getElementById('b');
    addEventListener(
      'load',
      evt => {
        a.focus();
        a.addEventListener('input', lineDiff);
        b.addEventListener('input', lineDiff);
      },
    )

    if (autorun) {
        addEventListener(
          'load',
          evt => {
            a.blur();
            lineDiff();
            const diff = document.getElementById('diff');
            diff
              .childNodes[3]
              .classList
              .add('selected');
            diff
              .childNodes[7]
              .classList
              .add('selected');
            wordDiff();
          },
        );
    }

  })();

})();
