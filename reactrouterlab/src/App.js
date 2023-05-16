import logo from "./logo.svg";
import "./App.css";
import styles from "./App.module.css";
import React from "react";
import { connectToSocket, disconnectFromSocket } from "./dataHandling";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import { DataDisplayer } from "./component/dataDisplayer";

function App() {
  const [sensorList, setSensorList] = React.useState([]);
  const [queue, setQueue] = React.useState([]);
  const [url, setUrl] = React.useState("");
  const [connected, setConnected] = React.useState(false);
  const [client, setClient] = React.useState(null);
  
  const onMessage = (message) => {
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
 React.useEffect(() => {
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
        <img src={logo} alt="Stuff sensor" className={styles['App-logo']} />
      </div>
      <header className={styles['App-header']}>
        <div className={styles['App-column-left']}>
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
        <div className={styles['App-column-left']}>
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
              placeholder="Entrez l'url de la datasource"
            />
            <input
              type="submit"
              value={connected ? "Se deconnecter" : "Se connecter"}
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
