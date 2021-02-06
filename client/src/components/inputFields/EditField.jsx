import React from 'react';

const EditField = ({ label, type, inputValue, inputColor, handleOnChange, warning, textarea, disabled }) => (
  <div className="edit-name" data-testid="edit-field-test">
    <p>{ label }:</p>
    { textarea ?
      <textarea spellCheck="false" onChange={ handleOnChange } maxLength="150" className="edit-desc-area" rows="8" value={ inputValue || '' } style={{ color: inputColor || '#00d9ff' }}></textarea> :
      <input spellCheck="false" disabled={ disabled } type={ type } onChange={ handleOnChange } className="edit-input" value={ inputValue || (type === 'color' ? '#00d9ff' : '') } style={{ color: inputColor || '#00d9ff', borderBottomColor: warning && warning.borderColor }}/>
    }
    <i className="edit-warning">{ warning && warning.text }</i>
  </div>
);

export default EditField;
