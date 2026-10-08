import { format, parseISO, differenceInDays, isAfter, isBefore, addDays } from 'date-fns';

export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '₹0';
  return '₹' + Number(amount).toLocaleString('en-IN');
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
    return format(date, 'dd MMM yyyy');
  } catch {
    return dateStr;
  }
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return '—';
  try {
    const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
    return format(date, 'dd MMM yyyy, hh:mm a');
  } catch {
    return dateStr;
  }
};

export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined) return '0%';
  return Number(value).toFixed(decimals) + '%';
};

export const getAttendanceColor = (percentage) => {
  if (percentage >= 90) return 'text-emerald-600';
  if (percentage >= 75) return 'text-amber-600';
  return 'text-red-600';
};

export const getAttendanceBg = (percentage) => {
  if (percentage >= 90) return 'bg-emerald-50 text-emerald-700';
  if (percentage >= 75) return 'bg-amber-50 text-amber-700';
  return 'bg-red-50 text-red-700';
};

export const getFeeStatusBadge = (status) => {
  switch (status?.toLowerCase()) {
    case 'paid': return 'badge-success';
    case 'partial': return 'badge-warning';
    case 'overdue': return 'badge-danger';
    case 'pending': return 'badge-info';
    default: return 'badge-neutral';
  }
};

export const getTestStatusBadge = (status) => {
  switch (status?.toLowerCase()) {
    case 'pass': return 'badge-success';
    case 'fail': return 'badge-danger';
    case 'absent': return 'badge-neutral';
    default: return 'badge-info';
  }
};

export const calculatePenalty = (config, dueDate, paymentDate, outstandingAmount) => {
  if (!config || config.type === 'none' || !dueDate || !paymentDate) return 0;
  
  const due = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;
  const payment = typeof paymentDate === 'string' ? parseISO(paymentDate) : paymentDate;
  const graceEnd = addDays(due, config.gracePeriod || 0);
  
  if (!isAfter(payment, graceEnd)) return 0;
  
  const daysLate = differenceInDays(payment, graceEnd);
  let penalty = 0;
  
  switch (config.type) {
    case 'fixed':
      penalty = config.amount || 0;
      break;
    case 'daily':
      penalty = daysLate * (config.amount || 0);
      break;
    case 'percentage':
      penalty = outstandingAmount * (config.rate || 0) / 100;
      break;
    default:
      penalty = 0;
  }
  
  if (config.maxPenalty && penalty > config.maxPenalty) {
    penalty = config.maxPenalty;
  }
  
  return Math.round(penalty);
};

export const calculateRanks = (students, testId, marksData) => {
  const testMarks = marksData
    .filter(m => m.testId === testId && m.status === 'present')
    .map(m => ({ studentId: m.studentId, marks: m.marks, percentage: m.percentage }))
    .sort((a, b) => b.marks - a.marks);
  
  let rank = 0;
  let prevMarks = -1;
  let skip = 0;
  
  return testMarks.map((entry, index) => {
    if (entry.marks !== prevMarks) {
      rank = index + 1;
      prevMarks = entry.marks;
    }
    return { ...entry, rank };
  });
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

export const generateReceiptNo = () => {
  const prefix = 'EP';
  const year = new Date().getFullYear().toString().slice(-2);
  const num = Math.floor(Math.random() * 9000 + 1000);
  return `${prefix}${year}-${num}`;
};

export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
};

export const truncateText = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const getFileIcon = (fileType) => {
  switch (fileType?.toLowerCase()) {
    case 'pdf': return 'FileText';
    case 'doc':
    case 'docx': return 'FileText';
    case 'xls':
    case 'xlsx': return 'Sheet';
    case 'jpg':
    case 'jpeg':
    case 'png': return 'Image';
    default: return 'File';
  }
};

export const getFileSizeString = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export const searchFilter = (items, query, fields) => {
  if (!query || !query.trim()) return items;
  const lower = query.toLowerCase().trim();
  return items.filter(item =>
    fields.some(field => {
      const value = field.split('.').reduce((obj, key) => obj?.[key], item);
      return value && String(value).toLowerCase().includes(lower);
    })
  );
};

export const getDaysUntilDue = (dueDate) => {
  if (!dueDate) return null;
  const due = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return differenceInDays(due, today);
};

export const isOverdue = (dueDate) => {
  const days = getDaysUntilDue(dueDate);
  return days !== null && days < 0;
};
