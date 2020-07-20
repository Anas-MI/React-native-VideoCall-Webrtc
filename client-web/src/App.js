import React from 'react';
import ChatPage from './pages/ChatPageM';
import Login from './pages/Login';
import { ThemeProvider, CSSReset } from '@chakra-ui/core';
// import ChatPage from './pages/ChatPage1To1';
// import ChatPage from './pages/ChatPageL';
import { Router } from '@reach/router';
function App() {
  return (
    <ThemeProvider>
      <CSSReset />
      <Router>
        <Login path="/"></Login>
        <ChatPage path="/room/:roomName/:userName"></ChatPage>
      </Router>
    </ThemeProvider>
  );
}

export default App;
