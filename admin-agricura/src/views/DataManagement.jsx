import React, { useState } from 'react';
import { Upload, Plus, FileSpreadsheet, FileText, X, ChevronRight, Database } from 'lucide-react';
import ExcelImportModal from '../components/ExcelImportModal';
import SIIImportModal from '../components/SIIImportModal';

export default function DataManagement({ supabase, onNewDocument, onShowConfirm }) {
  const [showChooser, setShowChooser] = useState(false);
  const [showAgricuraImport, setShowAgricuraImport] = useState(false);
  const [showSIIImport, setShowSIIImport] = useState(false);

  const openChooser = () => setShowChooser(true);
  const closeChooser = () => setShowChooser(false);

  const handleSelectAgricura = () => { closeChooser(); setShowAgricuraImport(true); };
  const handleSelectSII      = () => { closeChooser(); setShowSIIImport(true); };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <header className="px-1">
        <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
          <Database size={28} className="text-blue-600" />
          Manejo de Datos
        </h2>
        <p className="text-slate-400 text-sm font-medium mt-1">Gestiona el ingreso y la carga de documentos al sistema.</p>
      </header>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl">

        {/* Card: Importar Datos */}
        <button
          onClick={openChooser}
          className="group relative bg-white border border-slate-200 rounded-2xl p-7 text-left hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-200 active:scale-[0.99]"
        >
          <div className="flex items-start justify-between mb-5">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
              <Upload size={22} className="text-emerald-600" />
            </div>
            <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-400 transition-colors mt-1" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">Importar Datos</h3>
          <p className="text-sm text-slate-400 font-medium leading-relaxed">
            Carga documentos desde un archivo Excel. Elige entre datos de <span className="text-slate-600 font-semibold">Agricura</span> o del <span className="text-slate-600 font-semibold">SII</span>.
          </p>
        </button>

        {/* Card: Registrar Documento */}
        <button
          onClick={onNewDocument}
          className="group relative bg-white border border-slate-200 rounded-2xl p-7 text-left hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-200 active:scale-[0.99]"
        >
          <div className="flex items-start justify-between mb-5">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
              <Plus size={22} className="text-blue-600" />
            </div>
            <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-400 transition-colors mt-1" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">Registrar Documento</h3>
          <p className="text-sm text-slate-400 font-medium leading-relaxed">
            Ingresa manualmente una factura, boleta u otro tipo de documento al sistema.
          </p>
        </button>

      </div>

      {/* ── Chooser popup ─────────────────────────────────────────────────── */}
      {showChooser && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/60 w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <Upload size={18} className="text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Importar Datos</h3>
                  <p className="text-xs text-slate-400 font-medium">Selecciona la fuente de los datos</p>
                </div>
              </div>
              <button
                onClick={closeChooser}
                className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-400 rounded-lg transition-all active:scale-[0.97]"
              >
                <X size={16} />
              </button>
            </div>

            {/* Options */}
            <div className="p-5 space-y-3">
              <button
                onClick={handleSelectAgricura}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 transition-all duration-150 active:scale-[0.99] text-left group"
              >
                <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors">
                  <FileSpreadsheet size={20} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Importar datos de Agricura</p>
                  <p className="text-xs text-slate-400 mt-0.5">Carga facturas desde el archivo Excel interno.</p>
                </div>
                <ChevronRight size={16} className="text-slate-300 group-hover:text-emerald-500 ml-auto shrink-0 transition-colors" />
              </button>

              <button
                onClick={handleSelectSII}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-violet-300 hover:bg-violet-50/40 transition-all duration-150 active:scale-[0.99] text-left group"
              >
                <div className="w-10 h-10 bg-violet-50 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-violet-100 transition-colors">
                  <FileText size={20} className="text-violet-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Importar datos del SII</p>
                  <p className="text-xs text-slate-400 mt-0.5">Carga el libro de compras exportado desde el SII.</p>
                </div>
                <ChevronRight size={16} className="text-slate-300 group-hover:text-violet-500 ml-auto shrink-0 transition-colors" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      {showAgricuraImport && (
        <ExcelImportModal
          supabase={supabase}
          onClose={() => setShowAgricuraImport(false)}
          onImported={() => { setShowAgricuraImport(false); }}
        />
      )}

      {showSIIImport && (
        <SIIImportModal
          supabase={supabase}
          onClose={() => setShowSIIImport(false)}
          onImported={() => { setShowSIIImport(false); }}
        />
      )}

    </div>
  );
}
