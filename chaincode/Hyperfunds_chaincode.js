'use strict';   //to run in strict mode

const {Contract} = require('fabric-contract-api');                  //retrieving contract from fabric to use its features
const ClientIdentity = require('fabric-shim').ClientIdentity;       //retrieving ClientIdentity from fabric to use its features

var balance={};     //global dictionary for balance with key:faculty_email and value: account balance
let txn_id=-1;
let threshold=40000;    //look into it later! Maybe let the user decide interactively

class Hyperfunds extends Contract
{
    async initLedger(ctx){

    }

    async CreateProposalTxn(ctx,proposed_amount,faculty_email_id){

        //create key-value pair
        //user id- email of the user while enrolling

        console.info('============= START : CreateProposal ===========');

        let cid = new ClientIdentity(ctx.stub);
        let userID = cid.getID();

        console.log(`Proposed Amount : ${proposed_amount}`);
        console.log(`userID  : ${userID}`);
        console.log(`emailID : ${faculty_email_id}`);

        if(userID.includes(faculty_email_id) || userID.includes(dor_email)) {
            if(userID.includes(faculty_email_id)){
                //Faculty is only allowed to deduct funds
                proposed_amount = proposed_amount * (-1)
            }

            //Obtain current balance for the faculty
            current_balance = balance[userID]

            //Transaction is deducted only if there is sufficient balance
            if ((current_balance + proposed_amount) >= 0) {

                const approvers = [];
                const approvals = 0;

                const msg = {
                    proposed_amount,
                    userID,
                    approvals,
                    approvers,
                    faculty_email_id,
                };

                // if new faculty, add faculty to balance dictionary
                if (!(balance.includes(faculty_email_id))) {
                    console.log(`New faculty! Added to the chain state.`);
                    balance.faculty_email_id = 0;        //Add to dictionary
                }

                txnID += 1;

                await ctx.stub.putState(txnID.toString(), Buffer.from(JSON.stringify(msg)));
            }
            else{
                throw new Error('Insufficient Funds!')
            }
        }
        else{
            throw new Error('User not allowed to access funds for the given faculty!')
        }
        console.info('============= END : createMsg ===========');


    }

    async CreateApprovalTxn(ctx,txnid){

    }

    async QueryTxn(ctx,txnid){

    }

    async QueryAllTxn(ctx,faculty_emailid="default"){

    }

    async getbalance(){

    }


}