import logo from "./logo.svg";
import "./App.css";
import styles from "./App.module.css";
import React, { useState, useEffect } from "react";
import { connectToSocket, disconnectFromSocket } from "./dataHandling";
import { Routes, Route, Link } from "react-router-dom";
import { DataDisplayer } from "./component/dataDisplayer";

function App() {
  const [sensorList, setSensorList] = useState([]);
  const [queue, setQueue] = useState([]);
  const [url, setUrl] = useState("");
  const [connected, setConnected] = useState(false);
  const [client, setClient] = useState(null);
  const existingUrls = ["wss://random.pigne.org", "wss://wss.databeam.eu"];
  
  const onMessage = async (message) => {
    const topic = message.destinationName;
    const payload = JSON.parse(message.payloadString);
    if (sensorList.find((sensor) => sensor.topic === topic) === undefined) {
      payload.value = [payload.value];
      const copy = [...sensorList, { topic, payload }];
      setQueue(copy);
    }
  };

  const deconnect = () => {
    setConnected(false);
    disconnectFromSocket(client);
    setQueue([]);
    setSensorList([]);
    setClient(null);
  };

  useEffect(() => {
    if (!queue.length) return;
    const idx = sensorList.findIndex(
      (sensor) => sensor.topic === queue[0].topic
    );
    if (idx !== -1) {
      const copy = [...sensorList];
      copy[idx].payload.value = [
        ...copy[idx].payload.value,
        queue[0].payload.value,
      ];
      setSensorList(copy);
    } else {
      setSensorList([...sensorList, queue[0]]);
    }
    setQueue(queue.slice(1));
  }, [queue, sensorList]);

  return (
    <>
      <div className={styles.Header}>
        <img src={logo} alt="Stuff sensor" className={styles["App-logo"]} />
      </div>
      <header className={styles["App-header"]}>
        <div className={styles["App-column-left"]}>
          <Routes>
            <Route index element={<main className=""></main>} />
            {sensorList.map((sensor) => {
              return (
                <Route
                  key={sensor.topic}
                  path={`/${sensor.payload.name}`}
                  element={<DataDisplayer sensorData={sensor} />}
                />
              );
            })}
          </Routes>
        </div>
        <div className={styles["App-column-left"]}>
          <form
            onSubmit={(evt) => {
              evt.preventDefault();
              if (connected) {
                deconnect();
                return false;
              }
              const cli = connectToSocket(url, onMessage);
              if (cli === null) return false;
              setClient(cli);
              setConnected(true);
              return false;
            }}
          >
             <input
  onChange={(evt) => setUrl(evt.target.value)}
  placeholder="Entrez l'url de la datasource "
  list="urlSuggestions"
/>
<datalist id="urlSuggestions">
  {existingUrls.map((url) => (
    <option key={url} value={url} />
  ))}
</datalist>
<input
  type="submit"
  value={connected ? "Se déconnecter" : "Se connecter"}
  className={connected ? styles.disconnectButton : styles.connectButton}
/>
    </form>
          <>
          {sensorList.map((sensor) => {
    return (
      <ul key={sensor.topic} className={styles['sensor-list']}>
        <Link to={`/${sensor.payload.name}`}>
          {sensor.payload.name}
        </Link>
      </ul>
    );
  })}
          </>
        </div>
      </header>
    </>
  );
}

export default App;
