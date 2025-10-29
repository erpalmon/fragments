const MarkdownIt = require('markdown-it');
const md = new MarkdownIt();

function mdToHtml(input) {
  const text = Buffer.isBuffer(input) ? input.toString('utf8') : String(input);
  return Buffer.from(md.render(text), 'utf8');
}

module.exports = { mdToHtml };
