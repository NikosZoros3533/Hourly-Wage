export const calculateHours = (startTime: string, endTime: string): number => {
  const start = convertToMinutes(startTime);
  const end = convertToMinutes(endTime);

  let diff = end - start;

  // overnight shift
  if (diff < 0) {
    diff += 24 * 60;
  }

  return diff / 60;
};

const convertToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);

  return hours * 60 + minutes;
};
