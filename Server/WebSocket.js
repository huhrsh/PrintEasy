  const WebSocket = require('ws');
  let wss;

  const userClients = new Map();
  const shopClients = new Map();

  function initWebSocketServer(server) {
    wss = new WebSocket.Server({ server });

    wss.on('connection',(ws,req)=>{
      const urlParts = req.url.split('/');
      const userType = urlParts[1];
      const id = urlParts[2];

      if (userType === 'user' && id) {
        ws.userId = id;
        userClients.set(id, ws);

        ws.on('close', () => {
          userClients.delete(id);
        });
      } else if (userType === 'shop' && id) {
        ws.shopId = id;
        shopClients.set(id, ws);

        ws.on('close', () => {
          shopClients.delete(id);
        });
      } else {
        ws.close();
      }
    })

  }

  // function notifyShop(shopId, printId, priority) {
  //   wss.clients.forEach((client) => {
  //     if (client.shopId === shopId && client.readyState === WebSocket.OPEN) {
  //       client.send(JSON.stringify({ type: 'newPrint', shopId, printId, priority }));
  //     }
  //   });
  // }

  function notifyShop(shopId, printId, priority) {
    const shopWebSocket = shopClients.get(shopId);
    // console.log(shopWebSocket);
    // console.log("notify shop")
    if (shopWebSocket && shopWebSocket.readyState === WebSocket.OPEN) {
      shopWebSocket.send(JSON.stringify({ type: 'newPrint', shopId, printId, priority }));
    }
  }

  function notifyUser(userId,print){
    const userWebSocket = userClients.get(userId);
    // console.log("notify user")
    if (userWebSocket && userWebSocket.readyState === WebSocket.OPEN) {
      userWebSocket.send(JSON.stringify({ type: 'complete', print }));
    }
  }

  function sendToShopFromUser(userId, shopId, message) {
    const shopWebSocket = shopClients.get(shopId);
    if (shopWebSocket && shopWebSocket.readyState === WebSocket.OPEN) {
      shopWebSocket.send(JSON.stringify({ type: 'messageFromUser', userId, message }));
    }
  }
  
  function sendToUserFromShop(shopId, userId, message) {
    const userWebSocket = userClients.get(userId);
    if (userWebSocket && userWebSocket.readyState === WebSocket.OPEN) {
      userWebSocket.send(JSON.stringify({ type: 'messageFromShop', shopId, message }));
    }
  }

  module.exports = {
    initWebSocketServer,
    notifyShop,
    notifyUser,
    sendToShopFromUser,
    sendToUserFromShop
  };
