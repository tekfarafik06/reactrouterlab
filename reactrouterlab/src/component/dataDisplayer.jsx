import React from "react";
import "../App.css";

export function DataDisplayer({ sensorData }) {
  const slice = sensorData.payload.value.slice(-20);
  return (
    <>
      <p>
        <u>Sensor :</u> {sensorData.payload.name }
        <br></br>
        <u>Unité :</u> {sensorData.payload.type}
        <br></br>
        <u>Valeur actuelle :</u>{" "}
        {sensorData.payload.value[sensorData.payload.value.length - 1]}
      </p>
      <div className="container">
        <p className="right history-text">Historique</p>
        <ul>
          {slice.map((value, index) => {
            return <li key={index}>{value}</li>;
          })}
        </ul>
      </div>
    </>
  );
}
