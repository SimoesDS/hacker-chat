import ComponentBuilder from "./components.js";
import { constants } from "./constants.js";

export default class TerminalController {
  #userColors = new Map();

  constructor() {}

  pickRandomColor() {
    return `#${((1 << 24) * Math.random() | 0).toString(16)}-fg`
  }

  #getUserColor(userName) {
    if(this.#userColors.get(userName))
      return this.#userColors.get(userName);

    const randomColor = this.pickRandomColor();
    this.#userColors.set(userName, randomColor);

    return randomColor;
  }

  #onInputReceived() {
    return function() {
      const message = this.getValue();
      console.log(message);
      this.clearValue();
    }
  }

  #onMessageReceived({ screen, chat }) {
    return msg => {
      const { userName, message } = msg;
      const color = this.#getUserColor(userName);
      chat.addItem(`{${color}}{bold}${userName}{/}: ${message}`);
      screen.render();
    }
  }

  #onLogChange({ screen, activityLog }) {
    return msg => {
      const [ userName ] = msg.split(/\s/);
      const color = this.#getUserColor(userName);


      activityLog.addItem(`{${color}}{bold}${msg.toString()}{/}`);
      screen.render();
    }
  }

  #onStatusChange({ screen, status }) {
    return users => {
      const { content } = status.items.shift();
      status.clearItems();
      status.addItem(content);

      users.forEach(userName => {
        const color = this.#getUserColor(userName);
        status.addItem(`{${color}}{bold}${userName}`);
      });

      screen.render();
    }
  }

  #registerEvents(eventEmitter, component) {
    eventEmitter.on(constants.events.app.MESSAGE_RECEIVED, this.#onMessageReceived(component));
    eventEmitter.on(constants.events.app.ACTIVITYLOG_UPDATE, this.#onLogChange(component));
    eventEmitter.on(constants.events.app.STATUS_UPDATE, this.#onStatusChange(component));
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