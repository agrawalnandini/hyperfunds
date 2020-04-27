from flask import Flask, render_template,Response

app = Flask(__name__)
@app.route('/')
@app.route('/index.html')
def login():
    #content = get_file('dor_home.html')
    #return Response(content, mimetype="text/html")
    return render_template('%s.html' % 'index')

@app.route('/signup.html')
def signup():
    return render_template('%s.html' % 'signup')

@app.route('/dor_home.html')
def dor_home():
    return render_template('%s.html' % 'dor_home')

@app.route('/faculty_home.html')
def faculty_home():
    return render_template('%s.html' % 'faculty_home')

@app.route('/accounts_home.html')
def accounts_home():
    return render_template('%s.html' % 'accounts_home')

@app.route('/Proposal.html')
def Proposal():
    return render_template('%s.html' % 'Proposal')

@app.route('/Approval.html')
def Approval():
    return render_template('%s.html' % 'Approval')

@app.route('/getbalance.html')
def getbalance():
    return render_template('%s.html' % 'getbalance')

@app.route('/query_email.html')
def query_email():
    return render_template('%s.html' % 'query_email')

@app.route('/query_txnid.html')
def query_txnid():
    return render_template('%s.html' % 'query_txnid')

@app.route('/query.html')
def query():
    return render_template('%s.html' % 'query')



if __name__ == '__main__':
    app.run(debug=True)
