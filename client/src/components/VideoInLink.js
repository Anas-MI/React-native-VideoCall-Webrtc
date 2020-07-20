import React, {Component} from 'react';
import {Text, View} from 'react-native';
import {
  RTCPeerConnection,
  RTCView,
  mediaDevices,
  RTCSessionDescription,
  RTCIceCandidate,
  RTCIceCandidateType,
  RTCSessionDescriptionType,
} from 'react-native-webrtc';

export default class VideoInLink extends Component {
  state = {
    localStream: null,
  };

  startLocalStream = async () => {
    // isFront will determine if the initial camera should face user or environment
    const isFront = true;
    const devices = await mediaDevices.enumerateDevices();

    const facing = isFront ? 'front' : 'environment';
    const videoSourceId = devices.find(
      device => device.kind === 'videoinput' && device.facing === facing,
    );
    const facingMode = isFront ? 'user' : 'environment';
    const constraints = {
      audio: true,
      video: {
        mandatory: {
          minWidth: 500, // Provide your own width, height and frame rate here
          minHeight: 500,
          minFrameRate: 30,
        },
        facingMode,
        optional: videoSourceId ? [{sourceId: videoSourceId}] : [],
      },
    };
    const localStream = await mediaDevices.getUserMedia(constraints);

    this.setState({localStream});
  };

  async componentDidMount() {
    await this.startLocalStream();

    const {localStream} = this.state;
    const {room, linkId} = this.props;

    const configuration = {iceServers: [{url: 'stun:stun.l.google.com:19302'}]};
    const localPC = new RTCPeerConnection(configuration);

    localPC.onicecandidate = e => {
      try {
        // console.log('localPC icecandidate:', e.candidate);
        if (e.candidate) {
          // remotePC.addIceCandidate(e.candidate);
          console.log(`Ice Send-${linkId}`);

          room.emit(`OnIceCandidate-${linkId}`, e.candidate);
        }
      } catch (err) {
        console.error(`Error adding remotePC iceCandidate: ${err}`);
      }
    };

    room.on(`OnIceCandidate-${linkId}`, IceCandidate => {
      console.log(`Ice Received-${linkId}`, IceCandidate);
      localPC
        .addIceCandidate(new RTCIceCandidate(IceCandidate))
        .catch(e => console.log(e));
    });

    room.on(`answer-${linkId}`, answer => {
      console.log(`Answer Received-${linkId}`);

      localPC.setRemoteDescription(
        new RTCSessionDescription({type: 'answer', sdp: answer}),
      );
    });

    localPC.addStream(localStream);

    const offer = await localPC.createOffer({
      offerToReceiveAudio: 1,
      offerToReceiveVideo: 1,
    });
    console.log('Offer from localPC, setLocalDescription');
    await localPC.setLocalDescription(offer);
    room.emit(`offer-${linkId}`, offer.sdp);
  }
  render() {
    const {localStream} = this.state;
    return (
      <View
        style={{
          backgroundColor: 'black',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          width: '20%',
          height: '20%',
        }}>
        {localStream && (
          <RTCView
            // zOrder={100}
            objectFit="cover"
            style={{width: '100%', height: '100%'}}
            streamURL={localStream.toURL()}
          />
        )}
      </View>
    );
  }
}
