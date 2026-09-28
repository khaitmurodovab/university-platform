import React, { useState, useEffect } from 'react';
import { 
  Users, BookOpen, GraduationCap, FileText, CheckCircle2, Clock, 
  Settings, LogOut, Shield, Award, Plus, Trash2, Edit, MessageSquare, 
  Bell, Search, Filter, Lock, Eye, AlertCircle, ChevronRight, UserPlus
} from 'lucide-react';

// Default initial database state stored in LocalStorage
const initialDatabase = {
  currentUser: null,
  users: [
    { id: '1', username: 'admin', password: '123', name: 'Super Admin', role: 'SUPER_ADMIN', groupId: null, courseId: null },
    { id: '2', username: 'admin_g201', password: '123', name: 'Group Admin 201', role: 'GROUP_ADMIN', groupId: 'g201', courseId: 'c2' },
    { id: '3', username: 'ali_a', password: '123', name: 'Ali Aliyev', role: 'STUDENT', groupId: 'g201', courseId: 'c2', studentId: 'ST1001' },
    { id: '4', username: 'vali_v', password: '123', name: 'Vali Valiyev', role: 'STUDENT', groupId: 'g201', courseId: 'c2', studentId: 'ST1002' }
  ],
  courses: [
    { id: 'c1', name: '1-kurs' },
    { id: 'c2', name: '2-kurs' }
  ],
  groups: [
    { id: 'g101', name: 'Group 101', courseId: 'c1' },
    { id: 'g201', name: 'Group 201', courseId: 'c2' }
  ],
  subjects: [
    { id: 's1', name: 'Informatika', groupId: 'g201' },
    { id: 's2', name: 'Matematika', groupId: 'g201' }
  ],
  assignments: [
    {
      id: 'a1',
      title: 'Kompyuter tarmoqlari testi',
      subjectId: 's1',
      groupId: 'g201',
      creatorId: '2',
      status: 'OPEN',
      timeLimitMinutes: 30,
      questions: [
        { id: 'q1', text: 'LAN nimani anglatadi?', options: ['Local Area Network', 'Large Area Network', 'Long Area Network'], correctAnswer: 0, points: 10 },
        { id: 'q2', text: 'IP manzil necha bitdan iborat (IPv4)?', options: ['16 bit', '32 bit', '64 bit'], correctAnswer: 1, points: 10 }
      ]
    }
  ],
  results: [
    { id: 'r1', assignmentId: 'a1', studentId: '3', score: 20, maxScore: 20, manualBonus: 0, completedAt: '2026-09-28 10:00' }
  ],
  auditLogs: [
    { id: 'l1', userId: '1', action: 'Tizim ishga tushirildi', timestamp: '2026-09-28 09:00' }
  ],
  chats: [],
  notifications: []
};

export default function App() {
  const [db, setDb] = useState(() => {
    const saved = localStorage.getItem('univ_db');
    return saved ? JSON.parse(saved) : initialDatabase;
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [authError, setAuthError] = useState('');
  
  // Auth Form State
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });

  // Modals / Forms State
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [selectedCourseForGroup, setSelectedCourseForGroup] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  
  // New Student state for Group form
  const [groupStudents, setGroupStudents] = useState([]);
  const [studentForm, setStudentForm] = useState({ name: '', studentId: '', username: '', password: '' });

  // Settings / Admin Profile change state
  const [settingsForm, setSettingsForm] = useState({ username: '', password: '', confirmPassword: '' });
  const [settingsSuccess, setSettingsSuccess] = useState('');

  useEffect(() => {
    localStorage.setItem('univ_db', JSON.stringify(db));
  }, [db]);

  // Auth Handler
  const handleLogin = (e) => {
    e.preventDefault();
    const user = db.users.find(u => u.username === loginForm.username && u.password === loginForm.password);
    if (user) {
      setDb(prev => ({ ...prev, currentUser: user }));
      setAuthError('');
      setLoginForm({ username: '', password: '' });
      setActiveTab('dashboard');
    } else {
      setAuthError('Login yoki parol noto‘g‘ri!');
    }
  };

  const handleLogout = () => {
    setDb(prev => ({ ...prev, currentUser: null }));
  };

  // Group & Student Creation Handler
  const handleAddStudentToGroupList = () => {
    if (!studentForm.name || !studentForm.username || !studentForm.password) {
      alert("Iltimos, talaba ma'lumotlarini to'liq kiriting!");
      return;
    }
    setGroupStudents([...groupStudents, { ...studentForm, id: Date.now().toString() }]);
    setStudentForm({ name: '', studentId: '', username: '', password: '' });
  };

  const handleCreateGroupWithStudents = () => {
    if (!newGroupName.trim()) {
      alert("Guruh nomini kiriting!");
      return;
    }

    const newGroupId = 'g_' + Date.now();
    const newGroup = { id: newGroupId, name: newGroupName, courseId: selectedCourseForGroup };

    const newUsers = groupStudents.map(st => ({
      id: 'u_' + st.id,
      username: st.username,
      password: st.password,
      name: st.name,
      studentId: st.studentId || ('ST' + Math.floor(1000 + Math.random() * 9000)),
      role: 'STUDENT',
      groupId: newGroupId,
      courseId: selectedCourseForGroup
    }));

    setDb(prev => ({
      ...prev,
      groups: [...prev.groups, newGroup],
      users: [...prev.users, ...newUsers],
      auditLogs: [
        ...prev.auditLogs,
        {
          id: 'log_' + Date.now(),
          userId: prev.currentUser.id,
          action: `Yangi guruh yaratildi: ${newGroupName} (${groupStudents.length} ta talaba bilan)`,
          timestamp: new Date().toLocaleString()
        }
      ]
    }));

    setShowAddGroupModal(false);
    setNewGroupName('');
    setGroupStudents([]);
    alert("Guruh va talabalar muvaffaqiyatli qo'shildi!");
  };

  // Admin Credentials Update Handler
  const handleUpdateAdminCredentials = (e) => {
    e.preventDefault();
    if (settingsForm.password && settingsForm.password !== settingsForm.confirmPassword) {
      alert("Parollar bir-biriga mos kelmadi!");
      return;
    }

    setDb(prev => {
      const updatedUsers = prev.users.map(u => {
        if (u.id === prev.currentUser.id) {
          return {
            ...u,
            username: settingsForm.username || u.username,
            password: settingsForm.password || u.password
          };
        }
        return u;
      });

      const updatedCurrentUser = updatedUsers.find(u => u.id === prev.currentUser.id);

      return {
        ...prev,
        currentUser: updatedCurrentUser,
        users: updatedUsers,
        auditLogs: [
          ...prev.auditLogs,
          {
            id: 'log_' + Date.now(),
            userId: prev.currentUser.id,
            action: "Admin profili ma'lumotlari (login/parol) yangilandi",
            timestamp: new Date().toLocaleString()
          }
        ]
      };
    });

    setSettingsSuccess("Ma'lumotlar muvaffaqiyatli yangilandi!");
    setTimeout(() => setSettingsSuccess(''), 3000);
  };

  const user = db.currentUser;

  // -------------------------------------------------------------
  // LOGIN PAGE (NO HINTS, SECURE FORM)
  // -------------------------------------------------------------
  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl">
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-full mb-3 border border-emerald-500/20">
              <GraduationCap className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Universitet Mustaqil Ta'lim Platformasi</h1>
            <p className="text-sm text-zinc-400 mt-1">Tizimga kirish uchun login va parolingizni kiriting</p>
          </div>

          {authError && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Login</label>
              <input
                type="text"
                required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="Loginni kiriting"
                value={loginForm.username}
                onChange={e => setLoginForm({ ...loginForm, username: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Parol</label>
              <input
                type="password"
                required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="Parolni kiriting"
                value={loginForm.password}
                onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold py-3 rounded-xl transition-all duration-200 mt-2 shadow-lg shadow-emerald-500/10"
            >
              Tizimga kirish
            </button>
          </form>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // MAIN DASHBOARD LAYOUT
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-black text-white flex font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-zinc-800 p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-sm leading-tight">TA'LIM PLATFORMASI</h2>
              <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">{user.role}</span>
            </div>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                activeTab === 'dashboard' ? 'bg-emerald-500 text-black font-semibold' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <BookOpen className="w-4 h-4" /> Bosh sahifa
            </button>

            <button
              onClick={() => setActiveTab('courses')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                activeTab === 'courses' ? 'bg-emerald-500 text-black font-semibold' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <GraduationCap className="w-4 h-4" /> Kurslar va Guruhlar
            </button>

            <button
              onClick={() => setActiveTab('results')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                activeTab === 'results' ? 'bg-emerald-500 text-black font-semibold' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Award className="w-4 h-4" /> Guruh Natijalari
            </button>

            {user.role === 'SUPER_ADMIN' && (
              <>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    activeTab === 'settings' ? 'bg-emerald-500 text-black font-semibold' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  <Settings className="w-4 h-4" /> Sozlamalar
                </button>

                <button
                  onClick={() => setActiveTab('audit')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    activeTab === 'audit' ? 'bg-emerald-500 text-black font-semibold' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  <Shield className="w-4 h-4" /> Audit Log
                </button>
              </>
            )}
          </nav>
        </div>

        {/* User Info & Logout */}
        <div className="pt-6 border-t border-zinc-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-emerald-400">
              {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate">{user.name}</p>
              <p className="text-xs text-zinc-500 truncate">@{user.username}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-red-500/10 text-red-400 hover:text-red-300 border border-zinc-800 hover:border-red-500/20 rounded-xl text-sm transition-all"
          >
            <LogOut className="w-4 h-4" /> Chiqish
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold">Xush kelibsiz, {user.name} 👋</h1>
              <p className="text-zinc-400 text-sm mt-1">Platformadagi faoliyatingiz va umumiy ko'rsatkichlar</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                <p className="text-xs font-semibold text-zinc-400 uppercase">Barcha Guruhlar</p>
                <p className="text-3xl font-bold mt-2 text-emerald-400">{db.groups.length}</p>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                <p className="text-xs font-semibold text-zinc-400 uppercase">Jami Talabalar</p>
                <p className="text-3xl font-bold mt-2 text-white">
                  {db.users.filter(u => u.role === 'STUDENT').length}
                </p>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                <p className="text-xs font-semibold text-zinc-400 uppercase">Mavjud Topshiriqlar</p>
                <p className="text-3xl font-bold mt-2 text-white">{db.assignments.length}</p>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                <p className="text-xs font-semibold text-zinc-400 uppercase">Kurslar</p>
                <p className="text-3xl font-bold mt-2 text-white">{db.courses.length}</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COURSES & GROUPS */}
        {activeTab === 'courses' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold">Kurslar va Guruhlar Boshqaruvi</h1>
                <p className="text-zinc-400 text-sm mt-1">Har bir kurs ichida guruhlar hamda ularning talabalari</p>
              </div>
            </div>

            <div className="space-y-6">
              {db.courses.map(course => {
                const courseGroups = db.groups.filter(g => g.courseId === course.id);
                return (
                  <div key={course.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
                    <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
                      <div className="flex items-center gap-3">
                        <GraduationCap className="w-6 h-6 text-emerald-400" />
                        <h2 className="text-xl font-bold">{course.name}</h2>
                      </div>

                      {/* Guruh qo'shish tugmasi (Faqat Super Admin va Group Admin uchun) */}
                      {(user.role === 'SUPER_ADMIN' || user.role === 'GROUP_ADMIN') && (
                        <button
                          onClick={() => {
                            setSelectedCourseForGroup(course.id);
                            setShowAddGroupModal(true);
                          }}
                          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold px-4 py-2 rounded-xl text-sm transition-all"
                        >
                          <Plus className="w-4 h-4" /> Guruh va Talabalar Qo'shish
                        </button>
                      )}
                    </div>

                    {/* Guruhlar Ro'yxati */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {courseGroups.length === 0 ? (
                        <p className="text-zinc-500 text-sm col-span-2">Ushbu kursda hali guruhlar yo'q.</p>
                      ) : (
                        courseGroups.map(group => {
                          const groupStudentsList = db.users.filter(u => u.groupId === group.id && u.role === 'STUDENT');
                          return (
                            <div key={group.id} className="bg-black border border-zinc-800 rounded-xl p-4 space-y-3">
                              <div className="flex justify-between items-center">
                                <h3 className="font-bold text-emerald-400">{group.name}</h3>
                                <span className="text-xs bg-zinc-800 text-zinc-300 px-2 py-1 rounded-md">
                                  {groupStudentsList.length} ta talaba
                                </span>
                              </div>

                              {/* Talabalar Ro'yxati */}
                              <div className="space-y-2 mt-2">
                                {groupStudentsList.map(st => (
                                  <div key={st.id} className="flex justify-between items-center bg-zinc-900/50 px-3 py-2 rounded-lg text-xs border border-zinc-800/50">
                                    <div>
                                      <p className="font-semibold text-white">{st.name}</p>
                                      <p className="text-zinc-500">ID: {st.studentId}</p>
                                    </div>
                                    <div className="text-right">
                                      <span className="text-zinc-400">Login: </span>
                                      <span className="text-emerald-400 font-mono">{st.username}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: GROUP RESULTS */}
        {activeTab === 'results' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold">Guruhlar Bo'yicha Natijalar</h1>
              <p className="text-zinc-400 text-sm mt-1">Har bir guruh va talabaning topshiriq bo'yicha natijalari</p>
            </div>

            <div className="space-y-6">
              {db.groups.map(group => {
                const groupResults = db.results.filter(r => {
                  const st = db.users.find(u => u.id === r.studentId);
                  return st && st.groupId === group.id;
                });

                return (
                  <div key={group.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
                    <h2 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                      <Users className="w-5 h-5" /> {group.name} Natijalari
                    </h2>

                    {groupResults.length === 0 ? (
                      <p className="text-zinc-500 text-sm">Ushbu guruhda hali topshirilgan natijalar yo'q.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                          <thead>
                            <tr className="border-b border-zinc-800 text-zinc-400 text-xs uppercase">
                              <th className="py-3 px-4">Talaba</th>
                              <th className="py-3 px-4">Topshiriq</th>
                              <th className="py-3 px-4">To'plangan Ball</th>
                              <th className="py-3 px-4">Bonus</th>
                              <th className="py-3 px-4">Yakuniy Ball</th>
                              <th className="py-3 px-4">Sana</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-800/50">
                            {groupResults.map(res => {
                              const st = db.users.find(u => u.id === res.studentId);
                              const ass = db.assignments.find(a => a.id === res.assignmentId);
                              return (
                                <tr key={res.id} className="hover:bg-zinc-800/30">
                                  <td className="py-3 px-4 font-semibold">{st?.name}</td>
                                  <td className="py-3 px-4 text-zinc-300">{ass?.title || 'Topshiriq'}</td>
                                  <td className="py-3 px-4">{res.score} / {res.maxScore}</td>
                                  <td className="py-3 px-4 text-emerald-400">+{res.manualBonus}</td>
                                  <td className="py-3 px-4 font-bold text-emerald-400">{res.score + res.manualBonus}</td>
                                  <td className="py-3 px-4 text-zinc-500 text-xs">{res.completedAt}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: SETTINGS (ADMIN CREDENTIALS CHANGE) */}
        {activeTab === 'settings' && user.role === 'SUPER_ADMIN' && (
          <div className="space-y-6 max-w-xl">
            <div>
              <h1 className="text-2xl font-bold">Super Admin Sozlamalari</h1>
              <p className="text-zinc-400 text-sm mt-1">O'zingizning login va parolingizni o'zgartiring</p>
            </div>

            {settingsSuccess && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>{settingsSuccess}</span>
              </div>
            )}

            <form onSubmit={handleUpdateAdminCredentials} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-400 mb-2">Yangi Login (Username)</label>
                <input
                  type="text"
                  className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                  placeholder={user.username}
                  value={settingsForm.username}
                  onChange={e => setSettingsForm({ ...settingsForm, username: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-400 mb-2">Yangi Parol</label>
                <input
                  type="password"
                  className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                  placeholder="Yangi parol kiritish"
                  value={settingsForm.password}
                  onChange={e => setSettingsForm({ ...settingsForm, password: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-400 mb-2">Yangi Parolni Tasdiqlang</label>
                <input
                  type="password"
                  className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                  placeholder="Parolni qayta kiriting"
                  value={settingsForm.confirmPassword}
                  onChange={e => setSettingsForm({ ...settingsForm, confirmPassword: e.target.value })}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold py-3 rounded-xl transition-all"
              >
                O'zgarishlarni Saqlash
              </button>
            </form>
          </div>
        )}

        {/* TAB 5: AUDIT LOGS */}
        {activeTab === 'audit' && user.role === 'SUPER_ADMIN' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold">Audit Loglari</h1>
              <p className="text-zinc-400 text-sm mt-1">Tizimda amalga oshirilgan harakatlar ro'yxati</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-3">
              {db.auditLogs.map(log => (
                <div key={log.id} className="flex justify-between items-center bg-black border border-zinc-800 p-4 rounded-xl text-sm">
                  <div>
                    <p className="font-semibold text-white">{log.action}</p>
                    <p className="text-xs text-zinc-500 mt-1">Foydalanuvchi ID: {log.userId}</p>
                  </div>
                  <span className="text-xs text-emerald-400 font-mono">{log.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ------------------------------------------------------------- */}
      {/* ADD GROUP & STUDENTS MODAL */}
      {/* ------------------------------------------------------------- */}
      {showAddGroupModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
              <h3 className="text-xl font-bold">Yangi Guruh va Talabalar Yaratish</h3>
              <button onClick={() => setShowAddGroupModal(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-400 mb-2">Guruh Nomi</label>
                <input
                  type="text"
                  required
                  className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                  placeholder="Masalan: Group 301"
                  value={newGroupName}
                  onChange={e => setNewGroupName(e.target.value)}
                />
              </div>

              {/* Student Addition Section */}
              <div className="border-t border-zinc-800 pt-4 space-y-4">
                <h4 className="font-bold text-emerald-400 flex items-center gap-2 text-sm">
                  <UserPlus className="w-4 h-4" /> Guruhga Talabalar Qo'shish
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    className="bg-black border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white"
                    placeholder="Talaba Ism-Familiyasi"
                    value={studentForm.name}
                    onChange={e => setStudentForm({ ...studentForm, name: e.target.value })}
                  />
                  <input
                    type="text"
                    className="bg-black border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white"
                    placeholder="Student ID (Masalan: ST2001)"
                    value={studentForm.studentId}
                    onChange={e => setStudentForm({ ...studentForm, studentId: e.target.value })}
                  />
                  <input
                    type="text"
                    className="bg-black border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white"
                    placeholder="Login (Username)"
                    value={studentForm.username}
                    onChange={e => setStudentForm({ ...studentForm, username: e.target.value })}
                  />
                  <input
                    type="password"
                    className="bg-black border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white"
                    placeholder="Parol"
                    value={studentForm.password}
                    onChange={e => setStudentForm({ ...studentForm, password: e.target.value })}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddStudentToGroupList}
                  className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-2 rounded-xl text-sm transition-all"
                >
                  + Ro'yxatga Talaba Qo'shish
                </button>

                {/* Added students preview */}
                {groupStudents.length > 0 && (
                  <div className="space-y-2 mt-4">
                    <p className="text-xs font-semibold text-zinc-400">Qo'shilgan Talabalar Ro'yxati ({groupStudents.length}):</p>
                    <div className="max-h-36 overflow-y-auto space-y-2">
                      {groupStudents.map((st, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-black border border-zinc-800 p-3 rounded-lg text-xs">
                          <div>
                            <p className="font-semibold text-white">{st.name}</p>
                            <p className="text-zinc-500">ID: {st.studentId || 'Avto'} | Login: {st.username}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-zinc-800">
              <button
                onClick={() => setShowAddGroupModal(false)}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 py-3 rounded-xl font-semibold text-sm"
              >
                Bekor Qilish
              </button>
              <button
                onClick={handleCreateGroupWithStudents}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold py-3 rounded-xl text-sm"
              >
                Guruh va Talabalarni Saqlash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}