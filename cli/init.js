const path = require('path')
const shell = require("shelljs");
const { saveMnemonic } =  require('../lib')


exports.init = function (seedPhrase) {
    const changeDirPath = path.join('node_modules', 'only-payment')
    const goBack = path.join('..','..')


    shell.cd(changeDirPath)

    const resMigrate = shell.echo(shell.exec('./node_modules/.bin/sequelize-cli db:migrate'))
    const resSeed = shell.echo(shell.exec('./node_modules/.bin/sequelize-cli db:seed'))
    shell.echo(resMigrate);
    shell.echo(resSeed);

    saveMnemonic(seedPhrase).then(()=>{
        shell.echo('Initialized successfully');
        shell.cd(goBack)
    }).catch((e)=>{
        console.log(e)
        shell.echo('Initialized failed');
        shell.cd(goBack)
    })

}
