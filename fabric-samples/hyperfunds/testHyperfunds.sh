./teardownHyperfunds.sh
./startHyperfunds.sh

cd javascript
node enrollAdmin.js
node registerUser.js dor@ashoka.edu.in
node registerUser.js accounts@ashoka.edu.in
node registerUser.js fac1@ashoka.edu.in
node registerUser.js fac2@ashoka.edu.in

# add money to both the accounts
node invoke.js CreateProposalTxn 100000 dor@ashoka.edu.in fac1@ashoka.edu.in # txnid - 0
node invoke.js CreateProposalTxn 100000 dor@ashoka.edu.in fac2@ashoka.edu.in # txnid - 1

# money can't be spent by faculty without the approval by accounts dept
# approve this balance for fac1
node invoke.js CreateApprovalTxn 0 accounts@ashoka.edu.in fac1@ashoka.edu.in # txnid - 2
node query.js getBalance fac1@ashoka.edu.in fac1@ashoka.edu.in # should be 1,00,000

# this transaction will update the balance of fac1 only if it has approval from accounts
# since amt < (threshold = 40,000)
node invoke.js CreateProposalTxn 30000 fac1@ashoka.edu.in fac1@ashoka.edu.in # txnid - 3
node query.js getBalance fac1@ashoka.edu.in fac1@ashoka.edu.in # should be 1,00,000

# approval from accounts for this transaction txnid - 3
node invoke.js CreateApprovalTxn 3 accounts@ashoka.edu.in fac1@ashoka.edu.in # txnid - 4
node query.js getBalance fac1@ashoka.edu.in fac1@ashoka.edu.in # should be 70,000

# approve balance for fac2
node invoke.js CreateApprovalTxn 1 accounts@ashoka.edu.in fac2@ashoka.edu.in # txnid - 5
node query.js getBalance fac2@ashoka.edu.in fac2@ashoka.edu.in # should be 1,00,000

# this transaction will update the balance of fac2 only if it has approval from accounts and dor
# since amt > (threshold = 40,000)
node invoke.js CreateProposalTxn 50000 fac2@ashoka.edu.in fac2@ashoka.edu.in # txnid - 6
node query.js getBalance fac2@ashoka.edu.in fac2@ashoka.edu.in # should be 1,00,000

# approval from accounts for this transaction txnid - 6
node invoke.js CreateApprovalTxn 6 accounts@ashoka.edu.in fac2@ashoka.edu.in
node query.js getBalance fac2@ashoka.edu.in fac2@ashoka.edu.in # should be 1,00,000

# approval from dor for this transaction txnid - 6
node invoke.js CreateApprovalTxn 6 accounts@ashoka.edu.in fac2@ashoka.edu.in
node query.js getBalance fac2@ashoka.edu.in fac2@ashoka.edu.in # should be 50,000