process.title = 'GrowishPay-App-Generator';


const term = require('terminal-kit').terminal;
const loadTemplate = require('./core/load-template');
const writeFile = require('./core/write-file');
const editDotEnv = require('./core/edit-dotenv');

term.on( 'key' , function( name ) {
    if ( name === 'CTRL_C' ) {
        term.red("\nHard quit!");
        term.processExit();
    }
} ) ;



(async ()=>{

    let dockerCompose;
    let dockerFile;


    term.clear();

    term().yellow("GrowishPay App Generator").nextLine().nextLine();

    term("Type of project: ");
    const genType = await term.singleLineMenu(
        [
            'CI server + Docker',
            'CI server',
            'Docker'
        ]
    ).promise;

    term().nextLine();

    //CI Setup
    if(genType.selectedIndex <= 1) {

        term()
            .green('CI SERVER SETUP\n');

        term("CI server port: ");
        const ciServerPort = await term.inputField().promise;

        term().nextLine();

        term("Github webhook secret: ");
        const githubWebhookSecret = await term.inputField().promise;

        term().nextLine();

        term("Command for running the application: ");
        const cmd = await term.inputField().promise;


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

        term("Type of app:");
        const appType = (await term.singleLineMenu(
            [
                'NestJS',
                'Vanilla JS'
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

        term("Service name: ");
        const serviceName = await term.inputField().promise;

        term().nextLine();

        term("Application port: ");
        const applicationPort = await term.inputField().promise;

        term().nextLine();

        term("Connected to backend-services? [Y|n]: ");
        const networkConnected = (await term.yesOrNo( { yes: [ 'y' , 'ENTER' ] , no: [ 'n' ] }).promise);

        dockerCompose = loadTemplate('docker-compose.yml', {
            serviceName, containerName: serviceName, applicationPort, networkConnected
        });

        dockerFile = loadTemplate(appType === 'NestJS' ? 'Dockerfile-nextjs' : 'todo', {
            applicationPort, packageManager: packageManager.toLowerCase(), nodeVer, isYarn: packageManager === 'YARN'
        });

        term('\n');

        term().red('Writing Dockerfile and docker-compose.yml...\n');

        writeFile('docker-compose.yml', dockerCompose);
        writeFile('Dockerfile', dockerFile);


        term().green("DONE!");

        //console.log(dockerCompose);

    }



    //

    term.nextLine();


    term.processExit();

})();


