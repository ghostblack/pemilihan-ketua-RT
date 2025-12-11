import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell 
} from 'recharts';
import { Candidate, TokenData } from '../types';
import { 
  subscribeToCandidates, 
  subscribeToTokens, 
  createTokens, 
  addCandidate, 
  deleteCandidate 
} from '../services/firebase';
import { Button, Input, Card, Badge } from './UIComponents';

const AdminDashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'results' | 'candidates' | 'tokens'>('results');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [tokens, setTokens] = useState<TokenData[]>([]);
  
  // Form States
  const [newCandidate, setNewCandidate] = useState({ name: '', vision: '', mission: '', noUrut: 0, photoUrl: 'https://picsum.photos/200' });
  const [tokenAmount, setTokenAmount] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const unsubC = subscribeToCandidates(setCandidates);
    const unsubT = subscribeToTokens(setTokens);
    return () => {
      unsubC();
      unsubT();
    };
  }, []);

  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCandidate.name) return;
    await addCandidate(newCandidate);
    setNewCandidate({ name: '', vision: '', mission: '', noUrut: candidates.length + 1, photoUrl: 'https://picsum.photos/200' });
  };

  const handleGenerateTokens = async () => {
    setIsGenerating(true);
    await createTokens(tokenAmount);
    setIsGenerating(false);
    setTokenAmount(1);
  };

  const totalVotes = candidates.reduce((acc, curr) => acc + (curr.votes || 0), 0);
  const usedTokens = tokens.filter(t => t.isUsed).length;
  const participationRate = tokens.length > 0 ? Math.round((usedTokens / tokens.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">A</div>
            <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
          </div>
          <Button variant="secondary" onClick={onLogout} className="text-sm">Keluar</Button>
        </div>
        
        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 flex gap-6 overflow-x-auto">
          {[
            { id: 'results', label: 'Dashboard & Hasil' },
            { id: 'candidates', label: 'Kelola Kandidat' },
            { id: 'tokens', label: 'Manajemen Token' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* RESULTS TAB */}
        {activeTab === 'results' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <p className="text-sm text-gray-500">Total Suara Masuk</p>
                <p className="text-3xl font-bold text-gray-800">{totalVotes}</p>
              </Card>
              <Card>
                <p className="text-sm text-gray-500">Token Terpakai</p>
                <p className="text-3xl font-bold text-blue-600">{usedTokens} <span className="text-base text-gray-400 font-normal">/ {tokens.length}</span></p>
              </Card>
              <Card>
                <p className="text-sm text-gray-500">Partisipasi</p>
                <p className="text-3xl font-bold text-green-600">{participationRate}%</p>
              </Card>
            </div>

            <Card className="p-8">
              <h3 className="text-lg font-bold text-gray-800 mb-6">Grafik Perolehan Suara</h3>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={candidates} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip 
                      cursor={{ fill: '#f3f4f6' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    />
                    <Bar dataKey="votes" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Suara">
                      {candidates.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#60a5fa'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        )}

        {/* CANDIDATES TAB */}
        {activeTab === 'candidates' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <Card>
                <h3 className="text-lg font-bold mb-4">Tambah Kandidat</h3>
                <form onSubmit={handleAddCandidate} className="space-y-4">
                  <Input 
                    label="Nama Lengkap" 
                    value={newCandidate.name} 
                    onChange={e => setNewCandidate({...newCandidate, name: e.target.value})}
                    placeholder="Contoh: Budi Santoso"
                    required
                  />
                  <Input 
                    label="Nomor Urut" 
                    type="number"
                    value={newCandidate.noUrut} 
                    onChange={e => setNewCandidate({...newCandidate, noUrut: parseInt(e.target.value)})}
                    required
                  />
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Visi</label>
                    <textarea 
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      rows={2}
                      value={newCandidate.vision}
                      onChange={e => setNewCandidate({...newCandidate, vision: e.target.value})}
                      placeholder="Visi singkat..."
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Misi</label>
                    <textarea 
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      rows={3}
                      value={newCandidate.mission}
                      onChange={e => setNewCandidate({...newCandidate, mission: e.target.value})}
                      placeholder="Misi detail..."
                    />
                  </div>
                  <Input 
                    label="URL Foto (Opsional)" 
                    value={newCandidate.photoUrl} 
                    onChange={e => setNewCandidate({...newCandidate, photoUrl: e.target.value})}
                  />
                  <Button type="submit" className="w-full">Simpan Kandidat</Button>
                </form>
              </Card>
            </div>

            <div className="lg:col-span-2 space-y-4">
              {candidates.map((candidate) => (
                <Card key={candidate.id} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex-shrink-0 overflow-hidden">
                    <img src={candidate.photoUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded">No. {candidate.noUrut}</span>
                      <h4 className="font-bold text-gray-800">{candidate.name}</h4>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-1">{candidate.vision}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <span className="block text-2xl font-bold text-gray-800">{candidate.votes}</span>
                      <span className="text-xs text-gray-500">Suara</span>
                    </div>
                    <Button variant="danger" className="p-2" onClick={() => deleteCandidate(candidate.id)}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </Button>
                  </div>
                </Card>
              ))}
              {candidates.length === 0 && <p className="text-center text-gray-500 py-8">Belum ada kandidat.</p>}
            </div>
          </div>
        )}

        {/* TOKENS TAB */}
        {activeTab === 'tokens' && (
          <div className="space-y-6">
            <Card className="flex flex-col md:flex-row items-end gap-4">
              <div className="flex-grow w-full">
                <Input 
                  label="Jumlah Token" 
                  type="number" 
                  min="1" 
                  max="50" 
                  value={tokenAmount} 
                  onChange={e => setTokenAmount(parseInt(e.target.value))} 
                />
              </div>
              <Button onClick={handleGenerateTokens} isLoading={isGenerating} className="w-full md:w-auto">
                Generate {tokenAmount} Token
              </Button>
            </Card>

            <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Token</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Dibuat</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Digunakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {tokens.map((token) => (
                    <tr key={token.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-mono font-medium text-gray-900">{token.id}</td>
                      <td className="px-6 py-4">
                        <Badge type={token.isUsed ? 'success' : 'neutral'}>
                          {token.isUsed ? 'Sudah Dipilih' : 'Belum Dipakai'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(token.generatedAt).toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {token.usedAt ? new Date(token.usedAt).toLocaleString('id-ID') : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {tokens.length === 0 && <div className="p-8 text-center text-gray-500">Belum ada token.</div>}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
