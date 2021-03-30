import ComponentBuilder from './components.js';
import { constants } from './constants.js';

export default class TerminalController {
  #userColors = new Map();

  constructor() {}

  pickRandomColor() {
    // TODO: As vezes é gerado uma cor muito parecida com as que ja existem
    const randomValue = _ => Math.floor(Math.random() * 25 * 20).toString(16).padStart(2, '0');
    const red = randomValue();
    const green = randomValue();
    const blue = randomValue();
    const color = `#${red}${green}${blue}-fg`; 
    return color;
  }

  #getUserColor(username) {
    if(this.#userColors.get(username))
      return this.#userColors.get(username);

    const randomColor = this.pickRandomColor();
    this.#userColors.set(username, randomColor);

    return randomColor;
  }

  #onInputReceived(eventEmitter) {
    return function() {
      const message = this.getValue();
      eventEmitter.emit(constants.events.app.MESSAGE_SENT, message);
      this.clearValue();
    }
  }

  #onMessageReceived({ screen, chat }) {
    return msg => {
      const { username, message } = msg;
      const color = this.#getUserColor(username);
      chat.addItem(`{${color}}{bold}${username}{/}: ${message}`);
      screen.render();
    }
  }

  #onLogChange({ screen, activityLog }) {
    return msg => {
      const [ username ] = msg.split(/\s/);
      const color = this.#getUserColor(username);


      activityLog.addItem(`{${color}}{bold}${msg.toString()}{/}`);
      screen.render();
    }
  }

  #onStatusChange({ screen, status }) {
    return users => {
      const { content } = status.items.shift();
      status.clearItems();
      status.addItem(content);

      users.forEach(username => {
        const color = this.#getUserColor(username);
        status.addItem(`{${color}}{bold}${username}`);
      });

      screen.render();
    }
  }

  #registerEvents(eventEmitter, component) {
    eventEmitter.on(constants.events.app.MESSAGE_RECEIVED, this.#onMessageReceived(component));
    eventEmitter.on(constants.events.app.ACTIVITYLOG_UPDATED, this.#onLogChange(component));
    eventEmitter.on(constants.events.app.STATUS_UPDATED, this.#onStatusChange(component));
  }

  initializeTable(eventEmitter) {
    const componentBuilder = new ComponentBuilder()
      .setScreen({ title: 'HackerChat' }) // Define o titulo
      .setLayoutComponent() // Define o layout pra ficar no topo
      .setInputComponent(this.#onInputReceived(eventEmitter))
      .setChatComponent()
      .setActivityLogComponent()
      .setStatusComponent()
      .build();

    this.#registerEvents(eventEmitter, componentBuilder);

    componentBuilder.input.focus();
    componentBuilder.screen.render();

    // const users = ['Diego'];
    // eventEmitter.emit(constants.events.app.STATUS_UPDATE, users);

    // setTimeout(async() => {
    //   const delay = t => new Promise(r => setTimeout(r, t * 1000));

    //   users.push('Maria');
    //   eventEmitter.emit(constants.events.app.STATUS_UPDATE, users);
    //   await delay(1);

    //   users.push('Tesla');
    //   eventEmitter.emit(constants.events.app.STATUS_UPDATE, users);
    //   await delay(0.3);

    //   users.push('Troll1');
    //   eventEmitter.emit(constants.events.app.STATUS_UPDATE, users);
    //   await delay(3);
      
    //   users.push('Teste');
    //   eventEmitter.emit(constants.events.app.STATUS_UPDATE, users);
    //   users.push('Seila');
    // }, 1000);    
  }
}