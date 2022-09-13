export const compareStrings = (str1: string, str2: string) => {
  if (str1.localeCompare(str2) > 0) {
    return [str1, str2];
  } else {
    return [str2, str1];
  }
};
