const userIdReducer = (state, action) => {
  const actions = {
    SET_ID () {
      const { id } = action;
      localStorage.setItem('id', id);
      return id;
    },
    REMOVE_ID () {
      localStorage.removeItem('id');
      return null;
    }
  };
  const actionType = actions[action.type];
  return actionType ? actionType() : state;
};

export default userIdReducer;
