import { v4 } from 'uuid';
import LinkService from './LinkService';
export default class UserService {
  constructor(username, userSocket, room) {
    this.userSocket = userSocket;
    this.room = room;
    this.username = username;

    this.userId = v4();
    this.inLink = null;
    this.viewLink = [];
    this.userSocket.emit('my-id', this.userId);
  }
  async create() {
    this.userSocket.on('chat-message-room', (data) => {
      console.log('message', data);
      this.userSocket.broadcast.emit('chat-message-room', data);
    });

    const userInLink = new LinkService('in', this.room, this);
    await userInLink.create();
    this.inLink = userInLink;
    this.userId = `${this.username}-${this.userId}`;

    console.log(`New in link created `);

    for (const user of this.room.users) {
      console.log(user.username);
      await this.addViewer(user);
    }

    for (const user of this.room.users) {
      await user.addViewer(this);
    }
  }

  async addViewer(user) {
    const newInLink = new LinkService('view', this.room, this, user);
    newInLink.connectIn(this.inLink);
    await newInLink.create();
    this.viewLink.push(newInLink);
  }

  async removeViewer(user) {
    const selectedLink = this.viewLink.find(
      (link) => link.consumer.userId == user.userId
    );
    selectedLink.destroy();
    this.viewLink = this.viewLink.filter(
      (link) => !(link.consumer.userId == user.userId)
    );
  }

  async destroy() {
    this.room.users = this.room.users.filter(
      (user) => !(user.userId == this.userId)
    );
    this.inLink.destroy();

    for (const user of this.room.users) {
      await this.removeViewer(user);
    }

    for (const user of this.room.users) {
      await user.removeViewer(this);
    }

    if (this.room.users.length == 0) {
      this.room.destroy();
    }
  }
}
