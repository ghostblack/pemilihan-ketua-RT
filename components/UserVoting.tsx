import React, { useState, useEffect } from 'react';
import { Candidate } from '../types';
import { submitVote, subscribeToCandidates } from '../services/firebase';
import { Button, Card, Modal } from './UIComponents';

interface UserVotingProps {
  token: string;
  onSuccess: () => void;
  onLogout: () => void;
}

const UserVoting: React.FC<UserVotingProps> = ({ token, onSuccess, onLogout }) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voteSuccess, setVoteSuccess] = useState(false);
  
  // State untuk Modal Konfirmasi
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToCandidates((data) => {
      setCandidates(data);
    });
    return () => unsubscribe();
  }, []);

  // Handler saat tombol "Kirim Suara" ditekan (Hanya buka modal)
  const handleVoteClick = () => {
    if (!selectedCandidate) return;
    setShowConfirmModal(true);
  };

  // Handler saat "Ya, Yakin" ditekan di Modal
  const handleConfirmVote = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Panggil fungsi submit ke Firebase
      const result = await submitVote(token, selectedCandidate!);
      
      if (result.success) {
        setVoteSuccess(true);
        setShowConfirmModal(false); // Tutup modal
      } else {
        setError(result.message);
        setIsSubmitting(false);
        setShowConfirmModal(false); // Tutup modal agar user bisa baca error
      }
    } catch (err: any) {
      console.error(err);
      const msg = "Terjadi kesalahan koneksi atau sistem.";
      setError(msg);
      setIsSubmitting(false);
      setShowConfirmModal(false);
    }
  };

  // Get selected candidate name for modal
  const selectedCandidateName = candidates.find(c => c.id === selectedCandidate)?.name || "Kandidat";

  // TAMPILAN SUKSES
  if (voteSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50 px-4">
        <Card className="max-w-md w-full text-center p-10 shadow-2xl border-t-4 border-green-500">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Terima Kasih!</h2>
          <p className="text-lg text-gray-600 mb-8">Suara Anda telah berhasil direkam. Hak suara Anda sangat berarti untuk lingkungan kita.</p>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-8 border border-gray-100">
             <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Token Anda</p>
             <p className="font-mono text-xl font-bold text-gray-800 tracking-widest mt-1">{token}</p>
             <p className="text-xs text-red-500 mt-1 italic">Token ini kini sudah tidak aktif.</p>
          </div>

          <Button 
            onClick={onLogout} 
            className="w-full py-3 text-lg bg-green-600 hover:bg-green-700 shadow-green-200"
          >
            Kembali ke Halaman Utama
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 relative">
      
      {/* Modal Konfirmasi */}
      <Modal
        isOpen={showConfirmModal}
        title="Konfirmasi Pilihan Suara"
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmVote}
        isProcessing={isSubmitting}
        confirmText="Ya, Kirim Suara"
        cancelText="Batal"
      >
        <div className="text-center">
          <p className="text-gray-600 mb-4">Anda akan memberikan suara kepada:</p>
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-4">
             <p className="text-2xl font-bold text-blue-800">{selectedCandidateName}</p>
          </div>
          <p className="text-sm text-red-500 font-semibold bg-red-50 p-2 rounded">
            ⚠️ Peringatan: Pilihan tidak dapat diubah setelah dikirim.
          </p>
        </div>
      </Modal>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Surat Suara Digital</h2>
          <p className="text-gray-600">Token: <span className="font-mono font-bold bg-gray-100 px-2 py-1 rounded">{token}</span></p>
        </div>
        <Button variant="outline" onClick={onLogout} disabled={isSubmitting}>Keluar</Button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded text-red-700 animate-pulse">
          <div className="flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <p className="font-bold">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
        {candidates.map((candidate) => (
          <div 
            key={candidate.id}
            className={`cursor-pointer transition-all transform hover:-translate-y-1 duration-200 ${selectedCandidate === candidate.id ? 'ring-4 ring-blue-500 scale-105 shadow-2xl' : 'hover:shadow-xl'}`}
            onClick={() => !isSubmitting && setSelectedCandidate(candidate.id)}
          >
            <Card className="h-full flex flex-col items-center text-center p-0 overflow-hidden relative border-0">
              {/* No Urut Badge */}
              <div className="absolute top-4 left-4 bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-2xl shadow-lg z-10 border-2 border-white">
                {candidate.noUrut}
              </div>
              
              <div className="w-full h-56 bg-gray-200 relative group">
                <img 
                  src={candidate.photoUrl} 
                  alt={candidate.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${candidate.id}/400/300`
                  }}
                />
                <div className={`absolute inset-0 bg-blue-900 opacity-0 transition-opacity duration-300 ${selectedCandidate === candidate.id ? 'opacity-20' : ''}`}></div>
              </div>

              <div className="p-6 flex flex-col flex-grow w-full bg-white">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{candidate.name}</h3>
                
                <div className="text-left mt-4 space-y-4 flex-grow">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Visi</h4>
                    <p className="text-sm text-gray-800 leading-relaxed">{candidate.vision}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Misi</h4>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">{candidate.mission}</p>
                  </div>
                </div>

                <div className="mt-6 w-full pt-4 border-t border-gray-100">
                  <div className={`w-full py-3 rounded-xl font-bold text-lg border-2 transition-all flex items-center justify-center gap-2 ${selectedCandidate === candidate.id ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'border-gray-200 text-gray-400'}`}>
                    {selectedCandidate === candidate.id ? (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                        Dipilih
                      </>
                    ) : 'Pilih Kandidat Ini'}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-40">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-600 hidden md:block">
            {selectedCandidate ? (
              <span className="text-blue-600 font-bold bg-blue-50 px-3 py-1 rounded-full">1 Kandidat Dipilih</span>
            ) : "Silahkan klik salah satu kandidat di atas."}
          </div>
          <Button 
            onClick={handleVoteClick} 
            disabled={!selectedCandidate || isSubmitting} 
            className="w-full md:w-auto px-10 py-3 text-lg font-bold shadow-lg shadow-blue-500/30"
          >
            {isSubmitting ? 'Memproses...' : 'Kirim Suara Sekarang'}
          </Button>
        </div>
      </div>
      {/* Spacer for sticky footer */}
      <div className="h-10"></div>
    </div>
  );
};

export default UserVoting;