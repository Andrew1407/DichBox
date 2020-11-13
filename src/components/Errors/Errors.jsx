import React, { useContext } from 'react';
import { MenuContext } from '../../contexts/MenuContext';

const Errors = () => {
  const { foundErr } = useContext(MenuContext);

  return (
    <div>
      <h1>{ JSON.stringify(foundErr) }</h1>
    </div>
  );
}

export default Errors;
