import blessed from 'blessed';

export default class ComponentBuilder {
  #screen;
  #layout;
  #input;
  #chat;

  constructor() {}


  #baseComponent() {
    return {
      border: 'line',
      mouse: true,
      keys: true,
      top: 0,
      scrollbar: {
        ch: ' ',
        inverse: true
      },
      // habilita colocar cores e tags no texto
      tags: true
    }
  }

  setScreen({ title }) {
    this.#screen = blessed.screen({
      smartCSR: true, // Faz redimencionamento automatico,
      title,
    });

    this.#screen.key(['scape', 'q', 'C-c'], () => process.exit(0));
    return this;
  }

  setLayoutComponent() {
    this.#layout = blessed.layout({
      parent: this.#screen,
      width: '100%',
      height: '100%',
    });

    return this;
  }

  setInputComponent(onEnterPressed) {
    const input = blessed.textarea({
      parent: this.#screen,
      bottom: 0,
      height: '10%',
      inputOnFocus: true,
      padding: {
        top: 1,
        left: 2,
      },
      style: {
        fg: '#f6f6f6', // foreground,
        bg: '#353535',//background
      },
    });

    input.key('enter', onEnterPressed);
    this.#input = input;

    return this;
  }

  setChatComponent() {
    this.#chat = blessed.list({
      ...this.#baseComponent(),
      parent: this.#layout,
      align: 'left',
      width: '50%',
      height: '90%',
      items: ['{bold}Messenger{/}'],
    });

    return this;
  }

  build() {
    const component = {
      screen: this.#screen,
      input: this.#input,
    };

    return component;
  }
}