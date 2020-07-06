import React, { useState } from 'react';
import axios from 'axios';

const App = () => {
  const [text, setText] = useState('dich-client');
  const onClick = e => {
    e.preventDefault();
    axios
      .get('http://192.168.0.223:7041')
      .then(({ data }) => setText(data));
  };
  return (
    <h1 onClick={onClick}>{text}</h1>
  );
};

export default App;
