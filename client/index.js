import Events from 'events';
import CliConfig from './cliConfig.js';
import EventManager from './src/eventManager.js';
import SocketClient from './src/socket.js';
import TerminalController from './src/terminalController.js';

const [,, ...commands] = process.argv;
const cliConfig = CliConfig.parseArguments(commands);

const componentEmitter = new Events();
const socketClient = new SocketClient(cliConfig)
await socketClient.initialize();

const eventManager = new EventManager({ componentEmitter, socketClient });
const events = eventManager.getEvents();
socketClient.attachEvents(events);

const data = {
  roomId: cliConfig.room,
  username: cliConfig.username
}
eventManager.joinRoomAndWaitForMessages(data);

const terminalController = new TerminalController();
await terminalController.initializeTable(componentEmitter);
