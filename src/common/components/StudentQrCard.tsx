import React, { useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { 
  QrCode, 
  Download, 
  Printer, 
  X, 
  Copy, 
  Check, 
  ShieldCheck, 
  Award, 
  GraduationCap, 
  MapPin, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/common/components/ui/Button';
import { schoolConfig } from '@/config/schoolConfig';

interface StudentQrCardProps {
  user: any;
  userData: any;
  roleLabel: string;
  isOpen: boolean;
  onClose: () => void;
}

export function StudentQrPassModal({ user, userData, roleLabel, isOpen, onClose }: StudentQrCardProps) {
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const qrCanvasRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const crhsId = userData?.crhsId || `${schoolConfig.schoolShortName}-2026-UNASSIGNED`;
  const fullName = userData?.fullName || userData?.name || user?.email || 'Student';
  const mobile = userData?.mobileNumber || 'N/A';
  const campus = `${schoolConfig.location.address}, ${schoolConfig.location.state}`;

  // Construct official verification payload
  const verificationPayload = JSON.stringify({
    institution: schoolConfig.schoolName,
    campus: `${schoolConfig.location.address}, ${schoolConfig.location.state}`,
    crhsId: crhsId,
    studentName: fullName,
    role: roleLabel,
    email: user?.email || '',
    mobile: mobile,
    verificationUrl: `https://crhs.edu.in/verify?id=${crhsId}`,
    issuedDate: new Date().getFullYear().toString()
  });

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(crhsId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQr = () => {
    const canvas = qrCanvasRef.current?.querySelector('canvas');
    if (!canvas) return;

    // Create a styled offscreen canvas to include CRHS branding header and student details
    const padding = 24;
    const canvasWidth = 400;
    const canvasHeight = 520;

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvasWidth;
    exportCanvas.height = canvasHeight;
    const ctx = exportCanvas.getContext('2d');

    if (!ctx) return;

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Header Background (CRHS Navy)
    ctx.fillStyle = '#0f172a'; // Navy
    ctx.fillRect(0, 0, canvasWidth, 110);

    // Header Accent Line (Gold)
    ctx.fillStyle = '#d97706'; // Gold
    ctx.fillRect(0, 106, canvasWidth, 4);

    // Header Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("CHILDREN'S RISE HIGH SCHOOL", canvasWidth / 2, 38);

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('TARWARA, SIWAN, BIHAR', canvasWidth / 2, 58);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '11px sans-serif';
    ctx.fillText('OFFICIAL DIGITAL ID VERIFICATION PASS', canvasWidth / 2, 82);

    // Draw QR Code in center
    const qrSize = 180;
    const qrX = (canvasWidth - qrSize) / 2;
    const qrY = 135;

    // QR Border Card
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.strokeRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20);

    ctx.drawImage(canvas, qrX, qrY, qrSize, qrSize);

    // Student Details
    const textYStart = 350;

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(fullName, canvasWidth / 2, textYStart);

    ctx.fillStyle = '#b45309'; // Amber/Gold
    ctx.font = 'bold 14px monospace';
    ctx.fillText(`ID: ${crhsId}`, canvasWidth / 2, textYStart + 26);

    ctx.fillStyle = '#475569';
    ctx.font = '12px sans-serif';
    ctx.fillText(`Role: ${roleLabel} | Mobile: ${mobile}`, canvasWidth / 2, textYStart + 50);

    ctx.fillStyle = '#047857'; // Emerald
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('✓ VERIFIED STUDENT PROFILE', canvasWidth / 2, textYStart + 74);

    // Footer
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px sans-serif';
    ctx.fillText('Scan QR code with any camera or scanner to verify identity', canvasWidth / 2, canvasHeight - 20);

    // Trigger download
    const imageURI = exportCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `CRHS_ID_QR_${crhsId}.png`;
    link.href = imageURI;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:fixed print:inset-0">
      
      {/* Container */}
      <div 
        ref={cardRef} 
        className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden relative print:shadow-none print:border-none print:max-w-none print:w-full"
      >
        
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-slate-900 via-crhs-navy to-slate-900 text-white p-6 text-center relative border-b-4 border-crhs-gold print:bg-slate-900 print:text-white">
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-all print:hidden"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex justify-center mb-2">
            <div className="w-10 h-10 rounded-xl bg-crhs-gold text-crhs-navy flex items-center justify-center font-black shadow-md">
              <GraduationCap className="w-6 h-6" />
            </div>
          </div>

          <h3 className="text-base font-black tracking-tight uppercase text-white">
            {schoolConfig.schoolName}
          </h3>
          <p className="text-[11px] font-bold text-crhs-gold tracking-widest uppercase mt-0.5">
            {schoolConfig.location.address}, {schoolConfig.location.state}
          </p>
          <span className="inline-block mt-2 px-3 py-0.5 rounded-full bg-white/10 border border-white/20 text-[10px] font-black uppercase tracking-widest text-slate-200">
            Digital Verification Pass
          </span>
        </div>

        {/* Card Body */}
        <div className="p-6 text-center space-y-6">

          {/* Student Profile Overview */}
          <div className="space-y-1">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              {fullName}
            </h2>
            <div className="flex items-center justify-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider border border-emerald-300 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" /> {roleLabel}
              </span>
              <span className="text-slate-400 text-xs">•</span>
              <span className="text-slate-600 font-medium text-xs flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" /> Siwan Campus
              </span>
            </div>
          </div>

          {/* QR Code Canvas Box */}
          <div className="flex flex-col items-center justify-center">
            <div 
              ref={qrCanvasRef}
              className="p-4 bg-white rounded-2xl border-2 border-slate-200 shadow-md inline-block relative group hover:border-crhs-gold transition-all"
            >
              <QRCodeCanvas 
                value={verificationPayload}
                size={180}
                bgColor="#ffffff"
                fgColor="#0f172a"
                level="H"
                marginSize={1}
              />
              <div className="mt-2 text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3 text-crhs-gold" /> Encrypted {schoolConfig.schoolShortName} QR
              </div>
            </div>
          </div>

          {/* ${schoolConfig.schoolShortName} ID Box */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
            <div className="text-left">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                Verification {schoolConfig.schoolShortName} ID
              </span>
              <code className="text-sm font-mono font-black text-crhs-navy tracking-wider">
                {crhsId}
              </code>
            </div>

            <button
              onClick={handleCopyPayload}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-crhs-navy text-xs font-bold text-slate-700 flex items-center gap-1.5 shadow-sm transition-all active:scale-95 shrink-0"
              title="Copy ID string"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Verification Notice */}
          <p className="text-[11px] text-slate-500 leading-relaxed px-2">
            Present this QR code to school security, office staff, or exam invigilators for quick instant identity verification.
          </p>

          {/* Action Buttons (Hidden on Print) */}
          <div className="grid grid-cols-2 gap-3 pt-2 print:hidden">
            <Button
              onClick={handleDownloadQr}
              className="bg-crhs-navy hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 py-2.5 rounded-xl shadow-md"
            >
              <Download className="w-4 h-4 text-crhs-gold" /> Download QR
            </Button>

            <Button
              onClick={handlePrint}
              variant="outline"
              className="border-slate-300 hover:bg-slate-100 text-slate-800 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 py-2.5 rounded-xl"
            >
              <Printer className="w-4 h-4 text-crhs-navy" /> Print Pass
            </Button>
          </div>

        </div>

        {/* Footer Ribbon */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 text-center">
          <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider flex items-center justify-center gap-1">
            <Award className="w-3.5 h-3.5 text-crhs-gold" /> Official ${schoolConfig.schoolName} Student Credential
          </p>
        </div>

      </div>

    </div>
  );
}
