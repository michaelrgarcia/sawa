export function parseDate(dateStr: string): Date | null {
  try {
    const [month, day, yearAndRest] = dateStr.trim().split("/");
    const [year, timeAndPeriod] = yearAndRest.trim().split(" ");
    const [time, period] = [timeAndPeriod.slice(0, 5), timeAndPeriod.slice(5)];

    const final = `${month}/${day}/${year} ${time} ${period}`;

    return new Date(Date.parse(final));
  } catch {
    return null;
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateRandomString(length: number): string {
  const characters =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charactersLength);
    result += characters.charAt(randomIndex);
  }

  return result;
}

export function genSessionId(): string {
  const randomPart = generateRandomString(5).toLowerCase();
  const timestamp = Date.now(); // milliseconds since epoch
  return `${randomPart}${timestamp}`;
}
