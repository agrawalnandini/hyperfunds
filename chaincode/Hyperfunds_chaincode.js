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

    }

    async QueryTxn(ctx,txnid){

    }

    async QueryAllTxn(ctx,faculty_emailid="default"){

    }

    async getbalance(){

    }


}