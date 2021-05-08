export const enum Statuses {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  SERVER_INTERNAL = 500
};

export const enum ErrorMessages {
  USER_INVAID_REQUEST = 'This data is toxic. Not good for you...',
  USER_NOT_FOUND = 'The searched digital twin wasn\'t found in the DichBox system...',
  FORBIDDEN = 'Forbidden for you!!!',
  SUBSCRIPTIONS_NOT_FOUND = 'Nothing was found for you...',
  BOXES_NOT_FOUND = 'No box, no files, no directories... Nothing... Just nothing...',
  BOXES_INVAID_REQUEST = 'Well, invalid data...',
  DIR_NOT_FOUND = 'Nothing is here. No files, no directories...',
  INVALID_PATH = 'This path has led you to nowhere...',
  BOXES_INTERNAL = 'Very big problems with the DichBox server.',
  FILES_NOT_FOUND = 'Wrong names, no data for you...',
  SERVER_INTERNAL = 'It\'s a secret, but something terrible happened on the DichBox server...',
  INVALID_PASSWORD = 'Invalid password'
};
