const filesReducer = (state, action) => {
  const actions = {
    FILE_APPEND: () => {
      const leftArray = state.length === 10 ?
        state.slice(0, -1) : state;
        return [ action.file, ...leftArray ]
    },
    FILE_CLOSE: () => {
      const { index } = action;
      const leftL = state.slice(0, index);
      const leftR = state.slice(index + 1, state.length);
      return leftL.concat(leftR);
    }
  };
  const actionType = actions[action.type];
  return actionType ? actionType() : state;
};

export default filesReducer;
