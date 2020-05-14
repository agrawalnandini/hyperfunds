# ./teardownHyperfunds.sh
# ./startHyperfunds.sh

cd javascript
node registerUser.js dor@ashoka.edu.in
node registerUser.js accdept@ashoka.edu.in
node registerUser.js fac1@ashoka.edu.in
node registerUser.js fac2@ashoka.edu.in

# add money to both the accdept
node invoke.js CreateProposalTxn 100000 dor@ashoka.edu.in fac1@ashoka.edu.in # txnid - 0
node invoke.js CreateProposalTxn 100000 dor@ashoka.edu.in fac2@ashoka.edu.in # txnid - 1

# money can't be spent by faculty without the approval by accdept dept
# approve this balance for fac1
node invoke.js CreateApprovalTxn 0 accdept@ashoka.edu.in fac1@ashoka.edu.in 
node query.js getBalance fac1@ashoka.edu.in fac1@ashoka.edu.in # should be 1,00,000

# this transaction will update the balance of fac1 only if it has approval from accdept
# since amt < (threshold = 40,000)
node invoke.js CreateProposalTxn 30000 fac1@ashoka.edu.in fac1@ashoka.edu.in # txnid - 2
node query.js getBalance fac1@ashoka.edu.in fac1@ashoka.edu.in # should be 1,00,000

# approval from accdept for this transaction txnid - 2
node invoke.js CreateApprovalTxn 2 accdept@ashoka.edu.in fac1@ashoka.edu.in 
node query.js getBalance fac1@ashoka.edu.in fac1@ashoka.edu.in # should be 70,000

# approve balance for fac2
node invoke.js CreateApprovalTxn 1 accdept@ashoka.edu.in fac2@ashoka.edu.in 
node query.js getBalance fac2@ashoka.edu.in fac2@ashoka.edu.in # should be 1,00,000

# this transaction will update the balance of fac2 only if it has approval from accdept and dor
# since amt > (threshold = 40,000)
node invoke.js CreateProposalTxn 50000 fac2@ashoka.edu.in fac2@ashoka.edu.in # txnid - 3
node query.js getBalance fac2@ashoka.edu.in fac2@ashoka.edu.in # should be 1,00,000

# approval from accdept for this transaction txnid - 3
node invoke.js CreateApprovalTxn 3 accdept@ashoka.edu.in fac2@ashoka.edu.in
node query.js getBalance fac2@ashoka.edu.in fac2@ashoka.edu.in # should be 1,00,000

# approval from dor for this transaction txnid - 3
node invoke.js CreateApprovalTxn 3 dor@ashoka.edu.in fac2@ashoka.edu.in
node query.js getBalance fac2@ashoka.edu.in fac2@ashoka.edu.in # should be 50,000

# should return all transactions made by fac1
node query.js QueryAllTxn dor@ashoka.edu.in fac1@ashoka.edu.in 

# should not return the transactions made by fac1 - should throw an error
node query.js QueryAllTxn fac2@ashoka.edu.in fac1@ashoka.edu.in

# should return all transactions made only by fac2
node query.js QueryAllTxn fac2@ashoka.edu.in

# should return the transaction with txnID 2
node query.js QueryTxn dor@ashoka.edu.in 2
node query.js QueryTxn accdept@ashoka.edu.in 2
node query.js QueryTxn fac1@ashoka.edu.in 2

#should return all txns made in the network
node query.js QueryAllTxn accdept@ashoka.edu.in 
