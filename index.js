process.title = 'GrowishPay-App-Generator';


const term = require('terminal-kit').terminal;
const loadTemplate = require('./core/load-template');
const writeFile = require('./core/write-file');
const editDotEnv = require('./core/edit-dotenv');
const copyCiServer = require('./core/copy-ci-server');

term.on( 'key' , function( name ) {
    if ( name === 'CTRL_C' ) {
        term.red("\nHard quit!");
        term.processExit();
    }
} ) ;



(async ()=>{

    let dockerCompose;
    let dockerFile;
    let ciServerPort;

    term.clear();

    term().yellow("GrowishPay App Generator").nextLine().nextLine();

    term("What would you like to add? ");
    const genType = await term.singleLineMenu(
        [
            'CI server + Dockerization',
            'Only CI server',
            'Only Dockerization'
        ]
    ).promise;

    term().nextLine();

    term("Type of app:");
    const appType = (await term.singleLineMenu(
        [
            'NestJS',
            'Vanilla NodeJS app'
        ]
    ).promise).selectedText;

    term().nextLine();

    term("Package Manager:");
    const packageManager = (await term.singleLineMenu(
        [
            'YARN',
            'NPM'
        ]
    ).promise).selectedText;

    term().nextLine();

    let cmd;
    if(appType === 'Vanilla NodeJS app') {
        term("Command for running the application: ");
        cmd = await term.inputField().promise;
    } else
        cmd = packageManager + ' build && ' + packageManager + ' start';

    term().nextLine();


    //CI SERVER Setup
    if(genType.selectedIndex <= 1) {

        term()
            .green('CI SERVER SETUP\n');

        term("CI server port: ");
        ciServerPort = await term.inputField().promise;

        term().nextLine();

        term("Github webhook secret: ");
        const githubWebhookSecret = await term.inputField().promise;

        term().nextLine();


        const dotEnvResults = editDotEnv({
            GW_CI_SERVER_GITHUB_SECRET: githubWebhookSecret,
            GW_CI_SERVER_PORT: ciServerPort,
            GW_CI_SERVER_CMD:  cmd
        });


        if(dotEnvResults.dotEnvFound)
            term()
                .yellow("\nA .env file was ")
                .red("FOUND")
                .yellow(" and the necessary keys has been added\n");
        else
            term()
                .yellow("\nA .env file was ")
                .red("CREATED")
                .yellow(" and the necessary keys has been added. ")
                .yellow("Remember, DO NOT commit this file to the repository\n");


        copyCiServer();

        term().nextLine();
        term().red("ci-server.js").yellow(" was added to the root of your project. This file needs to be added to GIT and committed.")
        term().nextLine();


    }

    //Docker Setup
    if(genType.selectedIndex === 0 || genType.selectedIndex === 2) {

        term()
            .green('DOCKER SETUP\n');


        term("Node major version:");
        const nodeVer = (await term.singleLineMenu(
            [
                '14',
                '15',
                '16',
                '17'
            ]
        ).promise).selectedText;

        term().nextLine();

        term("Service name: ");
        const serviceName = await term.inputField().promise;

        term().nextLine();

        term("Application port: ");
        const applicationPort = await term.inputField().promise;

        term().nextLine();


        term("Connected to backend-services? [Y|n]: ");
        const networkConnected = (await term.yesOrNo( { yes: [ 'y' , 'ENTER' ] , no: [ 'n' ] }).promise);

        dockerCompose = loadTemplate('docker-compose.yml', {
            serviceName,
            containerName: serviceName,
            applicationPort,
            networkConnected,
            ciServerPort
        });

        dockerFile = loadTemplate(appType === 'NestJS' ? 'Dockerfile-nextjs' : 'Dockerfile-vanilla-nodejs', {
            applicationPort,
            packageManager: packageManager.toLowerCase(),
            nodeVer,
            isYarn: packageManager === 'YARN',
            cmd
        });

        term('\n');

        term().red('Writing Dockerfile and docker-compose.yml...\n');

        writeFile('docker-compose.yml', dockerCompose);
        writeFile('Dockerfile', dockerFile);


        term().green("DONE!");

    }


    term.nextLine();


    term.processExit();

})();


