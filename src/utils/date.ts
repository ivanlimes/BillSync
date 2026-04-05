export function toIsoDate(value: Date) {
  return value.toISOString().slice(0, 10);
}
