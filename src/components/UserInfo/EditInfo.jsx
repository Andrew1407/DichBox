import React, { useState } from 'react';
import defaultLogo from '../../styles/imgs/user-default-icon.png';

const EditInfo = () => {
  const [checked, setChecked] = useState(true);
  const [showPswdForm, setFormState] = useState(false);
  const passwordBtnVal = showPswdForm ? 'cancel' : 'change password'; 

  return ( 
    <form className="user-info edit">
      <img className="user-logo user-data logo-edit" src={defaultLogo} style={{ marginTop: showPswdForm ? '300%' : '220%' }}/>
      <div className="user-data user-img">
        <input className="img-radio" type="radio" checked={checked} onChange={() => setChecked(true)} />
        <b> url: </b>
        <input type="text" disabled={!checked}/>
      </div>
      <div className="user-data user-img">
        <input className="img-radio" type="radio" checked={!checked} onChange={() => setChecked(false)} />
        <b> file: </b>
        <input type="file" accept="image/*" disabled={checked} />
      </div>
      <div className="user-data inpt">
        <b>username: </b> <input type="text" />
      </div>
      <div className="user-data inpt">
        <b>email: </b> <input type="email" />
      </div>
      <div className="user-data inpt">
        <b>description: </b> <br/>
        <textarea id="edit-desc" cols="23" rows="5"></textarea>
      </div>
      <input type="button" className="user-data edit-btn pswd-btn" value={passwordBtnVal} onClick={() => setFormState(!showPswdForm)} />
      { showPswdForm && (<div className="user-data inpt">
        <b>current password: </b> <input type="text" />
        <b>new password: </b> <input type="text" />
      </div>)}
      <input type="submit" className="user-data edit-btn" value="confirm" />
    </form>
  );
};

export default EditInfo;
