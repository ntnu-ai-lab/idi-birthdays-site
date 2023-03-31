export function dateConvert(date) {
  return new Date(date).toLocaleDateString("NO", { day: "numeric", month: "short", year: "numeric" })
}