const justifyNumber = (n: string): string => (
  n.length > 1 ? n : '0' + n
);

const transformDate = (
  date: string,
  separator: string,
  joiner: string
): string => {
  return date
    .split(separator)
    .map(justifyNumber)
    .join(joiner);
};

export const formatDate = (dateRaw: string): string => {
  const dateUnformatted: string = new Date(dateRaw)
    .toLocaleDateString();
  const dateFormatted: string = transformDate(dateUnformatted, '/', '.');
  return dateFormatted;
};

export const formatDateTime = (dateRaw: string): string => {
  const dateUnformatted: string = new Date(dateRaw)
    .toLocaleString();
  const [ yearRaw, timeRaw ]: string[] = dateUnformatted.split(', ');
  const yearRes: string = transformDate(yearRaw, '/', '.');
  const timeRes: string = transformDate(timeRaw, ':', ':');
  const dateFormatted: string = `${yearRes}, ${timeRes}`;
  return dateFormatted;
};