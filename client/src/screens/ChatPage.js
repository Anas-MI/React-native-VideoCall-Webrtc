import React, {Component} from 'react';
import {Text, View, SafeAreaView, ScrollView} from 'react-native';
import {
  Container,
  Header,
  Content,
  Form,
  Item,
  Input,
  Button,
  List,
  ListItem,
  Grid,
  Row,
  Col,
} from 'native-base';
import VideoInLink from './../components/VideoInLink';
import VideoOutLink from './../components/VideoOutLink';
import io from 'socket.io-client';
import chunk from 'lodash/chunk';
export default class ChatPage extends Component {
  constructor(props) {
    super(props);
    this.baseUrl = `http://192.168.0.102:8000`;
    this.state = {videos: [], userName: '', roomName: ''};
  }
  handleJoin = () => {
    const {userName, roomName} = this.state;
    console.log('Joined Room');
    const chat = io(`${this.baseUrl}/chat`, {
      secure: true,
      transports: ['websocket'],
      rejectUnauthorized: false,
    });
    chat.on('connect', () => {
      console.log('connected');
    });
    chat.on('error', err => console.log(err));

    chat.emit('room-create', roomName);

    setTimeout(() => {
      const room = io(`${this.baseUrl}/${roomName}`);
      room.emit('room-join', userName);

      room.on('link-add', ({type, id}) => {
        console.log('type', type, id);
        const Video = type == 'in' ? VideoInLink : VideoOutLink;

        this.setState({
          videos: [
            ...this.state.videos,

            {
              id,
              component: <Video room={room} linkId={id} />,
            },
          ],
        });
      });
      room.on('link-remove', ({type, id}) => {
        this.setState({
          videos: this.state.videos.filter(data => !(data.id == id)),
        });
      });
    }, 1000);
  };

  handleChange = name => text => {
    this.setState({[name]: text});
  };

  render() {
    const {videos, userName, roomName} = this.state;
    const videoGroups = chunk(videos, 2);
    const videosList = videos.map(({component}) => component);

    return (
      <SafeAreaView
        style={{width: '100%', backgroundColor: 'aliceblue', height: '100%'}}>
        <View style={{backgroundColor: 'white'}}>
          <Form>
            <Item>
              <Input
                onChangeText={this.handleChange('roomName')}
                value={roomName}
                placeholder="Room ID"
              />
              <Input
                onChangeText={this.handleChange('userName')}
                value={userName}
                placeholder="Username"
              />
            </Item>
            <Button
              style={{borderRadius: 0}}
              onPress={this.handleJoin}
              primary
              block>
              <Text style={{color: 'white', fontWeight: 'bold'}}>Join</Text>
            </Button>
          </Form>
        </View>

        {videosList}
        <ScrollView>
          <Grid>
            {/* {videoGroups.map(videoRow => (
              <Row>{videoRow}</Row>
            ))} */}
          </Grid>
        </ScrollView>
      </SafeAreaView>
    );
  }
}
