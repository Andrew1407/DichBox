const boxPrivacyReducer = (state, action) => {
  const actions = {
    SET_PRIVACY: { 
      type: action.privacy,
      accessList: []
    },
    ACCESS_LIST_PUSH: { 
      type: 'limited',
      accessList: [...state.accessList, action.value]
    },
    SET_ACCESS_LIST: {
      type: 'limited',
      accessList: action.value
    }
  };
  const actionType = actions[action.type];
  return actionType ? actionType : state;
}

export default boxPrivacyReducer;
