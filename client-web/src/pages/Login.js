import React, { Component } from 'react';
import { Input, Button } from '@chakra-ui/core';
import { navigate } from '@reach/router';
export default class Login extends Component {
  state = {
    username: '',
    roomname: '',
  };
  handleChange = (name) => (e) => {
    this.setState({ [name]: e.target.value });
  };
  handleLogin = () => {
    const { username, roomname } = this.state;
    navigate(`/room/${roomname}/${username}`);
  };
  render() {
    return (
      <div className="flex justify-center items-center p-2 h-screen">
        <div class="max-w-sm rounded-lg p-6  bg-gray-500 overflow-hidden shadow-lg">
          <h1 className="text-center font-bold text-blue mb-4">
            Lets begin here
          </h1>
          <div className="p-2">
            <Input
              onChange={this.handleChange('roomname')}
              type="text"
              placeholder="Room Name"
            />
          </div>
          <div className="p-2">
            <Input
              onChange={this.handleChange('username')}
              type="text"
              placeholder="Your Name"
            />
          </div>
          <div className="p-2">
            <Button onClick={this.handleLogin} variantColor="green" isFullWidth>
              Login
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
