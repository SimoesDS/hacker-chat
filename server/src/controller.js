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
   
    this.broadCast({
      socketId,
      roomId,
      message: { id: socketId, username: userData.username},
      event: constants.event.NEW_USER_CONNECTED,
    });
  }

  broadCast({ socketId, roomId, event, message, includeCurrentSocket = false }) {
    const usersOnRoom = this.#rooms.get(roomId);

    for (const [key, user] of usersOnRoom) {
        if(!includeCurrentSocket && key === socketId) continue;

        this.socketServer.sendMessage(user.socket, event, message);
    }
  }

  message(socketId, data) {
    const { username, roomId } = this.#users.get(socketId);

    this.broadCast({
        roomId,
        socketId,
        event: constants.event.MESSAGE,
        message: { username, message: data },
        includeCurrentSocket: true,
    });

  }

  #joinUserOnRoom(roomId, user) {
    const usersOnRoom = this.#rooms.get(roomId) ?? new Map();
    usersOnRoom.set(user.id, user);
    this.#rooms.set(roomId, usersOnRoom);

    return usersOnRoom;
  }

  #logoutUser(id, roomId) {
    this.#users.delete(id);
    const usersOnRoom = this.#rooms.get(roomId);
    usersOnRoom.delete(id);

    this.#rooms.set(roomId, usersOnRoom);
  }

  #onSocketClose(id) {
    return _ => {
      const { username, roomId } = this.#users.get(id);
      console.log(username, 'diconnected', id);
      this.#logoutUser(id, roomId);

      this.broadCast({
          roomId,
          message: { id, username },
          socketId: id,
          event: constants.event.DISCONNECT_USER,
      });
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