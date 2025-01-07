export function parseDateString(dateString) {
  const [day, month, year] = dateString.split("/");
  return new Date(year, month - 1, day); // Mês é zero-indexado em JavaScript
}
