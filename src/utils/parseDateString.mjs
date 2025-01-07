export function parseDateString(dateString) {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
    console.error("Formato de data inválido. Use DD/MM/AAAA.");
    return { error: "Formato de data inválido. Use DD/MM/AAAA." };
  }

  try {
    const [day, month, year] = dateString.split("/");
    const date = new Date(year, month - 1, day);

    if (isNaN(date)) {
      return { error: "Data inválida." };
    }

    return { result: date };
  } catch (error) {
    return { error: "Erro ao parsear a data: " + error.message };
  }
}
