import React, { useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';

const Boxes = ({ menuOption, setMenuOption }) => {
  useEffect(() => {
    if (menuOption !== 'boxes')
      setMenuOption('boxes');
  }, []);
  const params = useHistory();

  return <h1>{JSON.stringify(params.location.pathname)}</h1>
};

export default Boxes;
