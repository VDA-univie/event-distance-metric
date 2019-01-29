const tape = require('tape');
const d3 = require('d3-selection');
require('../build/d3-extended');
const jsdom = require('jsdom');

tape('css - add style to element', test => {
  const document = jsdom.jsdom('<body><div id="test-div"></div></body>');
  const testDiv = d3.select(document).select('#test-div');
 
  testDiv.css('background', 'red');
  test.equal(testDiv.node().style.background, 'red');
  test.end();
});


tape('css - add multiple styles to element', test => {
  const document = jsdom.jsdom(`<body><div id="test-div"></div></body>`);
  const testDiv = d3.select(document).select('#test-div');
 
  testDiv.css({
    background:  'red',
    color : 'yellow'
  });

  test.equal(testDiv.node().style.background, 'red');
  test.equal(testDiv.node().style.color, 'yellow');
  test.end();
});
