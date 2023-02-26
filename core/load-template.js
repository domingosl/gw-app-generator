const ejs = require('ejs');
const fs = require('fs');
const path = require('path');

module.exports = (name, locals) => {

    const contents = fs.readFileSync(path.join(__dirname, '..', 'templates', (name + '.ejs')), 'utf-8');

    return ejs.render(contents, locals);

};