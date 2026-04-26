function checkTimeLength(props: number) {
  let timePropsString = String(props);
  if (timePropsString.length < 2) timePropsString = `0${timePropsString}`;
  return timePropsString;
}
function dayToChineseDay(props: number) {
  let chineseDay = "xx";
  switch (props) {
    case 0:
      chineseDay = "周日";
      break;
    case 1:
      chineseDay = "周一";
      break;
    case 2:
      chineseDay = "周二";
      break;
    case 3:
      chineseDay = "周三";
      break;
    case 4:
      chineseDay = "周四";
      break;
    case 5:
      chineseDay = "周五";
      break;
    case 6:
      chineseDay = "周六";
      break;
  }
  return chineseDay;
}
export { checkTimeLength, dayToChineseDay };
