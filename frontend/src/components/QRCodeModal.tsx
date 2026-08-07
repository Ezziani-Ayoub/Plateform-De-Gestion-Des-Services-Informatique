import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { X, Download, Printer, Monitor, Tag, MapPin, Hash } from 'lucide-react';
import type { Equipment } from '../types';

interface QRCodeModalProps {
  equipment: Equipment | null;
  onClose: () => void;
}

function categoryLabel(cat: string): string {
  const map: Record<string, string> = {
    LAPTOP: 'Ordinateur Portable',
    DESKTOP: 'PC Fixe',
    SERVER: 'Serveur',
    NETWORK: 'Matériel Réseau',
    PRINTER: 'Imprimante',
  };
  return map[cat] ?? cat;
}

function statusLabel(s: string): string {
  const map: Record<string, string> = {
    AVAILABLE: 'Disponible',
    IN_USE: 'En Utilisation',
    MAINTENANCE: 'En Maintenance',
    RETIRED: 'Réformé',
  };
  return map[s] ?? s;
}

function statusColor(s: string): string {
  const map: Record<string, string> = {
    AVAILABLE: '#10b981',
    IN_USE: '#3b82f6',
    MAINTENANCE: '#f59e0b',
    RETIRED: '#6b7280',
  };
  return map[s] ?? '#6b7280';
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ equipment, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dataUrl, setDataUrl] = useState<string>('');

  // The QR code encodes a URL to the equipment details page
  const qrContent = equipment
    ? `${window.location.origin}/equipment?id=${equipment.id}&sn=${equipment.serialNumber}`
    : '';

  useEffect(() => {
    if (!equipment || !canvasRef.current) return;

    QRCode.toCanvas(canvasRef.current, qrContent, {
      width: 220,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    }).then(() => {
      setDataUrl(canvasRef.current!.toDataURL('image/png'));
    });
  }, [equipment, qrContent]);

  if (!equipment) return null;

  // ── Download PNG ────────────────────────────────────────────────────────
  const handleDownload = () => {
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `QR_${equipment.serialNumber}_${equipment.name.replace(/\s+/g, '_')}.png`;
    link.click();
  };

  // ── Print ────────────────────────────────────────────────────────────────
  const handlePrint = () => {
    const win = window.open('', '_blank', 'width=600,height=500');
    if (!win || !dataUrl) return;
    win.document.write(`
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <title>Étiquette QR — ${equipment.name}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            background: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
          }
          .label {
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            padding: 20px;
            width: 320px;
            text-align: center;
          }
          .logo-row {
            font-weight: 800;
            font-size: 14px;
            color: #0ea5e9;
            letter-spacing: .05em;
            margin-bottom: 12px;
          }
          .logo-row span { color: #6366f1; }
          img { width: 180px; height: 180px; margin: 0 auto 14px; display: block; }
          .name { font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
          .sn { font-size: 11px; font-family: monospace; color: #64748b; margin-bottom: 8px; }
          .meta { font-size: 11px; color: #475569; line-height: 1.8; }
          .status {
            display: inline-block;
            padding: 2px 10px;
            border-radius: 999px;
            font-size: 10px;
            font-weight: 700;
            color: #fff;
            margin-top: 6px;
            background: ${statusColor(equipment.status)};
          }
          @media print { body { -webkit-print-color-adjust: exact; } }
        </style>
      </head>
      <body>
        <div class="label">
          <div class="logo-row">PGSI · <span>SOS Villages d'Enfants Maroc</span></div>
          <img src="${dataUrl}" alt="QR Code" />
          <div class="name">${equipment.name}</div>
          <div class="sn">SN : ${equipment.serialNumber}</div>
          <div class="meta">
            Catégorie : ${categoryLabel(equipment.category)}<br>
            ${equipment.location ? `Emplacement : ${equipment.location}<br>` : ''}
          </div>
          <div class="status">${statusLabel(equipment.status)}</div>
        </div>
        <script>window.onload = () => { window.print(); window.close(); }<\/script>
      </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-slideDown"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ───────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-violet-600 flex items-center justify-center shadow-sm">
              <Monitor className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Code QR</p>
              <p className="text-xs text-gray-400">Étiquette équipement</p>
            </div>
          </div>
          <button
            id="qr-modal-close"
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── QR Canvas ────────────────────────────────────────────── */}
        <div className="flex flex-col items-center px-6 py-6 bg-gradient-to-b from-gray-50 to-white">
          <div className="p-4 bg-white rounded-2xl shadow-inner border border-gray-100">
            <canvas ref={canvasRef} className="rounded-xl" />
          </div>
          <p className="mt-3 text-[11px] text-gray-400 text-center max-w-[200px] leading-snug">
            Scannez ce code pour accéder aux détails de l'équipement
          </p>
        </div>

        {/* ── Equipment Info ────────────────────────────────────────── */}
        <div className="px-6 pb-5 space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
            <Tag className="w-4 h-4 text-sky-500" />
            {equipment.name}
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
            <Hash className="w-3.5 h-3.5 text-gray-400" />
            {equipment.serialNumber}
          </div>
          {equipment.location && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              {equipment.location}
            </div>
          )}
          <div className="flex items-center gap-2 mt-1">
            <span
              className="text-[11px] font-bold px-2.5 py-0.5 rounded-full text-white"
              style={{ background: statusColor(equipment.status) }}
            >
              {statusLabel(equipment.status)}
            </span>
            <span className="text-[11px] text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full font-medium">
              {categoryLabel(equipment.category)}
            </span>
          </div>
        </div>

        {/* ── Actions ──────────────────────────────────────────────── */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            id="qr-download-btn"
            onClick={handleDownload}
            disabled={!dataUrl}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold transition-colors shadow-sm disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Télécharger
          </button>
          <button
            id="qr-print-btn"
            onClick={handlePrint}
            disabled={!dataUrl}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-colors shadow-sm disabled:opacity-50"
          >
            <Printer className="w-4 h-4" />
            Imprimer
          </button>
        </div>
      </div>
    </div>
  );
};
