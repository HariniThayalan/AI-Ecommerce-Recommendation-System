import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Smartphone, Info } from 'lucide-react';

export default function FakeRazorpayQR({ amount, onConfirm, onCancel }) {
  const [timeLeft, setTimeLeft] = useState(300);

  useEffect(() => {
    if (timeLeft <= 0) {
      onCancel();
      return;
    }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onCancel]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="bg-white w-full max-w-[390px] rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col border border-white/5 animate-in slide-in-from-bottom-5 duration-400">
        
        {/* HEADER - Tightened */}
        <div className="bg-[#1A1828] px-6 py-4 flex justify-between items-center relative overflow-hidden">
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-9 h-9 bg-gradient-to-br from-[#3395FF] to-[#2088f5] rounded-lg flex items-center justify-center shadow-lg border border-white/10">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="transform -rotate-12">
                 <path d="M12 2L4 7V17L12 22L20 17V7L12 2Z" fill="white" fillOpacity="0.2"/>
                 <text x="8" y="16" fill="white" fontSize="14" fontWeight="900" fontFamily="Arial" className="italic">R</text>
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-white font-black text-lg tracking-tight leading-none">Razorpay</span>
              <span className="text-blue-400 text-[8px] font-bold uppercase tracking-widest opacity-80 mt-1">Terminal</span>
            </div>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-white/10 rounded-full transition-all group relative z-10">
            <X className="text-white/40 group-hover:text-white" size={20} />
          </button>
        </div>

        {/* Amount Summary - Tightened */}
        <div className="px-6 py-3 bg-[#F9FAFB] border-b border-gray-100 flex justify-between items-center">
          <div>
            <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-0.5">Payable</p>
            <p className="text-2xl font-black text-[#1A1828]">₹{(Math.round(amount)).toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100/30 flex items-center gap-2">
             <p className="text-[8px] text-blue-400 font-bold uppercase">Ends in</p>
             <p className="text-blue-600 font-mono font-black text-sm">{formatTime(timeLeft)}</p>
          </div>
        </div>

        {/* QR Container - More Compact */}
        <div className="p-6 flex flex-col items-center bg-white relative">
          <div className="relative group">
            <div className="w-52 h-52 bg-white border-[1px] border-gray-100 rounded-[36px] p-6 shadow-xl relative transition-all group-hover:scale-[1.02] duration-500">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=razorpay@ybl&am=${Math.round(amount)}&cu=INR&tn=O${Date.now()}`} 
                alt="Payment QR" 
                className="w-full h-full contrast-[1.2]"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-12 h-12 bg-white shadow-xl rounded-xl flex items-center justify-center border border-gray-50 transform rotate-6 scale-90">
                    <Smartphone size={24} className="text-[#3395FF]" />
                 </div>
              </div>
            </div>
            {/* Minimal Corners */}
            <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-[#3395FF]/30 rounded-tl-2xl"></div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-[#3395FF]/30 rounded-br-2xl"></div>
          </div>

          <div className="mt-6 flex flex-col items-center w-full">
            <div className="flex items-center gap-3 w-full mb-4">
               <div className="h-[1px] flex-1 bg-gray-50"></div>
               <p className="text-[9px] font-black text-gray-300 tracking-[0.2em] uppercase">Scan & Pay</p>
               <div className="h-[1px] flex-1 bg-gray-50"></div>
            </div>
            
            {/* UPI Icons - Compact */}
            <div className="flex justify-between items-center w-full px-4 gap-4">
                <div className="flex flex-col items-center gap-2 group flex-1">
                   <div className="w-12 h-12 rounded-xl bg-[#F8F9FA] flex items-center justify-center group-hover:bg-white border border-transparent group-hover:border-gray-100 transition-all overflow-hidden p-3 shadow-sm">
                      <img src="/images/gpay.png" className="w-full h-full object-contain" alt="G" />
                   </div>
                   <span className="text-[8px] font-bold text-gray-400 uppercase">GPay</span>
                </div>
                
                <div className="flex flex-col items-center gap-2 group flex-1">
                   <div className="w-12 h-12 rounded-xl bg-[#F8F9FA] flex items-center justify-center group-hover:bg-white border border-transparent group-hover:border-gray-100 transition-all overflow-hidden p-3 shadow-sm">
                      <img src="/images/phonepe.png" className="w-full h-full object-contain" alt="Ph" />
                   </div>
                   <span className="text-[8px] font-bold text-gray-400 uppercase">PhonePe</span>
                </div>
                
                <div className="flex flex-col items-center gap-2 group flex-1">
                   <div className="w-12 h-12 rounded-xl bg-[#F8F9FA] flex items-center justify-center group-hover:bg-white border border-transparent group-hover:border-gray-100 transition-all overflow-hidden p-3 shadow-sm">
                      <img src="/images/paytm.png" className="w-full h-full object-contain" alt="Pm" />
                   </div>
                   <span className="text-[8px] font-bold text-gray-400 uppercase">Paytm</span>
                </div>
            </div>
          </div>
        </div>

        {/* Action Button - Tightened */}
        <div className="px-6 pb-8 pt-1 flex flex-col gap-4">
          <div className="flex justify-center flex-col items-center gap-1.5 opacity-80">
             <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-full">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-emerald-700 text-[9px] font-black uppercase tracking-widest leading-none">Awaiting Response</span>
             </div>
          </div>
          
          <button 
            onClick={onConfirm}
            className="w-full py-4 bg-[#3395FF] hover:bg-[#2088f5] text-white font-black rounded-2xl transition-all 
                       shadow-[0_12px_28px_-5px_rgba(51,149,255,0.5)] active:scale-[0.98] text-lg tracking-tight 
                       border-b-4 border-blue-700 hover:border-blue-800"
          >
            I've Paid ₹{Math.round(amount).toLocaleString()}
          </button>
          
          <div className="flex items-center justify-center gap-4 opacity-40 grayscale translate-y-1">
            <span className="text-[8px] font-black text-gray-500 flex items-center gap-1">
              <ShieldCheck size={12} className="text-emerald-500" />
              128-BIT SECURE
            </span>
            <span className="text-[8px] font-black text-gray-500 flex items-center gap-1">
              <Info size={12} />
              PCI CERTIFIED
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
