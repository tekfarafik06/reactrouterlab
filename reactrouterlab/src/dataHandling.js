import Paho from "paho-mqtt";

export function connectToSocket(url, onMessage) {
  console.log("Connecting to " + url);
  // Créer une nouvelle instance client MQTT
  let client = new Paho.Client(url, 443, "clientId");

  // Définir les fonctions de rappel pour les événements de connexion, de déconnexion et de réception de messages
  client.onConnectionLost = onConnectionLost;
  client.onMessageArrived = onMessageArrived;

  try {
    // Se connecter au broker MQTT via WebSocket
    client.connect({
      onSuccess: onConnect,
      useSSL: true,
    });
  } catch {
    if (!client.isConnected() && url.startsWith("wss://")) {
      console.log("Connection failed");
      url = url.replace("wss://", "");
      console.log("Trying to connect to " + url);
      client = new Paho.Client(url, 443, "clientId");
      client.onConnectionLost = onConnectionLost;
      client.onMessageArrived = onMessageArrived;
      client.connect({
        onSuccess: onConnect,
        useSSL: true,
      });
    }
  }

  // Fonction de rappel appelée lorsqu'une connexion est établie avec succès
  function onConnect() {
    console.log("Connecté avec succès à la websocket MQTT");

    // S'abonner à un sujet spécifique
    client.subscribe("#");
  }

  // Fonction de rappel appelée lorsque la connexion est perdue
  function onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0) {
      console.log("La connexion a été perdue : " + responseObject.errorMessage);
    }
  }

  // Fonction de rappel appelée lorsqu'un nouveau message est reçu
  function onMessageArrived(message) {
    onMessage(message);
    // console.log(`Nouveau message reçu : " + ${message.payloadString} -- topic: ${message.destinationName}`);
  }
  return client;
}
export function disconnectFromSocket(client) {
    if (!client.isConnected()) {
      console.log(client);
      return;
    }
    client.disconnect();
  }