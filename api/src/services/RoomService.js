import { v4 } from 'uuid';
import UserService from './UserService';
import { isEmpty } from 'lodash';
export default class RoomService {
  constructor(roomName, rooms, kurentoClient, IoSocket) {
    this.roomName = roomName;
    this.rooms = rooms;
    this.kurentoClient = kurentoClient;
    this.IoSocket = IoSocket;
    this.roomId = v4();
    this.users = [];
  }

  async create(name) {
    this.roomSocket = this.IoSocket.of(`/${name}`);
    this.roomMediaPipe = await this.kurentoClient.create('MediaPipeline');
    this.roomSocket.on('connection', async (userSocket) => {
      userSocket.on('room-join', async (username) => {
        console.log('Room Connection Triggered');
        const isExist = this.users.find((user) => user.username == username);

        if (!isEmpty(isExist)) return;

        let isCreating = true;
        let isDisconnected = false;
        const newUser = new UserService(username, userSocket, this);

        userSocket.on('disconnect', async () => {
          if (isCreating) {
            isDisconnected = true;
          } else {
            await newUser.destroy();
          }
        });

        await newUser.create();

        if (!isDisconnected) {
          this.users.push(newUser);
        } else {
          await newUser.destroy();
        }
        isCreating = false;
      });
    });

    console.log(`New Room created:${name}`);
  }

  destroy() {
    this.roomSocket.removeAllListeners(['connection']);
    delete this.rooms[this.roomName];
    console.log('Room removed');
  }
}
