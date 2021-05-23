const { v4: uuidv4 } = require('uuid')
const {Transaction} = require('./lib/transaction')


const t = new Transaction()
t.initiateTransaction( uuidv4(), 200000, 'NGN')
