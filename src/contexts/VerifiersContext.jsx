import React, { createContext, useState, useCallback } from 'react';
import axios from 'axios';

export const VerifiersContext = createContext();

const VerifiersContextProvider = props => {
  const [warnings, setWarning] = useState({});
  const [correctInput, setCorrectState] = useState({});
  const fetchInput = inputField => async inputValue => {
    const verifyBody = { inputField, inputValue };
    const { data } = await axios.post('http://192.168.0.223:7041/users/verify', verifyBody);
    return data;
  };
  const useVerifiersClb = verParams => {
    const verFields = Object.keys(verParams);
    const getVerifiersState = () => verFields.reduce(
      (isCorrectAll, isCorrectField) => 
        correctInput[isCorrectField] && isCorrectAll
    );
    const getVerifier = field => async input => {
      const verifierParams = verParams[field];
      const fetchVefifier = verifierParams.fetchFn;
      let warningStyle = {
        borderColor: 'rgb(0, 255, 76)',
        text: ''
      };
      let isCorrect = true;
      const inputRegExp = verifierParams.regExp;
      if (!inputRegExp.test(input)) {
        warningStyle = {
          borderColor: 'crimson',
          text: verifierParams.warningRegExp
        };
        isCorrect = false;
      } else if (fetchVefifier) {
        const checkupModifier = bool => verifierParams.fetchIsEqual ? bool : !bool;
        const res = await fetchVefifier(input);
        const checkup = checkupModifier(input === res.foundValue);
        if (!checkup) {
          warningStyle = {
            borderColor: 'crimson',
            text: verifierParams.warningFetch
          }
          isCorrect = false;
        }
      }
      setWarning({ ...warnings, [field]: warningStyle });
      setCorrectState({ ...correctInput, [field]: isCorrect });
    };
    return { getVerifiersState, getVerifier };
  };
  const useVerifiers = useCallback(useVerifiersClb, [warnings, correctInput]);

  return (
    <VerifiersContext.Provider value={{ useVerifiers, fetchInput, warnings, setWarning, correctInput, setCorrectState }}>
      {props.children}
    </VerifiersContext.Provider>
  );
};

export default VerifiersContextProvider;
