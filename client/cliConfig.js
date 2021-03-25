export default class CliConfig {
  constructor({ username, room, host }) {
    this.username = username;
    this.room = room;

    const { hostname, port, protocol } = new URL(host);
    
    this.host = hostname;
    this.port = port;
    this.protocol = protocol.replace(/\W/, '');
  }

  static parseArguments(commands) {
    const cmd = new Map();
    for(const key in commands){
      const commandPrefix = '--';
      const index = Number(key);
      const parameter = commands[index];
      const valueParam = commands[index + 1];

      if(!~parameter.indexOf('--')) continue;
      cmd.set(parameter.replace(commandPrefix, ''), valueParam);
    }

    return new CliConfig(Object.fromEntries(cmd));
  }
}