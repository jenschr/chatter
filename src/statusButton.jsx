import React from "react";

import speechState from "./speech-state.js";


function StatusButton (props) {
  const {
    clickHandler,
    status
  } = props;

  let buttonText = "";

  switch (status) {
    case speechState.retrieving:
      buttonText = "Retreiving!";
      break;

    case speechState.converting:
      buttonText = "Converting!";
      break;

    case speechState.playing:
      buttonText = "Playing!";
      break;

    case speechState.waitAndThenPlay:
      buttonText = "WaitAndPlay!";
      break;

    default:
      buttonText = "Speak!";
  }

  const handleClick = (event) => {
    event.stopPropagation();
    event.preventDefault();
    clickHandler();
  }

  return (
    <button
      onClick={handleClick}
      className="w3-button w3-black w3-padding-large w3-large w3-margin-top status-button"
    >
      {buttonText}
    </button>
  );
}

export default StatusButton;
