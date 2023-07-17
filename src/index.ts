import { httpServer } from "./http_server/index";
import { createWsServer } from "./ws_server/index";

const HTTP_PORT = 8181;
const WS_PORT = 3000;

createWsServer(WS_PORT);

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);
