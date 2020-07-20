import kurento from 'kurento-client';
import has from 'lodash/has';
import RoomService from './../services/RoomService';
import { KURENTO_URL } from './../configs/app';
export default class ChatController {
  constructor(io) {
    this.io = io;
    this.chat = io.of('/chat');
    this.chatIndex();
    this.rooms = {};
  }

  async chatIndex() {
    try {
      const kurentoClient = await kurento(KURENTO_URL);

      this.chat.on('connection', (socket) => {
        console.log('connection Triggered');
        // check roomid is not chat
        socket.on('room-create', async (roomId, username) => {
          console.log(`Room Triggered ${username}`);

          if (!has(this.rooms, roomId)) {
            const newRoom = new RoomService(
              roomId,
              this.rooms,
              kurentoClient,
              this.io
            );
            await newRoom.create(roomId);
            this.rooms[roomId] = newRoom;
          }
          this.chat.emit('room-connected', 'hello welcome');

          console.log('room ID', roomId);
        });

        socket.on('disconnect', () => {
          this.chat.emit('user disconnected');
        });
      });
    } catch (error) {
      console.log(error);
    }
  }
  index() {
    return 'Chat Route';
  }
}
