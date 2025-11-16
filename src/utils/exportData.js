/**
 * Exporta dados para arquivo CSV
 * @param {Array} data - Array de objetos com os dados
 * @param {Array} columns - Array de objetos com configuração das colunas: [{ key, label }]
 * @param {string} filename - Nome do arquivo a ser exportado
 */
export function exportToCSV(data, columns, filename) {
  if (!data || data.length === 0) {
    alert('Não há dados para exportar');
    return;
  }

  // Criar cabeçalho do CSV
  const headers = columns.map(col => col.label).join(',');

  // Criar linhas do CSV
  const rows = data.map(row => {
    return columns.map(col => {
      let value = row[col.key];

      // Se tiver uma função de formatação customizada, usar ela
      if (col.format) {
        value = col.format(row);
      }

      // Tratar valores especiais
      if (value === null || value === undefined) {
        value = '';
      }

      // Escapar vírgulas e aspas no valor
      value = String(value).replace(/"/g, '""');

      // Se contém vírgula, quebra de linha ou aspas, envolver em aspas
      if (value.includes(',') || value.includes('\n') || value.includes('"')) {
        value = `"${value}"`;
      }

      return value;
    }).join(',');
  });

  // Combinar cabeçalho e linhas
  const csv = [headers, ...rows].join('\n');

  // Criar blob e fazer download
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
