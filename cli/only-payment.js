#! /usr/bin/env node
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const {init} = require('./init')


const argv = yargs(hideBin(process.argv)).argv
const command = argv._[0]

switch (command) {
    case 'init':
        const seedPhrase = argv.seed
        init(seedPhrase)
        break
}
