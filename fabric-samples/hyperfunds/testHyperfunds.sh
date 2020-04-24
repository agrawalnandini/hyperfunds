./teardownHyperfunds.sh
./startHyperfunds.sh

cd javascript
node enrollAdmin.js
node registerUser.js dor@uni.edu
node registerUser.js accounts@uni.edu
node registerUser.js fac1@uni.edu
node registerUser.js fac2@uni.edu

# add money to both the accounts
node invoke.js CreateProposalTxn 100000 dor@uni.edu fac1@uni.edu # txnid - 0
node invoke.js CreateProposalTxn 100000 dor@uni.edu fac2@uni.edu # txnid - 1

# money can't be spent by faculty without the approval by accounts dept
# approve this balance for fac1
node invoke.js CreateApprovalTxn 0 accounts@uni.edu fac1@uni.edu 
node query.js getBalance fac1@uni.edu fac1@uni.edu # should be 1,00,000

# this transaction will update the balance of fac1 only if it has approval from accounts
# since amt < (threshold = 40,000)
node invoke.js CreateProposalTxn 30000 fac1@uni.edu fac1@uni.edu # txnid - 2
node query.js getBalance fac1@uni.edu fac1@uni.edu # should be 1,00,000

# approval from accounts for this transaction txnid - 2
node invoke.js CreateApprovalTxn 2 accounts@uni.edu fac1@uni.edu 
node query.js getBalance fac1@uni.edu fac1@uni.edu # should be 70,000

# approve balance for fac2
node invoke.js CreateApprovalTxn 1 accounts@uni.edu fac2@uni.edu 
node query.js getBalance fac2@uni.edu fac2@uni.edu # should be 1,00,000

# this transaction will update the balance of fac2 only if it has approval from accounts and dor
# since amt > (threshold = 40,000)
node invoke.js CreateProposalTxn 50000 fac2@uni.edu fac2@uni.edu # txnid - 3
node query.js getBalance fac2@uni.edu fac2@uni.edu # should be 1,00,000

# approval from accounts for this transaction txnid - 3
node invoke.js CreateApprovalTxn 3 accounts@uni.edu fac2@uni.edu
node query.js getBalance fac2@uni.edu fac2@uni.edu # should be 1,00,000

# approval from dor for this transaction txnid - 3
node invoke.js CreateApprovalTxn 3 dor@uni.edu fac2@uni.edu
node query.js getBalance fac2@uni.edu fac2@uni.edu # should be 50,000

# should return all transactions made by fac1
node query.js QueryAllTxn dor@uni.edu fac1@uni.edu 

# should not return the transactions made by fac1 - should throw an error
node query.js QueryAllTxn fac2@uni.edu fac1@uni.edu

# should return all transactions made only by fac2
node query.js QueryAllTxn fac2@uni.edu

# should return the transaction with txnID 2
node query.js QueryTxn dor@uni.edu 2
node query.js QueryTxn accounts@uni.edu 2
node query.js QueryTxn fac1@uni.edu 2

#should return all txns made in the network
node query.js QueryAllTxn accounts@uni.edu 
