import React, { Component } from 'react';
import io from 'socket.io-client';
import { WebRtcPeer } from 'kurento-utils';
import VideoInLink from './../components/VideoInLink';
import VideoOutLink from './../components/VideoOutLink';
import {
  Box,
  SimpleGrid,
  InputGroup,
  InputRightElement,
  Button,
  Avatar,
  AvatarBadge,
  Stack,
} from '@chakra-ui/core';
import { API_URL } from './../configs/app';
import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
} from '@chakra-ui/core';
import { Input } from '@chakra-ui/core';
import { navigate } from '@reach/router';
import classNames from 'classnames';
export default class ChatPage extends Component {
  constructor(props) {
    super(props);
    this.room = null;
    this.state = {
      videos: [],
      chats: [],
      message: '',
      isAudiable: true,
      isVideo: true,
    };
  }

  componentDidMount() {
    const { userName, roomName } = this.props;
    const chat = io(`${API_URL}/chat`);

    chat.emit('room-create', roomName);
    console.log('Joined Room');

    setTimeout(() => {
      const room = io(`${API_URL}/${roomName}`);
      this.room = room;
      room.emit('room-join', userName);
      room.on('error', (e) => {
        console.log(e);

        setTimeout(() => {
          room.open();
        }, 1000);
      });

      room.on('chat-message-room', (data) => {
        console.log(data);
        this.setState({ chats: [...this.state.chats, data] });
      });

      room.on('disconnect', () => console.log('disconnected'));
      room.on('link-add', ({ type, id }) => {
        console.log('type', type);
        let Video = type == 'in' ? VideoInLink : VideoOutLink;

        this.setState({
          videos: [
            ...this.state.videos,
            {
              id,
              component: (
                <Box>
                  <div className="rounded-lg  bg-gray-600 h-full  shadow-lg">
                    <div className="rounded-lg overflow-hidden">
                      <Video
                        className=""
                        style={{ maxHeight: '100%', maxWidth: '100%' }}
                        room={room}
                        linkId={id}
                      />
                    </div>
                  </div>
                </Box>
              ),
            },
          ],
        });
      });

      room.on('link-remove', ({ type, id }) => {
        this.setState({
          videos: this.state.videos.filter((data) => !(data.id == id)),
        });
      });
    }, 1000);
  }

  handleChat = () => {
    console.log('Messaged');
    const { userName, roomName } = this.props;

    const data = { username: userName, message: this.state.message };
    this.room.emit('chat-message-room', data);
    this.setState({ chats: [...this.state.chats, data] });
  };

  handleChange = (name) => (e) => {
    this.setState({ [name]: e.target.value });
  };

  handleChangeBool = (name) => () => {
    this.setState({ [name]: !this.state[name] });
  };

  handleEndCall = () => {
    this.room.disconnect();
    navigate('/');
  };
  render() {
    const { isAudiable, isVideo } = this.state;
    const { userName } = this.props;
    const videos = this.state.videos.map(({ component }) => component);
    return (
      <div>
        <div className="flex w-full">
          <div className="p-5 bg-gray-600 w-3/4 relative">
            <SimpleGrid columns={4} spacing={10}>
              {videos}
            </SimpleGrid>
            <div className="absolute w-full left-0 bottom-0">
              <div className="p-5 flex justify-center">
                {/* <Button
                  onClick={this.handleChangeBool('isVideo')}
                  className="mr-2 w-12"
                >
                  <i
                    className={classNames(
                      'fas',
                      { 'fa-video-slash': !isVideo },
                      { 'fa-video': isVideo }
                    )}
                  ></i>
                </Button> */}
                <Button
                  onClick={this.handleEndCall}
                  className="mr-2"
                  variantColor="red"
                >
                  <i className="fas fa-phone-slash transform rotate-90"></i>End
                </Button>
                {/* <Button
                  className="mr-2 w-12"
                  onClick={this.handleChangeBool('isAudiable')}
                >
                  <i
                    className={classNames(
                      'fas',
                      { 'fa-microphone-slash': !isAudiable },
                      { 'fa-microphone': isAudiable }
                    )}
                  ></i>
                </Button> */}
              </div>
            </div>
          </div>

          <div className="bg-white w-1/4 h-screen shadow-md">
            <div className="flex flex-col h-full">
              <div className="p-4 flex items-center">
                <Stack isInline spacing={4}>
                  <Avatar>
                    <AvatarBadge size="1.25em" bg="green.500" />
                  </Avatar>
                </Stack>
                <h1 className="font-bold p-2 capitalize">{userName}</h1>
              </div>
              <div className="h-full border">
                {this.state.chats.map((data) => (
                  <div className="flex p-2 w-full">
                    {userName != data.username ? (
                      <i
                        style={{
                          paddingTop: '11px',
                          color: '#e87474',
                          marginRight: '-5px',
                          zIndex: '1',
                        }}
                        className="fa fa-circle"
                      ></i>
                    ) : (
                      ''
                    )}

                    <div className="p-2 pl- bg-gray-300 flex-1 rounded">
                      <div className="text-blue-500 font-bold">
                        {data.username}
                      </div>
                      <div>{data.message}</div>
                    </div>
                    {userName == data.username ? (
                      <i
                        style={{
                          paddingTop: '11px',
                          color: 'rgb(45, 82, 187)',
                          marginLeft: '-5px',
                          zIndex: '1',
                        }}
                        className="fa fa-circle"
                      ></i>
                    ) : (
                      ''
                    )}
                  </div>
                ))}
              </div>
              <div className="">
                <div className="p-2">
                  <InputGroup isFullWidth={true} width="100%">
                    <Input
                      onChange={this.handleChange('message')}
                      pr="4.5rem"
                      isFullWidth={true}
                      placeholder="Message ..."
                    />
                    <InputRightElement width="4.5rem">
                      <Button onClick={this.handleChat} h="1.75rem" size="sm">
                        Send
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
