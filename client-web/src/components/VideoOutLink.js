import React, { Component, createRef } from 'react';
import { WebRtcPeer } from 'kurento-utils';

export default class VideoOutLink extends Component {
  constructor(props) {
    super(props);
    this.refV = createRef();
  }

  componentDidMount() {
    const { room, linkId } = this.props;
    // this.refV.current.target
    // const videoInput = this.refV.current.target;
    const videoInput = document.getElementById(linkId);

    this.rtcPear = new WebRtcPeer.WebRtcPeerRecvonly(
      {
        remoteVideo: videoInput,
        onicecandidate: (candidate) => {
          console.log(`Ice Send ${linkId}`);

          room.emit(`OnIceCandidate-${linkId}`, candidate);
        },
      },
      function (err) {
        console.log(err);

        // room.on(`link-offer-${linkId}`, (IceCandidate) => {
        // console.log('Link offer generate triggered');
        this.generateOffer((err, offer) => {
          console.log(`Offer Created ${linkId}`);
          room.emit(`offer-${linkId}`, offer);
        });
        // });

        // room.emit(`link-offer-connected-${linkId}`);
      }
    );

    room.on(`OnIceCandidate-${linkId}`, (IceCandidate) => {
      console.log(`Ice Received ${linkId}`);
      this.rtcPear.addIceCandidate(IceCandidate);
    });

    room.on(`answer-${linkId}`, (answer) => {
      console.log(`Answer Received ${linkId}`);

      this.rtcPear.processAnswer(answer);
    });

    // this.rtcPear.generateOffer((err, offer) => {
    //   console.log(`Offer Created ${linkId}`);
    //   room.emit(`offer-${linkId}`, offer);
    // });
  }

  render() {
    const { className, style } = this.props;
    return (
      <video
        className={className}
        style={style}
        autoPlay
        ref={this.refV}
        id={this.props.linkId}
      ></video>
    );
  }
}
