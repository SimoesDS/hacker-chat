import ComponentBuilder from "./components.js";

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

  #registerEvents(eventEmitter, component) {
    eventEmitter.on('message:received', this.#onMessageReceived(component));
    eventEmitter.on('message:updated', this.#onLogChange(component));
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

    setInterval(() => {
      eventEmitter.emit('message:updated', 'Diego join');
      eventEmitter.emit('message:updated', 'Seila join');
      eventEmitter.emit('message:received', { userName: 'Diego', message: 'hello world'});
      
      eventEmitter.emit('message:received', { userName: 'Seila', message: 'Oi'});
      eventEmitter.emit('message:updated', 'Jaquan join');
      eventEmitter.emit('message:received', { userName: 'Jaquan', message: 'consequatur'});
      eventEmitter.emit('message:updated', 'Diego left');
      //eventEmitter.emit('message:received', { userName: 'Davon', message: 'facilis iste explicabo'});
    }, 1000)
  }
}