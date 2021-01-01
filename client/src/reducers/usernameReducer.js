const usernameReducer = (state, action) => {
  const actions = {
    SET_NAME () {
      const { value } = action;
      localStorage.setItem('name', value);
      return value;
    },
    REMOVE_NAME () {
      localStorage.removeItem('name');
      return null;
    }
  };
  const actionType = actions[action.type];
  return actionType ? actionType() : state;
};

export default usernameReducer;
