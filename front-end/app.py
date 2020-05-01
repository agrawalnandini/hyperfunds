from flask import Flask, render_template,Response,request,redirect,session,flash
import flask_login
from flask_login import LoginManager, login_user, logout_user, login_required, UserMixin
import utils
import os
import json
import getpass
import random
import string
import subprocess
from functools import wraps
from flask import url_for,session,jsonify

app = Flask(__name__)

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = ''
app.config['SECRET_KEY'] = "hyperfunds"

db_path = "db.json"
user_dict = {}
if os.path.isfile(db_path):
    with open('db.json') as json_file: 
        user_dict = json.load(json_file)
    used_wallets = []
    # update available wallets
    for k, v in user_dict.items():
        used_wallets.append(k)
    
else:
    utils.write_file(db_path, "{}")

FABRIC_DIR="/Users/nandiniagrawal/Desktop/hyperfunds/fabric-samples/hyperfunds/javascript"
NODE_PATH = "/usr/local/bin/node"
DEBUG = True
SEND_OTP = True
dor_email='dor@uni.edu'
accounts_email='accounts@uni.edu'

ACCESS = {
    'dor': 0,
    'accounts': 1,
    'faculty': 2
}

def handle_setup(req_obj, flag):
    uid = req_obj['email']

    # registration
    if flag == "True":
        # if user already exists, fail
        # if no more wallets available, fail
        if uid in user_dict:
            utils.send_verification_email(uid, user_dict[uid]['pwd'])
            return 1

        # else assign user with a wallet
        else:
            pwd = ''.join(
                random.SystemRandom().choice(string.digits) for _ in
                range(4))
            if SEND_OTP:
                if utils.send_verification_email(uid, pwd) == 1:
                    return 1
            user_dict[uid] = {"pwd": pwd, "wallet":uid}
            if registerUser(user_dict[uid]['wallet']) != 0:
                user_dict.pop(uid)
                return 1
            utils.write_file(db_path, json.dumps(user_dict))
            return 0

    
def registerUser(user):
    #returns 0 on success
    output = "dummy"

    try:
        #subprocess.call("cd "+FABRIC_DIR,shell=True)
        output = subprocess.check_output([NODE_PATH, FABRIC_DIR + "/registerUser.js", user],cwd=FABRIC_DIR).decode().split()
    except:
        pass

    if DEBUG:
        print(' '.join(output))

    if output != "dummy" and output[len(output) - 1] == "wallet":
        return 0
    
    else:
        return 1

def check_dashboard(email):
    if email==dor_email:
        return '/dor_home'
    elif email==accounts_email:
        return '/accounts_home'
    else:
        return '/faculty_home'

def createProposal(req_obj):
    #0 for success
    userid = req_obj['userid']
    if userid!=session['email']:
        return 1
    
    amt = req_obj['amount']
    fac_email=req_obj['email']

    output = "error"

    try:
        output = subprocess.check_output([NODE_PATH, FABRIC_DIR + "/invoke.js", "CreateProposalTxn", amt, user_dict[userid]["wallet"],fac_email],
                 cwd=FABRIC_DIR).decode().split()
    except:
        pass

    if DEBUG:
        print(' '.join(output))

    if output != "dummy" and output[len(output) - 1] == "submitted!":
        return 0
    else:
        return 1

@login_manager.user_loader
def load_user(user_id):
    return User(user_id)


class User(UserMixin):
    def __init__(self, id,access=ACCESS['faculty']):
        self.id = id
        if id==dor_email:
            self.access=ACCESS['dor']
        elif id==accounts_email:
            self.access=ACCESS['accounts']
        else:
            self.access=ACCESS['faculty']

        
def requires_access_level(access_level):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # if not session.get('email'):    #checks fo 
            #     return redirect(url_for('login'))
            user = load_user(session['email'])
            if user.access!=access_level:
                return render_template('response.html', response="Operation not authorized")
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def query_by_txnid(user, txnid):
    #returns 1 on failure
    output = "query by txn_id unsuccessful"

    try:
        #subprocess.call("cd "+FABRIC_DIR,shell=True)
        output = subprocess.check_output([NODE_PATH, FABRIC_DIR + "/query.js", "QueryTxn", user, txnid],cwd=FABRIC_DIR).decode()
        #Looking for index where dictionary starts
        keyword_before_dict = "result is: "
        start_of_dict_index = output.find(keyword_before_dict) + len(keyword_before_dict)
        #Use only the dictionary part of the string
        output = output[start_of_dict_index:]
        #Convert string to dictionary
        output = eval(output)

    except:
        pass

    if DEBUG:
        print(' '.join(output))

    if output == "query by txn_id unsuccessful":
        return 1
    
    else:
        return output

def query_by_email(user, email):
    #returns 0 on success
    output = "query by txn_email unsuccessful"

    try:
        #subprocess.call("cd "+FABRIC_DIR,shell=True)
        output = subprocess.check_output([NODE_PATH, FABRIC_DIR + "/query.js", "QueryAllTxn", user, email],cwd=FABRIC_DIR).decode()
        #Looking for index where list starts
        keyword_before_dict = "result is: "
        start_of_dict_index = output.find(keyword_before_dict) + len(keyword_before_dict)
        #Use only the list part of the string
        output = output[start_of_dict_index:]
        #Convert string to list
        output = eval(output)
    
    except:
        pass

    if DEBUG:
        print(output)

    if output != "query by txn_email unsuccessful" and output[len(output) - 1] == "submitted!":
        return 0
    
    else:
        return 1

def query_all_txn(user):
    #returns 1 on failure
    output = "query by txn_all unsuccessful"

    try:
        #subprocess.call("cd "+FABRIC_DIR,shell=True)
        output = subprocess.check_output([NODE_PATH, FABRIC_DIR + "/query.js", "QueryAllTxn", user],cwd=FABRIC_DIR).decode()
        #Looking for index where list starts
        keyword_before_dict = "result is: "
        start_of_dict_index = output.find(keyword_before_dict) + len(keyword_before_dict)
        #Use only the list part of the string
        output = output[start_of_dict_index:]
        #Convert string to list
        output = eval(output)
    
    except:
        pass

    if DEBUG:
        print(output)

    if output == "query by txn_all unsuccessful":
        return 1
    
    else:
        return output

def getBalance(req_obj):
    #0 for success
    userid = req_obj['userid']
    if userid!=session['email']:
        return 1
    
    fac_email=req_obj['email']

    output = "error"

    try:
        output = subprocess.check_output([NODE_PATH, FABRIC_DIR + "/query.js", "getBalance", user_dict[userid]["wallet"],fac_email],
                 cwd=FABRIC_DIR).decode().split()
    except:
        pass

    if DEBUG:
        print(' '.join(output))

    if output != "dummy" and 'result' in output:
        return ' '.join(output)
    else:
        return "Error in evaluating request!"

def approve_txn(user, txnid):
    #returns 1 on failure
    output = "approval unsuccessful"

    try:
        #subprocess.call("cd "+FABRIC_DIR,shell=True)
        output = subprocess.check_output([NODE_PATH, FABRIC_DIR + "/invoke.js", "CreateApprovalTxn", txnid, user],cwd=FABRIC_DIR).decode()

    except:
        pass

    if DEBUG:
        print(' '.join(output))

    if output != "approval unsuccessful" and output[len(output) - 1] == "submitted!":
        return 0
    
    else:
        return 1

@app.route('/')
def login():
    return render_template('%s.html' % 'index')

@app.route('/',methods=['POST'])
def login_post():
    if request.form['email'] in user_dict and user_dict[request.form['email']]['pwd'] == request.form['pass']:
        session['email']=request.form['email']
        login_user(User(request.form['email']))
        return redirect(check_dashboard(request.form['email']))
    else:
        flash('Incorrect email/password')
        return redirect('/')

@app.route('/signup', methods=['POST'])
def signup_post():
    res = handle_setup(request.form, "True")
    if res == 0:
        flash('Registration successful! Check your email inbox/spam for password','success')
        return redirect('/')
    else:
        flash('Registration failed! You are already registered','error')
        return redirect('/signup')

@app.route('/signup')
def signup():
    return render_template('%s.html' % 'signup')

@app.route('/logout/')
@login_required
def logout():
    logout_user()
    return redirect('/')

@app.route('/dor_home')
@login_required
@requires_access_level(ACCESS['dor'])
def dor_home():
    return render_template('%s.html' % 'dor_home')


@app.route('/faculty_home')
@login_required
@requires_access_level(ACCESS['faculty'])
def faculty_home():
    return render_template('%s.html' % 'faculty_home')


@app.route('/accounts_home')
@login_required
@requires_access_level(ACCESS['accounts'])
def accounts_home():
    return render_template('%s.html' % 'accounts_home')

@app.route('/Proposal')
@login_required
def Proposal():
    return render_template('%s.html' % 'Proposal')

@app.route('/Proposal',methods=['POST'])
@login_required
def Proposal_post():
    check=createProposal(request.form)
    if check==0:
        flash('Transaction is submitted successfully','success')
        return redirect('/Proposal')
    else:
        flash('Error in submitting transaction','error')
        return redirect('/Proposal')


@app.route('/Approval')
@login_required
def Approval():
    #Query all transactions
    transactions = query_all_txn(session["email"])
    to_approve = []
    for txn in transactions:
        if (txn["txn"]["approvals"] != (-1) and session["email"] not in txn["txn"]["approvers"] ):
            to_approve.append(txn)
    return render_template('%s.html' % 'Approval')

@app.route('/Approval', methods=['POST'])
@login_required
def Approval_post():
    check = approve_txn(session["email"], request.form["txnid"])
    if check==0:
        flash('Transaction is approved successfully','success')
        return redirect('/Approval')
    else:
        flash('Error in approving transaction','error')
        return redirect('/Approval')



@app.route('/getbalance')
@login_required
def getbalance():
    return render_template('%s.html' % 'getbalance')

@app.route('/getbalance',methods=['POST'])
def getbalance_post():
    check=getBalance(request.form)
    return render_template('response.html',response=check)

@app.route('/query_email')
@login_required
def query_email():
    return render_template('%s.html' % 'query_email')

@app.route('/query_email', methods=['POST'])
@login_required
def query_email_post():
    res = query_by_email(session["email"], request.form["email"])
    print(res)
    return render_template('response.html',response=res)

@app.route('/query_txnid')
@login_required
def query_txnid():
    return render_template('%s.html' % 'query_txnid')

@app.route('/query_txnid', methods=['POST'])
@login_required
def query_txnid_post():
    res = query_by_txnid(session["email"], request.form["txnid"])
    return render_template('response.html',response=res)

@app.route('/query')
@login_required
def query():
    res = query_all_txn(session["email"])
    return render_template('response.html',response=res)



if __name__ == '__main__':
    app.run(debug=False)