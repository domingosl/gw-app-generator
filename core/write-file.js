const fs = require('fs');
const path = require('path');

module.exports = (name, content) => {

    fs.writeFileSync(path.join(__dirname, '..', name), content);

};