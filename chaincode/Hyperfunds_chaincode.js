'use strict';   //to run in strict mode

const {Contract} = require('fabric-contract-api');                  //retrieving contract from fabric to use its features
const ClientIdentity = require('fabric-shim').ClientIdentity;       //retrieving ClientIdentity from fabric to use its features

var balance={};     //global dictionary for balance with key:faculty_email and value: account balance
let txnID=-1;
let threshold=40000;    //look into it later! Maybe let the user decide interactively

class Hyperfunds extends Contract
{
    async initLedger(ctx){

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
        if((approverid.includes('dor@ashoka.edu.in')||approverid.includes('accounts@ashoka.edu.in'))==false)     
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
             if(txn.proposed_amount>=threshold)
             {
                 if((txn.approvers.includes('dor@ashoka.edu.in') && txn.approvers.includes('accounts@ashoka.edu.in')) && txn.approvals==2) 
                 {
                     txn.approvals=-1;
                     console.log(`Txn ${txnid} approval count is satisfied thus this trabnsaction is approved!`);
                 }
            }
            else
            {
                if((txn.approvers.includes('accounts@ashoka.edu.in')) && txn.approvals==1)
                {
                    txn.approvals=-1;
                    console.log(`Txn ${txnid} approval count is satisfied thus this trabnsaction is approved!`);
                }
            }
        }

        else
        {
            throw new Error(`Cannot Approve transaction!`);
        }

        await ctx.stub.putState(txnid, Buffer.from(JSON.stringify(txn)));
    }

        



        



    }

    async QueryTxn(ctx,txnid){

    }

    async QueryAllTxn(ctx,faculty_emailid="default"){

    }

    async getbalance(){

    }


}