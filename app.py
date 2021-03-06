import pandas as pd
import data_retrieval as dr
from config import is_debug

from flask import Flask, jsonify, render_template, request

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/categories')
def categories():
    return jsonify(dr.get_categories())

@app.route('/statistics')
def statistics():
    return jsonify(dr.get_statistics())

@app.route('/data', methods=['POST'])
def data():
    return jsonify(dr.get_data(request.get_json(force=True)))

if __name__ == '__main__':
    app.run(debug=is_debug)
