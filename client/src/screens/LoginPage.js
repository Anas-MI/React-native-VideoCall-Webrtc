import React, {Component} from 'react';
import {Text, View} from 'react-native';
import {
  Container,
  Header,
  Content,
  Form,
  Item,
  Input,
  Button,
} from 'native-base';

export default class LoginPage extends Component {
  render() {
    return (
      <Container>
        <Header />
        <Content>
          <Form>
            <Item>
              <Input placeholder="Username" />
            </Item>
            <Item last>
              <Input placeholder="Room ID" />
            </Item>
            <Button primary block>
              <Text style={{color: 'white', fontWeight: 'bold'}}>Login</Text>
            </Button>
          </Form>
        </Content>
      </Container>
    );
  }
}
