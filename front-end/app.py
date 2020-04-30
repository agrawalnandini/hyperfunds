from flask import Flask, render_template,Response,request,redirect
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
from flask import url_for,session

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

# def check_dashboard(email):
#     if email==dor_email:
#         return '/dor_home'
#     elif email==accounts_email:
#         return '/accounts_home'
#     else:
#         return '/faculty_home'

@login_manager.user_loader
def load_user(user_id):
    return User(user_id)



class User(UserMixin):
    def __init__(self, id,access=ACCESS['faculty']):
        self.id = id
        self.access=access
    
    # def is_dor(self):
    #     return self.access == ACCESS['dor']
    
    # def is_accounts(self):
    #     return self.access == ACCESS['accounts']
    
        
def requires_access_level(access_level):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not session.get('email'):
                return redirect(url_for('login'))

            user = User.find_by_email(session['email'])
            print(user)
            print(user.access)
            if user.access!=access_level:
                return render_template('response.html', response="User not authorized")
            return f(*args, **kwargs)
        return decorated_function
    return decorator

@app.route('/')
def login():
    return render_template('%s.html' % 'index')

@app.route('/',methods=['POST'])
def login_post():
    if request.form['email'] in user_dict and user_dict[request.form['email']]['pwd'] == request.form['pass']:
        if request.form['email']==dor_email:
            login_user(User(request.form['email'],ACCESS['dor']))
            return redirect('/dor_home')
        elif request.form['email']==accounts_email:
            login_user(User(request.form['email'],ACCESS['accounts']))
            return redirect('/accounts_home')
        else:
            login_user(User(request.form['email'],ACCESS['faculty']))
            return redirect('/faculty_home')  
    else:
        return render_template('response.html', response="Invalid email/password!")

@app.route('/signup', methods=['POST'])
def signup_post():
    res = handle_setup(request.form, "True")
    if res == 0:
        return render_template('response.html',
                               response="Registration successful! Check your email inbox/spam for password.")
    else:
        return render_template('response.html',
                               response="Registration failed! You're already registered. Check your email's inbox/spam folder for password.")

@app.route('/signup')
def signup():
    return render_template('%s.html' % 'signup')



@app.route('/dor_home')
@login_required
@requires_access_level(ACCESS['dor'])
def dor_home():
    return render_template('%s.html' % 'dor_home')


@app.route('/faculty_home')
@login_required
def faculty_home():
    return render_template('%s.html' % 'faculty_home')


@app.route('/accounts_home')
@login_required
@requires_access_level(ACCESS['accounts'])
def accounts_home():
    return render_template('%s.html' % 'accounts_home')

@app.route('/Proposal')
def Proposal():
    return render_template('%s.html' % 'Proposal')

@app.route('/Approval')
def Approval():
    return render_template('%s.html' % 'Approval')

@app.route('/getbalance')
def getbalance():
    return render_template('%s.html' % 'getbalance')

@app.route('/query_email')
def query_email():
    return render_template('%s.html' % 'query_email')

@app.route('/query_txnid')
def query_txnid():
    return render_template('%s.html' % 'query_txnid')

@app.route('/query')
def query():
    return render_template('%s.html' % 'query')



if __name__ == '__main__':
    app.run(debug=False)
