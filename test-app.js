const http = require('http');

const server = http.createServer(function (req, res) {


    let body = '';

    req.on('data', data => body += data);

    req.on('end', function () {

        console.log("Data received!");

        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end('OK!');

    })

});


server.listen(8085);
console.log("Test App running!");