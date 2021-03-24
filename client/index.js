import Events from 'events';
import CliConfig from './cliConfig.js';
import SocketClient from './src/socket.js';
import TerminalController from './src/terminalController.js';

const [,, ...commands] = process.argv;
const cliConfig = CliConfig.parseArguments(commands);

const componentEmitter = new Events();
const socketClient = new SocketClient(cliConfig)
await socketClient.initialize();

// const terminalController = new TerminalController();
// await terminalController.initializeTable(componentEmitter);
