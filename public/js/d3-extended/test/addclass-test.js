const tape = require('tape');
const d3 = require('d3-selection');
require('../build/d3-extended');
const jsdom = require('jsdom');

tape('addclass - class added to element', test => {
  const document = jsdom.jsdom(
    `<body>
      <h1 class='c1 c2'>hello</h1>
      <h1 class='c3'></h1>
    </body>`);
  const body = d3.select(document).select('body').addClass('c3');

  console.log(d3.select(document).select('body'))

  test.ok(body.classed('c3'));
  test.equal(body.node().classList.length, 1);
  test.end();
});

tape('addclass - two classes added to element', test => {
  const document = jsdom.jsdom(
    `<body>
      <h1 class='c1 c2'>hello</h1>
      <h1 class='c3'></h1>
    </body>`);
  const body = d3.select(document).select('body').addClass('c3 c4');

  test.ok(body.classed('c3'));
  test.ok(body.classed('c4'));
  test.equal(body.node().classList.length, 2);
  test.end();
});
