import React, { Component } from 'react';
import io from 'socket.io-client';
import { WebRtcPeer } from 'kurento-utils';

export default class ChatPage extends Component {
  constructor(props) {
    super(props);
    this.chat = io(`https://${window.location.hostname}:8000/chat`);
  }

  handleJoin = () => {
    console.log('Joined Room');
    this.chat.emit('room-join', 'Test');

    this.rtcPear.generateOffer((err, offer) => {
      console.log('Offer Created');
      this.chat.emit('offer', offer);
    });
  };
  componentDidMount() {
    const videoInput = document.getElementById('in');
    const videoOutput = document.getElementById('recv');

    const rtcPear = WebRtcPeer.WebRtcPeerSendrecv({
      localVideo: videoInput,
      remoteVideo: videoOutput,

      onicecandidate: (candidate) => {
        console.log('Ice Send');

        this.chat.emit('OnIceCandidate', candidate);
      },
    });

    this.rtcPear = rtcPear;

    this.chat.on('OnIceCandidate', (IceCandidate) => {
      console.log('Ice Received');
      rtcPear.addIceCandidate(IceCandidate);
    });

    this.chat.on('answer', (answer) => {
      console.log('Answer Received');

      rtcPear.processAnswer(answer);
    });
  }

  render() {
    return (
      <div>
        <div>
          in
          <video autoPlay id="in"></video>
        </div>
        <div>
          recv
          <video autoPlay id="recv"></video>
        </div>
        <button onClick={this.handleJoin}>Join</button>
      </div>
    );
  }
}
