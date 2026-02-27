import React, { useState } from 'react';
import { FileSpreadsheet, X, CheckCircle, AlertCircle, Download, Upload } from 'lucide-react';

const ExcelImportModal = ({ onClose, onImported, supabase }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const processExcel = async () => {
    if (!file || !window.XLSX) return;
    setLoading(true);
    setStatus('Procesando...');

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = window.XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = window.XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (jsonData.length === 0) throw new Error('Archivo vacío');

        const grouped = jsonData.reduce((acc, curr) => {
          const provKey = (curr.proveedor || curr.Proveedor || '').toString().trim().toUpperCase();
          const folioKey = (curr.no_documento || curr.folio || '').toString().trim();
          if (!provKey || !folioKey) return acc;
          const key = `${provKey}-${folioKey}`;
          if (!acc[key]) acc[key] = [];
          acc[key].push({
            detalle: curr.detalle || curr.descripcion || 'Producto',
            cantidad: parseFloat(curr.cantidad || 1),
            total_item: parseInt(curr.total_items || curr.total_linea || 0),
          });
          return acc;
        }, {});

        let successCount = 0;
        for (const [key, items] of Object.entries(grouped)) {
          const [prov, folio] = key.split('-');
          const neto = items.reduce((s, i) => s + i.total_item, 0);
          const { error } = await supabase
            .from('invoices')
            .update({ items, total_bruto: neto, iva: Math.round(neto * 0.19), total_a_pagar: Math.round(neto * 1.19) })
            .ilike('proveedor', prov)
            .eq('no_documento', folio);
          if (!error) successCount++;
        }
        setStatus(`Sincronizados: ${successCount} documentos`);
        setTimeout(() => { onImported(); onClose(); }, 1500);
      } catch (err) {
        setStatus(`Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl p-6 lg:p-7 relative border border-slate-200/60 max-h-[95vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-2 rounded-lg text-blue-600"><FileSpreadsheet size={20} /></div>
            <h3 className="text-base font-bold text-slate-900">Importar Detalles</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-all active:scale-[0.98] text-slate-400"><X size={18} /></button>
        </div>

        <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-5 mb-5 space-y-5">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-blue-600">
              <CheckCircle size={16} className="shrink-0" />
              <p className="text-xs font-semibold uppercase tracking-wide">Columnas Obligatorias</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {['proveedor', 'no_documento', 'detalle', 'cantidad', 'total_items'].map((col) => (
                <span key={col} className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 shadow-sm">{col}</span>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-500">
              <AlertCircle size={16} className="shrink-0" />
              <p className="text-xs font-semibold uppercase tracking-wide">Restricción Contable</p>
            </div>
            <div className="bg-blue-50/60 border border-blue-100 p-4 rounded-xl">
              <p className="text-xs font-medium text-blue-800 leading-relaxed">
                El valor en <span className="font-bold">total_items</span> debe ingresarse <span className="font-bold">SIN IVA (Neto)</span>. El sistema calculará el impuesto automáticamente.
              </p>
            </div>
          </div>

          <a
            href="/template-agricura.xlsx"
            download
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-white border border-slate-200 text-slate-700 font-medium text-sm hover:bg-slate-50 hover:border-slate-300 rounded-lg transition-all active:scale-[0.98]"
          >
            <Download size={18} className="text-slate-400" />
            Descargar Template Oficial
          </a>
        </div>

        <div className="space-y-6">
          <label className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 hover:bg-blue-50/30 hover:border-blue-300 transition-all cursor-pointer group">
            <input type="file" accept=".xlsx" onChange={(e) => setFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
            <Upload className="text-slate-400 mb-2 group-hover:text-blue-500 transition-colors" size={28} />
            <p className="text-sm font-medium text-slate-700 truncate px-4 max-w-full">{file ? file.name : 'Subir Archivo Excel'}</p>
            <p className="text-xs text-slate-400 mt-0.5">Arrastra o haz clic aquí</p>
          </label>

          {status && (
            <div className={`p-3.5 rounded-xl text-center text-sm font-medium ${status.includes('Error') ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-blue-50 text-blue-700 border border-blue-100 animate-pulse'}`}>
              {status}
            </div>
          )}

          <button
            disabled={!file || loading}
            onClick={processExcel}
            className="w-full bg-blue-600 text-white font-semibold py-2.5 px-5 rounded-lg shadow-sm shadow-blue-600/20 hover:shadow-md hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none text-sm flex justify-center items-center gap-2"
          >
            {loading ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Procesando...</>
            ) : (
              'Iniciar Carga de Datos'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExcelImportModal;
