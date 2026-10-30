// ── MoneyCare Formatting & Utility Helpers ─────────────────────────────

// Định dạng tiền tệ Việt Nam (ví dụ: 987.654.321 đ)
export function fmtMoney(amount, showSign = false, type = 'NONE') {
  if (amount === null || amount === undefined || isNaN(amount)) return '0 đ';
  const num = Math.abs(Number(amount));
  const formatted = num.toLocaleString('vi-VN') + ' đ';

  if (!showSign) return formatted;
  if (type === 'INCOME' || type === 'THU' || amount > 0) {
    return `+${formatted}`;
  }
  if (type === 'EXPENSE' || type === 'CHI' || amount < 0) {
    return `-${formatted}`;
  }
  return formatted;
}

// Định dạng ngày: dd/MM/yyyy
export function fmtDate(dateString) {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateString;
  }
}

// Định dạng ngày giờ: dd/MM/yyyy HH:mm
export function fmtDateTime(dateString) {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch {
    return dateString;
  }
}

// Che email: ví dụ tran***@gmail.com
export function maskEmail(email) {
  if (!email || !email.includes('@')) return email || '—';
  const [name, domain] = email.split('@');
  if (name.length <= 2) return `${name[0]}***@${domain}`;
  return `${name.slice(0, 2)}***@${domain}`;
}

// Che số điện thoại: ví dụ 09******
export function maskPhone(phone) {
  if (!phone) return '—';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length < 4) return phone;
  return `${cleaned.slice(0, 2)}******`;
}

// Che số tài khoản: chỉ hiện 4 số cuối
export function maskAccountNumber(accNo) {
  if (!accNo) return '••••';
  const str = String(accNo);
  if (str.length <= 4) return str;
  return `•••• ${str.slice(-4)}`;
}

// Xuất file CSV hỗ trợ tiếng Việt (UTF-8 BOM) và phòng chống CSV injection
export function exportToCSV(filename, headers, rows) {
  const sanitizeCell = (val) => {
    if (val === null || val === undefined) return '""';
    let str = String(val).replace(/"/g, '""');
    // Phòng ngừa CSV Formula Injection (=, +, -, @)
    if (str.startsWith('=') || str.startsWith('+') || str.startsWith('-') || str.startsWith('@')) {
      str = "'" + str;
    }
    return `"${str}"`;
  };

  const headerRow = headers.map(h => sanitizeCell(h.label)).join(',');
  const dataRows = rows.map(row => {
    return headers.map(h => sanitizeCell(typeof h.key === 'function' ? h.key(row) : row[h.key])).join(',');
  });

  // UTF-8 BOM: \uFEFF
  const csvContent = '\uFEFF' + [headerRow, ...dataRows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
