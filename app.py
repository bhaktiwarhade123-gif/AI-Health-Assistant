from flask import Flask, render_template, request, jsonify
from data import health_data, health_tips, emergency_symptoms
import webbrowser
from threading import Timer

app = Flask(__name__)


# --------------------------------
# HOME PAGE
# --------------------------------

@app.route("/")
def home():
    return render_template("index.html")


# --------------------------------
# ANALYZE SYMPTOMS
# --------------------------------

@app.route("/predict", methods=["POST"])
def predict():

    data = request.get_json()

    if not data or "symptoms" not in data:
        return jsonify({
            "success": False,
            "message": "Please enter your symptoms."
        })

    user_input = data["symptoms"].lower().strip()

    if user_input == "":
        return jsonify({
            "success": False,
            "message": "Please enter your symptoms."
        })


    # --------------------------------
    # CHECK EMERGENCY SYMPTOMS
    # --------------------------------

    for emergency in emergency_symptoms:

        if emergency in user_input:

            return jsonify({
                "success": True,
                "emergency": True,
                "condition": "Urgent Medical Attention Required",
                "confidence": 100,
                "matched_symptoms": [emergency],
                "advice": [
                    "Do not ignore severe symptoms.",
                    "Seek professional medical help immediately."
                ]
            })


    # --------------------------------
    # FIND BEST MATCH
    # --------------------------------

    best_condition = None
    best_score = 0
    best_matches = []

    for condition, information in health_data.items():

        matches = []

        for symptom in information["symptoms"]:

            if symptom in user_input:
                matches.append(symptom)

        score = len(matches)

        if score > best_score:

            best_score = score
            best_condition = condition
            best_matches = matches


    # --------------------------------
    # NO MATCH FOUND
    # --------------------------------

    if best_condition is None or best_score == 0:

        return jsonify({
            "success": True,
            "emergency": False,
            "condition": "No Clear Match",
            "confidence": 0,
            "matched_symptoms": [],
            "advice": [
                "Describe your symptoms clearly.",
                "Monitor your symptoms.",
                "Consult a healthcare professional if symptoms continue."
            ]
        })


    # --------------------------------
    # CALCULATE CONFIDENCE
    # --------------------------------

    total_symptoms = len(
        health_data[best_condition]["symptoms"]
    )

    confidence = int(
        (best_score / total_symptoms) * 100
    )

    if confidence > 100:
        confidence = 100


    # --------------------------------
    # SEND RESULT
    # --------------------------------

    return jsonify({
        "success": True,
        "emergency": False,
        "condition": best_condition,
        "confidence": confidence,
        "matched_symptoms": best_matches,
        "advice": health_data[best_condition]["advice"]
    })


# --------------------------------
# HEALTH TIPS
# --------------------------------

@app.route("/tips")
def tips():

    return jsonify({
        "tips": health_tips
    })


# --------------------------------
# OPEN BROWSER AUTOMATICALLY
# --------------------------------

def open_browser():
    webbrowser.open("http://127.0.0.1:5000")


# --------------------------------
# START APPLICATION
# --------------------------------

if __name__ == "__main__":

    Timer(1, open_browser).start()

    app.run(debug=True, use_reloader=False)