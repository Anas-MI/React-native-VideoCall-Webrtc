import kurento from 'kurento-client';
import has from 'lodash/has';
import get from 'lodash/get';
export default class ChatController {
  constructor(io) {
    this.io = io;
    this.chat = io.of('/chat');
    this.chatIndex();
  }

  async chatIndex() {
    const kurentoClient = await kurento('ws://127.0.0.1:8888/kurento');
    const rooms = {};
    //send answer
    // inEndPoint.gatherCandidates()
    // console.log(this.chat);
    this.chat.on('connection', (socket) => {
      console.log('connection Triggered');

      socket.on('room-join', async (roomId) => {
        let inMediaPipe;
        let user = null;
        console.log('Room Triggered');
        this.chat.emit('this', 'Room Triggered');

        if (has(rooms, roomId)) {
          user = 2;
          inMediaPipe = get(rooms, `${roomId}.inMediaPipe`);
        } else {
          user = 1;
          rooms[roomId] = {};
          inMediaPipe = await kurentoClient.create('MediaPipeline');
          rooms[roomId].inMediaPipe = inMediaPipe;
        }

        const inEndPoint = await inMediaPipe.create('WebRtcEndpoint');

        if (!has(rooms[roomId], `endPoint[0]`)) {
          rooms[roomId].endPoint = [inEndPoint];
          console.log('Linked ', user);
        } else {
          rooms[roomId].endPoint[1] = inEndPoint;

          const inEndPointOld = rooms[roomId].endPoint[0];
          //   await inEndPointOld.connect(inEndPoint);
          //   await inEndPoint.connect(inEndPointOld);
          console.log('Linked - 2', user);
        }

        inEndPoint.on('OnIceCandidate', (event) => {
          var candidate = kurento.getComplexType('IceCandidate')(
            event.candidate
          );
          console.log('Ice Send', user);
          socket.emit('OnIceCandidate', candidate);
        });

        socket.on('OnIceCandidate', async (data) => {
          console.log('Ice Received', user);
          var candidate = kurento.getComplexType('IceCandidate')(data);

          inEndPoint.addIceCandidate(data);
        });

        socket.on('offer', async (offer) => {
          console.log('Offer Received', user);
          const answer = await inEndPoint.processOffer(offer);
          if (user == 2) {
            const inEndPointOld = rooms[roomId].endPoint[0];

            await inEndPointOld.connect(inEndPoint);
            await inEndPoint.connect(inEndPointOld);
          }

          socket.emit('answer', answer);

          await inEndPoint.gatherCandidates((err) => console.log(err));
          console.log('Answer Send', user);
          //   console.log(await inEndPoint.getConnectionState());
        });

        inEndPoint.on('IceComponentStateChange', async (data) => {
          console.log(user, data);
          console.log(user, 'Media State', await inEndPoint.getMediaState());
        });

        console.log('room ID', roomId, user);
      });

      this.chat.emit('this', { will: 'be received by everyone' });
      // this.chat.broadcast.emit({ will: 'be received by everyone' });

      socket.on('private message', (from, msg) => {
        console.log('I received a private message by ', from, ' saying ', msg);
      });

      socket.on('disconnect', () => {
        this.chat.emit('user disconnected');
      });
    });
  }
  index() {
    return 'Chat Route';
  }
}
