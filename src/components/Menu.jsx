import React, { useContext } from 'react';
import { MainContext } from '../contexts/MainContext';
import SignForms from './SignForms/SignForms';
import Personal from './Personal/Personal';
import hideImg from '../styles/imgs/hide-arrow.png';
import '../styles/menu.css';

const Menu = () => {
  const { isHidden, setMenuHidden, userId } = useContext(MainContext);
  const handleArrowClick = e => {
    e.preventDefault();
    setMenuHidden(true)
  };

  return (
    !isHidden && <menu id="menu">
      <img src={hideImg} id="hide-arrow" onClick={ handleArrowClick } />
      { !userId ? <Personal /> : <SignForms />}
    </menu>
  );
};

export default Menu;
