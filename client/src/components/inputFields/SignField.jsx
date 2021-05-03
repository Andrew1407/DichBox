import React from 'react';

const SignField = ({ warning, handleOnChange, type, label }) => (
  <div className="sign-field" data-testid="sign-field-test">
    <p>{ label }:</p>
    <input {...{ type, spellCheck: false, onChange: handleOnChange, style: { borderBottomColor: warning?.borderColor } }} />
    <i className="warning">{ warning?.text }</i>
  </div>
);

export default SignField;
