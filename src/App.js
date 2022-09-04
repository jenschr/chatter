import './App.css';
import './useInterval';
import {UID, KEY} from './secret';
import ReactAudioPlayer from 'react-audio-player';
import {useState, useEffect, useRef} from 'react';

function App() {
  const speechState = {
    "idle": "idle",
    "converting": "converting",
    "retrieving": "retrieving",
    "playing": "playing",
    "waitAndThenPlay": "waitAndThenPlay",
  }
  const axios = require('axios').default;
  const [textToSay, setTextToSay] = useState('Bytt denne teksten med noe nyttig');
  const [activeAudioFile, setActiveAudioFile] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [currentSpeechState, setCurrentSpeechState] = useState(speechState.idle);
  const [activeTranscriptionId, setActiveTranscriptionId] = useState(0);
  const baseUrl = "https://play.ht/api/v1";
  const convertUrl = baseUrl+"/convert";
  const resultUrl  = baseUrl+"/articleStatus?transcriptionId=";
  var speechRequest = {
    "voice": "nb-NO-FinnNeural",
    "content": "",
    "title": "jensatester", // Optional
    "trimSilence": false,    // Optional
  }
  
  var timer;

  useInterval(() => {
      if( currentSpeechState == speechState.retrieving )
      {
        axios.get(resultUrl+activeTranscriptionId, {
     headers: {
       'X-User-ID': UID,
       'Authorization': KEY,
     }})
        .then(function (response) {
          console.log("axios response: "+response);
          // {"status":"transcriping","transcriptionId":"-NB7NC5kkMThnqOaE7Re","contentLength":3,"wordCount":3}
          if( response && response.data.converted )
          {
            console.log("Play.ht gave us "+response.data.audioUrl);
            setActiveAudioFile(response.data.audioUrl);
            setCurrentSpeechState(speechState.playing);
          }
          else if( response && response.data.error )
          {
            console.log("Play.ht error "+response.data.errorMessage);
            setCurrentSpeechState(speechState.idle);
          }
          else
          {
            // Just hang here...
          }
        })
        .catch(function (error) {
          console.log("axios error: "+error);
          setCurrentSpeechState(speechState.idle);
        });
      }
      else if( currentSpeechState == speechState.waitAndThenPlay )
      {
        setCurrentSpeechState(speechState.idle);
        handleSpeak();
      }
    }, 1000);

  useEffect(() => {
    //();
  });

  function saySomething( whatToSay )
  {
    setTextToSay( whatToSay );
    setCurrentSpeechState(speechState.waitAndThenPlay);
  }

  const handleMenuClick = event => {
    setIsActive(current => !current);
  };

  const doFocus = (event) => {
    setTextToSay("");
    console.log("OnFocus");
  }

  const handleSpeak = event => {
    console.log( speechRequest )
    speechRequest.content = [textToSay];
    setCurrentSpeechState(speechState.converting);
    axios.post(convertUrl, speechRequest, {
     headers: {
       'X-User-ID': UID,
       'Authorization': KEY,
     }})
    .then(function (response) {
      console.log("axios response: "+response);
      // {"status":"transcriping","transcriptionId":"-NB7NC5kkMThnqOaE7Re","contentLength":3,"wordCount":3}
      if( response && response.data && response.data.status)
      {
        if( response.data.status == "transcriping" && response.data.transcriptionId ) // success
        {
          setActiveTranscriptionId(response.data.transcriptionId);
          setCurrentSpeechState(speechState.retrieving);
        }
        else // fail
        {
          console.log("Play.ht responded with "+response.data.status+"?");
          setCurrentSpeechState(speechState.idle);
        }
      }
      else
      {
        setCurrentSpeechState(speechState.idle);
      }
    })
    .catch(function (error) {
      console.log("axios error: "+error);
      setCurrentSpeechState(speechState.idle);
    });
  };

  function useInterval(callback, delay) {
    const savedCallback = useRef();

    // Remember the latest function.
    useEffect(() => {
      savedCallback.current = callback;
    }, [callback]);

    // Set up the interval.
    useEffect(() => {
      function tick() {
        savedCallback.current();
      }
      if (delay !== null) {
        let id = setInterval(tick, delay);
        return () => clearInterval(id);
      }
    }, [delay]);
  }

  return (
    <div className="App">
      {/* Navbar */}
      <div className="w3-top">
        <div className="w3-bar w3-red w3-card w3-left-align w3-large">
          <a className="w3-bar-item w3-button w3-hide-medium w3-hide-large w3-right w3-padding-large w3-hover-white w3-large w3-red" onClick={handleMenuClick} title="Toggle Navigation Menu"><i className="fa fa-bars"></i></a>
          <a href="#" className="w3-bar-item w3-button w3-padding-large w3-white">Home</a>
          <a href="#" onClick={() => saySomething('Ja')} className="w3-bar-item w3-button w3-hide-small w3-padding-large w3-hover-white">Ja</a>
          <a href="#" onClick={() => saySomething('Nei')} className="w3-bar-item w3-button w3-hide-small w3-padding-large w3-hover-white">Nei</a>
          <a href="#" onClick={() => saySomething('Kanskje')} className="w3-bar-item w3-button w3-hide-small w3-padding-large w3-hover-white">Kanskje</a>
          <a href="#" onClick={() => saySomething('Vent litt mens jeg skriver noe')} className="w3-bar-item w3-button w3-hide-small w3-padding-large w3-hover-white">Dust</a>
        </div>

        {/* Navbar on small screens */}
        <div id="navDemo" className={ isActive ? 'w3-bar-block w3-white w3-hide w3-hide-large w3-hide-medium w3-large w3-show' : 'w3-bar-block w3-white w3-hide w3-hide-large w3-hide-medium w3-large' }>
          <a href="#" onClick={() => saySomething('Ja')} className="w3-bar-item w3-button w3-padding-large">Ja</a>
          <a href="#" onClick={() => saySomething('Nei')} className="w3-bar-item w3-button w3-padding-large">Nei</a>
          <a href="#" onClick={() => saySomething('Kanskje')} className="w3-bar-item w3-button w3-padding-large">Kanskje</a>
          <a href="#" onClick={() => saySomething('Vent litt mens jeg skriver noe')} className="w3-bar-item w3-button w3-padding-large">Dust</a>
        </div>
      </div>

      {/* Header */}
      <header className="w3-container w3-red w3-center" style={{padding:"128px 16px"}}>
        <p><input value={textToSay} onFocus={doFocus} style={{alignSelf:"stretch",width:"100%"}} onInput={e => setTextToSay(e.target.value)} /></p>
        <button onClick={handleSpeak} className="w3-button w3-black w3-padding-large w3-large w3-margin-top">Speak!</button>
        <div><ReactAudioPlayer
          src={activeAudioFile}
          autoPlay
        /></div>
        <p>{currentSpeechState}:{activeTranscriptionId}</p>
      </header>

      {/* First Grid */}
      <div className="w3-row-padding w3-padding-64 w3-container">
        <div className="w3-content">
                      <h1>Første test</h1>
            <h5 className="w3-padding-32">Fant en grei template som virker med både mobil og PC. Ganske greit å få dette opp og gå også.</h5>

            <p className="w3-text-grey">Bruker dette som en måte å friske opp React, så jeg bruker litt tid på å gjøre ting på "riktig" måte.</p>
        </div>
      </div>

      <div className="w3-container w3-black w3-center w3-opacity w3-padding-64">
          <h1 className="w3-margin w3-xlarge">Quote of the day: live life</h1>
      </div>

      {/* Footer */}
      <footer className="w3-container w3-padding-64 w3-center w3-opacity">  
        <div className="w3-xlarge w3-padding-32">
          <i className="fa fa-facebook-official w3-hover-opacity"></i>
          <i className="fa fa-instagram w3-hover-opacity"></i>
          <i className="fa fa-snapchat w3-hover-opacity"></i>
          <i className="fa fa-pinterest-p w3-hover-opacity"></i>
          <i className="fa fa-twitter w3-hover-opacity"></i>
          <i className="fa fa-linkedin w3-hover-opacity"></i>
       </div>
       <p>Footer shit goes here</p>
      </footer>
    </div>
  );
}

export default App;
