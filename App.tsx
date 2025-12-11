import React, { useState, useEffect } from 'react';
import { ViewState } from './types';
import { validateToken, initAuth } from './services/firebase';
import { Button, Input, Card } from './components/UIComponents';
import UserVoting from './components/UserVoting';
import AdminDashboard from './components/AdminDashboard';

function App() {
  const [view, setView] = useState<ViewState>(ViewState.HOME);
  const [tokenInput, setTokenInput] = useState('');
  const [activeToken, setActiveToken] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Admin Login State
  const [adminPin, setAdminPin] = useState('');

  // Initialize Firebase Auth on Mount
  useEffect(() => {
    const initialize = async () => {
      try {
        await initAuth();
      } catch (err: any) {
        console.error("Initialization error:", err);
        if (err.message === "AUTH_CONFIG_MISSING") {
           setError("SETUP_REQUIRED");
        } else {
           setError("Gagal terhubung ke sistem. Cek koneksi internet.");
        }
      } finally {
        setIsInitializing(false);
      }
    };
    initialize();
  }, []);

  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;

    setLoading(true);
    setError(null);
    
    try {
      const sanitizedToken = tokenInput.trim().toUpperCase();
      const result = await validateToken(sanitizedToken);
      if (result.valid) {
        setActiveToken(sanitizedToken);
        setView(ViewState.USER_VOTING);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Terjadi kesalahan koneksi.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // HARDCODED SIMPLE PIN FOR DEMO
    // In production, implement real Auth
    if (adminPin === '123456') {
      setView(ViewState.ADMIN_DASHBOARD);
      setError(null);
    } else {
      setError("PIN Admin salah.");
    }
  };

  // --- LOADING VIEW ---
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-500 font-medium">Menghubungkan ke sistem...</p>
        </div>
      </div>
    );
  }

  // --- SETUP REQUIRED VIEW ---
  if (error === "SETUP_REQUIRED") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <Card className="max-w-xl w-full">
          <div className="flex items-center gap-3 mb-4 text-amber-600">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            <h2 className="text-xl font-bold">Setup Firebase Diperlukan</h2>
          </div>
          <p className="mb-4 text-gray-700">Agar aplikasi dapat berjalan, Anda perlu mengaktifkan <strong>Anonymous Authentication</strong> di Firebase Console.</p>
          <ol className="list-decimal list-inside space-y-2 mb-6 text-gray-600 text-sm bg-gray-50 p-4 rounded-lg">
            <li>Buka <a href="https://console.firebase.google.com/" target="_blank" className="text-blue-600 hover:underline">Firebase Console</a>.</li>
            <li>Pilih project <strong>pemilihan-ketua-rt-1b452</strong>.</li>
            <li>Klik menu <strong>Authentication</strong> di sidebar kiri (Atau Build &gt; Authentication).</li>
            <li>Klik tab <strong>Sign-in method</strong>.</li>
            <li>Cari provider <strong>Anonymous</strong>, klik tombol Edit (ikon pensil).</li>
            <li>Aktifkan (Enable) dan klik <strong>Save</strong>.</li>
            <li>Refresh halaman ini.</li>
          </ol>
          <Button onClick={() => window.location.reload()} className="w-full">Saya Sudah Mengaktifkannya, Refresh</Button>
        </Card>
      </div>
    );
  }

  // --- RENDER VIEWS ---

  if (view === ViewState.ADMIN_DASHBOARD) {
    return <AdminDashboard onLogout={() => { setView(ViewState.HOME); setAdminPin(''); }} />;
  }

  if (view === ViewState.USER_VOTING) {
    return (
      <UserVoting 
        token={activeToken} 
        onSuccess={() => setView(ViewState.HOME)} 
        onLogout={() => { setView(ViewState.HOME); setActiveToken(''); setTokenInput(''); }}
      />
    );
  }

  if (view === ViewState.ADMIN_LOGIN) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Login Admin</h2>
            <p className="text-gray-500">Masukkan PIN Admin untuk masuk</p>
          </div>
          <form onSubmit={handleAdminLogin} className="space-y-6">
            <div>
              <Input 
                type="password" 
                placeholder="PIN Admin (Default: 123456)" 
                value={adminPin}
                onChange={(e) => setAdminPin(e.target.value)}
                autoFocus
              />
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>
            <div className="flex flex-col gap-3">
              <Button type="submit" className="w-full">Masuk Dashboard</Button>
              <button 
                type="button"
                onClick={() => { setView(ViewState.HOME); setError(null); }}
                className="text-gray-500 text-sm hover:underline"
              >
                Kembali ke Halaman Pemilih
              </button>
            </div>
          </form>
        </Card>
      </div>
    );
  }

  // DEFAULT: HOME / TOKEN INPUT
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col items-center justify-center p-4 relative">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      </div>

      <div className="w-full max-w-lg z-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">E-Voting RT</h1>
          <p className="text-lg text-gray-600">Sistem Pemilihan Ketua RT yang Jujur & Transparan</p>
        </div>

        <Card className="shadow-xl border-0">
          <form onSubmit={handleUserLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Masukkan Token Pemilihan</label>
              <input
                type="text"
                className="w-full px-4 py-4 text-center text-2xl font-mono tracking-widest border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all uppercase placeholder-gray-300"
                placeholder="XXXXXX"
                maxLength={6}
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value.toUpperCase())}
              />
              {error && (
                <div className="mt-3 bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm flex items-center">
                   <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                   {error}
                </div>
              )}
            </div>

            <Button type="submit" className="w-full py-4 text-lg shadow-lg shadow-blue-500/30" isLoading={loading}>
              Masuk & Pilih
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <button 
              onClick={() => { setView(ViewState.ADMIN_LOGIN); setError(null); }}
              className="text-xs text-gray-400 hover:text-blue-600 font-medium transition-colors"
            >
              Login sebagai Admin
            </button>
          </div>
        </Card>
        
        <p className="text-center text-gray-400 text-xs mt-8">
          &copy; 2024 Panitia Pemilihan RT. Gunakan token anda dengan bijak.
        </p>
      </div>
    </div>
  );
}

export default App;