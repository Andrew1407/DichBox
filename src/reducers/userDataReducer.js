const userDataReducer = (state, action) => {
  const actions = {
    REFRESH_DATA: { ...state, ...action.data },
    CLEAN_DATA: {}
  };
  const actionType = actions[action.type];
  return actionType ? actionType : state;
};

export default userDataReducer;
