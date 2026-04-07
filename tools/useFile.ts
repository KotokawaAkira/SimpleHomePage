function readImgToBase64(
  file: File,
  callback: (imgBase64String: string) => void,
) {
  const reader = new FileReader();
  reader.onload = () => {
    const resultString = reader.result as string;
    callback(resultString);
  };
  reader.readAsDataURL(file); // 转为 Base64
}

export { readImgToBase64 };
