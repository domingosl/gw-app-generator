const fs = require('fs');
const path = require('path');


const dotEnv = {
    parse: content => {

        const obj = {};
        content.split("\n").forEach(line => {

            if(!line) return;

            const pair = line.split("=");

            if(pair.length !== 2) return;

            obj[pair[0]] = pair[1];

        });

        return obj;
    },
    serialize: obj => {

        let response = "";
        for(const key in obj) {
            response += key + "=" + obj[key] + "\n";
        }

        return response;
    }
}

module.exports = keyPairs => {

    const dotEnvPath = path.join(process.cwd(), '.env');

    let dotEnvObj;
    const results = { dotEnvFound: false };

    if(fs.existsSync(dotEnvPath)) {

        results.dotEnvFound = true;

        const dotEnvContent = fs.readFileSync(dotEnvPath, 'utf-8');

        dotEnvObj = dotEnv.parse(dotEnvContent);

    }
    else {
        dotEnvObj = {};
    }

    for(const key in keyPairs) {
        dotEnvObj[key] = keyPairs[key];
    }

    fs.writeFileSync(dotEnvPath, dotEnv.serialize(dotEnvObj));

    return results;

};