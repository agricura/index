import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  CheckCircle, 
  Clock, 
  Plus, 
  LayoutDashboard, 
  LogOut, 
  FileText, 
  Trash2, 
  Pencil, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight,
  Filter, 
  X,
  Search,
  Calendar,
  Wallet,
  ChevronDown,
  Check,
  PlusCircle,
  MinusCircle,
  Package,
  Upload,
  FileSpreadsheet,
  Download,
  Info
} from 'lucide-react';

// ==========================================
// CONFIGURACIÓN Y CARGA DE LIBRERÍAS
// ==========================================
const loadScript = (url) => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${url}"]`)) return resolve();
    const script = document.createElement('script');
    script.src = url;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

const supabaseUrl = 'https://obobxoubzosqylpzadsh.supabase.co';
const supabaseAnonKey = 'sb_publishable_w5Sy0ZRcp5rYQzKJl7RkmQ_HPCjOXY5';

const formatCLP = (val) => {
  return new Intl.NumberFormat('es-CL').format(Math.round(val || 0));
};

// --- COMPONENTE MODAL DE CONFIRMACIÓN (REUTILIZABLE) ---
const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Aceptar", cancelText = "Cancelar", type = "info" }) => {
  if (!isOpen) return null;
  const colors = {
    danger: "bg-red-600 hover:bg-red-700 shadow-red-200",
    success: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200",
    info: "bg-blue-600 hover:bg-blue-700 shadow-blue-200"
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 text-center animate-in zoom-in duration-200 border border-slate-100">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${type === 'danger' ? 'bg-red-50 text-red-600' : (type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600')}`}>
           {type === 'danger' ? <Trash2 size={40} /> : (type === 'success' ? <CheckCircle size={40} /> : <Info size={40} />)}
        </div>
        <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight mb-4 leading-tight">{title}</h3>
        <p className="text-slate-500 font-bold text-sm leading-relaxed mb-10">{message}</p>
        <div className="flex gap-4 justify-center">
          <button onClick={onClose} className="px-8 py-4 text-[11px] font-black uppercase text-slate-400 hover:text-slate-600 tracking-widest transition-all">
            {cancelText}
          </button>
          <button 
            onClick={() => { onConfirm(); onClose(); }} 
            className={`px-10 py-4 text-[11px] font-black uppercase rounded-[1.5rem] text-white shadow-xl transition-all active:scale-95 tracking-widest ${colors[type] || colors.info}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTE DE SELECCIÓN MÚLTIPLE ---
const MultiSelect = ({ label, options, selectedValues, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    return options.filter(opt => String(opt).toLowerCase().includes(searchTerm.toLowerCase()));
  }, [options, searchTerm]);

  const displayText = selectedValues.length === 0 
    ? placeholder 
    : selectedValues.length === 1 ? selectedValues[0] : `${selectedValues.length} seleccionados`;

  return (
    <div className="relative text-left" ref={dropdownRef}>
      <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block tracking-widest">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] font-bold text-slate-700 hover:bg-white transition-all focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
      >
        <span className="truncate">{displayText}</span>
        <ChevronDown size={14} className={`ml-2 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full max-h-72 bg-white border border-slate-100 rounded-[1.5rem] shadow-xl flex flex-col py-2 animate-in fade-in zoom-in duration-150">
          <div className="px-3 pb-2 pt-1 border-b border-slate-50 mb-1 sticky top-0 bg-white z-10 text-left">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
              <input 
                type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          <div className="overflow-y-auto max-h-48 text-left scrollbar-hide">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-4 text-xs text-slate-400 italic text-center">Sin resultados</div>
            ) : (
              filteredOptions.map((opt) => (
                <button
                  key={opt} type="button" onClick={() => {
                    if (selectedValues.includes(opt)) onChange(selectedValues.filter(v => v !== opt));
                    else onChange([...selectedValues, opt]);
                  }}
                  className="w-full flex items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 transition-colors text-left"
                >
                  <div className={`w-4 h-4 border rounded-md mr-3 flex items-center justify-center transition-colors ${selectedValues.includes(opt) ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'}`}>
                    {selectedValues.includes(opt) && <Check size={10} className="text-white" />}
                  </div>
                  <span className={selectedValues.includes(opt) ? 'font-bold text-blue-700' : 'font-medium'}>{opt}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- MODAL DE IMPORTACIÓN ---
const ExcelImportModal = ({ onClose, onImported, supabase }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files[0]) setFile(e.target.files[0]);
  };

  const processExcel = async () => {
    if (!file || !window.XLSX) return;
    setLoading(true);
    setStatus('Procesando archivo...');

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = window.XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = window.XLSX.utils.sheet_to_json(worksheet, { defval: "" });
        
        if (jsonData.length === 0) throw new Error("El archivo está vacío");

        const grouped = jsonData.reduce((acc, curr) => {
          const provKey = (curr.proveedor || curr.Proveedor || "").toString().trim().toUpperCase();
          const folioKey = (curr.no_documento || curr.folio || "").toString().trim();
          if (!provKey || !folioKey) return acc;
          const key = `${provKey}-${folioKey}`;
          if (!acc[key]) acc[key] = [];
          const totalItem = parseInt(curr.total_items || curr.total_linea || 0);
          acc[key].push({
            detalle: curr.detalle || curr.descripcion || "Sin descripción",
            cantidad: parseFloat(curr.cantidad || 0),
            total_item: totalItem
          });
          return acc;
        }, {});

        let successCount = 0;
        for (const [key, items] of Object.entries(grouped)) {
          const [prov, folio] = key.split('-');
          setStatus(`Vinculando Folio #${folio}...`);
          const neto = items.reduce((s, i) => s + i.total_item, 0);
          const iva = Math.round(neto * 0.19);
          const total = neto + iva;
          const { error } = await supabase
            .from('invoices')
            .update({ items, total_bruto: neto, iva, total_a_pagar: total })
            .ilike('proveedor', prov)
            .eq('no_documento', folio);
          if (!error) successCount++;
        }
        setStatus(`¡Éxito! Actualizados ${successCount} documentos.`);
        setTimeout(() => { onImported(); onClose(); }, 1500);
      } catch (err) { setStatus(`Error: ${err.message}`); } finally { setLoading(false); }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl p-10 relative overflow-hidden">
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-50 p-4 rounded-[1.5rem] border border-emerald-100 text-emerald-600">
              <FileSpreadsheet size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Importación Masiva</h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Sincronizar ítems desde Excel</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-full transition-all active:scale-90"><X size={28} className="text-slate-400" /></button>
        </div>
        
        <div className="space-y-8">
          <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Columnas Requeridas</h4>
            <div className="flex flex-wrap gap-2 mb-6">
              {['proveedor', 'no_documento', 'detalle', 'cantidad', 'total_items'].map(col => (
                <span key={col} className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold text-blue-600 shadow-sm">{col}</span>
              ))}
            </div>
            <a href="/detalle_facturas.xlsx" download className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 text-white text-[10px] font-black uppercase rounded-2xl hover:bg-slate-700 transition-all shadow-lg tracking-widest">
              <Download size={16} /> Descargar Plantilla
            </a>
          </div>

          <div className="relative group">
            <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
            <div className="border-3 border-dashed border-slate-200 rounded-[2rem] py-14 text-center bg-slate-50 transition-all group-hover:bg-blue-50 group-hover:border-blue-400 group-hover:border-solid">
              <Upload className="mx-auto text-slate-300 mb-4 group-hover:text-blue-500 transition-colors animate-bounce" size={48} />
              <p className="text-sm font-black text-slate-600 uppercase tracking-tighter">{file ? file.name : "Arrastra o selecciona tu archivo Excel"}</p>
            </div>
          </div>

          {status && (
            <div className="flex items-center justify-center gap-2 bg-blue-50 py-3 rounded-2xl border border-blue-100 animate-pulse">
              <Info size={16} className="text-blue-600" />
              <p className="text-[11px] font-black uppercase text-blue-600 tracking-widest">{status}</p>
            </div>
          )}

          <div className="flex justify-end gap-4 pt-4">
            <button onClick={onClose} className="px-8 py-4 text-[11px] font-black uppercase text-slate-400 hover:text-slate-600 tracking-widest">Cancelar</button>
            <button 
              onClick={processExcel} 
              disabled={!file || loading} 
              className="px-10 py-5 bg-blue-600 text-white text-[11px] font-black uppercase rounded-[1.5rem] shadow-xl shadow-blue-200 disabled:opacity-50 hover:bg-blue-700 transition-all active:scale-95 tracking-widest"
            >
              {loading ? 'Procesando...' : 'Iniciar Sincronización'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTE MODAL DE DETALLE DE FACTURA ---
const InvoiceDetailModal = ({ invoice, onClose }) => {
  if (!invoice) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-slate-900 p-8 flex justify-between items-center text-white">
          <div className="flex items-center gap-6">
            <div className="bg-blue-600 p-4 rounded-[1.5rem] shadow-xl">
              <Package size={32} className="text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-black uppercase tracking-tight leading-tight">
                {invoice.tipo_doc} <span className="text-blue-400">#{invoice.no_documento}</span>
              </h3>
              <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] mt-1">{invoice.proveedor}</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/10 p-3 rounded-full transition-all active:scale-90"><X size={32} /></button>
        </div>
        
        <div className="p-10 overflow-y-auto space-y-10 bg-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 p-8 rounded-[2rem] border border-slate-100 bg-slate-50/50">
            {[
              { label: 'Emisión', val: invoice.fecha_emision, type: 'date' },
              { label: 'Vencimiento', val: invoice.fecha_venc, type: 'date' },
              { label: 'Centro de Costo', val: invoice.centro_costo || 'N/A', type: 'tag' },
              { label: 'Estado', val: invoice.status_pago, type: 'status' }
            ].map((field, i) => (
              <div key={i}>
                <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">{field.label}</p>
                {field.type === 'tag' ? (
                  <span className="bg-white border border-slate-200 text-slate-700 text-[10px] px-3 py-1.5 rounded-xl font-black uppercase shadow-sm inline-block">{field.val}</span>
                ) : field.type === 'status' ? (
                  <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase inline-flex items-center shadow-sm ${field.val === 'PAGADO' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
                    {field.val}
                  </span>
                ) : (
                  <p className="font-mono text-sm text-slate-800 font-bold">{field.val}</p>
                )}
              </div>
            ))}
          </div>

          <div>
            <h4 className="text-xs font-black text-slate-900 uppercase mb-6 tracking-[0.3em] flex items-center gap-3">
              <div className="w-2 h-6 bg-blue-600 rounded-full"></div>
              Desglose de Productos
            </h4>
            <div className="border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  <tr>
                    <th className="p-5">Producto / Descripción</th>
                    <th className="p-5 text-center">Cantidad</th>
                    <th className="p-5 text-right">Subtotal ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {invoice.items && Array.isArray(invoice.items) && invoice.items.length > 0 ? (
                    invoice.items.map((it, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-5 font-bold text-slate-800">{it.detalle}</td>
                        <td className="p-5 text-center font-mono font-bold text-slate-500">{it.cantidad}</td>
                        <td className="p-5 text-right font-black text-slate-900 font-mono text-lg">${formatCLP(it.total_item)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="3" className="p-20 text-center text-slate-400 italic font-bold text-sm">No se ha registrado desglose detallado.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <div className="w-full md:w-96 space-y-5 bg-slate-900 text-white p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/20 blur-[80px] rounded-full -mr-16 -mt-16"></div>
              <div className="flex justify-between items-center text-[11px] opacity-60 uppercase font-black tracking-widest border-b border-white/10 pb-4">
                <span>Monto Neto</span>
                <span className="font-mono text-lg">${formatCLP(invoice.total_bruto)}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] opacity-60 uppercase font-black tracking-widest border-b border-white/10 pb-4">
                <span>IVA (19%)</span>
                <span className="font-mono text-lg">${formatCLP(invoice.iva)}</span>
              </div>
              <div className="pt-2">
                <span className="text-[10px] font-black uppercase text-blue-400 block mb-2 tracking-[0.2em]">Total a Pagar</span>
                <span className="text-4xl font-black font-mono tracking-tighter">${formatCLP(invoice.total_a_pagar)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [supabaseClient, setSupabaseClient] = useState(null);
  const [session, setSession] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [invoiceToEdit, setInvoiceToEdit] = useState(null);
  const [viewingInvoice, setViewingInvoice] = useState(null); 
  const [isImporting, setIsImporting] = useState(false);
  const [isReady, setIsReady] = useState(false);
  
  // Estado global para el modal de confirmación
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {}, type: 'info' });

  useEffect(() => {
    const initApp = async () => {
      try {
        await loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2');
        await loadScript('https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js');
        const client = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
        setSupabaseClient(client);
        client.auth.getSession().then(({ data: { session } }) => {
          setSession(session);
          setIsReady(true);
        });
        client.auth.onAuthStateChange((_event, session) => setSession(session));
      } catch (err) { console.error("Error dependencias:", err); }
    };
    initApp();
  }, []);

  if (!isReady) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white space-y-6">
      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <h1 className="text-4xl font-black tracking-[0.3em] uppercase animate-pulse">AGRICURA</h1>
    </div>
  );

  if (!session) return <Auth supabase={supabaseClient} onShowAlert={(m) => setConfirmModal({ isOpen: true, title: 'Error de Acceso', message: m, type: 'danger', onConfirm: () => {} })} />;

  return (
    <div className="h-screen bg-[#F8FAFC] flex font-sans overflow-hidden">
      {/* SIDEBAR AGRICURA */}
      <nav className="w-72 bg-slate-900 text-white flex flex-col shadow-2xl z-20 shrink-0">
        <div className="p-10 text-center">
          <h1 className="text-3xl font-black tracking-[0.2em] uppercase text-white">AGRICURA</h1>
          <div className="h-1 w-12 bg-blue-600 mx-auto mt-2 rounded-full"></div>
        </div>
        
        <div className="flex-1 px-6 space-y-4 mt-8 overflow-y-auto scrollbar-hide">
          <button 
            onClick={() => { setCurrentView('dashboard'); setInvoiceToEdit(null); }} 
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 ${currentView === 'dashboard' ? 'bg-blue-600 shadow-xl shadow-blue-900/40 text-white translate-x-2' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <LayoutDashboard size={20} /><span className="font-black text-xs uppercase tracking-widest">Dashboard</span>
          </button>
          
          <button 
            onClick={() => { setCurrentView('form'); setInvoiceToEdit(null); }} 
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 ${currentView === 'form' ? 'bg-blue-600 shadow-xl shadow-blue-900/40 text-white translate-x-2' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <Plus size={20} /><span className="font-black text-xs uppercase tracking-widest">Nuevo Registro</span>
          </button>

          <div className="pt-10 pb-4">
            <p className="px-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Herramientas</p>
            <button 
              onClick={() => setIsImporting(true)} 
              className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-emerald-400 hover:bg-emerald-500/10 transition-all border border-emerald-500/10 bg-emerald-500/5 group"
            >
              <FileSpreadsheet size={20} className="group-hover:scale-110 transition-transform" />
              <span className="font-black text-xs uppercase tracking-widest">Importar Excel</span>
            </button>
          </div>
        </div>

        <div className="p-8 bg-black/20 border-t border-white/5 space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-xs uppercase">{session?.user?.email?.[0]}</div>
            <p className="text-[10px] text-slate-400 font-bold truncate tracking-tighter uppercase">{session?.user?.email}</p>
          </div>
          <button 
            onClick={() => supabaseClient.auth.signOut()} 
            className="w-full flex items-center justify-center gap-2 text-red-400 hover:bg-red-500/10 transition-all rounded-2xl py-4 border border-red-500/10 text-xs font-black uppercase tracking-widest"
          >
            <LogOut size={16} /> Cerrar Sesión
          </button>
        </div>
      </nav>

      <main className="flex-1 overflow-auto h-full relative scroll-smooth">
        {currentView === 'dashboard' ? (
          <Dashboard 
            supabase={supabaseClient} 
            onEdit={(inv) => { setInvoiceToEdit(inv); setCurrentView('form'); }} 
            onViewDetail={(inv) => setViewingInvoice(inv)} 
            onShowConfirm={(cfg) => setConfirmModal({ ...cfg, isOpen: true })}
          />
        ) : (
          <InvoiceForm 
            supabase={supabaseClient} 
            invoiceToEdit={invoiceToEdit} 
            onSuccess={() => { setCurrentView('dashboard'); setInvoiceToEdit(null); }} 
            onShowConfirm={(cfg) => setConfirmModal({ ...cfg, isOpen: true })}
          />
        )}
        
        {viewingInvoice && <InvoiceDetailModal invoice={viewingInvoice} onClose={() => setViewingInvoice(null)} />}
        {isImporting && <ExcelImportModal supabase={supabaseClient} onClose={() => setIsImporting(false)} onImported={() => window.location.reload()} />}
      </main>

      {/* POP-UP CENTRADO DE AGRICURA */}
      <ConfirmModal 
        isOpen={confirmModal.isOpen} 
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
      />
    </div>
  );
}

function Auth({ supabase, onShowAlert }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) onShowAlert(error.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-6">
      <div className="max-w-md w-full bg-white p-12 rounded-[3rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-3 bg-blue-600"></div>
        <div className="text-center mb-10">
          <h2 className="text-4xl font-black text-slate-800 uppercase tracking-tighter">Agricura</h2>
          <p className="text-slate-400 font-black mt-2 uppercase tracking-[0.2em] text-[10px]">Gestión Contable Senior</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Email Corporativo</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700 focus:ring-4 focus:ring-blue-100 transition-all" required placeholder="tu@empresa.com" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Contraseña</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700 focus:ring-4 focus:ring-blue-100 transition-all" required placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl shadow-xl uppercase tracking-[0.2em] text-xs hover:bg-slate-800 transition-all active:scale-95 mt-4">
            {loading ? 'Validando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}

function Dashboard({ supabase, onEdit, onViewDetail, onShowConfirm }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [filters, setFilters] = useState({ search: '', providers: [], costCenters: [], types: [], status: [], startDate: '', endDate: '' });

  useEffect(() => { fetchInvoices(true); }, []);

  const fetchInvoices = async (initial = false) => {
    if (initial) setLoading(true); else setIsRefreshing(true);
    let allInvoices = [];
    let from = 0;
    try {
      while (true) {
        const { data, error } = await supabase.from('invoices').select('*').order('fecha_emision', { ascending: false }).range(from, from + 999);
        if (error) throw error;
        allInvoices = [...allInvoices, ...data];
        if (data.length < 1000) break; else from += 1000;
      }
      setInvoices(allInvoices);
    } catch (e) { console.error(e); } finally { setLoading(false); setIsRefreshing(false); }
  };

  const toggleStatus = (id, currentStatus) => {
    const newStatus = currentStatus === 'PENDIENTE' ? 'PAGADO' : 'PENDIENTE';
    
    onShowConfirm({
      title: newStatus === 'PAGADO' ? 'Marcar Documento' : 'Revertir Pago',
      message: newStatus === 'PAGADO' 
        ? 'El documento se va a marcar como "PAGADO". ¿Está seguro de que quiere continuar?'
        : 'El documento ya figura como pagado. ¿Está seguro de que quiere revertir el estado a "PENDIENTE"?',
      type: 'info',
      onConfirm: async () => {
        const originalInvoices = [...invoices];
        setInvoices(prev => prev.map(inv => 
          inv.id === id 
            ? { ...inv, status_pago: newStatus, fecha_pago: newStatus === 'PAGADO' ? new Date().toISOString().split('T')[0] : null } 
            : inv
        ));

        try {
          const { error } = await supabase.from('invoices').update({ status_pago: newStatus, fecha_pago: newStatus === 'PAGADO' ? new Date().toISOString().split('T')[0] : null }).eq('id', id);
          if (error) throw error;
        } catch (e) {
          setInvoices(originalInvoices);
          onShowConfirm({ title: 'Error', message: 'No se pudo actualizar el estado: ' + e.message, type: 'danger', onConfirm: () => {} });
        }
      }
    });
  };

  const deleteInvoice = (id) => {
    onShowConfirm({
      title: 'Eliminar Registro',
      message: '¿Está seguro de que desea eliminar este registro de forma permanente? Esta acción no se puede deshacer.',
      type: 'danger',
      onConfirm: async () => {
        const { error } = await supabase.from('invoices').delete().eq('id', id);
        if (error) {
          onShowConfirm({ title: 'Error', message: 'No se pudo eliminar: ' + error.message, type: 'danger', onConfirm: () => {} });
        } else {
          fetchInvoices();
        }
      }
    });
  };

  const filterOptions = useMemo(() => ({
    providers: [...new Set(invoices.map(i => i.proveedor).filter(Boolean))].sort(),
    costCenters: [...new Set(invoices.map(i => i.centro_costo).filter(Boolean))].sort(),
    types: [...new Set(invoices.map(i => i.tipo_doc).filter(Boolean))].sort(),
    status: ["PENDIENTE", "PAGADO", "VENCIDA"]
  }), [invoices]);

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const matchesSearch = !filters.search || inv.proveedor?.toLowerCase().includes(filters.search.toLowerCase()) || inv.no_documento?.toString().includes(filters.search) || inv.centro_costo?.toLowerCase().includes(filters.search.toLowerCase());
      const matchesStatus = filters.status.length === 0 || filters.status.some(s => {
        if (s === 'PAGADO') return inv.status_pago === 'PAGADO';
        if (s === 'VENCIDA') return inv.status_pago === 'PENDIENTE' && todayStr > inv.fecha_venc;
        if (s === 'PENDIENTE') return inv.status_pago === 'PENDIENTE' && todayStr <= inv.fecha_venc;
        return false;
      });
      const matchesDate = (!filters.startDate || inv.fecha_emision >= filters.startDate) && (!filters.endDate || inv.fecha_emision <= filters.endDate);
      const matchesProvider = filters.providers.length === 0 || filters.providers.includes(inv.proveedor);
      const matchesCostCenter = filters.costCenters.length === 0 || filters.costCenters.includes(inv.centro_costo);
      const matchesType = filters.types.length === 0 || filters.types.includes(inv.tipo_doc);
      return matchesSearch && matchesStatus && matchesDate && matchesProvider && matchesCostCenter && matchesType;
    });
  }, [invoices, filters, todayStr]);

  const stats = useMemo(() => ({
    pend: filteredInvoices.filter(inv => inv.status_pago === 'PENDIENTE').reduce((s, i) => s + Number(i.total_a_pagar), 0),
    paid: filteredInvoices.filter(inv => inv.status_pago === 'PAGADO').reduce((s, i) => s + Number(i.total_a_pagar), 0)
  }), [filteredInvoices]);

  const paginatedInvoices = useMemo(() => filteredInvoices.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage), [filteredInvoices, currentPage]);
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

  return (
    <div className="p-6 md:p-10 max-w-[1600px] mx-auto space-y-8 md:space-y-10 min-h-full flex flex-col overflow-hidden">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 uppercase tracking-tighter">Panel de Control</h2>
          <p className="text-slate-400 mt-1 text-[9px] font-black uppercase tracking-[0.3em]">Gestionando {filteredInvoices.length} registros contables</p>
        </div>
        {isRefreshing && (
          <div className="flex items-center gap-2 bg-blue-50 text-blue-600 px-5 py-2 rounded-2xl border border-blue-100 shadow-sm animate-in fade-in zoom-in">
            <Clock size={14} className="animate-spin" />
            <span className="text-[10px] font-black uppercase tracking-widest">Sincronizando Auditoría</span>
          </div>
        )}
      </header>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: 'Total Pendiente', val: stats.pend, color: 'red', icon: <Clock size={44}/> },
          { label: 'Total Pagado', val: stats.paid, color: 'emerald', icon: <Wallet size={44}/> },
          { label: 'Documentos', val: filteredInvoices.length, color: 'blue', icon: <FileText size={44}/>, raw: true },
          { label: 'Estado Sistema', val: 'Online', color: 'emerald', icon: <CheckCircle size={44}/>, text: true }
        ].map((card, i) => (
          <div key={i} className={`bg-white p-6 md:p-8 rounded-[2rem] border-l-8 border-${card.color}-500 flex flex-col justify-center shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 relative overflow-hidden group`}>
            <div className={`absolute -right-3 -top-3 opacity-5 group-hover:opacity-10 transition-opacity text-${card.color}-600 p-4`}>
              {card.icon}
            </div>
            <div className="relative z-10">
              <h3 className="text-slate-400 text-[10px] font-black uppercase mb-1 md:mb-2 tracking-widest leading-none">{card.label}</h3>
              <p className={`text-xl md:text-2xl font-black ${card.color === 'emerald' ? 'text-emerald-600' : card.color === 'red' ? 'text-red-600' : 'text-slate-900'} tracking-tighter leading-tight`}>
                {card.text ? card.val : (card.raw ? card.val : `$${formatCLP(card.val)}`)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* FILTROS */}
      <div className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6 md:space-y-8">
        <div className="flex items-center justify-between border-b border-slate-50 pb-4 md:pb-6">
          <div className="flex items-center gap-3 text-slate-800 font-black uppercase text-[11px] tracking-[0.2em]"><Filter size={18} /> Filtros de Auditoría</div>
          <button onClick={() => {setFilters({search:'', providers:[], costCenters:[], types:[], status:[], startDate:'', endDate:''}); setCurrentPage(1);}} className="text-blue-600 hover:text-blue-800 text-[10px] font-black uppercase tracking-widest transition-all">Limpiar todo</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
          <div className="md:col-span-2">
            <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Búsqueda Inteligente</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                value={filters.search} onChange={e => {setFilters({...filters, search: e.target.value}); setCurrentPage(1);}} 
                placeholder="Buscar por Folio, Proveedor o Centro de Costo..." 
                className="w-full pl-12 pr-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] font-bold focus:ring-4 focus:ring-blue-100 outline-none transition-all" 
              />
            </div>
          </div>
          <div><label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Desde</label><input type="date" value={filters.startDate} onChange={e => {setFilters({...filters, startDate: e.target.value}); setCurrentPage(1);}} className="w-full px-6 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] font-bold outline-none" /></div>
          <div><label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Hasta</label><input type="date" value={filters.endDate} onChange={e => {setFilters({...filters, endDate: e.target.value}); setCurrentPage(1);}} className="w-full px-6 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] font-bold outline-none" /></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
          <MultiSelect label="Proveedor" options={filterOptions.providers} selectedValues={filters.providers} onChange={(vals) => {setFilters({...filters, providers: vals}); setCurrentPage(1);}} placeholder="Todos los proveedores" />
          <MultiSelect label="C. Costo" options={filterOptions.costCenters} selectedValues={filters.costCenters} onChange={(vals) => {setFilters({...filters, costCenters: vals}); setCurrentPage(1);}} placeholder="Todos los centros" />
          <MultiSelect label="Tipo Doc." options={filterOptions.types} selectedValues={filters.types} onChange={(vals) => {setFilters({...filters, types: vals}); setCurrentPage(1);}} placeholder="Todos los tipos" />
          <MultiSelect label="Estado Pago" options={filterOptions.status} selectedValues={filters.status} onChange={(vals) => {setFilters({...filters, status: vals}); setCurrentPage(1);}} placeholder="Cualquier estado" />
        </div>
      </div>

      {/* TABLA ADAPTATIVA */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col flex-1 min-h-[400px]">
        <div className="overflow-x-auto flex-1 scrollbar-hide">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead className="sticky top-0 z-10 shadow-sm bg-slate-900 text-white">
              <tr className="text-[9px] uppercase font-black tracking-[0.2em]">
                <th className="p-6">Proveedor</th>
                <th className="p-6">Documento</th>
                <th className="p-6">Emisión</th>
                <th className="p-6">Vencimiento</th>
                <th className="p-6">C. Costo</th>
                <th className="p-6 text-right">Total ($)</th>
                <th className="p-6 text-center">Estado</th>
                <th className="p-6 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-[12px]">
              {paginatedInvoices.map((inv) => {
                const isOverdue = inv.status_pago === 'PENDIENTE' && todayStr > inv.fecha_venc;
                return (
                  <tr key={inv.id} className={`hover:bg-blue-50/40 transition-colors group ${isOverdue ? 'bg-red-50/20' : ''}`}>
                    <td className="p-6">
                      <p className="font-black text-slate-800 leading-tight tracking-tight uppercase whitespace-nowrap">{inv.proveedor}</p>
                    </td>
                    <td className="p-6">
                      <div className="bg-slate-100 px-3 py-1 rounded-lg inline-block mb-1 border border-slate-200">
                        <span className="font-mono font-black text-slate-700">#{inv.no_documento}</span>
                      </div>
                      <p className="text-[9px] uppercase font-black text-slate-400 tracking-widest">{inv.tipo_doc}</p>
                    </td>
                    <td className="p-6 font-mono text-slate-800 font-bold">{inv.fecha_emision}</td>
                    <td className="p-6 font-mono font-bold">
                      <span className={isOverdue ? 'text-red-600 animate-pulse' : 'text-slate-600'}>{inv.fecha_venc}</span>
                    </td>
                    <td className="p-6">
                      <span className="bg-white border border-slate-200 text-slate-700 text-[8.5px] px-2 py-0.5 rounded-md font-black uppercase shadow-xs">{inv.centro_costo || 'N/A'}</span>
                    </td>
                    <td className={`p-6 text-right font-black font-mono text-[16px] tracking-tighter ${Number(inv.total_a_pagar) < 0 ? 'text-red-600' : 'text-slate-900'}`}>
                      ${formatCLP(inv.total_a_pagar)}
                    </td>
                    <td className="p-6 text-center">
                      <span className={`w-24 py-1.5 rounded-xl text-[8.5px] font-black uppercase inline-flex items-center justify-center shadow-sm ${isOverdue ? 'bg-red-600 text-white' : (inv.status_pago === 'PAGADO' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600')}`}>
                        {isOverdue ? 'VENCIDA' : inv.status_pago}
                      </span>
                    </td>
                    <td className="p-6 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button onClick={() => onViewDetail(inv)} className="p-2 bg-slate-50 border border-slate-200 text-slate-400 hover:text-blue-600 hover:bg-white hover:shadow-md hover:scale-110 rounded-xl transition-all" title="Ver Detalle">
                          <Search size={16} className={inv.items?.length > 0 ? 'text-blue-600' : ''} />
                        </button>
                        <button onClick={() => toggleStatus(inv.id, inv.status_pago)} className="p-2 bg-slate-50 border border-slate-200 text-slate-400 hover:text-emerald-600 hover:bg-white hover:shadow-md hover:scale-110 rounded-xl transition-all">
                          {inv.status_pago === 'PAGADO' ? <CheckCircle size={16} className="text-emerald-500" /> : <Clock size={16} />}
                        </button>
                        <button onClick={() => onEdit(inv)} className="p-2 bg-slate-50 border border-slate-200 text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-md hover:scale-110 rounded-xl transition-all"><Pencil size={16} /></button>
                        <button onClick={() => deleteInvoice(inv.id)} className="p-2 bg-red-50 border border-red-100 text-red-300 hover:text-red-600 hover:bg-white hover:shadow-md hover:scale-110 rounded-xl transition-all"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* PAGINACIÓN */}
        {totalPages > 1 && (
          <div className="p-6 md:p-8 border-t border-slate-50 bg-slate-50/40 flex items-center justify-between shrink-0">
            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">
              Página <span className="text-blue-600">{currentPage}</span> de <span className="text-blue-600">{totalPages}</span> 
            </p>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="p-2.5 border border-slate-200 rounded-xl hover:bg-white hover:shadow-md disabled:opacity-20 transition-all active:scale-90"><ChevronLeft size={18} /></button>
              <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="p-2.5 border border-slate-200 rounded-xl hover:bg-white hover:shadow-md disabled:opacity-20 transition-all active:scale-90"><ChevronRight size={18} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InvoiceForm({ supabase, onSuccess, invoiceToEdit, onShowConfirm }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tipo_doc: invoiceToEdit?.tipo_doc || 'Factura',
    no_documento: invoiceToEdit?.no_documento || '',
    proveedor: invoiceToEdit?.proveedor || '',
    fecha_emision: invoiceToEdit?.fecha_emision || '',
    fecha_venc: invoiceToEdit?.fecha_venc || '',
    total_bruto: invoiceToEdit?.total_bruto || 0, 
    iva: invoiceToEdit?.iva || 0,
    total_a_pagar: invoiceToEdit?.total_a_pagar || 0,
    centro_costo: invoiceToEdit?.centro_costo || '',
    item: invoiceToEdit?.item || '',
    items: (invoiceToEdit?.items && Array.isArray(invoiceToEdit.items) && invoiceToEdit.items.length > 0) 
           ? invoiceToEdit.items 
           : [{ detalle: '', cantidad: 1, total_item: 0 }] 
  });

  const [focusField, setFocusField] = useState(null);

  const calculateTotals = (items, netoManual = null, ivaOverride = null) => {
    const neto = items.length > 0 && items[0].detalle !== ''
      ? items.reduce((sum, it) => sum + (Number(it.total_item) || 0), 0)
      : (netoManual !== null ? Number(netoManual) : Number(formData.total_bruto) || 0);
    
    const iva = ivaOverride !== null ? Number(ivaOverride) : Math.round(neto * 0.19);
    const total = neto + iva;
    return { neto, iva, total };
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    const { neto, iva, total } = calculateTotals(newItems);
    setFormData({ ...formData, items: newItems, total_bruto: neto, iva, total_a_pagar: total });
  };

  const addItem = () => {
    setFormData({ ...formData, items: [...formData.items, { detalle: '', cantidad: 1, total_item: 0 }] });
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    const { neto, iva, total } = calculateTotals(newItems);
    setFormData({ ...formData, items: newItems.length === 0 ? [{ detalle: '', cantidad: 1, total_item: 0 }] : newItems, total_bruto: neto, iva, total_a_pagar: total });
  };

  const handleGeneralChange = (e) => {
    const { name, value } = e.target;
    if (!name) return;
    
    const numVal = Number(value) || 0;
    
    if (name === 'iva') {
      setFormData(prev => ({ ...prev, iva: numVal, total_a_pagar: (Number(prev.total_bruto) || 0) + numVal }));
    } else if (name === 'total_bruto') {
      const { neto, iva, total } = calculateTotals([], value);
      setFormData(prev => ({ ...prev, total_bruto: neto, iva, total_a_pagar: total }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sesión expirada.");

      const cleanItems = formData.items.filter(it => it.detalle.trim() !== "");
      
      const payload = {
        tipo_doc: formData.tipo_doc,
        no_documento: formData.no_documento,
        proveedor: formData.proveedor,
        fecha_emision: formData.fecha_emision,
        fecha_venc: formData.fecha_venc,
        total_bruto: Number(formData.total_bruto),
        iva: Number(formData.iva),
        total_a_pagar: Number(formData.total_a_pagar),
        centro_costo: formData.centro_costo,
        item: formData.item,
        items: cleanItems,
        created_by: user.id,
        status_pago: invoiceToEdit?.status_pago || 'PENDIENTE'
      };

      Object.keys(payload).forEach(key => { if (key === "" || key === "undefined") delete payload[key]; });

      let res;
      if (invoiceToEdit) {
        res = await supabase.from('invoices').update(payload).eq('id', invoiceToEdit.id);
      } else {
        res = await supabase.from('invoices').insert([payload]);
      }

      if (res.error) throw res.error;
      onSuccess();
    } catch (err) { 
      onShowConfirm({ title: 'Error de Validación', message: err.message, type: 'danger', onConfirm: () => {} });
    } finally { 
      setLoading(false); 
    }
  };

  const hasItems = formData.items.some(it => it.detalle.trim() !== "");

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-10">
      <header className="flex items-center gap-6">
        <button onClick={onSuccess} className="p-4 bg-white border border-slate-200 rounded-[1.5rem] shadow-sm hover:shadow-md transition-all active:scale-90"><ChevronLeft size={24}/></button>
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 uppercase tracking-tighter">{invoiceToEdit ? 'Editar Documento' : 'Nuevo Registro Contable'}</h2>
          <p className="text-slate-400 mt-1 text-[10px] font-black uppercase tracking-[0.3em]">Auditoría Agricura</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="bg-white p-8 md:p-12 rounded-[3rem] shadow-sm border border-slate-100 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Proveedor / Entidad</label>
            <input name="proveedor" value={formData.proveedor} onChange={handleGeneralChange} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl outline-none font-black text-slate-800 text-lg focus:ring-4 focus:ring-blue-100 transition-all uppercase" required placeholder="RAZÓN SOCIAL" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Tipo</label>
            <select name="tipo_doc" value={formData.tipo_doc} onChange={handleGeneralChange} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-black text-slate-800 focus:ring-4 focus:ring-blue-100 transition-all appearance-none">
              <option value="Factura">Factura de Compra</option>
              <option value="Boleta">Boleta de Servicio</option>
              <option value="Nota de Credito">Nota de Crédito</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div><label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Nº de Folio</label><input name="no_documento" value={formData.no_documento} onChange={handleGeneralChange} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl outline-none font-bold text-slate-800" required /></div>
          <div><label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Emisión</label><input type="date" name="fecha_emision" value={formData.fecha_emision} onChange={handleGeneralChange} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl outline-none font-bold text-slate-800" required /></div>
          <div><label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Vencimiento</label><input type="date" name="fecha_venc" value={formData.fecha_venc} onChange={handleGeneralChange} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl outline-none font-bold text-slate-800" required /></div>
        </div>

        <div className="space-y-6 pt-6 border-t border-slate-50">
          <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-3"><Package size={18} className="text-blue-600" /> Desglose de Productos</h3>
          <div className="space-y-4">
            {formData.items.map((it, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 items-center">
                <div className="md:col-span-7"><input value={it.detalle} onChange={(e) => handleItemChange(idx, 'detalle', e.target.value)} className="w-full bg-white border border-slate-200 p-3.5 rounded-xl text-sm font-bold text-slate-700 outline-none" placeholder="Descripción" /></div>
                <div className="md:col-span-1"><input type="number" step="0.001" value={it.cantidad} onChange={(e) => handleItemChange(idx, 'cantidad', e.target.value)} className="w-full bg-white border border-slate-200 p-3.5 rounded-xl text-sm text-center font-mono font-bold" /></div>
                <div className="md:col-span-3">
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl flex items-center p-3.5">
                    <input 
                      type={focusField === `item-${idx}` ? "number" : "text"}
                      value={focusField === `item-${idx}` ? it.total_item : formatCLP(it.total_item)}
                      onChange={(e) => handleItemChange(idx, 'total_item', e.target.value)}
                      onFocus={() => setFocusField(`item-${idx}`)}
                      onBlur={() => setFocusField(null)}
                      className="w-full bg-transparent outline-none text-right font-black text-emerald-800 text-sm font-mono" 
                    />
                  </div>
                </div>
                <div className="md:col-span-1 flex justify-center"><button type="button" onClick={() => removeItem(idx)} className="text-red-300 hover:text-red-600 transition-all"><MinusCircle size={26} /></button></div>
              </div>
            ))}
          </div>
          <div className="flex justify-end"><button type="button" onClick={addItem} className="bg-slate-900 text-white px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-200"><PlusCircle size={20} className="inline mr-2" /> Nueva línea</button></div>
        </div>

        <div className="bg-slate-900 p-10 rounded-[3.5rem] grid grid-cols-1 md:grid-cols-3 gap-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full"></div>
          <div><label className="text-[10px] font-black text-slate-400 mb-3 uppercase tracking-widest block">Neto ($)</label><input name="total_bruto" type={focusField === 'neto' ? "number" : "text"} value={focusField === 'neto' ? formData.total_bruto : formatCLP(formData.total_bruto)} onChange={handleGeneralChange} onFocus={() => setFocusField('neto')} onBlur={() => setFocusField(null)} className={`w-full bg-white/5 border border-white/10 rounded-2xl p-6 font-black text-3xl text-white font-mono outline-none ${hasItems ? 'opacity-40 pointer-events-none' : ''}`} required readOnly={hasItems} /></div>
          <div><label className="text-[10px] font-black text-slate-400 mb-3 uppercase tracking-widest block">IVA (19%)</label><input name="iva" type={focusField === 'iva' ? "number" : "text"} value={focusField === 'iva' ? formData.iva : formatCLP(formData.iva)} onChange={handleGeneralChange} onFocus={() => setFocusField('iva')} onBlur={() => setFocusField(null)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 font-black text-3xl text-blue-400 font-mono outline-none" /></div>
          <div><label className="text-[10px] font-black text-slate-400 mb-3 uppercase tracking-widest block">Total</label><div className="bg-blue-600 text-white p-6 rounded-2xl shadow-xl font-mono text-3xl font-black text-right">${formatCLP(formData.total_a_pagar)}</div></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          <div><label className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Centro de Costo</label><input name="centro_costo" value={formData.centro_costo} onChange={handleGeneralChange} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl outline-none font-bold uppercase" placeholder="EJ: AGRICURA" /></div>
          <div><label className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Glosa / Categoría</label><input name="item" value={formData.item} onChange={handleGeneralChange} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl outline-none font-bold uppercase" placeholder="EJ: INSUMOS" /></div>
        </div>

        <div className="flex justify-end gap-6 pt-6">
          <button type="button" onClick={onSuccess} className="px-10 py-5 border-2 border-slate-100 rounded-[1.5rem] text-slate-400 font-black uppercase text-[10px] tracking-[0.2em]">Cancelar</button>
          <button type="submit" disabled={loading} className="px-14 py-5 bg-blue-600 text-white font-black rounded-[1.5rem] shadow-2xl shadow-blue-200 uppercase tracking-[0.2em] text-[10px] hover:bg-blue-700 active:scale-95 transition-all">{loading ? 'Guardando...' : 'Finalizar Registro'}</button>
        </div>
      </form>
    </div>
  );
}