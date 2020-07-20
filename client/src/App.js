import React, {Component} from 'react';
import {Text, View} from 'react-native';
import ChatPage from './screens/ChatPage';
import LoginPage from './screens/LoginPage';
import {Root} from 'native-base';

export default class App extends Component {
  render() {
    return (
      <Root>
        {/* <LoginPage /> */}
        <ChatPage />
      </Root>
    );
  }
}
