const fs = require('fs');
const http = require('http');
const path = require('path');
const crypto = require('crypto');
const childProcess = require('child_process');

const logger = function() {
    console.log("[GWCI]", ...arguments);
};

const config = (() => {

    const content = fs.readFileSync(path.join(__dirname, '.env'), 'utf-8');

    const obj = {};
    content.split("\n").forEach(line => {

        if(!line) return;

        const pair = line.split("=");

        if(pair.length !== 2) return;

        obj[pair[0]] = pair[1];

    });

    return obj;

})();

const verifyGithubSign = (sign, secret, body, ) => {

    if(!sign)
        throw new Error("Github signature cannot be empty");

    const hash = "sha1=" + crypto.createHmac('sha1', secret).update(JSON.stringify(body)).digest('hex');

    if(hash !== sign)
        throw new Error("Signature is not valid");

};

const httpServer = (GW_CI_SERVER_PORT, GW_CI_SERVER_GITHUB_SECRET, handler) => {

    const server = http.createServer(function(req, res) {

        if (req.method !== 'POST' || req.headers['content-type'] !== 'application/json') {
            logger("Invalid method or content type", { method: req.method, contentType: req.headers['content-type'] });
            res.writeHead(403, {'Content-Type': 'text/html'});
            return res.end('KO!');
        }

        let body = '';

        req.on('data', data => body += data);

        req.on('end', function() {

            try {
                body = JSON.parse(body);

                verifyGithubSign(req.headers['x-hub-signature'], GW_CI_SERVER_GITHUB_SECRET, body);

                res.writeHead(200, {'Content-Type': 'text/html'});
                res.end('OK!');
                handler({ body, headers: req.headers });
            }
            catch (error) {
                logger("Invalid request", { error: error.message ? error.message : error });
                res.writeHead(403, {'Content-Type': 'text/html'});
                res.end('KO!');
            }
        })

    });


    server.listen(GW_CI_SERVER_PORT);

    logger("HTTP server ready!", { GW_CI_SERVER_PORT });

};


(async () => {

    try {

        let app = childProcess.exec('node test-app');
        app.stdout.pipe(process.stdout);

        app.on('exit', function() {
            logger(`App process exited with code ${code}`);
        });

        httpServer(config.GW_CI_SERVER_PORT, config.GW_CI_SERVER_GITHUB_SECRET, req => {

            logger("Hook received!", req);

            const gitProcess = childProcess.exec('git pull');
            gitProcess.on('exit', function() {
                logger("Git pull completed!, killing app");
                app.kill();
                app = childProcess.exec('node test-app');
            });

        });


    } catch (e) {
        console.log("--->", e);
        logger(e.message ? e.message : e);
    }


})();
