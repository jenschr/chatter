import * as ACTION from "./actions.js";
import speechState from "./speech-state.js";


const reducer = (state = {}, action = {}) => {
  const {type, payload} = action;

  switch (type) {
    case ACTION.SAY:
      return {
        ...state,
        textToSay: payload,
        currentSpeechState: speechState.waitAndThenPlay
      };

    case ACTION.SET_TEXT_TO_SAY:
      return {
        ...state,
        textToSay: payload
      };

    case ACTION.SET_CURRENT_SPEECH_STATE:
      if (state.currentSpeechState === payload) {
        break;
      }
      return {
        ...state,
        currentSpeechState: payload
      };

    case ACTION.SET_ACTIVE_AUDIO_FILE:
      return {
        ...state,
        activeAudioFile: payload
      };

    case ACTION.AUDIO_FINISHED:
      return {
        ...state,
        textToSay: "",
        currentSpeechState: speechState.idle
      };

    case ACTION.SET_ACTIVE_TRANSCRIPTION_ID:
      return {
        ...state,
        activeTranscriptionId: payload,
        currentSpeechState: speechState.retrieving
      };

    case ACTION.AXIOS_ERROR:
      console.log(`axios error: ${payload}`);

      return {
        ...state,
        currentSpeechState: speechState.idle,
        errors: [
          payload,
          ...state.errors
        ]
      };

    default:
      return state;
  }

  return state;
};

export default reducer;
