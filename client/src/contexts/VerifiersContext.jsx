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
    setWarning({});
  };
  const cleanWarnings = useCallback(cleanWarningsClb, []);
  const setWarningsOnHandleClb = (wrngs, correctState) => {
    if (wrngs)
      setWarning({ ...warnings, ...wrngs });
    if (correctState)
      setCorrectState({ ...correctInput, ...correctState });
  };
  const setWarningsOnHandle = useCallback(setWarningsOnHandleClb, [warnings, correctInput]);
  const fetchBoxInput = async (username, boxName) => {
    const verifyBody = { username, boxName };
    const { data } = await axios.post(`${process.env.APP_ADDR}/boxes/verify`, verifyBody);
    return data;
  };
  const fetchUserInput = async (inputField, inputValue) => {
    const verifyBody = { inputField, inputValue };
    const { data } = await axios.post(`${process.env.APP_ADDR}/users/verify`, verifyBody);
    return data.foundValue;
  };
  const fetchPasswdVer = async (username, passwd) => {
    const passwdBody = { username, passwd };
    const { data } = await axios.post(`${process.env.APP_ADDR}/users/passwd_verify`, passwdBody);
    return data.checked;
  }
  const useVerifiersClb = verParams => {
    const verFields = Object.keys(verParams);
    const getVerifiersState = (arr = verFields) => arr.reduce(
      (isCorrectAll, isCorrectField) =>
        (isCorrectAll && !!correctInput[isCorrectField]), true
    );
    const getVerifier = field => {
      const verifierParams = verParams[field];
      if (!verifierParams) return;
      return async input => {
        const { fetchVerifier, defaultState } = verifierParams;
        let warningStyle = {
          borderColor: 'rgb(0, 255, 76)',
          text: ''
        };
        let isCorrect = true;
        const inputRegExp = verifierParams.regExp;
        if (defaultState?.value === input) {
          warningStyle = {
            borderColor: 'rgb(0, 217, 255)',
            text: ''
          };
          isCorrect = defaultState.correct;
        } else if (inputRegExp && !inputRegExp.test(input)) {
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
  const useVerifiers = useCallback(useVerifiersClb, [warnings, correctInput, dataInput]);

  return (
    <VerifiersContext.Provider value={{ useVerifiers, fetchUserInput, warnings, correctInput, dataInput, dispatchDataInput, fetchPasswdVer, cleanWarnings, setWarningsOnHandle, fetchBoxInput }}>
      { props.children }
    </VerifiersContext.Provider>
  );
};

export default VerifiersContextProvider;
