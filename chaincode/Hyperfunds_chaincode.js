'use strict';   //to run in strict mode

const {Contract} = require('fabric-contract-api');                  //retrieving contract from fabric to use its features
const ClientIdentity = require('fabric-shim').ClientIdentity;       //retrieving ClientIdentity from fabric to use its features

var balance={};     //global dictionary for balance with key:faculty_email and value: account balance
let txnID=-1;
let threshold=40000;    //look into it later! Maybe let the user decide interactively
let dor_email = "dor@ashoka.edu.in";
let accdept_email = "accounts@ashoka.edu.in";

class Hyperfunds extends Contract
{
    async initLedger(ctx){
    console.info('============= START : Initialize Ledger ===========');

        const startKey = '0';
        const endKey = '99999';

        const iterator = await ctx.stub.getStateByRange(startKey, endKey); // create an iterator to go over all transactions in the blockchain

        while (true) {
            const res = await iterator.next();

            if (res.value && res.value.value.toString()) {
                // console.log(res.value.value.toString('utf8'));
                let prop; // proposal object
                try {
                    prop = JSON.parse(res.value.value.toString('utf8')); //convert the value to a JSON object

                    // update balance array and txnID
                    if (prop.amount === "0") { // if proposal amount is 0, update the balance to be 0 for that faculty member.
                        balance[prop.faculty_email_id] = prop.proposed_amount;
                    }
                    else { // if proposal amount is not 0, add that to the balance for that faculty member
                        balance[prop.faculty_email_id] = prop.balance[faculty_email_id] + prop.proposed_amount;
                    }
                
                    txnID += 1; //increment txnID as we iterate through transactions

                } catch (err) {
                    console.log(err);
                    prop = res.value.value.toString('utf8');
                }
            }

            if (res.done) {
                await iterator.close();
                console.log(`Balance array: ${balance}`);
                console.log(`num of faculty members registered: ${balance.length}`);
                console.log(`Last txn ID: ${txnID}`);
                break;
            }
        }
        console.info('============= END : Initialize Ledger ===========');
    }

    async CreateProposalTxn(ctx,proposed_amount,faculty_email_id){

        //create key-value pair
        //user id- email of the user while enrolling

    }

    async CreateApprovalTxn(ctx,txnid){

        //retrieving the id of the approver: note we are defining the ids
        let cid=new ClientIdentity(ctx.stub);
        let approverid=cid.getID();

        //approval cannot come from faculty
        if((approverid.includes(dor_email)||approverid.includes(accdept_email))==false)     
        {
            throw new Error(`Faculty cannot Approve Transaction!`);
        }

        //getting the current key-value pair we are changing from the worldstate
        const TxnAsBytes= await ctx.stub.getState(txnID);   

        //if nothing retrived then throw error 
        if (!TxnAsBytes || TxnAsBytes.length === 0) 
        {
            throw new Error(`${txnid} does not exist`);
        }

        //converting to JSON object
        const txn = JSON.parse(TxnAsBytes.toString());   

        //check if not already approved and this approver id is not in the approvers list
        if((txn.approvals!=-1) && !(txn.approvers.includes(approverid)))     
        {
             // push new approver in approval list
             txn.approvers.push(approverid);
             // increment approvals counter
             txn.approvals += 1;

             console.log('Your Approval is Submitted');

             //checking for how many approvals required
             balanceAmt=balance[txn.faculty_email_id];
             if(txn.proposed_amount>=threshold)
             {
                 if((txn.approvers.includes(dor_email) && txn.approvers.includes(accdept_email)) && txn.approvals==2 && ((balanceAmt+proposed_amount)>=0)) 
                 {
                     txn.approvals=-1;
                     balance[txn.faculty_email_id]=balanceAmt+proposed_amount;
                     console.log(`Txn ${txnid} approval count is satisfied thus this transaction is approved and balance is updated!`);
                 }
            }
            else
            {
                if((txn.approvers.includes(accdept_email)) && txn.approvals==1 && ((balanceAmt+proposed_amount)>=0))
                {
                    txn.approvals=-1;
                    balance[txn.faculty_email_id]=balanceAmt+proposed_amount;
                    console.log(`Txn ${txnid} approval count is satisfied thus this transaction is approved and balance is updated!`);
                }
            }
        }

        else
        {
            throw new Error(`Error Approving Transaction!`);
        }

        await ctx.stub.putState(txnid, Buffer.from(JSON.stringify(txn)));
    }

    async QueryTxn(ctx,txnid){

        let cid=new ClientIdentity(ctx.stub);
        let userid=cid.getID();

        const TxnAsBytes= await ctx.stub.getState(txnID);   
        //if nothing retrived then throw error 
        if (!TxnAsBytes || TxnAsBytes.length === 0) 
        {
            throw new Error(`${txnid} does not exist`);
        }

        //converting to JSON object
        const txn = JSON.parse(TxnAsBytes.toString());

        //a faculty can only see their transaction whereas dor and accounts can see any transaction 
        if(userid.includes(txn.faculty_email_id) || userid.includes(dor_email) || userid.includes(accdept_email))
        {
            console.log(txn);
            return JSON.stringify(txn);
        }

        else
        {
            throw new Error('Cannot view this transaction')
            
        }
    }

    async QueryAllTxn(ctx,faculty_emailid="default"){

    }

    async getbalance(){
    //retrieving the id of the approver: note we are defining the ids
    let cid = new ClientIdentity(ctx.stub);
    let approverid = cid.getID();

    //approval cannot come from faculty
    if((approverid.includes(dor_email)||approverid.includes(accdept_email)||(approverid.includes(faculty_email_id)))==true) {
        return balance[faculty_email_id];
    }     
    else {
        throw new Error(`Unauthorised access to Balance detected`);
    }
    }

}