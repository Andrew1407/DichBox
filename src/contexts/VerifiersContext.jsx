import React, { createContext, useState, useCallback } from 'react';
import axios from 'axios';

export const VerifiersContext = createContext();

const VerifiersContextProvider = props => {
  const [warnings, setWarning] = useState({});
  const [correctInput, setCorrectState] = useState({});
  const [userDataInput, setUserDataInput] = useState({});
  const fetchInput = async (inputField, inputValue) => {
    const verifyBody = { inputField, inputValue };
    const { data } = await axios.post('http://192.168.0.223:7041/users/verify', verifyBody);
    return data;
  };
  const useVerifiersClb = verParams => {
    const verFields = Object.keys(verParams);
    const getVerifiersState = (arr = verFields) => arr.reduce(
      (isCorrectAll, isCorrectField) => 
        isCorrectAll && correctInput[isCorrectField], true
    );
    const getVerifier = field => {
      const verifierParams = verParams[field];
      if (!verifierParams) return;
      return async input => {
        const { fetchVerifier } = verifierParams;
        let warningStyle = {
          borderColor: 'rgb(0, 255, 76)',
          text: ''
        };
        let isCorrect = true;
        const inputRegExp = verifierParams.regExp;
        if (inputRegExp && !inputRegExp.test(input)) {
          warningStyle = {
            borderColor: 'crimson',
            text: verifierParams.warningRegExp
          };
          isCorrect = false;
        } else if (fetchVerifier) {
          const checkup = await fetchVerifier(input);
          if (checkup) {
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
    };
    const updateUserDataClb = field => {
      const inputVerifier = getVerifier(field);
      return e => {
        e.preventDefault();
        const input = e.target.value;
        if (inputVerifier)
          inputVerifier(input);
        setUserDataInput({ ...userDataInput, [field]: input });
      };
    };
    const getOnChangeVerifier = useCallback(updateUserDataClb, [userDataInput, warnings, correctInput]);
    return { getVerifiersState, getOnChangeVerifier };
  };
  const useVerifiers = useCallback(useVerifiersClb, [warnings, correctInput]);

  return (
    <VerifiersContext.Provider value={{ useVerifiers, fetchInput, warnings, setWarning, correctInput, setCorrectState, userDataInput, setUserDataInput }}>
      {props.children}
    </VerifiersContext.Provider>
  );
};

export default VerifiersContextProvider;
