// ================================
// AI HEALTH ASSISTANT
// ================================


// -------------------------------
// SPEECH TO TEXT
// -------------------------------

let recognition;

const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {

    recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = function () {

        document.getElementById("voiceStatus").innerText =
            "🎙️ Listening... Please speak your symptoms.";

        document.getElementById("micButton").innerText =
            "🔴";
    };


    recognition.onresult = function (event) {

        const text = event.results[0][0].transcript;

        document.getElementById("symptoms").value = text;

        document.getElementById("voiceStatus").innerText =
            "✅ Speech converted to text.";
    };


    recognition.onerror = function () {

        document.getElementById("voiceStatus").innerText =
            "❌ Could not hear you. Please try again.";

    };


    recognition.onend = function () {

        document.getElementById("micButton").innerText =
            "🎤";
    };

}


// Microphone function
function startListening() {

    if (!recognition) {

        alert(
            "Speech recognition is not supported in this browser. Please use Google Chrome."
        );

        return;
    }

    recognition.start();
}


// -------------------------------
// ANALYZE SYMPTOMS
// -------------------------------

async function analyzeSymptoms() {

    const symptoms =
        document.getElementById("symptoms").value.trim();

    if (symptoms === "") {

        alert("Please enter or speak your symptoms first.");

        return;
    }


    const button =
        document.querySelector(".analyze-button");

    button.innerText = "🔄 Analyzing...";
    button.disabled = true;


    try {

        const response = await fetch("/predict", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                symptoms: symptoms
            })

        });


        const data = await response.json();


        // Show result
        document.getElementById("result")
            .classList.remove("hidden");


        // Condition
        document.getElementById("condition")
            .innerText = data.disease;


        // Confidence
        document.getElementById("confidence")
            .innerText =
            "Confidence: " + data.confidence + "%";


        // Matched symptoms
        const matchedList =
            document.getElementById("matchedSymptoms");

        matchedList.innerHTML = "";


        if (data.matched_symptoms) {

            data.matched_symptoms.forEach(function (symptom) {

                const li = document.createElement("li");

                li.innerText = symptom;

                matchedList.appendChild(li);

            });

        }


        // Advice
        const adviceList =
            document.getElementById("advice");

        adviceList.innerHTML = "";


        if (data.advice) {

            data.advice.forEach(function (item) {

                const li = document.createElement("li");

                li.innerText = item;

                adviceList.appendChild(li);

            });

        }


    }

    catch (error) {

        console.error(error);

        alert(
            "Something went wrong. Please check the Flask server."
        );

    }


    button.innerText = "🔍 Analyze Symptoms";
    button.disabled = false;

}


// -------------------------------
// CLEAR BUTTON
// -------------------------------

function clearInput() {

    document.getElementById("symptoms").value = "";

    document.getElementById("result")
        .classList.add("hidden");

    document.getElementById("voiceStatus")
        .innerText = "";

}


// -------------------------------
// TEXT TO SPEECH
// -------------------------------

function speakResult() {

    const condition =
        document.getElementById("condition").innerText;

    const confidence =
        document.getElementById("confidence").innerText;


    const advice =
        document.getElementById("advice").innerText;


    if (condition === "") {

        alert("Please analyze symptoms first.");

        return;
    }


    const text =
        "Your AI health result is " +
        condition +
        ". " +
        confidence +
        ". General advice: " +
        advice;


    const speech =
        new SpeechSynthesisUtterance(text);


    speech.lang = "en-IN";
    speech.rate = 0.9;
    speech.pitch = 1;


    window.speechSynthesis.cancel();

    window.speechSynthesis.speak(speech);

}