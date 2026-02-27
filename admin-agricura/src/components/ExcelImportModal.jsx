import React, { useState } from 'react';
import { FileSpreadsheet, X, CheckCircle, AlertCircle, Download, Upload } from 'lucide-react';

const ExcelImportModal = ({ onClose, onImported, supabase }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [mode, setMode] = useState('sync'); // 'sync' | 'replace'

  const processExcel = async () => {
    if (!file || !window.XLSX) return;
    setLoading(true);
    setStatus('Leyendo archivo...');

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = window.XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = window.XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (jsonData.length === 0) throw new Error('Archivo vacío');

        // Deduplicate raw rows by proveedor+folio+detalle before grouping
        const seenRows = new Set();
        const dedupedData = jsonData.filter(curr => {
          const provKey = (curr.proveedor || curr.Proveedor || '').toString().trim().toUpperCase();
          const folioKey = (curr.no_documento || curr.folio || '').toString().trim();
          const detalleKey = (curr.detalle || curr.descripcion || '').toString().trim();
          const rowKey = `${provKey}|${folioKey}|${detalleKey}|${curr.cantidad ?? ''}|${curr.total_items ?? curr.total_linea ?? ''}`;
          if (seenRows.has(rowKey)) return false;
          seenRows.add(rowKey);
          return true;
        });

        const grouped = dedupedData.reduce((acc, curr) => {
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

        // En modo Reemplazar, primero limpia los items de todas las facturas
        if (mode === 'replace') {
          setStatus('Limpiando datos existentes...');
          const { error: clearErr } = await supabase
            .from('invoices')
            .update({ items: [], total_bruto: 0, iva: 0, total_a_pagar: 0 })
            .neq('id', 0);
          if (clearErr) throw new Error('Error al limpiar: ' + clearErr.message);
        }

        const total = Object.keys(grouped).length;
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
          setStatus(`Sincronizando... ${successCount}/${total}`);
        }
        setStatus(`✓ ${successCount} documento${successCount !== 1 ? 's' : ''} sincronizados`);
        setTimeout(() => { onImported(); onClose(); }, 1500);
      } catch (err) {
        setStatus(`Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    reader.onerror = () => { setStatus('Error al leer el archivo'); setLoading(false); };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl p-6 lg:p-7 relative border border-slate-200/60 max-h-[95vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-50 p-2 rounded-lg text-emerald-600"><FileSpreadsheet size={20} /></div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Importar Datos Agricura</h3>
              <p className="text-xs text-slate-400 mt-0.5">Detalles de facturas en formato Excel (.xlsx)</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-all active:scale-[0.98] text-slate-400"><X size={18} /></button>
        </div>

        {/* Info columnas */}
        <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 mb-5 space-y-3">
          <div className="flex items-center gap-2 text-emerald-600">
            <CheckCircle size={15} className="shrink-0" />
            <p className="text-xs font-semibold uppercase tracking-wide">Columnas requeridas</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {['proveedor', 'no_documento', 'detalle', 'cantidad', 'total_items'].map(col => (
              <span key={col} className="px-2 py-0.5 bg-white border border-slate-200 rounded-md text-xs font-medium text-slate-600">{col}</span>
            ))}
          </div>
          <div className="bg-emerald-50/70 border border-emerald-100 p-3 rounded-lg">
            <p className="text-xs font-medium text-emerald-800 leading-relaxed flex items-start gap-1.5">
              <AlertCircle size={12} className="shrink-0 mt-0.5" />
              <span><span className="font-bold">total_items</span> debe ingresarse <span className="font-bold">SIN IVA (Neto)</span>. El sistema calculará el impuesto automáticamente.</span>
            </p>
          </div>
          <a href="/template-agricura.xlsx" download
            className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-white border border-slate-200 text-slate-600 font-medium text-xs hover:bg-slate-50 hover:border-slate-300 rounded-lg transition-all active:scale-[0.98]">
            <Download size={14} className="text-slate-400" /> Descargar Template Oficial
          </a>
        </div>

        {/* Modo de carga */}
        <div className="mb-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Modo de importación</p>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setMode('sync')}
              className={`p-3 rounded-lg border text-left transition-all ${mode === 'sync' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
              <p className="text-xs font-bold">Sincronizar</p>
              <p className="text-xs mt-0.5 opacity-70">Actualiza solo las facturas encontradas</p>
            </button>
            <button onClick={() => setMode('replace')}
              className={`p-3 rounded-lg border text-left transition-all ${mode === 'replace' ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
              <p className="text-xs font-bold">Reemplazar</p>
              <p className="text-xs mt-0.5 opacity-70 flex items-center gap-1"><AlertCircle size={11} /> Limpia todo y recarga</p>
            </button>
          </div>
        </div>

        <div className="space-y-5">
          <label className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 hover:bg-emerald-50/30 hover:border-emerald-300 transition-all cursor-pointer group">
            <input type="file" accept=".xlsx" onChange={(e) => setFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
            <Upload className="text-slate-400 mb-2 group-hover:text-emerald-500 transition-colors" size={26} />
            <p className="text-sm font-medium text-slate-700 truncate px-4 max-w-full">{file ? file.name : 'Subir archivo Excel (.xlsx)'}</p>
            <p className="text-xs text-slate-400 mt-0.5">Arrastra o haz clic aquí</p>
          </label>

          {status && (
            <div className={`p-3.5 rounded-xl text-center text-sm font-medium ${
              status.startsWith('Error') ? 'bg-rose-50 text-rose-700 border border-rose-100'
              : status.startsWith('✓') ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
              : 'bg-emerald-50 text-emerald-700 border border-emerald-100 animate-pulse'
            }`}>
              {status}
            </div>
          )}

          <button
            disabled={!file || loading}
            onClick={processExcel}
            className="w-full bg-emerald-600 text-white font-semibold py-2.5 px-5 rounded-lg shadow-sm shadow-emerald-600/20 hover:shadow-md hover:bg-emerald-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none text-sm flex justify-center items-center gap-2"
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
