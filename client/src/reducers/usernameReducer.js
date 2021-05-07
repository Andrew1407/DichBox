const usernameReducer = (state, action) => {
  const actions = {
    SET_NAME: () => action.value,
    REMOVE_NAME: () => null
  };
  const actionType = actions[action.type];
  return actionType ? actionType() : state;
};

export default usernameReducer;
