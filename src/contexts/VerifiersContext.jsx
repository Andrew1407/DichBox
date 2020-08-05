import React, { createContext, useState, useCallback, useReducer } from 'react';
import axios from 'axios';
import verifyDataReducer from '../reducers/verifyDataReducer';

export const VerifiersContext = createContext();

const VerifiersContextProvider = props => {
  const [warnings, setWarning] = useState({});
  const [correctInput, setCorrectState] = useState({});
  const [dataInput, dispatchDataInput] = useReducer(verifyDataReducer, {});
  const cleanWarningsClb = () => {
    setCorrectState({});
    setWarning({})
  };
  const cleanWarnings = useCallback(cleanWarningsClb, []);
  const setWarningsOnHandleClb = (wrngs, correctState) => {
    if (wrngs)
      setWarning({ ...warnings, ...wrngs });
    if (correctState)
      setCorrectState({ ...correctInput, ...correctState });
  };
  const setWarningsOnHandle = useCallback(setWarningsOnHandleClb, [warnings, correctInput]);
  const fetchInput = fetchType => async (inputField, inputValue) => {
    const verifyBody = { inputField, inputValue };
    const { data } = await axios.post(`http://192.168.0.223:7041/${fetchType}/verify`, verifyBody);
    return data;
  };
  const fetchPasswdVer = async (id, passwd) => {
    const passwdBody = { id, passwd };
    const { data } = await axios.post('http://192.168.0.223:7041/users/passwd_verify', passwdBody);
    return data;
  }
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
        setWarningsOnHandle(
          { [field]: warningStyle },
          { [field]: isCorrect }
        );
      };
    };
    const updateUserDataClb = field => {
      const inputVerifier = getVerifier(field);
      return e => {
        e.preventDefault();
        const input = e.target.value;
        if (inputVerifier)
          inputVerifier(input);
        const dataReducerAction = {
          type: 'PUSH_DATA',
          data: { [field]: input }
        };
        dispatchDataInput(dataReducerAction);
      };
    };
    const getOnChangeVerifier = useCallback(updateUserDataClb, [dataInput, warnings, correctInput]);
    return { getVerifiersState, getOnChangeVerifier };
  };
  const useVerifiers = useCallback(useVerifiersClb, [warnings, correctInput]);

  return (
    <VerifiersContext.Provider value={{ useVerifiers, fetchInput, warnings, correctInput, dataInput, dispatchDataInput, fetchPasswdVer, cleanWarnings, setWarningsOnHandle }}>
      {props.children}
    </VerifiersContext.Provider>
  );
};

export default VerifiersContextProvider;
