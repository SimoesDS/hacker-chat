import { constants } from './constants.js';

export default class Controller {
  #users = new Map();
  #rooms = new Map();

  constructor({ socketServer }) {
    this.socketServer = socketServer;
  }

  onNewConnection(socket) {
    const { id } = socket;
    console.log('connection stablish with ', id);
    const userData = { id, socket };

    this.#updateGlobalUserData(id, userData);

    socket.on('data', this.#onSocketData(id))
    socket.on('error', this.#onSocketClose(id))
    socket.on('end', this.#onSocketClose(id))
  }

  async joinRoom(socketId, data) {
    const userData = data;
    console.log(`${userData.username} joined! ${[socketId]}`);
    const user = this.#updateGlobalUserData(socketId, userData);

    const { roomId } = userData;
    const users = this.#joinUserOnRoom(roomId, user);

    const currentUsers = Array.from(users.values())
        .map(({ id, username }) => ({ username, id }));

    // Atualiza o usuário corrente sobre todos os usuarios
    // que já estão conectados na mesma sala
    this.socketServer
        .sendMessage(user.socket, constants.event.UPDATE_USERS, currentUsers);
   
  }

  #joinUserOnRoom(roomId, user) {
    const usersOnRoom = this.#rooms.get(roomId) ?? new Map();
    usersOnRoom.set(user.id, user);
    this.#rooms.set(roomId, usersOnRoom);

    return usersOnRoom;
  }

  #onSocketClose(id) {
    return data => {
      console.log('onSocketClosed', id);
    }
  }

  #onSocketData(id) {
    return data => {
      try {
        console.log(data.toString());
        const { event, message } = JSON.parse(data);

        this[event](id, message);
      } catch (error) {
        console.error(`wrong event format!!`, error, data.toString());
      }
    }
  }

  #updateGlobalUserData(socketId, userData) {
    const users = this.#users;
    const user = users.get(socketId) ?? {};

    const updateUsersData = {
      ...user,
      ...userData
    };

    users.set(socketId, updateUsersData);
    return users.get(socketId);
  }
}