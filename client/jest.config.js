module.exports = {
  moduleNameMapper: {
    '\\.(css|less)$': '<rootDir>/jest/styleMock.js',
    '\\.(png|jpe?g|gif)': '<rootDir>/jest/fileMock.js'
  },
  setupFilesAfterEnv: ['<rootDir>/jest/setUpTests.js']
};
