import React, { useState, useContext } from 'react';
import { MainContext } from '../../contexts/MainContext';
import logoDefault from '../../styles/imgs/default-user-logo.png';
import '../../styles/edit-profile.css';

const EditProfile = () => {
  const [checkedRadio, setCheckedRadio] = useState(true);
  const { userData } = useContext(MainContext);
  const {name} = userData;
  const handleRadioChange = state => () => setCheckedRadio(state);
 
  return (
    <div id="edit-profile">
      <div className="edit-field">
        <img id="edit-logo" src={ logoDefault } />
        <div className="edit-logo-input">
          <input type="radio" checked={ checkedRadio } onChange={ handleRadioChange(true) } />
          <p>url:</p>
          <input type="text"  disabled={ !checkedRadio } />
        </div>
        <div className="edit-logo-input">
          <input type="radio" checked={ !checkedRadio } onChange={ handleRadioChange(false) } />
          <p>file:</p>
          <input type="file" disabled={ checkedRadio } />
        </div>
      </div>

      <div className="edit-field">
        <div className="edit-name">
          <p>username:</p>
          <input type="text" value={ name } style={{ color: userData.name_color }}/>
        </div>
        <div className="edit-name">
          <p>username color:</p>
          <input type="color" value={userData.name_color}/>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
