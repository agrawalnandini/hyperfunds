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

if __name__ == '__main__':
    app.run(debug=True)