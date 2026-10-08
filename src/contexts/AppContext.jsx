import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const AppContext = createContext(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

export const AppProvider = ({ children }) => {
  const { user, isAdmin, isStudent, isAuthenticated } = useAuth();

  // Reference data
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [settings, setSettings] = useState({});

  // Entity data arrays (pre-fetched for page compatibility)
  const [students, setStudents] = useState([]);
  const [payments, setPayments] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [tests, setTests] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [studyMaterials, setStudyMaterials] = useState([]);
  const [income, setIncome] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Constants for dropdowns
  const COURSES = useMemo(() => courses.map(c => c.name), [courses]);
  const BATCHES = useMemo(() => batches.map(b => b.name), [batches]);
  const SUBJECTS = useMemo(() => subjects.map(s => s.name), [subjects]);
  const ACADEMIC_YEARS = ['2024-2025', '2025-2026', '2026-2027'];

  // ─── Load all data on authentication ───
  useEffect(() => {
    if (!isAuthenticated) {
      setDataLoaded(false);
      return;
    }
    loadAllData();
  }, [isAuthenticated, isAdmin]);

  const loadAllData = async () => {
    try {
      // Load reference data first
      const [coursesData, batchesData, subjectsData] = await Promise.all([
        api.get('/settings/courses'),
        api.get('/settings/batches'),
        api.get('/settings/subjects'),
      ]);
      setCourses(coursesData);
      setBatches(batchesData);
      setSubjects(subjectsData);

      if (isAdmin) {
        // Admin: load everything
        const [
          studentsData, paymentsData, testsData,
          incomeData, expensesData, remindersData, notifData
        ] = await Promise.all([
          api.get('/students'),
          api.get('/payments'),
          api.get('/tests'),
          api.get('/finance/income'),
          api.get('/finance/expenses'),
          api.get('/reminders'),
          api.get('/notifications'),
        ]);
        setStudents(studentsData);
        setPayments(paymentsData);
        setTests(testsData);
        setIncome(incomeData);
        setExpenses(expensesData);
        setReminders(remindersData);
        setNotifications(notifData);

        // Load settings
        try {
          const settingsData = await api.get('/settings');
          setSettings(settingsData);
        } catch (e) { console.warn('Settings load failed:', e); }
      } else if (user?.studentId || user?.student?.id) {
        // Student: load own data
        const studentId = user.studentId || user.student?.id || user.id;
        const [paymentsData, docsData, materialsData, notifData] = await Promise.all([
          api.get(`/payments/student/${studentId}`).catch(() => []),
          api.get(`/documents/student/${studentId}`).catch(() => []),
          api.get('/materials').catch(() => []),
          api.get('/notifications').catch(() => []),
        ]);
        setPayments(paymentsData);
        setDocuments(docsData);
        setStudyMaterials(materialsData);
        setNotifications(notifData);
      }

      setDataLoaded(true);
    } catch (err) {
      console.error('Failed to load data:', err);
      setDataLoaded(true); // Still mark loaded so UI isn't stuck
    }
  };

  // ─── Refresh helpers ───
  const refreshStudents = useCallback(async () => {
    try {
      const data = await api.get('/students');
      setStudents(data);
      return data;
    } catch (e) { console.error(e); return students; }
  }, [students]);

  const refreshPayments = useCallback(async () => {
    try {
      const data = await api.get('/payments');
      setPayments(data);
      return data;
    } catch (e) { console.error(e); return payments; }
  }, [payments]);

  // ─── Student CRUD ───
  const addStudent = useCallback(async (studentData) => {
    const result = await api.post('/students', studentData);
    setStudents(prev => [...prev, result]);
    return result;
  }, []);

  const updateStudent = useCallback(async (id, updates) => {
    const result = await api.put(`/students/${id}`, updates);
    setStudents(prev => prev.map(s => s.id === id ? result : s));
    return result;
  }, []);

  const deactivateStudent = useCallback(async (id) => {
    const result = await api.patch(`/students/${id}/status`);
    setStudents(prev => prev.map(s => s.id === id ? result : s));
    return result;
  }, []);

  const getStudentById = useCallback(async (id) => {
    return api.get(`/students/${id}`);
  }, []);

  // ─── Payments ───
  const addPayment = useCallback(async (paymentData) => {
    const result = await api.post('/payments', paymentData);
    setPayments(prev => [...prev, result]);
    return result;
  }, []);

  const updatePayment = useCallback(async (id, updates) => {
    const result = await api.put(`/payments/${id}`, updates);
    setPayments(prev => prev.map(p => p.id === id ? result : p));
    return result;
  }, []);

  const deletePayment = useCallback(async (id) => {
    await api.delete(`/payments/${id}`);
    setPayments(prev => prev.filter(p => p.id !== id));
  }, []);

  const getPaymentReceipt = useCallback(async (id) => {
    return api.get(`/payments/${id}/receipt`);
  }, []);

  // ─── Attendance ───
  const markAttendance = useCallback(async (records) => {
    const result = await api.post('/attendance/mark', { records });
    // Refresh attendance after marking
    return result;
  }, []);

  const getAttendanceForStudent = useCallback(async (studentId, filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return api.get(`/attendance/student/${studentId}${params ? `?${params}` : ''}`);
  }, []);

  const getBatchAttendance = useCallback(async (batchId, filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return api.get(`/attendance/batch/${batchId}${params ? `?${params}` : ''}`);
  }, []);

  // ─── Synchronous summary helpers (compute from pre-fetched data) ───
  const getStudentFeeSummary = useCallback((studentId) => {
    const student = students.find(s => s.id === studentId) || user;
    const studentPayments = payments.filter(p => p.studentId === studentId);
    const totalPaid = studentPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalFees = student?.totalFees || 0;
    const remaining = Math.max(totalFees - totalPaid, 0);
    return {
      totalFees,
      totalPaid,
      remaining,
      payments: studentPayments,
      status: remaining <= 0 ? 'Paid' : 'Pending',
    };
  }, [students, payments, user]);

  const getStudentAttendanceSummary = useCallback((studentId) => {
    const studentAtt = attendance.filter(a => a.studentId === studentId);
    const total = studentAtt.length;
    const present = studentAtt.filter(a => a.status === 'PRESENT').length;
    return {
      totalClasses: total,
      present,
      absent: total - present,
      percentage: total > 0 ? Math.round((present / total) * 100) : 0,
    };
  }, [attendance]);

  const getStudentTestSummary = useCallback((studentId) => {
    const publishedTests = tests.filter(t => t.published);
    const studentMarks = publishedTests.flatMap(t =>
      (t.marks || []).filter(m => m.studentId === studentId)
    );
    const totalTests = studentMarks.length;
    const avgPercentage = totalTests > 0
      ? Math.round(studentMarks.reduce((sum, m) => sum + m.percentage, 0) / totalTests)
      : 0;
    const passed = studentMarks.filter(m => m.percentage >= 40).length;
    return {
      totalTests,
      avgPercentage,
      passed,
      failed: totalTests - passed,
      passRate: totalTests > 0 ? Math.round((passed / totalTests) * 100) : 0,
    };
  }, [tests]);

  const getNotificationsForStudent = useCallback((studentId) => {
    return notifications.filter(n => n.studentId === studentId || !studentId);
  }, [notifications]);

  // ─── Tests & Marks ───
  const addTest = useCallback(async (testData) => {
    const result = await api.post('/tests', testData);
    setTests(prev => [...prev, result]);
    return result;
  }, []);

  const updateTest = useCallback(async (id, updates) => {
    const result = await api.put(`/tests/${id}`, updates);
    setTests(prev => prev.map(t => t.id === id ? result : t));
    return result;
  }, []);

  const publishTest = useCallback(async (id) => {
    const result = await api.patch(`/tests/${id}/publish`);
    setTests(prev => prev.map(t => t.id === id ? result : t));
    return result;
  }, []);

  const updateMarks = useCallback(async (testId, marksData) => {
    const result = await api.post(`/tests/${testId}/marks`, { marks: marksData });
    // Refresh tests to get updated marks
    try {
      const testsData = await api.get('/tests');
      setTests(testsData);
    } catch (e) { console.error(e); }
    return result;
  }, []);

  const getTestResults = useCallback(async (testId) => {
    return api.get(`/tests/${testId}/results`);
  }, []);

  // ─── Documents ───
  const addDocument = useCallback(async (formData) => {
    const result = await api.upload('/documents/upload', formData);
    setDocuments(prev => [...prev, result]);
    return result;
  }, []);

  const deleteDocument = useCallback(async (id) => {
    await api.delete(`/documents/${id}`);
    setDocuments(prev => prev.filter(d => d.id !== id));
  }, []);

  const getDocumentsForStudent = useCallback(async (studentId) => {
    return api.get(`/documents/student/${studentId}`);
  }, []);

  // ─── Study Materials ───
  const addStudyMaterial = useCallback(async (formData) => {
    const result = await api.upload('/materials', formData);
    setStudyMaterials(prev => [...prev, result]);
    return result;
  }, []);

  const deleteStudyMaterial = useCallback(async (id) => {
    await api.delete(`/materials/${id}`);
    setStudyMaterials(prev => prev.filter(m => m.id !== id));
  }, []);

  // ─── Reminders ───
  const addReminder = useCallback(async (data) => {
    const result = await api.post('/reminders', data);
    setReminders(prev => [...prev, result]);
    return result;
  }, []);

  const updateReminder = useCallback(async (id, updates) => {
    const result = await api.put(`/reminders/${id}`, updates);
    setReminders(prev => prev.map(r => r.id === id ? result : r));
    return result;
  }, []);

  const deleteReminder = useCallback(async (id) => {
    await api.delete(`/reminders/${id}`);
    setReminders(prev => prev.filter(r => r.id !== id));
  }, []);

  // ─── Academy Finance ───
  const addIncome = useCallback(async (data) => {
    const result = await api.post('/finance/income', data);
    setIncome(prev => [...prev, result]);
    return result;
  }, []);

  const updateIncome = useCallback(async (id, updates) => {
    const result = await api.put(`/finance/income/${id}`, updates);
    setIncome(prev => prev.map(i => i.id === id ? result : i));
    return result;
  }, []);

  const deleteIncome = useCallback(async (id) => {
    await api.delete(`/finance/income/${id}`);
    setIncome(prev => prev.filter(i => i.id !== id));
  }, []);

  const addExpense = useCallback(async (data) => {
    const result = await api.post('/finance/expenses', data);
    setExpenses(prev => [...prev, result]);
    return result;
  }, []);

  const updateExpense = useCallback(async (id, updates) => {
    const result = await api.put(`/finance/expenses/${id}`, updates);
    setExpenses(prev => prev.map(e => e.id === id ? result : e));
    return result;
  }, []);

  const deleteExpense = useCallback(async (id) => {
    await api.delete(`/finance/expenses/${id}`);
    setExpenses(prev => prev.filter(e => e.id !== id));
  }, []);

  const getFinanceSummary = useCallback(async () => {
    return api.get('/finance/summary');
  }, []);

  const getFinancePnL = useCallback(async () => {
    return api.get('/finance/pnl');
  }, []);

  // ─── Notifications ───
  const markNotificationRead = useCallback(async (id) => {
    await api.patch(`/notifications/${id}/read`);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const addNotification = useCallback(async (data) => {
    const result = await api.post('/notifications', data);
    setNotifications(prev => [...prev, result]);
    return result;
  }, []);

  // ─── Settings ───
  const updateSettings = useCallback(async (updates) => {
    const result = await api.put('/settings', updates);
    setSettings(result);
    return result;
  }, []);

  // ─── Reports ───
  const fetchReport = useCallback(async (type, filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return api.get(`/reports/${type}${params ? `?${params}` : ''}`);
  }, []);

  // ─── Course/Batch/Subject management ───
  const addCourse = useCallback(async (data) => {
    const result = await api.post('/settings/courses', data);
    setCourses(prev => [...prev, result]);
    return result;
  }, []);

  const addBatch = useCallback(async (data) => {
    const result = await api.post('/settings/batches', data);
    setBatches(prev => [...prev, result]);
    return result;
  }, []);

  const addSubject = useCallback(async (data) => {
    const result = await api.post('/settings/subjects', data);
    setSubjects(prev => [...prev, result]);
    return result;
  }, []);

  const value = {
    // Reference data (arrays + name strings)
    courses, batches, subjects, settings, dataLoaded,
    COURSES, BATCHES, SUBJECTS, ACADEMIC_YEARS,

    // Entity arrays (pre-fetched, synchronous)
    students, payments, attendance, tests, documents,
    studyMaterials, income, expenses, reminders, notifications,

    // Student CRUD
    addStudent, updateStudent, deactivateStudent, getStudentById,
    refreshStudents,

    // Payments
    addPayment, updatePayment, deletePayment, getPaymentReceipt, refreshPayments,

    // Attendance
    markAttendance, getAttendanceForStudent, getBatchAttendance,

    // Synchronous summary helpers (for page compatibility)
    getStudentFeeSummary, getStudentAttendanceSummary,
    getStudentTestSummary, getNotificationsForStudent,

    // Tests
    addTest, updateTest, publishTest, updateMarks, getTestResults,

    // Documents
    addDocument, deleteDocument, getDocumentsForStudent,

    // Study Materials
    addStudyMaterial, deleteStudyMaterial,

    // Reminders
    addReminder, updateReminder, deleteReminder,

    // Finance
    addIncome, updateIncome, deleteIncome,
    addExpense, updateExpense, deleteExpense,
    getFinanceSummary, getFinancePnL,

    // Notifications
    markNotificationRead, addNotification,

    // Settings
    updateSettings,

    // Reports
    fetchReport,

    // Course/Batch/Subject management
    addCourse, addBatch, addSubject,

    // Reload
    loadAllData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContext;
