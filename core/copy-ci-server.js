const fs = require('fs');
const path = require('path');


module.exports = () => {


    const contents = fs.readFileSync(path.join(__dirname, '..', 'ci-server.js'), 'utf-8');

    fs.writeFileSync(path.join(process.cwd(), 'ci-server.js'), contents);


}