export function formatDateForInput(value) {
  const date = value instanceof Date ? value : new Date(value);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10);
}
