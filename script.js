// Fetches the list of supported languages from the JSON file and populates the dropdown
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

// Selecting elements from the DOM
let results = document.getElementById("results");
let start_Btn = document.getElementById("start");
let stop_Btn = document.getElementById("stop");
let download_Btn = document.getElementById("download");
let voiceSelect = document.getElementById("voiceSelect");
let speak_Btn = document.getElementById("speak");

// Initialize Speech Recognition API
let speechRecognition =
    window.speechRecognition || window.webkitSpeechRecognition,
  recognition,
  recording = false;

if (!speechRecognition) {
  alert(`Speech Recognition API is not supported in this browser.
Please use Chrome
     `);
}

// Map of words to punctuation
const punctuationMap = Object.freeze({
  "full stop": ".",
  period: ".",
  comma: ",",
  "question mark": "?",
  "exclamation mark": "!",
  "exclamation point": "!",
});

// Function to replace spoken punctuation words with actual symbols
const processSpeechResult = (speechResult) => {
  let words = speechResult.split(" ");
  return words
    .map((word) => punctuationMap[word.toLowerCase()] || word)
    .join(" ");
};

// Function to start speech recognition
function speechToText() {
  if (!speechRecognition)
    return alert(`Speech Recognition API is not supported in this browser.
      Please use Chrome
    `);
  try {
    recognition = new speechRecognition();
    recognition.lang = document.getElementById("language").value;
    recognition.interimResults = true;
    recognition.start();

    let fullTranscript = "";

    recognition.onresult = (event) => {
      let interimTranscript = "";
      // let transcript = processSpeechResult(event.results[0][0].transcript);
      let transcript = event.results[0][0].transcript;
      if (event.results[0].isFinal) {
        results.innerHTML += " " + transcript; // Append to full transcripte finalized text
        results.querySelector(".interim").remove();
      } else {
        // interim does not exist creat one
        if (!document.querySelector(".interim")) {
          const interim = document.createElement("span");
          interim.classList.add("interim");
          results.appendChild(interim);
        }
        document.querySelector(".interim").innerHTML = " " + transcript;
      }
      // for (let i = 0; i < event.results.length; i++) {
      //   let transcript = processSpeechResult(event.results[i][0].transcript);

      //   if (event.results[i].isFinal) {
      //     fullTranscript += " " + transcript; // Append to full transcripte finalized text
      //   } else {
      //     interimTranscript += " " + transcript;
      //   }
      // }
      // console.log("Final: " + finalTranscript);
      // console.log("Interim: " + interimTranscript);

      // Display the recognized text
      // if (fullTranscript) {
      //   results.classList.add("final");
      //   results.classList.remove("interim");
      //   results.innerHTML = fullTranscript;
      // } else {
      //   results.classList.add("interim");
      //   results.classList.remove("final");
      //   results.innerHTML = interimTranscript;
      // }
      // results.innerHTML = finalTranscript + '<span class="interim">' + interimTranscript + '</span>';

      // Enable download Button if text is available
      if (results.innerHTML.length > 0) {
        download_Btn.disabled = false;
        speak_Btn.style.display = "inline-block";
      }
    };

    // Restart recognition when speech ends if recording is still active
    recognition.onspeechend = () => {
      if (recording) {
        speechToText();
        // setTimeout(() => speechToText(), 500);
      }
    };

    // Handle errors
    recognition.onerror = (event) => {
      stopRecording();
      // alert("Error occurred in recognition: " + event.error);
      console.log("Error occurred in recognition: " + event.error);
    };
  } catch (error) {
    recording = false;
    console.error(error);
  }
}

// Function to start listening for speech
function startListening() {
  console.log("Listening...");
  if (!recording) {
    recording = true;
    start_Btn.disabled = true;
    stop_Btn.disabled = false;
    speechToText();
  }
}

// Function to stop listening for speech
function stopRecording() {
  if (recognition) {
    recognition.stop();
  }
  recording = false;
  start_Btn.disabled = false;
  stop_Btn.disabled = true;
    if (!document.querySelector(".interim")) {
   TextToSpeech();
  }
}

// Function to clear the results
function clearResults() {
  results.innerHTML = "";
  // interimElement.innerText = "";
  download_Btn.disabled = true;
}

// Function to download the recognized text
function download() {
  const text = results.innerHTML;
  const firstLetterofFirstWord = text.trim().split(" ")[0].charAt(0).toUpperCase();
  const remainingLettersofFirstWord = text.trim().split(" ")[0].slice(1);
  const filename = `${firstLetterofFirstWord}${remainingLettersofFirstWord}_speech.txt`;

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

// Text-to-Speech

let utterance = new SpeechSynthesisUtterance();
let voices = [];

// Function to set voices
function setVoices() {
  voices = window.speechSynthesis.getVoices();
  utterance.voice = voices[0];

  voices.forEach(
    (voice, index) =>
      (voiceSelect.options[index] = new Option(voice.name, index))
  );
  console.log(voiceSelect.selectedIndex)
}

setVoices();

if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = setVoices;
}

function TextToSpeech() {
  if (recording == false && results.innerHTML.trim() !== "") {
    utterance.text = results.innerHTML;
    utterance.voice = voices[voiceSelect.selectedIndex];
    console.log(utterance.voice)
    alert(`voice: ${utterance.voice?.name}`)
    speechSynthesis.speak(utterance);
  }
}
