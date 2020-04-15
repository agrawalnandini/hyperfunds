
'use strict';

const {FileSystemWallet, Gateway} = require('fabric-network');
const fs = require('fs');
const path = require('path');

const ccpPath = path.resolve(__dirname, '..', '..', 'basic-network', 'connection.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);
let user, choice, msg, emailID;

process.argv.forEach(function (val, index, array) {
    choice = array[2];              //determines which function to call (createProposal or createApproval)
    txn_argument = array[3];                 //will be proposed_amt for createProposal part and txnid for createApproval part
    user = array[4];                //our user id is in the form of email id (of the current user)
    faculty_emailID = array[5];     //to determine which faculty's balance to be updated based on txn
});