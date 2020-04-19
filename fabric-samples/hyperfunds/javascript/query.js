'use strict';

const {FileSystemWallet, Gateway} = require('fabric-network');
const fs = require('fs');
const path = require('path');

const ccpPath = path.resolve(__dirname, '..', '..', 'basic-network', 'connection.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);
let choice;
let user;
let IDoremail;

process.argv.forEach(function (val, index, array) {
	choice = array[2];		// determines which function to call (query or queryAll or getBalance)
	user = array[3];		// our user id is in the form of email id (of the current user)
	IDoremail = array[4];		
	// For queryTxn - this will be txnID.
	// For queryAllTxns - this will be faculty email ID if all transactions made by a certain faculty member have to be queried.
	// It can be left empty if all transactions every made need to be queried.
	// For getBalance - this will be faculty email ID. 
});

async function main() {
	try {

		// Create a new file system based wallet for managing identities.
		const walletPath = path.join(process.cwd(), 'wallet');
		const wallet = new FileSystemWallet(walletPath);
		console.log(`Wallet path: ${walletPath}`);

		// Check to see if we've already enrolled the user.
		const userExists = await wallet.exists(user);
		if (!userExists) {
			console.log(`An identity for the user ${user} does not exist in the wallet`);
			console.log('Run the registerUser.js application before retrying');
			return;
		}

		// Create a new gateway for connecting to our peer node.
		const gateway = new Gateway();
		await gateway.connect(ccp, {wallet, identity: user, discovery: {enabled: false}});

		// Get the network (channel) our contract is deployed to.
		const network = await gateway.getNetwork('mychannel');

		// Get the contract from the network.
		const contract = network.getContract('hyperfunds');

		// Evaluate the specified transaction.
		// queryTxn - requires 1 argument - txnID, ex: ('queryTxn', '19')
		// queryAllTxns transaction - requires 0 to 1 arguments - faculty email ID or empty,
		// ex: ('queryAllTxns') or ('queryAllTxns', 'mahavir.jhawar@ashoka.edu.in')
		// getBalance - requires 1 argument -  faculty email ID, ex: ('getBalance', 'mahavir.jhawar@ashoka.edu.in')
		
		if (choice === 'QueryTxn') {
			const result = await contract.evaluateTransaction('QueryTxn', IDoremail);
			console.log(`TransactionTypeAll has been evaluated, result is: ${result.toString()}`);
		} 
		else if (choice === 'QueryAllTxn') {
			if(!IDoremail) {
				const result = await contract.evaluateTransaction('QueryAllTxn','no_input');
				console.log(`TransactionTypeID has been evaluated, result is: ${result.toString()}`);
			}
			else {
				const result = await contract.evaluateTransaction('QueryAllTxn', IDoremail);
				console.log(`TransactionTypeID has been evaluated, result is: ${result.toString()}`);
			}
		}
		else if (choice === 'getBalance') {
			const result = await contract.evaluateTransaction('getBalance', IDoremail);
			console.log(`TransactionTypeID has been evaluated, result is: ${result.toString()}`);
		}
		else {
            console.log(`Choice ${choice} not valid`);  
        }

	} catch (error) {
		console.error(`Failed to evaluate transaction: ${error}`);
		process.exit(1);
	}
}

main();
