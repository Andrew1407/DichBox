import React from 'react';

const EditField = ({ label, type, inputValue, inputColor, handleOnChange, warning, textarea, disabled }) => (
  <div className="edit-name">
    <p>{ label }:</p>
    { textarea ?
      <textarea spellCheck="false" onChange={ handleOnChange } maxLength="150" className="edit-desc-area" rows="8" value={ inputValue ? inputValue : '' } style={{ color: inputColor ? inputColor : '#00d9ff' }}></textarea> :
      <input spellCheck="false" disabled={ disabled } type={ type } onChange={ handleOnChange } className="edit-input" value={ inputValue ? inputValue : (type === 'color' ? '#00d9ff' : '') } style={{ color: inputColor ? inputColor : '#00d9ff', borderBottomColor: warning && warning.borderColor }}/>
    }
    { warning && <i className="edit-warning">{ warning ? warning.text : null }</i> }
  </div>
);

export default EditField;
