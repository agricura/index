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
  Info,
  Menu,
  MoreVertical,
  Settings2,
  ChevronUp,
  RotateCcw
} from 'lucide-react';

// ==========================================
// CONFIGURACIÓN Y UTILIDADES
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

// --- COMPONENTE MENU ACCIONES (SOLO MÓVIL) ---
const MobileActionMenu = ({ invoice, onEdit, onView, onToggleStatus, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasItems = invoice.items && Array.isArray(invoice.items) && invoice.items.length > 0;

  return (
    <div className="relative lg:hidden" ref={menuRef}>
      <button 
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        className="p-3 hover:bg-slate-100 rounded-full transition-all text-slate-400 active:scale-90"
      >
        <MoreVertical size={20} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-[150] animate-in fade-in zoom-in duration-100">
          <button onClick={() => { onView(invoice); setIsOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-blue-50 transition-colors border-b border-slate-50">
            <Search size={16} className={hasItems ? "text-blue-600" : "text-slate-400"} /> Ver Detalles
          </button>
          <button onClick={() => { onToggleStatus(invoice.id, invoice.status_pago); setIsOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-blue-50 transition-colors border-b border-slate-50">
            {invoice.status_pago === 'PAGADO' ? <Clock size={16} className="text-amber-500" /> : <CheckCircle size={16} className="text-emerald-500" />}
            {invoice.status_pago === 'PAGADO' ? 'Marcar Pendiente' : 'Marcar Pagado'}
          </button>
          <button onClick={() => { onEdit(invoice); setIsOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-blue-50 transition-colors border-b border-slate-50">
            <Pencil size={16} className="text-indigo-500" /> Editar Registro
          </button>
          <button onClick={() => { onDelete(invoice.id); setIsOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors">
            <Trash2 size={16} /> Eliminar
          </button>
        </div>
      )}
    </div>
  );
};

// --- MODAL DE CONFIRMACIÓN ---
const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Aceptar", cancelText = "Cancelar", type = "info" }) => {
  if (!isOpen) return null;
  const colors = {
    danger: "bg-red-600 hover:bg-red-700 shadow-red-200",
    success: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200",
    info: "bg-blue-600 hover:bg-blue-700 shadow-blue-200"
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl p-8 text-center animate-in zoom-in duration-200 border border-slate-100">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${type === 'danger' ? 'bg-red-50 text-red-600' : (type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600')}`}>
           {type === 'danger' ? <Trash2 size={28} /> : (type === 'success' ? <CheckCircle size={28} /> : <Info size={28} />)}
        </div>
        <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-3 leading-tight">{title}</h3>
        <p className="text-slate-500 font-bold text-sm leading-relaxed mb-8">{message}</p>
        <div className="flex flex-col gap-3">
          <button onClick={() => { onConfirm(); onClose(); }} className={`w-full py-4 text-xs font-black uppercase rounded-xl text-white shadow-lg transition-all active:scale-95 tracking-widest ${colors[type] || colors.info}`}>{confirmText}</button>
          <button onClick={onClose} className="w-full py-3 text-xs font-black uppercase text-slate-400 hover:text-slate-600 tracking-widest transition-all">Regresar</button>
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
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => options.filter(opt => String(opt).toLowerCase().includes(searchTerm.toLowerCase())), [options, searchTerm]);
  const displayText = selectedValues.length === 0 ? placeholder : selectedValues.length === 1 ? selectedValues[0] : `${selectedValues.length} seleccionados`;

  return (
    <div className="relative text-left" ref={dropdownRef}>
      <label className="text-xs font-black text-slate-400 uppercase mb-2 block tracking-widest px-1 leading-none">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-white transition-all outline-none shadow-sm h-[46px]"
      >
        <span className="truncate">{displayText}</span>
        <ChevronDown size={14} className={`ml-2 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-[160] mt-2 w-full max-h-64 bg-white border border-slate-100 rounded-2xl shadow-2xl flex flex-col py-2 animate-in fade-in zoom-in duration-150">
          <div className="px-3 pb-2 pt-1 border-b border-slate-50 mb-1 sticky top-0 bg-white z-10">
            <input 
              type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Filtrar..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="overflow-y-auto max-h-48 scrollbar-hide px-1">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-5 text-xs text-slate-400 text-center italic">Sin resultados</div>
            ) : (
              filteredOptions.map((opt) => (
                <button
                  key={opt} type="button" onClick={() => {
                    if (selectedValues.includes(opt)) onChange(selectedValues.filter(v => v !== opt));
                    else onChange([...selectedValues, opt]);
                  }}
                  className="w-full flex items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 rounded-lg transition-colors text-left"
                >
                  <div className={`w-4 h-4 border rounded mr-3 flex items-center justify-center transition-colors ${selectedValues.includes(opt) ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'}`}>
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
        const jsonData = window.XLSX.utils.sheet_to_json(worksheet, { defval: "" });
        
        if (jsonData.length === 0) throw new Error("Archivo vacío");

        const grouped = jsonData.reduce((acc, curr) => {
          const provKey = (curr.proveedor || curr.Proveedor || "").toString().trim().toUpperCase();
          const folioKey = (curr.no_documento || curr.folio || "").toString().trim();
          if (!provKey || !folioKey) return acc;
          const key = `${provKey}-${folioKey}`;
          if (!acc[key]) acc[key] = [];
          acc[key].push({
            detalle: curr.detalle || curr.descripcion || "Producto",
            cantidad: parseFloat(curr.cantidad || 1),
            total_item: parseInt(curr.total_items || curr.total_linea || 0)
          });
          return acc;
        }, {});

        let successCount = 0;
        for (const [key, items] of Object.entries(grouped)) {
          const [prov, folio] = key.split('-');
          const neto = items.reduce((s, i) => s + i.total_item, 0);
          const { error } = await supabase.from('invoices')
            .update({ items, total_bruto: neto, iva: Math.round(neto*0.19), total_a_pagar: Math.round(neto*1.19) })
            .ilike('proveedor', prov).eq('no_documento', folio);
          if (!error) successCount++;
        }
        setStatus(`Sincronizados: ${successCount}`);
        setTimeout(() => { onImported(); onClose(); }, 1500);
      } catch (err) { setStatus(`Error: ${err.message}`); } finally { setLoading(false); }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl p-8 lg:p-10 relative border border-slate-100 max-h-[95vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 p-2.5 rounded-xl text-emerald-600"><FileSpreadsheet size={22}/></div>
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight leading-none">Importar Detalles</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-all active:scale-90"><X size={20}/></button>
        </div>

        {/* INSTRUCCIONES CLARAS REFINADAS */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 mb-8 space-y-6">
          <div className="space-y-3">
             <div className="flex items-center gap-2 text-blue-600">
               <CheckCircle size={18} className="shrink-0" />
               <p className="text-[11px] font-black uppercase tracking-widest">Columnas Obligatorias</p>
             </div>
             <div className="flex flex-wrap gap-2">
                {['proveedor', 'no_documento', 'detalle', 'cantidad', 'total_items'].map(col => (
                  <span key={col} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-black text-slate-600 tracking-tight shadow-sm">{col}</span>
                ))}
             </div>
          </div>

          <div className="space-y-3">
             <div className="flex items-center gap-2 text-blue-500">
                <AlertCircle size={18} className="shrink-0" />
                <p className="text-[11px] font-black uppercase tracking-widest">Restricción Contable</p>
             </div>
             <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl">
                <p className="text-xs font-bold text-gray-700 leading-relaxed">
                  El valor en <span className="font-black text-blue-500">total_items</span> debe ingresarse <span className="font-black text-blue-500">SIN IVA (Neto)</span>. El sistema calculará el impuesto automáticamente.
                </p>
             </div>
          </div>

          <a 
            href="/template-agricura.xlsx" 
            download 
            className="flex items-center justify-center gap-3 w-full py-4 bg-blue-500 text-white hover:bg-slate-800 rounded-xl transition-all active:scale-95 group shadow-lg"
          >
            <Download size={18} className="group-hover:translate-y-0.5 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">Descargar Template Oficial</span>
          </a>
        </div>

        <div className="space-y-6">
          <div className="relative group border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center bg-slate-50 hover:bg-blue-50 transition-all cursor-pointer">
            <input type="file" accept=".xlsx" onChange={(e) => setFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
            <Upload className="mx-auto text-slate-300 mb-4" size={40} />
            <p className="text-sm font-black text-slate-600 uppercase tracking-widest leading-tight">{file ? file.name : "Subir Archivo Excel"}</p>
            <p className="text-[10px] font-bold text-slate-400 mt-2">Arrastra tu archivo aquí o haz clic</p>
          </div>
          
          {status && (
            <div className={`p-4 rounded-xl text-center text-xs font-black uppercase tracking-widest ${status.includes('Error') ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600 animate-pulse'}`}>
              {status}
            </div>
          )}

          <button 
            disabled={!file || loading} onClick={processExcel}
            className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl uppercase tracking-widest text-[11px] active:scale-95 transition-all disabled:opacity-50 hover:bg-blue-700"
          >
            {loading ? 'Sincronizando Auditoría...' : 'Iniciar Carga de Datos'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MODAL DETALLE FACTURA ---
const InvoiceDetailModal = ({ invoice, onClose }) => {
  if (!invoice) return null;
  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-100">
        <div className="bg-slate-900 p-6 lg:p-8 flex justify-between items-center text-white shrink-0">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-xl shadow-lg"><Package size={22} /></div>
            <div>
              <h3 className="text-lg font-black uppercase tracking-tight leading-tight">#{invoice.no_documento}</h3>
              <p className="text-slate-400 text-xs font-black uppercase tracking-widest truncate max-w-[200px] lg:max-w-none">{invoice.proveedor}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-all active:scale-90"><X size={24}/></button>
        </div>
        <div className="p-6 lg:p-8 overflow-y-auto space-y-6 bg-white">
          <div className="grid grid-cols-2 gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100">
            <div><p className="text-[10px] font-black text-slate-400 uppercase mb-1.5 tracking-widest">Fecha Emisión</p><p className="font-mono text-sm font-bold text-slate-800">{invoice.fecha_emision}</p></div>
            <div><p className="text-[10px] font-black text-slate-400 uppercase mb-1.5 tracking-widest">Vencimiento</p><p className="font-mono text-sm font-bold text-slate-800">{invoice.fecha_venc}</p></div>
          </div>
          <div className="space-y-4">
            <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-50 pb-3 leading-none">Desglose de Productos</h4>
            <div className="space-y-2">
              {invoice.items && invoice.items.length > 0 ? invoice.items.map((it, idx) => (
                <div key={idx} className="flex justify-between items-center p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-sm font-bold text-slate-800 truncate uppercase tracking-tight">{it.detalle}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Cantidad: {it.cantidad}</p>
                  </div>
                  <p className="font-black text-slate-900 text-base font-mono tracking-tighter">${formatCLP(it.total_item)}</p>
                </div>
              )) : <p className="text-center py-8 text-slate-400 text-sm italic font-bold">Sin detalle registrado.</p>}
            </div>
          </div>
          <div className="bg-slate-900 p-8 lg:p-10 rounded-[2rem] text-white space-y-3 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 opacity-10 blur-[60px]"></div>
            <div className="flex justify-between items-center text-xs opacity-60 uppercase font-black border-b border-white/5 pb-2 tracking-widest"><span>Subtotal Neto</span><span>${formatCLP(invoice.total_bruto)}</span></div>
            <div className="flex justify-between items-center text-xs opacity-60 uppercase font-black border-b border-white/5 pb-2 tracking-widest"><span>IVA (19%)</span><span>${formatCLP(invoice.iva)}</span></div>
            <div className="pt-2 flex justify-between items-end">
              <span className="text-[10px] font-black uppercase text-blue-400 tracking-widest mb-1">Total a Pagar</span>
              <span className="text-3xl font-black font-mono tracking-tighter leading-none">${formatCLP(invoice.total_a_pagar)}</span>
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
  
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
      } catch (err) { console.error("Error al cargar dependencias contables:", err); }
    };
    initApp();
  }, []);

  if (!isReady) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white gap-6">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <h1 className="text-xl font-black tracking-widest uppercase animate-pulse">AGRICURA</h1>
    </div>
  );

  if (!session) return <Auth supabase={supabaseClient} onShowAlert={(m) => setConfirmModal({ isOpen: true, title: 'Error de Acceso', message: m, type: 'danger', onConfirm: () => {} })} />;

  return (
    <div className="h-screen bg-[#F1F5F9] flex flex-col lg:flex-row font-sans overflow-hidden">
      
      {/* HEADER MOBILE */}
      <header className="lg:hidden flex items-center justify-between px-6 py-4 bg-slate-900 text-white z-[100] shadow-xl shrink-0">
        <h1 className="text-lg font-black tracking-tighter uppercase">AGRICURA</h1>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-slate-800 rounded-xl transition-all active:scale-90"><Menu size={24} /></button>
      </header>

      {/* SIDEBAR OPTIMIZADO */}
      <aside className={`
        fixed inset-0 z-[200] transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:z-20
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        w-64 bg-slate-900 text-white flex flex-col shadow-2xl shrink-0
      `}>
        {/* BOTÓN CERRAR: Movido un poco más arriba para no estorbar el nav */}
        <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden absolute top-5 right-5 p-2 text-slate-400 hover:text-white transition-colors z-30"><X size={24} /></button>
        
        <div className="p-10 text-center hidden lg:block shrink-0">
          <h1 className="text-2xl font-black tracking-[0.15em] uppercase">AGRICURA</h1>
          <div className="h-1 w-8 bg-blue-600 mx-auto mt-2 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.6)]"></div>
        </div>
        
        {/* NAV: mt-20 en móvil para evitar solapamiento con el botón X */}
        <nav className="flex-1 px-5 space-y-2 mt-20 lg:mt-0 overflow-y-auto scrollbar-hide py-4">
          <button 
            onClick={() => { setCurrentView('dashboard'); setIsSidebarOpen(false); }} 
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-200 ${currentView === 'dashboard' ? 'bg-blue-600 shadow-lg shadow-blue-900/40 text-white font-bold' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
          >
            <LayoutDashboard size={22} /><span className="text-sm uppercase tracking-wider">Dashboard</span>
          </button>
          
          <button 
            onClick={() => { setCurrentView('form'); setInvoiceToEdit(null); setIsSidebarOpen(false); }} 
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-200 ${currentView === 'form' ? 'bg-blue-600 shadow-lg shadow-blue-900/40 text-white font-bold' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
          >
            <Plus size={22} /><span className="text-sm uppercase tracking-wider">Registrar</span>
          </button>

          <div className="pt-8 px-5 pb-4">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 leading-none">Herramientas</p>
            <button 
              onClick={() => { setIsImporting(true); setIsSidebarOpen(false); }} 
              className="w-full flex items-center gap-4 px-5 py-4 rounded-xl text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/10 transition-all"
            >
              <FileSpreadsheet size={22} /><span className="text-sm uppercase tracking-wider font-bold">Importar</span>
            </button>
          </div>
        </nav>

        <div className="p-6 bg-black/20 border-t border-white/5 flex flex-col gap-4 shrink-0">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-xs font-black shadow-lg">
              {session?.user?.email?.[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold truncate opacity-50 uppercase tracking-tighter mb-1 leading-none tracking-tighter leading-none mb-1">Usuario Activo</p>
              <p className="text-[11px] font-black truncate uppercase tracking-tighter mb-1 leading-none tracking-tighter leading-none">{session?.user?.email?.split('@')[0]}</p>
            </div>
          </div>
          <button onClick={() => supabaseClient.auth.signOut()} className="w-full py-3 bg-red-500/10 text-red-400 rounded-xl text-[14px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all border border-red-500/10">Cerrar Sesión</button>
        </div>
      </aside>

      {isSidebarOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] lg:hidden" onClick={() => setIsSidebarOpen(false)} />}

      <main className="flex-1 overflow-auto h-full relative bg-[#F8FAFC] flex flex-col">
        {/* CONTENEDOR FLUIDO CON MAX-WIDTH PARA PANTALLAS GRANDES */}
        <div className="flex-1 w-full max-w-[1600px] mx-auto">
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
        </div>
        {viewingInvoice && <InvoiceDetailModal invoice={viewingInvoice} onClose={() => setViewingInvoice(null)} />}
        {isImporting && <ExcelImportModal supabase={supabaseClient} onClose={() => setIsImporting(false)} onImported={() => window.location.reload()} />}
      </main>

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
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-6 py-12">
      <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden border border-white/10">
        <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter leading-tight">Agricura</h2>
          <p className="text-slate-400 font-black mt-2 uppercase tracking-widest text-[10px] leading-none">Gestión Contable Senior</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <div><label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700 text-sm focus:ring-4 focus:ring-blue-100 transition-all" placeholder="usuario@agricura.cl" required /></div>
          <div><label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700 text-sm focus:ring-4 focus:ring-blue-100 transition-all" placeholder="••••••••" required /></div>
          <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl shadow-xl uppercase tracking-widest text-[11px] active:scale-95 transition-all hover:bg-slate-800">{loading ? 'Validando...' : 'Entrar al Sistema'}</button>
        </form>
      </div>
    </div>
  );
}

function Dashboard({ supabase, onEdit, onViewDetail, onShowConfirm }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false); 
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [filters, setFilters] = useState({ search: '', providers: [], costCenters: [], types: [], status: [], startDate: '', endDate: '' });

  useEffect(() => { fetchInvoices(); }, []);

  const fetchInvoices = async () => {
    setLoading(true);
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
    } catch (e) { console.error("Error fetch:", e); } finally { setLoading(false); }
  };

  const toggleStatus = (id, currentStatus) => {
    const newStatus = currentStatus === 'PENDIENTE' ? 'PAGADO' : 'PENDIENTE';
    const newFechaPago = newStatus === 'PAGADO' ? new Date().toISOString() : null;

    onShowConfirm({
      title: 'Actualizar Estado',
      message: `¿Cambiar el estado del documento a ${newStatus}?`,
      onConfirm: async () => {
        // ACTUALIZACIÓN OPTIMISTA (Mejora inmediata de UX)
        setInvoices(prev => prev.map(inv => 
          inv.id === id ? { ...inv, status_pago: newStatus, fecha_pago: newFechaPago } : inv
        ));

        // Petición al backend en segundo plano
        const { error } = await supabase.from('invoices').update({ 
          status_pago: newStatus, 
          fecha_pago: newFechaPago 
        }).eq('id', id);

        if (error) {
          // Revertir si hay error y avisar
          console.error("Error backend:", error);
          fetchInvoices(); 
        }
      }
    });
  };

  const clearFilters = () => {
    setFilters({ search: '', providers: [], costCenters: [], types: [], status: [], startDate: '', endDate: '' });
    setCurrentPage(1);
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
      const matchesSearch = !filters.search || inv.proveedor?.toLowerCase().includes(filters.search.toLowerCase()) || inv.no_documento?.toString().includes(filters.search);
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
    <div className="p-6 md:p-8 lg:p-10 space-y-6 flex flex-col min-h-full">
      
      {/* HEADER DASHBOARD OPTIMIZADO */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl lg:text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">Panel de Auditoría</h2>
          <p className="text-slate-400 mt-1.5 text-[10px] lg:text-xs font-black uppercase tracking-[0.2em] leading-none">Filtrando {filteredInvoices.length} de {invoices.length} documentos totales</p>
        </div>
      </header>

      {/* STATS CARDS: GRID REFINADO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
        {[
          { label: 'Total Pendiente', val: stats.pend, color: 'rose' },
          { label: 'Total Pagado', val: stats.paid, color: 'emerald' },
          { label: 'Docs Filtrados', val: filteredInvoices.length, color: 'blue', raw: true },
          { label: 'Status Sistema', val: 'Conectado', color: 'emerald', text: true }
        ].map((card, i) => (
          <div key={i} className={`bg-white p-6 lg:p-8 rounded-3xl border-l-[8px] border-${card.color}-500 shadow-sm flex flex-col justify-center relative overflow-hidden group hover:shadow-xl transition-all duration-300`}>
            <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest leading-none mb-3">{card.label}</h3>
            <p className={`text-xl lg:text-2xl font-black ${card.color === 'emerald' ? 'text-emerald-600' : card.color === 'rose' ? 'text-rose-600' : 'text-slate-900'} truncate tracking-tight`}>
              {card.text ? card.val : (card.raw ? card.val : `$${formatCLP(card.val)}`)}
            </p>
          </div>
        ))}
      </div>

      {/* FILTROS: REESTRUCTURADOS PARA MEJOR ALINEACIÓN EN WEB */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <button 
          onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          className="lg:hidden w-full flex items-center justify-between px-6 py-5 hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-3 text-slate-800 font-black uppercase text-xs tracking-widest"><Settings2 size={18} className="text-blue-600"/> Filtros de Búsqueda</div>
          {isFiltersOpen ? <ChevronUp size={20} className="text-slate-400"/> : <ChevronDown size={20} className="text-slate-400"/>}
        </button>
        
        <div className={`transition-all duration-500 overflow-hidden ${isFiltersOpen ? 'max-h-[1200px] opacity-100' : 'max-h-0 lg:max-h-none opacity-0 lg:opacity-100 hidden lg:block'}`}>
          <div className="p-6 lg:p-8 space-y-8">
            
            {/* BOTÓN LIMPIAR PARA MÓVIL (TOP) */}
            <div className="lg:hidden flex justify-end">
               <button onClick={clearFilters} className="text-[10px] font-black uppercase text-blue-600 tracking-widest flex items-center gap-2 py-2 px-4 bg-blue-50 rounded-xl active:scale-95 transition-all">
                 <RotateCcw size={14} /> Reiniciar Filtros
               </button>
            </div>

            {/* Fila 1: Búsqueda */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              <input 
                value={filters.search} onChange={e => {setFilters({...filters, search: e.target.value}); setCurrentPage(1);}} 
                placeholder="Proveedor, Folio o Glosa..." 
                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-blue-100 transition-all shadow-sm" 
              />
            </div>
            
            {/* Fila 2: Selectores Principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <MultiSelect label="Proveedor" options={filterOptions.providers} selectedValues={filters.providers} onChange={(vals) => {setFilters({...filters, providers: vals}); setCurrentPage(1);}} placeholder="Todos" />
              <MultiSelect label="C. Costo" options={filterOptions.costCenters} selectedValues={filters.costCenters} onChange={(vals) => {setFilters({...filters, costCenters: vals}); setCurrentPage(1);}} placeholder="Todos" />
              <MultiSelect label="Tipo Doc" options={filterOptions.types} selectedValues={filters.types} onChange={(vals) => {setFilters({...filters, types: vals}); setCurrentPage(1);}} placeholder="Todos" />
            </div>

            {/* Fila 3: Rango de Fechas + BOTÓN LIMPIAR DESKTOP (Basado en imagen 627631.png) */}
            <div className="pt-6 border-t border-slate-50">
              <div className="flex flex-col md:flex-row items-end gap-6 w-full">
                <div className="w-full md:w-64 space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase mb-2 block tracking-widest px-1 leading-none">Emisión Desde</label>
                  <input 
                    type="date" 
                    value={filters.startDate} 
                    onChange={e => {setFilters({...filters, startDate: e.target.value}); setCurrentPage(1);}} 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none shadow-sm hover:bg-white focus:ring-4 focus:ring-blue-100 transition-all h-[46px]" 
                  />
                </div>
                <div className="w-full md:w-64 space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase mb-2 block tracking-widest px-1 leading-none">Emisión Hasta</label>
                  <input 
                    type="date" 
                    value={filters.endDate} 
                    onChange={e => {setFilters({...filters, endDate: e.target.value}); setCurrentPage(1);}} 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none shadow-sm hover:bg-white focus:ring-4 focus:ring-blue-100 transition-all h-[46px]" 
                  />
                </div>
                
                {/* BOTÓN LIMPIAR DESKTOP (Ref: image_627631.png) */}
                <div className="hidden md:block ml-auto">
                   <button 
                    onClick={clearFilters} 
                    className="bg-[#4F6EF7] hover:bg-[#3D5CD9] text-white px-8 h-[46px] rounded-xl flex items-center gap-3 shadow-lg shadow-blue-200 transition-all active:scale-95"
                   >
                     <LayoutDashboard size={20} strokeWidth={2.5} />
                     <span className="text-[12px] font-black uppercase tracking-[0.15em]">Limpiar Filtros</span>
                   </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABLA: RESPONSIVIDAD MEJORADA */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 flex flex-col flex-1 overflow-hidden min-h-[450px]">
        {/* Vista Escritorio (Table) */}
        <div className="hidden lg:block overflow-x-auto flex-1 scrollbar-hide">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 shadow-sm bg-slate-900 text-white">
              <tr className="text-[10px] uppercase font-black tracking-[0.15em]">
                <th className="p-6">Proveedor / Folio</th>
                <th className="p-6">Emisión</th>
                <th className="p-6">Vencimiento</th>
                <th className="p-6">C. Costo</th>
                <th className="p-6 text-center">Monto</th>
                <th className="p-6 text-center">Estado</th>
                <th className="p-6 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-[13px]">
              {paginatedInvoices.map((inv) => {
                const isOverdue = inv.status_pago === 'PENDIENTE' && todayStr > inv.fecha_venc;
                const hasItems = inv.items && Array.isArray(inv.items) && inv.items.length > 0;
                return (
                  <tr key={inv.id} className={`hover:bg-blue-50/40 transition-all duration-200 group ${isOverdue ? 'bg-red-50/10' : ''}`}>
                    <td className="p-6">
                      <p className="font-black text-slate-800 uppercase tracking-tight leading-tight mb-1">{inv.proveedor}</p>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-400 text-[10px]">#{inv.no_documento}</span>
                        <span className="text-[9px] font-black text-blue-500 uppercase bg-blue-50 px-2 py-0.5 rounded">{inv.tipo_doc}</span>
                      </div>
                    </td>
                    <td className="p-6 font-mono text-slate-500 font-bold">{inv.fecha_emision}</td>
                    <td className={`p-6 font-mono font-bold ${isOverdue ? 'text-red-600' : 'text-slate-500'}`}>{inv.fecha_venc}</td>
                    <td className="p-6">
                      <span className="bg-slate-50 border border-slate-200 text-slate-700 text-[10px] px-2.5 py-1 rounded-lg font-black uppercase">{inv.centro_costo || 'N/A'}</span>
                    </td>
                    <td className={`p-6 text-right font-black font-mono text-base tracking-tighter ${Number(inv.total_a_pagar) < 0 ? 'text-red-600' : 'text-slate-900'}`}>
                      ${formatCLP(inv.total_a_pagar)}
                    </td>
                    <td className="p-6 text-center">
                      <span className={`w-24 py-1.5 rounded-lg text-[9px] font-black uppercase inline-flex items-center justify-center shadow-sm ${isOverdue ? 'bg-red-600 text-white shadow-red-200' : (inv.status_pago === 'PAGADO' ? 'bg-emerald-600 text-white shadow-emerald-200' : 'bg-slate-100 text-slate-500')}`}>
                        {isOverdue ? 'VENCIDA' : inv.status_pago}
                      </span>
                    </td>
                    <td className="p-6 text-center">
                      <div className="flex items-center justify-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onViewDetail(inv)} className={`p-2 transition-all hover:scale-110 ${hasItems ? 'text-blue-600' : 'text-slate-300'}`} title="Ver Detalle">
                          <Search size={18} strokeWidth={hasItems ? 3 : 2} />
                        </button>
                        <button onClick={() => toggleStatus(inv.id, inv.status_pago)} className="p-2 text-slate-400 hover:text-emerald-600 transition-all hover:scale-110" title="Cambiar Estado"><CheckCircle size={18} /></button>
                        <button onClick={() => onEdit(inv)} className="p-2 text-slate-400 hover:text-indigo-600 transition-all hover:scale-110" title="Editar"><Pencil size={18} /></button>
                        <button onClick={() => onShowConfirm({ title: 'Eliminar Documento', message: '¿Confirmas la eliminación permanente?', onConfirm: async () => { await supabase.from('invoices').delete().eq('id', inv.id); fetchInvoices(); }, type: 'danger' })} className="p-2 text-red-200 hover:text-red-600 transition-all hover:scale-110" title="Eliminar"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Vista Móvil: Compacta con Texto Legible */}
        <div className="lg:hidden flex-1 overflow-y-auto divide-y divide-slate-50 scrollbar-hide">
          {paginatedInvoices.map((inv) => {
            const isOverdue = inv.status_pago === 'PENDIENTE' && todayStr > inv.fecha_venc;
            const displayProvider = inv.proveedor.length > 15 
              ? inv.proveedor.substring(0, 15).toUpperCase() + ".." 
              : inv.proveedor.toUpperCase();

            return (
              <div key={inv.id} className={`p-4 flex items-center justify-between gap-3 active:bg-slate-50 transition-all ${isOverdue ? 'bg-red-50/5' : ''}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${isOverdue ? 'bg-red-500 animate-pulse' : (inv.status_pago === 'PAGADO' ? 'bg-emerald-500' : 'bg-slate-300')}`}></div>
                    <h4 className="font-black text-slate-800 text-[13px] uppercase truncate tracking-tight">{displayProvider}</h4>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                    <span className="font-mono">#{inv.no_documento}</span>
                    <span className="text-[9px] uppercase px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 font-black">{inv.tipo_doc}</span>
                  </div>
                </div>
                
                <div className="text-right shrink-0">
                  <p className={`font-black font-mono text-base tracking-tighter leading-none ${Number(inv.total_a_pagar) < 0 ? 'text-red-600' : 'text-slate-900'}`}>
                    ${formatCLP(inv.total_a_pagar)}
                  </p>
                  <p className={`text-[9px] font-black uppercase mt-1 tracking-widest leading-none ${isOverdue ? 'text-red-500' : 'text-slate-300'}`}>{inv.fecha_venc}</p>
                </div>

                <div className="shrink-0 border-l border-slate-50 pl-1">
                  <MobileActionMenu invoice={inv} onEdit={onEdit} onView={onViewDetail} onToggleStatus={toggleStatus} onDelete={() => onShowConfirm({ title: 'Eliminar Registro', message: '¿Eliminar este registro?', onConfirm: async () => { await supabase.from('invoices').delete().eq('id', inv.id); fetchInvoices(); }, type: 'danger' })} />
                </div>
              </div>
            );
          })}
        </div>

        {/* PAGINACIÓN REFINADA */}
        {totalPages > 1 && (
          <div className="px-6 py-5 lg:px-8 border-t border-slate-50 bg-slate-50/50 flex items-center justify-between shrink-0">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Pág {currentPage} / {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => {setCurrentPage(p => Math.max(p - 1, 1)); window.scrollTo(0,0);}} disabled={currentPage === 1} className="p-2.5 bg-white border border-slate-200 rounded-lg shadow-sm disabled:opacity-30 active:scale-90 transition-all"><ChevronLeft size={18}/></button>
              <button onClick={() => {setCurrentPage(p => Math.min(p + 1, totalPages)); window.scrollTo(0,0);}} disabled={currentPage === totalPages} className="p-2.5 bg-white border border-slate-200 rounded-lg shadow-sm disabled:opacity-30 active:scale-90 transition-all"><ChevronRight size={18}/></button>
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
           ? invoiceToEdit.items : [{ detalle: '', cantidad: 1, total_item: 0 }] 
  });

  const [focusField, setFocusField] = useState(null);

  const calculateTotals = (items, netoManual = null) => {
    const neto = items.length > 0 && items[0].detalle !== ''
      ? items.reduce((sum, it) => sum + (Number(it.total_item) || 0), 0)
      : (netoManual !== null ? Number(netoManual) : Number(formData.total_bruto) || 0);
    const iva = Math.round(neto * 0.19);
    return { neto, iva, total: neto + iva };
  };

  const handleItemChange = (idx, field, value) => {
    const newItems = [...formData.items];
    newItems[idx] = { ...newItems[idx], [field]: value };
    const { neto, iva, total } = calculateTotals(newItems);
    setFormData({ ...formData, items: newItems, total_bruto: neto, iva, total_a_pagar: total });
  };

  const handleGeneralChange = (e) => {
    const { name, value } = e.target;
    if (name === 'total_bruto') {
      const { neto, iva, total } = calculateTotals([], value);
      setFormData({...formData, total_bruto: neto, iva, total_a_pagar: total});
    } else if (name === 'iva') {
      const ivaVal = Number(value) || 0;
      setFormData({...formData, iva: ivaVal, total_a_pagar: Number(formData.total_bruto) + ivaVal});
    } else {
      setFormData({...formData, [name]: value});
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const payload = { ...formData, items: formData.items.filter(it => it.detalle.trim() !== ""), created_by: user.id };
      let res = invoiceToEdit ? await supabase.from('invoices').update(payload).eq('id', invoiceToEdit.id) : await supabase.from('invoices').insert([payload]);
      if (res.error) throw res.error;
      onSuccess();
    } catch (err) { onShowConfirm({ title: 'Error de Guardado', message: err.message, type: 'danger', onConfirm: () => {} }); }
    finally { setLoading(false); }
  };

  const hasItems = formData.items.some(i => i.detalle.trim() !== "");

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-center gap-4">
        <button onClick={onSuccess} className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all active:scale-90"><ChevronLeft size={22}/></button>
        <div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter leading-none">{invoiceToEdit ? 'Editar Registro' : 'Nuevo Documento'}</h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1 leading-none">Formulario de Auditoría Contable</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="bg-white p-8 lg:p-10 rounded-[2rem] shadow-sm border border-slate-100 space-y-10">
        <div className="space-y-4">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest block px-1 leading-none">Proveedor y Datos Básicos</label>
          <input name="proveedor" value={formData.proveedor} onChange={handleGeneralChange} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-black uppercase text-base lg:text-lg focus:ring-4 focus:ring-blue-100 transition-all outline-none" placeholder="Nombre del Proveedor" required />
          
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
             <div className="col-span-2 lg:col-span-1 space-y-1.5">
               <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Folio / Número</label>
               <input name="no_documento" value={formData.no_documento} onChange={handleGeneralChange} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-bold text-sm outline-none transition-all focus:bg-white" placeholder="Folio #" required />
             </div>
             
             {/* AJUSTE: Etiquetas de Fecha Claras */}
             <div className="space-y-1.5">
               <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Fecha Emisión</label>
               <input type="date" name="fecha_emision" value={formData.fecha_emision} onChange={handleGeneralChange} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-bold text-sm outline-none transition-all focus:bg-white" required />
             </div>
             <div className="space-y-1.5">
               <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Vencimiento</label>
               <input type="date" name="fecha_venc" value={formData.fecha_venc} onChange={handleGeneralChange} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-bold text-sm outline-none transition-all focus:bg-white" required />
             </div>
          </div>
        </div>

        <div className="space-y-4 pt-6 border-t border-slate-100">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-3 leading-none"><Package size={18} className="text-blue-600"/> Detalle de Productos</h3>
          <div className="space-y-6">
            {formData.items.map((it, idx) => (
              <div key={idx} className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4 relative group hover:bg-white hover:shadow-md transition-all">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Descripción del Ítem</label>
                  <input value={it.detalle} onChange={(e) => handleItemChange(idx, 'detalle', e.target.value)} className="w-full bg-white border border-slate-200 p-3.5 rounded-xl text-sm font-bold uppercase outline-none focus:ring-2 focus:ring-blue-500 shadow-sm" placeholder="Descripción de la línea..." />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Cantidad</label>
                    <input type="number" step="0.01" value={it.cantidad} onChange={(e) => handleItemChange(idx, 'cantidad', e.target.value)} className="w-full bg-white border border-slate-200 p-3 rounded-xl text-sm text-center font-bold outline-none" placeholder="Cant." />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-emerald-600 uppercase tracking-widest px-1">Total (Sin IVA)</label>
                    <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl flex items-center h-[46px]">
                      <span className="text-emerald-700 font-black mr-1">$</span>
                      <input 
                        type={focusField === `i-${idx}` ? "number" : "text"}
                        value={focusField === `i-${idx}` ? it.total_item : formatCLP(it.total_item)}
                        onChange={(e) => handleItemChange(idx, 'total_item', e.target.value)}
                        onFocus={() => setFocusField(`i-${idx}`)} onBlur={() => setFocusField(null)}
                        className="w-full bg-transparent text-right font-black text-emerald-800 text-sm font-mono outline-none" 
                      />
                    </div>
                  </div>
                </div>
                {formData.items.length > 1 && (
                  <button type="button" onClick={() => setFormData({...formData, items: formData.items.filter((_,i) => i !== idx)})} className="absolute -top-2 -right-2 bg-white shadow-lg text-red-500 rounded-full p-1 border border-red-50 transition-transform hover:scale-110"><MinusCircle size={22}/></button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => setFormData({...formData, items: [...formData.items, {detalle: '', cantidad: 1, total_item: 0}]})} className="w-full py-4 border-2 border-dashed border-slate-200 rounded-xl text-[10px] font-black uppercase text-slate-400 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all duration-300 shadow-sm">+ Agregar Nueva Línea</button>
          </div>
        </div>

        <div className="bg-slate-900 p-8 lg:p-12 rounded-[2.5rem] grid grid-cols-1 md:grid-cols-3 gap-6 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-blue-600 opacity-10 blur-[80px]"></div>
          <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-center md:text-left leading-none px-1">Total Neto (Sumatoria)</label><input name="total_bruto" type={focusField === 'neto' ? "number" : "text"} value={focusField === 'neto' ? formData.total_bruto : formatCLP(formData.total_bruto)} onChange={handleGeneralChange} onFocus={() => setFocusField('neto')} onBlur={() => setFocusField(null)} className={`w-full bg-white/5 border border-white/10 rounded-xl p-4 font-black text-xl text-white font-mono text-center md:text-left outline-none ${hasItems ? 'opacity-40 pointer-events-none' : ''}`} required readOnly={hasItems} /></div>
          <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-center md:text-left leading-none px-1">Impuesto IVA (19%)</label><input name="iva" type={focusField === 'iva' ? "number" : "text"} value={focusField === 'iva' ? formData.iva : formatCLP(formData.iva)} onChange={handleGeneralChange} onFocus={() => setFocusField('iva')} onBlur={() => setFocusField(null)} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 font-black text-xl text-blue-400 font-mono text-center md:text-left outline-none" /></div>
          <div className="flex flex-col justify-center pt-2 md:pt-6"><div className="bg-blue-600 p-6 rounded-2xl text-center md:text-right font-mono text-xl xl:text-xl font-black text-white leading-none shadow-3xl shadow-blue-900/40 border border-white/10 tracking-tighter">${formatCLP(formData.total_a_pagar)}</div></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest px-1 block">Centro de Costo</label><input name="centro_costo" value={formData.centro_costo} onChange={handleGeneralChange} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl outline-none font-bold uppercase text-xs transition-all focus:bg-white" placeholder="EJ: AGRÍCOLA CENTRAL" /></div>
          <div><label className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest px-1 block">Categoría</label><input name="item" value={formData.item} onChange={handleGeneralChange} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl outline-none font-bold uppercase text-xs transition-all focus:bg-white" placeholder="EJ: INSUMOS QUÍMICOS" /></div>
        </div>

        <div className="flex flex-col md:flex-row justify-end gap-3 pt-6">
          <button type="button" onClick={onSuccess} className="w-full md:w-auto px-8 py-3.5 text-xs font-black uppercase text-slate-400 tracking-widest hover:text-slate-600 transition-all rounded-xl order-2 md:order-1">Cancelar</button>
          <button type="submit" disabled={loading} className="w-full px-12 py-4 bg-blue-600 text-white font-black rounded-xl uppercase tracking-widest text-[11px] shadow-xl shadow-blue-200 active:scale-95 transition-all hover:bg-blue-700 order-1 md:order-2">{loading ? 'Procesando...' : 'Guardar Documento'}</button>
        </div>
      </form>
    </div>
  );
}