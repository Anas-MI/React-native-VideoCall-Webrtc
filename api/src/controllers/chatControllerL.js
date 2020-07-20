import kurento from 'kurento-client';
export default class ChatController {
  constructor(io) {
    this.io = io;
    this.chat = io.of('/chat');
    this.chatIndex();
  }

  async chatIndex() {
    const kurentoClient = await kurento('ws://127.0.0.1:8888/kurento');

    //send answer
    // inEndPoint.gatherCandidates()
    // console.log(this.chat);
    this.chat.on('connection', (socket) => {
      console.log('connection Triggered');

      socket.on('room-join', async (roomId) => {
        console.log('Room Triggered');
        this.chat.emit('this', 'Room Triggered');

        const inMediaPipe = await kurentoClient.create('MediaPipeline');
        const inEndPoint = await inMediaPipe.create('WebRtcEndpoint');
        await inEndPoint.connect(inEndPoint);

        inEndPoint.on('OnIceCandidate', (event) => {
          var candidate = kurento.getComplexType('IceCandidate')(
            event.candidate
          );
          console.log('Ice Send');
          socket.emit('OnIceCandidate', candidate);
        });

        socket.on('OnIceCandidate', async (data) => {
          console.log('Ice Received');
          var candidate = kurento.getComplexType('IceCandidate')(data);

          inEndPoint.addIceCandidate(data);
        });

        socket.on('offer', async (offer) => {
          console.log('Offer Received');
          const answer = await inEndPoint.processOffer(offer);
          socket.emit('answer', answer);

          await inEndPoint.gatherCandidates(async (err) => {
            console.log(await inEndPoint.getConnectionState());

            console.log(err);
          });
          console.log('Answer Send');
        });

        inEndPoint.on('IceComponentStateChange', (data) => console.log(data));

        console.log('room ID', roomId);
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
