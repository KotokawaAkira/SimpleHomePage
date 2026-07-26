import { computed, reactive } from "vue";
import { checkTimeLength, dayToChineseDay } from "../../tools/timeTools";
import type { MyDate } from "../types/types";

export function useTime() {
  const nowDate = new Date();
  const time = reactive<MyDate>({
    year: nowDate.getFullYear(),
    day: nowDate.getDay(),
    date: nowDate.getDate(),
    month: nowDate.getMonth(),
    hours: nowDate.getHours(),
    minutes: nowDate.getMinutes(),
    seconds: nowDate.getSeconds(),
  });

  const timeString = computed(
    () =>
      `${checkTimeLength(time.hours)}:${checkTimeLength(time.minutes)}:${checkTimeLength(time.seconds)}`,
  );

  let timer: ReturnType<typeof setInterval>;

  function startClock() {
    timer = setInterval(() => {
      const newTime = new Date();
      time.year = newTime.getFullYear();
      time.day = newTime.getDay();
      time.date = newTime.getDate();
      time.hours = newTime.getHours();
      time.minutes = newTime.getMinutes();
      time.seconds = newTime.getSeconds();
    }, 1000);
  }

  function stopClock() {
    clearInterval(timer);
  }

  return { time, timeString, startClock, stopClock, dayToChineseDay };
}
