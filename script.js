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
// let interimElement = document.getElementById("interim");
let startButton = document.getElementById("start");
let stopButton = document.getElementById("stop");
let downloadButton = document.getElementById("download");

// Initialize Speech Recognition API
let speechRecognition =
    window.speechRecognition || window.webkitSpeechRecognition,
  recognition,
  recording = false;

// Map of words to punctuation
const punctuationMap = Object.freeze({
  "full stop": ".",
  "period": ".",
  "comma": ",",
  "question mark": "?",
  "exclamation mark": "!",
  "exclamation point": "!"
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
           if(!document.querySelector(".interim")){
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

      // Enable download button if text is available
      if (results.innerHTML.length > 0) {
        downloadButton.disabled = false;
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
};

// Function to start listening for speech
function startListening() {
  console.log("Listening...");
  if (!recording) {
    recording = true;
    startButton.disabled = true;
    stopButton.disabled = false;
    speechToText();
  }
}

// Function to stop listening for speech
function stopRecording() {
  if (recognition) {
    recognition.stop();
  }
  recording = false;
  startButton.disabled = false;
  stopButton.disabled = true;
}

// Function to clear the results
function clearResults() {
  results.innerHTML = "";
  // interimElement.innerText = "";
  downloadButton.disabled = true;
}

// Function to download the recognized text
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
