import ComponentBuilder from "./components.js";

export default class TerminalController {
  constructor() {}

  #onInputReceived() {
    return function() {
      const message = this.getValue();
      console.log(message);
      this.clearValue();
    }
  }

  initializeTable(eventEmitter) {
    const componentBuilder = new ComponentBuilder()
      .setScreen({ title: 'HackerChat' }) // Define o titulo
      .setLayoutComponent() // Define o layout pra ficar no topo
      .setInputComponent(this.#onInputReceived(eventEmitter))
      .setChatComponent()
      .build()

    componentBuilder.input.focus();
    componentBuilder.screen.render();
  }
}