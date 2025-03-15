fetch("./languages.json")
  .then((response) => response.json())
  .then((data) => {
    const languageSelect = document.getElementById("language");
    data.forEach((language) => {
      const option = document.createElement("option");
      option.value = language.code;
      option.textContent = `${language.name} (${language.native})`;
      languageSelect.appendChild(option);
    });
  })
  .catch((error) => console.error("Error loading languages:", error));

let results = document.getElementById("results");
let interimElement = document.getElementById("interim");
let startButton = document.getElementById("start");
let stopButton = document.getElementById("stop");
let downloadButton = document.getElementById("download");

let speechRecognition =
    window.speechRecognition || window.webkitSpeechRecognition,
  recognition,
  recording = false;

const punctuationMap = {
  "full stop": ".",
  period: ".",
  comma: ",",
  "question mark": "?",
  "exclamation mark": "!",
  "exclamation point": "!",
};

const processSpeechResult = (speechResult) => {
  let words = speechResult.split(" ");
  return words
    .map((word) => punctuationMap[word.toLowerCase()] || word)
    .join(" ");
};

const speechToText = () => {
  try {
    recognition = new speechRecognition();
    recognition.lang = document.getElementById("language").value;
    recognition.interimResults = true;
    recognition.start();

    let lastFinalText = "";

    recognition.onresult = (event) => {
      let interimTranscript = "";
      let finalTranscript = lastFinalText;
      for (let i = 0; i < event.results.length; i++) {
        let transcript = processSpeechResult(event.results[i][0].transcript);

        if (event.results[i].isFinal) {
          finalTranscript += " " + transcript;
          lastFinalText = finalTranscript; // Store finalized text
        } else {
          interimTranscript += " " + transcript;
        }
      }
      console.log("Final: " + finalTranscript);
      console.log("Interim: " + interimTranscript);

      if (finalTranscript) {
        results.classList.add("final");
        results.classList.remove("interim");
        results.innerHTML = finalTranscript;
      } else {
        results.classList.add("interim");
        results.classList.remove("final");
        results.innerHTML = interimTranscript;
      }
      // results.innerHTML = finalTranscript + '<span class="interim">' + interimTranscript + '</span>';

      if (results.innerHTML.length > 0) {
        downloadButton.disabled = false;
      }
    };

    recognition.onspeechend = () => {
      if (recording) {
        speechToText()
        // setTimeout(() => speechToText(), 500);
      }
    };

    recognition.onerror = (event) => {
      stopRecording();
      results.classList.add("final");
      results.classList.remove("interim");
      alert("Error occurred in recognition: " + event.error);
      console.log("Error occurred in recognition: " + event);
    };
  } catch (error) {
    recording = false;
    console.error(error);
  }
};

function startListening() {
  console.log("listening");
  if (!recording) {
    recording = true;
    startButton.disabled = true;
    stopButton.disabled = false;
    speechToText();
  }
}

function stopRecording() {
  if (recognition) {
    recognition.stop();
  }
  results.classList.add("final");
  results.classList.remove("interim");
  recording = false;
  startButton.disabled = false;
  stopButton.disabled = true;
}

function clearResults() {
  results.innerHTML = "";
  // interimElement.innerText = "";
  downloadButton.disabled = true;
}

function download() {
  const text = results.innerHTML;
  const filename = "speech.txt";

  const element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain; charset=utf-8," + encodeURIComponent(text)
  );
  element.setAttribute("download", filename);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}
