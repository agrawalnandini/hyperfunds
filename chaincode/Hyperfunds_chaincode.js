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

            //Transaction is accepted only if there is sufficient balance
            if ((current_balance + proposed_amount) >= 0) {

                const approvers = [];
                const approvals = 0;

                const msg = {
                    faculty_email_id,
                    proposed_amount,
                    userID,
                    approvals,
                    approvers,
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
        console.info('============= END : CreateProposal ===========');


    }

    async CreateApprovalTxn(ctx,txnid){

        console.info('============= START : CreateApproval ===========');

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

             //if proposal txn made by dor, dont need to check for threshold- just need account's approval
             if(txn.userID.includes(dor_email))
             {
                if((txn.approvers.includes(accdept_email)) && txn.approvals==1 && ((balanceAmt+proposed_amount)>=0))
                {
                    txn.approvals=-1;
                    balance[txn.faculty_email_id]=balanceAmt+proposed_amount;
                    console.log(`Txn ${txnid} approval count is satisfied thus this transaction is approved and balance is updated!`);
                }
             }

             else
             {
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
            
        }

        else
        {
            throw new Error(`Cannot Approve Transaction!`);
        }

        await ctx.stub.putState(txnid, Buffer.from(JSON.stringify(txn)));
        
        console.info('============= END : CreateApproval ===========');
    }

    async QueryTxn(ctx,txnid){

        console.info('============= START : CreateQueryTxn ===========');

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
        console.info('============= END : CreateQueryTxn ===========');
    }

    async QueryAllTxn(ctx,input_email='default'){
        //this function tries to query all txns or query all txns of a particular faculty
        console.info('============= START : queryAllTxns ===========');

        const startKey = '0';
        const endKey = '99999';

        const iterator = await ctx.stub.getStateByRange(startKey, endKey);

        const allResults = [];
        while (true) {
            const res = await iterator.next();

            if (res.value && res.value.value.toString()) {
                // console.log(res.value.value.toString('utf8'));

                const Key = res.value.key;
                let txn;
                try {
                    txn = JSON.parse(res.value.value.toString('utf8'));

                    // don't show registration $HELLO$ records
                    if (txn.proposed_amount === 0 || ( (txn.faculty_email_id != input_email) && (input_email != 'default') ) ) {
                        continue;
                    }

                    // no need to show these fields anyway
                    delete msg.userID;
                    delete msg.approvers;
                    delete msg.approvals;

                } catch (err) {
                    console.log(err);
                    msg = res.value.value.toString('utf8');
                }
                allResults.push({Key, msg});
            }
            if (res.done) {
                await iterator.close();
                console.info(allResults);
                console.info('============= END : queryAllTxns ===========');
                return JSON.stringify(allResults);
            }
        }

    }

    async getBalance(ctx, faculty_email_id){

        console.info('============= START : getBalance ===========');
        // return balance for the faculty email ID received as argument
        if(balance.hasOwnProperty(faculty_email_id)) {
            return balance[faculty_email_id];
        }     
        else { // if received email ID is not present in the dictionary, throw an error
            throw new Error(`Invalid Email ID - not registered as faculty!`);
        }
        console.info('============= END : getBalance ===========');
    }

}

module.exports=Hyperfunds;