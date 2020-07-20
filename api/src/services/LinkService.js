import { v4 } from 'uuid';
import kurento from 'kurento-client';
export default class LinkService {
  constructor(typeLink, room, provider, consumer) {
    this.room = room;
    this.provider = provider;
    this.consumer = consumer;
    this.typeLink = typeLink;
    const linkId = v4();

    this.roomMediaPipe = room.roomMediaPipe;
    this.userSocket =
      typeLink == 'in' ? provider.userSocket : consumer.userSocket;

    const userPart =
      typeLink == 'in'
        ? provider.username
        : `${provider.username}->${consumer.username}`;

    this.linkId = `${typeLink}-${userPart}-${linkId}`;
  }

  async create() {
    this.endPoint = await this.roomMediaPipe.create('WebRtcEndpoint');

    this.endPoint.on(`OnIceCandidate`, (event) => {
      var candidate = kurento.getComplexType('IceCandidate')(event.candidate);
      console.log(`Ice Send-${this.linkId}`);
      this.userSocket.emit(`OnIceCandidate-${this.linkId}`, candidate);
    });

    this.userSocket.on(`OnIceCandidate-${this.linkId}`, async (data) => {
      console.log(`Ice Received-${this.linkId}`);
      var candidate = kurento.getComplexType('IceCandidate')(data);

      this.endPoint.addIceCandidate(data);
    });

    const isAnswered = new Promise((resolve, reject) => {
      console.log('offer linked', this.linkId);
      this.userSocket.on(`offer-${this.linkId}`, async (offer) => {
        console.log(`Offer Received-${this.linkId}`);
        const answer = await this.endPoint.processOffer(offer);

        if (this.typeLink == 'view') {
          // await this.inLink.endPoint.connect(this.endPoint);
          await this.inLink.endPoint.connect(this.endPoint);
          console.log(`Connected ${this.inLink.linkId}->${this.linkId}`);
        }

        this.userSocket.emit(`answer-${this.linkId}`, answer);
        this.endPoint.on('IceCandidateFound', async (candidate) => {
          // console.log(candidate);
        });

        console.log(`Answer Send-${this.linkId}`);

        await this.endPoint.gatherCandidates((err) =>
          console.log('gatherCandidates', err)
        );
        this.endPoint.on('IceComponentStateChange', async (data) => {
          console.log(this.linkId, data);
          console.log(
            this.linkId,
            'Media State',
            await this.endPoint.getMediaState()
          );
        });
        console.log(this.linkId, await this.endPoint.getConnectionState());
        resolve(true);
      });
    });
    console.log('All events linked');

    this.userSocket.emit('link-add', {
      id: this.linkId,
      type: this.typeLink,
    });

    // this.userSocket.on(`link-offer-connected-${this.linkId}`, async (data) => {
    //   console.log(`link-offer-connected-${this.linkId}`);
    //   this.userSocket.emit(`link-offer-${this.linkId}`);
    // });

    await isAnswered;
  }

  connectIn(link) {
    this.inLink = link;
  }

  async destroy() {
    this.userSocket.emit('link-remove', {
      id: this.linkId,
      type: this.typeLink,
    });
  }

  async gatherAll() {}
}
