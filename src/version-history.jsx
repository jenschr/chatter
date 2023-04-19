import React from "react";

function VersionHistory(props) {
  return (
    <div className="w3-row-padding w3-padding-64 w3-container">
      <div className="w3-content">
        <h1>V1.1.0</h1>
        <h5 className="w3-padding-32">
          Har lagt til at filen hentes når man trykker Enter + støtte for flere
          linjer. Må pønske litt på hvordan jeg kan gjøre caching. Thomas
          foreslo å bruke LocalStorage? Får se om det er enkleste løsning.
        </h5>
        <h1 className="w3-text-grey">Første versjon</h1>
        <h5 className="w3-text-grey">
          Fant en grei template som virker med både mobil og PC. Ganske greit å
          få dette opp og gå også.
        </h5>

        <p className="w3-text-grey">
          Bruker dette som en måte å friske opp React, så jeg bruker litt tid på
          å gjøre det på "riktig" måte.
        </p>
      </div>
    </div>
  );
}

export default VersionHistory;
