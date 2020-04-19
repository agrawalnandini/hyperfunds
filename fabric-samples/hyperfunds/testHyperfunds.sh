./teardownHyperfunds.sh
./startHyperfunds.sh

cd javascript
node enrollAdmin.js
node registerUser.js dor@ashoka.edu.in
node registerUser.js accounts@ashoka.edu.in
node registerUser.js fac1@ashoka.edu.in
node invoke.js CreateProposalTxn 10000 dor@ashoka.edu.in fac1@ashoka.edu.in
