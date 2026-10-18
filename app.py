import json
import pathlib
from flask import Flask, jsonify, render_template, jsonify

BASE = pathlib.Path(__file__).parent
app = Flask(__name__, static_folder="static", static_url_path="")


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/api/config")
def config():
    with open(BASE / "config.json", encoding="utf-8") as f:
        return jsonify(json.load(f))


if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True)