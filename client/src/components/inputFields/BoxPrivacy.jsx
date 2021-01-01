import React, { useCallback } from 'react';
import SearchUsers from './SearchUsers'
import '../../styles/box-privacy.css';

const BoxPrivacy = ({ privacy, setPrivacy, limitedList, setLimitedList, setChangedList, changedList }) => {
  const radios = [
    ['public', '(everyone can view this box)'],
    ['private', '(you and editors can view this box)'],
    ['followers', '(subscribers can view this box)'],
    ['limited', '(add/remove users who can view this box)']
  ];
  const handleRadioChangeClb = e => {
    const radioValue = e.target.value;
    setPrivacy(radioValue);
    if (radioValue !== 'limited')
      setLimitedList([]);
    if (!changedList)
      setChangedList(true);
  };
  const handleRadioChange = useCallback(handleRadioChangeClb, []);
  
  return (
    <div className="box-privacy">
      <p>*box privacy:</p>
      { radios.map(val =>
        <div className="box-privacy-radio" key={ val[0] } >
          <label>
            <input type="radio" {...{ value: val[0], name: val[0] + 'Radio', checked: privacy === val[0], onChange: handleRadioChange }} />
            { ' ' + val.join(' ') }
          </label>
        </div>
      )}
      { (privacy === 'limited') && 
        <SearchUsers {...{ changedList, setChangedList, inputList: limitedList, setInputList: setLimitedList }} />
      }
    </div>
  );
};

export default BoxPrivacy;
