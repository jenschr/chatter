import React, { useState, useReducer } from "react";
import ReactAudioPlayer from "react-audio-player";
import sum from "hash-sum";

import "./App.css";
import useInterval from "./useInterval.js";
import { UID, KEY } from "./secret.js";
import StatusButton from "./statusButton.jsx";
import VersionHistory from "./version-history.jsx";
import QuoteOfTheDay from "./quote-of-the-day.jsx";
import Footer from "./footer.jsx";
import speechState from "./speech-state.js";
import reducer from "./reducer.js";
import * as ACTION from "./actions.js";

const VOICE = {
  NL: "nl-NL-MaartenNeural",
  NO: "nb-NO-FinnNeural",
  EN: "en-GB-RyanNeural",
};

const phraseList = [
  { text: "Ja" },
  { text: "Nei" },
  { text: "Kanskje" },
  { text: "Det driter jeg i", short: "Driter i..." },
  { text: "Vent litt mens jeg skriver noe", short: "Vent litt..." },
  {
    text: "En van je hoempa, hoempa, hoempa dada da-a-a!",
    short: "♬",
    lang: "NL",
  },
];

const placeholderPhrase = "Bytt denne teksten med noe nyttig";

const axios = require("axios").default;

const baseUrl = "https://play.ht/api/v1";
const convertUrl = baseUrl + "/convert";
const resultUrl = baseUrl + "/articleStatus?transcriptionId=";

const initialState = {
  phrases: {},
  textToSay: placeholderPhrase,
  currentSpeechState: speechState.idle,
  activeAudioFile: "",
  activeTranscriptionId: 0,
  errors: [],
};

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const {
    textToSay,
    activeAudioFile,
    activeTranscriptionId,
    currentSpeechState,
  } = state;

  const [isActive, setIsActive] = useState(false);

  const speechRequest = {
    voice: "nb-NO-FinnNeural",
    content: "",
    title: "jensatester", // Optional
    trimSilence: false, // Optional
  };

  useInterval(() => {
    if (currentSpeechState === speechState.retrieving) {
      axios
        .get(resultUrl + activeTranscriptionId, {
          headers: {
            "X-User-ID": UID,
            Authorization: KEY,
          },
        })
        .then(function (response) {
          console.log("axios response: " + response);
          // {"status":"transcriping","transcriptionId":"-NB7NC5kkMThnqOaE7Re","contentLength":3,"wordCount":3}
          if (response && response.data.converted) {
            dispatch({
              type: ACTION.SET_ACTIVE_AUDIO_FILE,
              payload: response.data.audioUrl,
            });
            dispatch({
              type: ACTION.SET_CURRENT_SPEECH_STATE,
              payload: speechState.playing,
            });
            console.log("Play.ht gave us " + response.data.audioUrl);
          } else if (response && response.data.error) {
            dispatch({
              type: ACTION.AXIOS_ERROR,
              payload: response.data.errorMessage,
            });
          } else {
            // Just hang here...
          }
        })
        .catch(function (error) {
          dispatch({ type: ACTION.AXIOS_ERROR, payload: error });
        });
    } else if (currentSpeechState === speechState.waitAndThenPlay) {
      dispatch({
        type: ACTION.SET_CURRENT_SPEECH_STATE,
        payload: speechState.playing,
      });
      handleSpeak();
    }
  }, 1000);

  function saySomething(whatToSay) {
    dispatch({ type: ACTION.SAY, payload: whatToSay });
  }

  const handleMenuClick = (event) => {
    setIsActive((current) => !current);
  };

  const doFocus = (event) => {
    dispatch({ type: ACTION.SET_TEXT_TO_SAY, payload: "" });
    console.log("OnFocus");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      console.log("do validate");
      saySomething(textToSay);
    }
    return false;
  };

  const audioFinished = (e) => {
    console.log(`Finished ${JSON.stringify(e)}`);
    dispatch({ type: ACTION.AUDIO_FINISHED });
  };

  const handleSpeak = (event) => {
    console.log(speechRequest);
    speechRequest.content = [textToSay];
    dispatch({
      type: ACTION.SET_CURRENT_SPEECH_STATE,
      payload: speechState.converting,
    });

    axios
      .post(convertUrl, speechRequest, {
        headers: {
          "X-User-ID": UID,
          Authorization: KEY,
        },
      })
      .then(function (response) {
        console.log(`axios response: ${response}`);
        // {"status":"transcriping","transcriptionId":"-NB7NC5kkMThnqOaE7Re","contentLength":3,"wordCount":3}
        if (response && response.data && response.data.status) {
          if (
            response.data.status === "CREATED" &&
            response.data.transcriptionId
          ) {
            // success
            dispatch({
              type: ACTION.SET_ACTIVE_TRANSCRIPTION_ID,
              payload: response.data.transcriptionId,
            });
          } // fail
          else {
            console.log(`Play.ht responded with ${response.data.status}?`);
            dispatch({
              type: ACTION.SET_CURRENT_SPEECH_STATE,
              payload: speechState.idle,
            });
          }
        } else {
          dispatch({
            type: ACTION.SET_CURRENT_SPEECH_STATE,
            payload: speechState.idle,
          });
        }
      })
      .catch(function (error) {
        dispatch({ type: ACTION.AXIOS_ERROR, payload: error });
      });
  };

  const handleTextInput = (event) => {
    dispatch({ type: ACTION.SET_TEXT_TO_SAY, payload: event.target.value });
  };

  const handlePhraseButton = (event) => {
    dispatch({ type: ACTION.SAY, payload: event.target.value });
  };

  return (
    <div className="App">
      {/* Navbar */}
      <div className="w3-top">
        <div className="w3-bar w3-red w3-card w3-left-align w3-large">
          <button
            className="w3-bar-item w3-button w3-hide-medium w3-hide-large w3-right w3-padding-large w3-hover-white w3-large w3-red"
            onClick={handleMenuClick}
            title="Toggle Navigation Menu"
          >
            <i className="fa fa-bars"></i>
          </button>
          <a
            className="w3-bar-item w3-button w3-padding-large w3-white"
            href="/"
          >
            Home
          </a>
          {phraseList.map((phrase, index) => (
            <button
              className="w3-bar-item w3-button w3-hide-small w3-padding-large w3-hover-white"
              key={phrase + index}
              value={phrase.text}
              onClick={handlePhraseButton}
              title={phrase.text}
            >
              {phrase.short ? phrase.short : phrase.text}
            </button>
          ))}
        </div>

        {/* Navbar on small screens */}
        <div
          id="navDemo"
          className={
            isActive
              ? "w3-bar-block w3-white w3-hide w3-hide-large w3-hide-medium w3-large w3-show"
              : "w3-bar-block w3-white w3-hide w3-hide-large w3-hide-medium w3-large"
          }
        >
          {phraseList.map((phrase, index) => (
            <button
              className="w3-bar-item w3-button w3-padding-large"
              key={phrase.text + index}
              value={phrase.text}
              onClick={handlePhraseButton}
              title={phrase.text}
            >
              {phrase.short ? phrase.short : phrase.text}
            </button>
          ))}
        </div>
      </div>

      {/* Header */}
      <header className="w3-container w3-red w3-center main-header">
        <p>
          <textarea
            autoComplete="true"
            className="text-to-say"
            onFocus={doFocus}
            onInput={handleTextInput}
            onKeyDown={handleKeyDown}
            rows={4}
            value={textToSay}
          />
        </p>
        <StatusButton clickHandler={handleSpeak} status={currentSpeechState} />
        <div>
          <ReactAudioPlayer
            src={activeAudioFile}
            autoPlay
            onEnded={audioFinished}
          />
        </div>
      </header>

      {/* First Grid */}
      <VersionHistory />

      {/* Quote of the day */}
      <QuoteOfTheDay />

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
