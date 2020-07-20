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

  async componentDidMount() {
    const {localStream} = this.state;
    const {room, linkId} = this.props;
    console.log('OutLink Created', linkId);

    const configuration = {iceServers: [{url: 'stun:stun.l.google.com:19302'}]};
    const localPC = new RTCPeerConnection(configuration);

    localPC.onaddstream = e => {
      console.log('remotePC tracking with ', e);
      if (e.stream && localStream !== e.stream) {
        console.log('RemotePC received the stream', e.stream);

        this.setState({localStream: e.stream});
      }
    };
    localPC.onicecandidate = e => {
      try {
        // console.log('localPC icecandidate:', e.candidate);
        if (e.candidate) {
          // remotePC.addIceCandidate(e.candidate);
          console.log('Ice Send', linkId);

          room.emit(`OnIceCandidate-${linkId}`, e.candidate);
        }
      } catch (err) {
        console.error(`Error adding remotePC iceCandidate: ${err}`);
      }
    };

    room.on(`OnIceCandidate-${linkId}`, IceCandidate => {
      console.log('Ice Received', linkId);
      localPC
        .addIceCandidate(new RTCIceCandidate(IceCandidate))
        .catch(e => console.log(e));
    });

    room.on(`answer-${linkId}`, answer => {
      console.log(`Answer Received-${linkId}`);

      localPC.setRemoteDescription(
        new RTCSessionDescription({type: 'answer', sdp: answer}),
      );

      const streams = localPC.getRemoteStreams();
      console.log('streams', streams.length);
    });

    const offer = await localPC.createOffer({
      offerToReceiveAudio: 1,
      offerToReceiveVideo: 1,
    });
    console.log('Offer from localPC, setLocalDescription');
    await localPC.setLocalDescription(offer);
    room.emit(`offer-${linkId}`, offer.sdp);
    console.log(`Offer Send-${linkId}`);
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
