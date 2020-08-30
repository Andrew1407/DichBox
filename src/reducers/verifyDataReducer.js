const verifyDataReducer = (state, action) => {
  const actions = {
    SET_DATA: { ...action.data },
    PUSH_DATA: { ...state, ...action.data },
    CLEAN_DATA: {}
  };
  const actionType = actions[action.type];
  return actionType || state;
};

export default verifyDataReducer;
