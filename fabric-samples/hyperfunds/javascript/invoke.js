
'use strict';

const {FileSystemWallet, Gateway} = require('fabric-network');
const fs = require('fs');
const path = require('path');

const ccpPath = path.resolve(__dirname, '..', '..', 'basic-network', 'connection.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);
let user, choice, txn_argument, faculty_emailID;

process.argv.forEach(function (val, index, array) {
    choice = array[2];              // determines which function to call (createProposal or createApproval)
    txn_argument = array[3];        // will be proposed_amt for createProposal part and txnid for createApproval part
    user = array[4];                // our user id is in the form of email id (of the current user)
    faculty_emailID = array[5];     // to determine which faculty's balance to be updated based on txn
});

async function main()
{
    try
    {
        //create a new file system based wallet(wallets created as folders)
        const walletPath = path.join(process.cwd(), 'wallet');      //joining current path with 'wallet'
        const wallet = new FileSystemWallet(walletPath);            //making a new wallet instance
        console.log(`Wallet path: ${walletPath}`);                  //printing the wallet path

        //check if this user has a wallet, if not then return
        const userExists = await wallet.exists(user);
        if(!userExists)
        {
            console.log(`User ${user} does not exist! Register user using RegisterUser.js`);
            return;
        }

        //creating a gateway to connect to the peer node
        const gateway= new Gateway();
        await gateway.connect(ccp, {wallet, identity: user, discovery: {enabled: false}});

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('hyperfunds');


        //submitting txn
        //1.Type1 : CreateProposalTxn(proposed_amt,faculty_email_id) : made by dor or faculty 
        //2.Type2 : CreateApprovalTxn(txnid) : made by dor or accdept
        
        if(choice=='CreateProposalTxn')
        {
            await contract.submitTransaction('CreateProposalTxn', txn_argument,faculty_emailID); //here txn_argument is proposed_amount
            console.log(`${choice} Transaction has been submitted!`);

        }
        else if(choice=='CreateApprovalTxn') 
        {
            await contract.submitTransaction('CreateApprovalTxn',txn_argument);     //here txn_argument is txnid
            console.log(`${choice} Transaction has been submitted!`);
        }
        else
        {
            console.log(`Choice ${choice} not valid`);  //if anything except CreateProposalTxn or CreateApprovalTxn is used then prints invalid
        }

        // Disconnect from the gateway.
        await gateway.disconnect();
    } catch(error) {
        console.error(`Failed to submit transaction: ${error}`);    //if doesnt enter the try block
        process.exit(1);
    }
}
    
main();