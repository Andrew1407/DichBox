import React from 'react';
import { useHistory } from 'react-router-dom';


const BoxEntries = () => {
  const params = useHistory();

  return (
    <h1>{ params.location.pathname }</h1>
    
  );
};

export default BoxEntries;
