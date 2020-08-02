import React from 'react';

const SignField = ({ warning, handleOnChange, type, label }) => (
  <div className="sign-field">
    <p>{ label }:</p>
    <input type={ type } onChange={ handleOnChange } style={{ borderBottomColor: warning ? warning.borderColor : null }} />
    <i className="warning">{ warning ? warning.text : null }</i>
  </div>
);

export default SignField;
