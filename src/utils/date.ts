export function toIsoFromDateTimeLocal(value: string) {
  const date = new Date(value);
  return date.toISOString();
}

export function toDefaultRange() {
  const now = new Date();
  const to = now;
  const from = new Date(now.getTime() - 2 * 60 * 60 * 1000);
  const pad = (num: number) => String(num).padStart(2, "0");

  const toLocal = `${to.getFullYear()} - ${pad(to.getMonth() + 1)} - ${pad(to.getDate())}T${pad(to.getHours())}:${pad(to.getMinutes())}`;
  const fromLocal = `${from.getFullYear()} - ${pad(from.getMonth() + 1)} - ${pad(from.getDate())}T${pad(from.getHours())}:${pad(from.getMinutes())}`;
  return { toLocal, fromLocal };
}
