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
        className="p-2.5 hover:bg-slate-100 rounded-xl transition-all text-slate-500 active:scale-[0.98]"
      >
        <MoreVertical size={20} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-52 bg-white rounded-xl shadow-lg shadow-slate-200/50 border border-slate-200/60 py-1 z-[150]">
          <button onClick={() => { onView(invoice); setIsOpen(false); }} className="w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors">
            <Search size={16} className={hasItems ? "text-blue-500" : "text-slate-400"} /> Ver Detalles
          </button>
          <button onClick={() => { onToggleStatus(invoice.id, invoice.status_pago); setIsOpen(false); }} className="w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            {invoice.status_pago === 'PAGADO' ? <Clock size={16} className="text-amber-500" /> : <CheckCircle size={16} className="text-emerald-500" />}
            {invoice.status_pago === 'PAGADO' ? 'Marcar Pendiente' : 'Marcar Pagado'}
          </button>
          <button onClick={() => { onEdit(invoice); setIsOpen(false); }} className="w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            <Pencil size={16} className="text-indigo-500" /> Editar Registro
          </button>
          <div className="h-px bg-slate-100 my-1 mx-3"></div>
          <button onClick={() => { onDelete(invoice.id); setIsOpen(false); }} className="w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors">
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
    danger: "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200 focus:ring-rose-100",
    success: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200 focus:ring-emerald-100",
    info: "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 focus:ring-blue-100"
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl p-6 text-center animate-in zoom-in duration-200 border border-slate-200/60">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${type === 'danger' ? 'bg-rose-50 text-rose-600' : (type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600')}`}>
           {type === 'danger' ? <Trash2 size={22} /> : (type === 'success' ? <CheckCircle size={22} /> : <Info size={22} />)}
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-1.5">{title}</h3>
        <p className="text-slate-500 font-medium text-sm leading-relaxed mb-6">{message}</p>
        <div className="flex flex-col gap-2.5">
          <button onClick={() => { onConfirm(); onClose(); }} className={`w-full py-2.5 px-5 text-sm font-semibold rounded-lg shadow-sm outline-none transition-all active:scale-[0.98] ${colors[type] || colors.info}`}>{confirmText}</button>
          <button onClick={onClose} className="w-full py-2.5 px-5 text-sm font-medium rounded-lg text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all active:scale-[0.98] outline-none">{cancelText}</button>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTE DE SELECCIÓN MÚLTIPLE ---
const MultiSelect = ({ label, options, selectedValues, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownStyle, setDropdownStyle] = useState({});
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  const openDropdown = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + 6,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
      });
    }
    setIsOpen(true);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        buttonRef.current && !buttonRef.current.contains(event.target) &&
        dropdownRef.current && !dropdownRef.current.contains(event.target)
      ) setIsOpen(false);
    };
    const handleScroll = () => { if (isOpen) setIsOpen(false); };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen]);

  const filteredOptions = useMemo(() => options.filter(opt => String(opt).toLowerCase().includes(searchTerm.toLowerCase())), [options, searchTerm]);
  const displayText = selectedValues.length === 0 ? placeholder : selectedValues.length === 1 ? selectedValues[0] : `${selectedValues.length} seleccionados`;

  return (
    <div className="relative text-left w-full">
      <label className="text-xs font-semibold text-slate-500 uppercase mb-2 block tracking-wide px-1">{label}</label>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => isOpen ? setIsOpen(false) : openDropdown()}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
      >
        <span className="truncate">{displayText}</span>
        <ChevronDown size={18} className={`ml-2 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div ref={dropdownRef} style={dropdownStyle} className="max-h-72 bg-white border border-slate-200/60 rounded-xl shadow-lg shadow-slate-200/50 flex flex-col p-1 animate-in fade-in zoom-in duration-150">
          <div className="p-1.5 sticky top-0 bg-white z-10">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          <div className="overflow-y-auto max-h-48 scrollbar-hide p-1">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-6 text-sm text-slate-500 text-center font-medium">Sin resultados</div>
            ) : (
              filteredOptions.map((opt) => (
                <button
                  key={opt} type="button" onClick={() => {
                    if (selectedValues.includes(opt)) onChange(selectedValues.filter(v => v !== opt));
                    else onChange([...selectedValues, opt]);
                  }}
                  className="w-full flex items-center px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors text-left mb-0.5"
                >
                  <div className={`w-4 h-4 border rounded-sm mr-3 flex items-center justify-center transition-colors ${selectedValues.includes(opt) ? 'bg-blue-600 border-blue-600' : 'bg-slate-100 border-slate-300'}`}>
                    {selectedValues.includes(opt) && <Check size={12} className="text-white" />}
                  </div>
                  <span className={selectedValues.includes(opt) ? 'font-semibold text-slate-900' : 'font-medium text-slate-600'}>{opt}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- INPUT DE FECHA CON PLACEHOLDER PERSONALIZADO ---
const DateInput = ({ value, onChange, className }) => (
  <div className="relative">
    <input
      type="date"
      value={value}
      onChange={onChange}
      className={`${className} ${!value ? '[color:transparent]' : ''}`}
    />
    {!value && (
      <span className="absolute inset-0 flex items-center px-4 text-slate-400 text-sm font-medium pointer-events-none select-none">
        dd/mm/yyyy
      </span>
    )}
  </div>
);

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
        setStatus(`Sincronizados: ${successCount} documentos`);
        setTimeout(() => { onImported(); onClose(); }, 1500);
      } catch (err) { setStatus(`Error: ${err.message}`); } finally { setLoading(false); }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl p-6 lg:p-7 relative border border-slate-200/60 max-h-[95vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-2 rounded-lg text-blue-600"><FileSpreadsheet size={20}/></div>
            <h3 className="text-base font-bold text-slate-900">Importar Detalles</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-all active:scale-[0.98] text-slate-400"><X size={18}/></button>
        </div>

        {/* INSTRUCCIONES CLARAS REFINADAS */}
        <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-5 mb-5 space-y-5">
          <div className="space-y-3">
             <div className="flex items-center gap-2 text-blue-600">
               <CheckCircle size={16} className="shrink-0" />
               <p className="text-xs font-semibold uppercase tracking-wide">Columnas Obligatorias</p>
             </div>
             <div className="flex flex-wrap gap-2">
                {['proveedor', 'no_documento', 'detalle', 'cantidad', 'total_items'].map(col => (
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
            <p className="text-sm font-medium text-slate-700 truncate px-4 max-w-full">{file ? file.name : "Subir Archivo Excel"}</p>
            <p className="text-xs text-slate-400 mt-0.5">Arrastra o haz clic aquí</p>
          </label>
          
          {status && (
            <div className={`p-3.5 rounded-xl text-center text-sm font-medium ${status.includes('Error') ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-blue-50 text-blue-700 border border-blue-100 animate-pulse'}`}>
              {status}
            </div>
          )}

          <button 
            disabled={!file || loading} onClick={processExcel}
            className="w-full bg-blue-600 text-white font-semibold py-2.5 px-5 rounded-lg shadow-sm shadow-blue-600/20 hover:shadow-md hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none text-sm flex justify-center items-center gap-2"
          >
            {loading ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Procesando...</>
            ) : 'Iniciar Carga de Datos'}
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
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200/60">
        <div className="bg-white border-b border-slate-100 p-5 lg:p-6 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600"><Package size={20} /></div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                #{invoice.no_documento}
                <span className="text-xs uppercase font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md tracking-wide">{invoice.tipo_doc}</span>
              </h3>
              <p className="text-slate-500 text-sm font-medium truncate max-w-[200px] lg:max-w-none mt-0.5">{invoice.proveedor}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-lg transition-all active:scale-[0.98]"><X size={18}/></button>
        </div>
        
        <div className="p-5 lg:p-6 overflow-y-auto space-y-6 bg-slate-50/30">
          <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase mb-1 tracking-wide">Fecha Emisión</p>
              <p className="font-mono text-sm font-semibold text-slate-800">{invoice.fecha_emision}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase mb-1 tracking-wide">Vencimiento</p>
              <p className={`font-mono text-sm font-semibold ${new Date().toISOString().split('T')[0] > invoice.fecha_venc && invoice.status_pago === 'PENDIENTE' ? 'text-rose-600' : 'text-slate-800'}`}>{invoice.fecha_venc}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide border-b border-slate-100 pb-2">Desglose de Productos</h4>
            <div className="space-y-3">
              {invoice.items && invoice.items.length > 0 ? invoice.items.map((it, idx) => (
                <div key={idx} className="flex justify-between items-center p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:border-slate-200 transition-colors">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-sm font-semibold text-slate-800 truncate mb-0.5">{it.detalle}</p>
                    <p className="text-xs text-slate-500 font-medium">Cant: {it.cantidad}</p>
                  </div>
                  <p className="font-bold text-slate-900 text-base font-mono">${formatCLP(it.total_item)}</p>
                </div>
              )) : (
                <div className="text-center py-10 bg-white rounded-xl border border-dashed border-slate-200">
                  <p className="text-slate-400 text-sm font-medium">Sin detalle de productos registrado.</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-slate-900 p-5 rounded-xl text-white space-y-3 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500 rounded-full opacity-15 blur-3xl"></div>
            <div className="flex justify-between items-center text-sm font-medium opacity-80 border-b border-white/10 pb-3">
              <span>Subtotal Neto</span><span>${formatCLP(invoice.total_bruto)}</span>
            </div>
            <div className="flex justify-between items-center text-sm font-medium opacity-80 border-b border-white/10 pb-3">
              <span>IVA (19%)</span><span>${formatCLP(invoice.iva)}</span>
            </div>
            <div className="pt-2 flex justify-between items-end relative z-10">
              <span className="text-xs font-semibold uppercase text-blue-300 tracking-wide">Total a Pagar</span>
              <span className="text-xl font-bold font-mono tracking-tight">${formatCLP(invoice.total_a_pagar)}</span>
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white gap-5">
      <div className="w-12 h-12 border-[3px] border-blue-500/30 border-t-blue-400 rounded-full animate-spin"></div>
      <div className="text-center">
        <h1 className="text-lg font-bold tracking-[0.2em] uppercase">Agricura</h1>
        <p className="text-xs text-slate-500 mt-1 font-medium">Cargando sistema...</p>
      </div>
    </div>
  );

  if (!session) return <Auth supabase={supabaseClient} onShowAlert={(m) => setConfirmModal({ isOpen: true, title: 'Error de Acceso', message: m, type: 'danger', onConfirm: () => {} })} />;

  return (
    <div className="h-screen bg-slate-50 flex flex-col lg:flex-row font-sans overflow-hidden text-slate-800">
      
      {/* HEADER MOBILE */}
      <header className="lg:hidden flex items-center justify-between px-5 py-3 bg-white border-b border-slate-200 z-[100] shrink-0">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
             <LayoutDashboard size={18} className="text-white"/>
           </div>
           <h1 className="text-base font-bold tracking-tight text-slate-900">AGRICURA</h1>
        </div>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-all"><Menu size={22} /></button>
      </header>

      {/* SIDEBAR OPTIMIZADO */}
      <aside className={`
        fixed inset-0 z-[200] transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:z-20
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        w-64 bg-slate-900 text-white flex flex-col shadow-2xl lg:shadow-none shrink-0
      `}>
        {/* BOTÓN CERRAR */}
        <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden absolute top-4 right-4 p-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all active:scale-[0.98] z-30"><X size={18} /></button>
        
        <div className="p-6 hidden lg:flex flex-col items-center shrink-0 border-b border-white/5">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 mb-3">
            <LayoutDashboard size={20} className="text-white"/>
          </div>
          <h1 className="text-base font-bold tracking-[0.15em] uppercase">AGRICURA</h1>
        </div>
        
        {/* NAV */}
        <nav className="flex-1 px-3 space-y-1 mt-16 lg:mt-3 overflow-y-auto scrollbar-hide py-3">
          <button 
            onClick={() => { setCurrentView('dashboard'); setIsSidebarOpen(false); }} 
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium ${currentView === 'dashboard' ? 'bg-blue-600 shadow-md shadow-blue-600/20 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
          >
            <LayoutDashboard size={18} /><span>Panel Contable</span>
          </button>

          <div className="pt-5 px-1 pb-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2.5">Herramientas</p>
            <button 
              onClick={() => { setCurrentView('form'); setInvoiceToEdit(null); setIsSidebarOpen(false); }} 
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium ${currentView === 'form' ? 'bg-blue-600 shadow-md shadow-blue-600/20 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
            >
              <Plus size={20} /><span>Registrar Documento</span>
            </button>
            <button 
              onClick={() => { setIsImporting(true); setIsSidebarOpen(false); }} 
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-all active:scale-[0.98] text-sm font-medium"
            >
              <FileSpreadsheet size={20} /><span>Importar Datos</span>
            </button>
          </div>
        </nav>

        <div className="p-4 bg-slate-950/50 border-t border-white/5 flex flex-col gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-xs font-bold text-slate-300">
              {session?.user?.email?.[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{session?.user?.email?.split('@')[0]}</p>
              <p className="text-xs font-medium text-slate-500 truncate">Administrador</p>
            </div>
          </div>
          <button onClick={() => supabaseClient.auth.signOut()} className="w-full flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-rose-500/10 hover:text-rose-400 text-slate-500 rounded-lg text-xs font-medium transition-all active:scale-[0.98]">
            <LogOut size={14} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {isSidebarOpen && <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[150] lg:hidden" onClick={() => setIsSidebarOpen(false)} />}

      <main className="flex-1 overflow-auto h-full relative bg-slate-50 flex flex-col">
        {/* CONTENEDOR FLUIDO CON MAX-WIDTH */}
        <div className="flex-1 w-full max-w-[1600px] mx-auto p-4 lg:p-8">
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50/30 px-4 py-12">
      <div className="max-w-sm w-full bg-white p-8 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/60 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500"></div>
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4 text-blue-600 shadow-sm">
            <LayoutDashboard size={28} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Agricura</h2>
          <p className="text-slate-400 font-medium mt-1 text-sm">Control Contable</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5 px-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none font-medium text-slate-800 text-sm focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all" placeholder="usuario@agricura.cl" required />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5 px-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none font-medium text-slate-800 text-sm focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all" placeholder="••••••••" required />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-semibold py-2.5 px-6 rounded-lg shadow-sm shadow-blue-600/20 hover:bg-blue-700 hover:shadow-md text-sm active:scale-[0.98] transition-all mt-1 flex justify-center items-center gap-2">
            {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Validando...</> : 'Ingresar al Sistema'}
          </button>
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
        setInvoices(prev => prev.map(inv => 
          inv.id === id ? { ...inv, status_pago: newStatus, fecha_pago: newFechaPago } : inv
        ));

        const { error } = await supabase.from('invoices').update({ 
          status_pago: newStatus, 
          fecha_pago: newFechaPago 
        }).eq('id', id);

        if (error) {
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
    <div className="space-y-6 flex flex-col min-h-full">
      
      {/* HEADER DASHBOARD OPTIMIZADO */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-1">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">Panel de Control</h2>
          <p className="text-slate-500 mt-1.5 text-sm font-medium">Mostrando {filteredInvoices.length} de {invoices.length} documentos</p>
        </div>
      </header>

      {/* STATS CARDS */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-4">
        {[
          { label: 'Total Pendiente', val: stats.pend, color: 'rose', icon: <Clock size={18} /> },
          { label: 'Total Pagado', val: stats.paid, color: 'emerald', icon: <CheckCircle size={18} /> },
          { label: 'Docs Filtrados', val: filteredInvoices.length, color: 'blue', raw: true, icon: <FileText size={18} /> },
          { label: 'Sistema', val: 'Conectado', color: 'emerald', text: true, icon: <Wallet size={18} /> }
        ].map((card, i) => (
          <div key={i} className="bg-white p-4 lg:p-5 rounded-xl border border-slate-200/60 flex items-start gap-3 hover:shadow-md hover:border-slate-200 transition-all duration-200 group">
            <div className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${card.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : card.color === 'rose' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>
              {card.icon}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-slate-400 mb-0.5 truncate">{card.label}</p>
              <p className={`text-lg lg:text-xl font-bold truncate ${card.color === 'emerald' ? 'text-emerald-600' : card.color === 'rose' ? 'text-rose-600' : 'text-slate-800'}`}>
                {card.text ? card.val : (card.raw ? card.val : `$${formatCLP(card.val)}`)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* FILTROS */}
      <div className="bg-white rounded-xl border border-slate-200/60">
        <button 
          onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          className="lg:hidden w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-2.5 text-slate-700 font-semibold text-sm"><Settings2 size={18} className="text-blue-500"/> Filtros de Búsqueda</div>
          {isFiltersOpen ? <ChevronUp size={20} className="text-slate-400"/> : <ChevronDown size={20} className="text-slate-400"/>}
        </button>
        
        <div className={`transition-all duration-300 ${isFiltersOpen ? 'max-h-[1200px] opacity-100 overflow-visible' : 'max-h-0 lg:max-h-none opacity-0 lg:opacity-100 hidden lg:block overflow-hidden'}`}>
          <div className="p-5 lg:p-6 lg:pb-8 space-y-6">
            
            {/* BOTÓN LIMPIAR PARA MÓVIL */}
            <div className="lg:hidden flex justify-end">
               <button onClick={clearFilters} className="text-xs font-semibold text-blue-600 flex items-center gap-1.5 py-2 px-4 bg-blue-50 rounded-lg active:scale-[0.98] transition-all">
                 <RotateCcw size={14} /> Reiniciar
               </button>
            </div>

            {/* Fila 1: Búsqueda */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                value={filters.search} onChange={e => {setFilters({...filters, search: e.target.value}); setCurrentPage(1);}} 
                placeholder="Buscar por Proveedor, Folio..." 
                className="w-full pl-11 pr-5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-800 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all" 
              />
            </div>
            
            {/* Fila 2: Selectores */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <MultiSelect label="Proveedor" options={filterOptions.providers} selectedValues={filters.providers} onChange={(vals) => {setFilters({...filters, providers: vals}); setCurrentPage(1);}} placeholder="Todos" />
              <MultiSelect label="Centro de Costo" options={filterOptions.costCenters} selectedValues={filters.costCenters} onChange={(vals) => {setFilters({...filters, costCenters: vals}); setCurrentPage(1);}} placeholder="Todos" />
              <MultiSelect label="Tipo Documento" options={filterOptions.types} selectedValues={filters.types} onChange={(vals) => {setFilters({...filters, types: vals}); setCurrentPage(1);}} placeholder="Todos" />
              <MultiSelect label="Estado" options={['PAGADO', 'PENDIENTE', 'VENCIDA']} selectedValues={filters.status} onChange={(vals) => {setFilters({...filters, status: vals}); setCurrentPage(1);}} placeholder="Todos" />
            </div>

            {/* Fila 3: Fechas + Limpiar */}
            <div className="pt-5 border-t border-slate-100">
              <div className="flex flex-col md:flex-row items-end gap-5 w-full">
                <div className="w-full md:w-64 space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide px-1">Desde</label>
                  <DateInput value={filters.startDate} onChange={e => {setFilters({...filters, startDate: e.target.value}); setCurrentPage(1);}} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 outline-none hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all" />
                </div>
                <div className="w-full md:w-64 space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide px-1">Hasta</label>
                  <DateInput value={filters.endDate} onChange={e => {setFilters({...filters, endDate: e.target.value}); setCurrentPage(1);}} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 outline-none hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all" />
                </div>
                
                {/* BOTÓN LIMPIAR DESKTOP */}
                <div className="hidden md:block ml-auto">
                   <button 
                    onClick={clearFilters} 
                    className="bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all active:scale-[0.98] text-sm font-medium"
                   >
                     <RotateCcw size={16} /> Limpiar Filtros
                   </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-xl border border-slate-200/60 flex flex-col flex-1 overflow-hidden min-h-[450px]">
        {/* Vista Escritorio (Table) */}
        <div className="hidden lg:block overflow-x-auto flex-1 scrollbar-hide">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-slate-50/80 backdrop-blur-sm border-b border-slate-200">
              <tr className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                <th className="px-6 py-4">Proveedor / Folio</th>
                <th className="px-6 py-4">Emisión</th>
                <th className="px-6 py-4">Vencimiento</th>
                <th className="px-6 py-4">Centro Costo</th>
                <th className="px-6 py-4 text-right">Monto</th>
                <th className="px-6 py-4 text-center">Estado</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {paginatedInvoices.map((inv) => {
                const isOverdue = inv.status_pago === 'PENDIENTE' && todayStr > inv.fecha_venc;
                const hasItems = inv.items && Array.isArray(inv.items) && inv.items.length > 0;
                return (
                  <tr key={inv.id} className={`hover:bg-blue-50/30 transition-colors group ${isOverdue ? 'bg-rose-50/20' : ''}`}>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900 truncate max-w-[200px] mb-1">{inv.proveedor}</p>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium text-slate-500 text-xs">#{inv.no_documento}</span>
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase">{inv.tipo_doc}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{inv.fecha_emision}</td>
                    <td className={`px-6 py-4 font-medium ${isOverdue ? 'text-rose-600' : 'text-slate-600'}`}>{inv.fecha_venc}</td>
                    <td className="px-6 py-4">
                      <span className="text-slate-600 text-xs font-medium bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">{inv.centro_costo || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`font-bold font-mono text-base tabular-nums ${
                        isOverdue ? 'text-rose-500' :
                        inv.status_pago === 'PAGADO' ? 'text-emerald-600' :
                        Number(inv.total_a_pagar) < 0 ? 'text-rose-500' : 'text-amber-600'
                      }`}>${formatCLP(inv.total_a_pagar)}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                        isOverdue
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : inv.status_pago === 'PAGADO'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          isOverdue ? 'bg-rose-500' :
                          inv.status_pago === 'PAGADO' ? 'bg-emerald-500' : 'bg-amber-500'
                        }`} />
                        {isOverdue ? 'VENCIDA' : inv.status_pago}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button onClick={() => onViewDetail(inv)} className={`p-1.5 rounded-lg transition-all ${hasItems ? 'text-blue-600 hover:bg-blue-50' : 'text-slate-400 hover:bg-slate-100'}`} title="Ver Detalle">
                          <Search size={16} />
                        </button>
                        <button onClick={() => toggleStatus(inv.id, inv.status_pago)} className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all" title="Cambiar Estado"><CheckCircle size={16} /></button>
                        <button onClick={() => onEdit(inv)} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all" title="Editar"><Pencil size={16} /></button>
                        <button onClick={() => onShowConfirm({ title: 'Eliminar Documento', message: '¿Confirmas la eliminación permanente?', onConfirm: async () => { await supabase.from('invoices').delete().eq('id', inv.id); fetchInvoices(); }, type: 'danger' })} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all" title="Eliminar"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Vista Móvil: Compacta con Texto Legible */}
        <div className="lg:hidden flex-1 overflow-y-auto divide-y divide-slate-100 scrollbar-hide">
          {paginatedInvoices.map((inv) => {
            const isOverdue = inv.status_pago === 'PENDIENTE' && todayStr > inv.fecha_venc;
            const displayProvider = inv.proveedor.length > 20 
              ? inv.proveedor.substring(0, 20) + "..." 
              : inv.proveedor;

            return (
              <div key={inv.id} className={`p-4 flex items-center justify-between gap-3 active:bg-slate-50 transition-colors ${isOverdue ? 'bg-rose-50/20' : ''}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${isOverdue ? 'bg-rose-500 animate-pulse' : (inv.status_pago === 'PAGADO' ? 'bg-emerald-500' : 'bg-amber-400')}`}></div>
                    <h4 className="font-bold text-slate-900 text-sm truncate">{displayProvider}</h4>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-xs text-slate-500 font-medium">#{inv.no_documento}</span>
                    <span className="text-xs uppercase px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded-md font-semibold">{inv.tipo_doc}</span>
                  </div>
                </div>
                
                <div className="text-right shrink-0">
                  <p className={`font-bold font-mono text-base ${
                    isOverdue ? 'text-rose-500' :
                    inv.status_pago === 'PAGADO' ? 'text-emerald-600' :
                    Number(inv.total_a_pagar) < 0 ? 'text-rose-500' : 'text-amber-600'
                  }`}>
                    ${formatCLP(inv.total_a_pagar)}
                  </p>
                  <p className={`text-xs font-semibold mt-1 uppercase ${isOverdue ? 'text-rose-500' : 'text-slate-400'}`}>{inv.fecha_venc}</p>
                </div>

                <div className="shrink-0 pl-1">
                  <MobileActionMenu invoice={inv} onEdit={onEdit} onView={onViewDetail} onToggleStatus={toggleStatus} onDelete={() => onShowConfirm({ title: 'Eliminar Registro', message: '¿Eliminar este registro?', onConfirm: async () => { await supabase.from('invoices').delete().eq('id', inv.id); fetchInvoices(); }, type: 'danger' })} />
                </div>
              </div>
            );
          })}
        </div>

        {/* PAGINACIÓN REFINADA */}
        {totalPages > 1 && (
          <div className="px-5 py-3 lg:px-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
            <span className="text-sm font-medium text-slate-500">Página {currentPage} de {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => {setCurrentPage(p => Math.max(p - 1, 1)); window.scrollTo(0,0);}} disabled={currentPage === 1} className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 active:scale-[0.98] transition-all text-slate-600"><ChevronLeft size={18}/></button>
              <button onClick={() => {setCurrentPage(p => Math.min(p + 1, totalPages)); window.scrollTo(0,0);}} disabled={currentPage === totalPages} className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 active:scale-[0.98] transition-all text-slate-600"><ChevronRight size={18}/></button>
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
    <div className="p-0 lg:p-4 max-w-5xl mx-auto space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-center gap-4">
        <button onClick={onSuccess} className="p-2 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 transition-all active:scale-[0.98] text-slate-500"><ChevronLeft size={18}/></button>
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">{invoiceToEdit ? 'Editar Registro' : 'Nuevo Documento'}</h2>
          <p className="text-slate-500 text-sm font-medium mt-0.5">Gestión y desglose contable</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="bg-white p-6 lg:p-8 rounded-xl border border-slate-200/60 space-y-7">
        {/* SECCIÓN 1: PROVEEDOR */}
        <div className="space-y-4">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block px-1">Proveedor y Datos Básicos</label>
          <input name="proveedor" value={formData.proveedor} onChange={handleGeneralChange} className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 px-4 py-3 rounded-lg font-semibold text-base focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all outline-none text-slate-900 placeholder:text-slate-400 placeholder:font-normal" placeholder="Nombre de la Empresa o Proveedor" required />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5">
             <div className="space-y-1.5">
               <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide px-1">Folio / Número</label>
               <input name="no_documento" value={formData.no_documento} onChange={handleGeneralChange} className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 px-4 py-2.5 rounded-lg font-medium text-sm text-slate-800 outline-none transition-all focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10" placeholder="Ej: 45001" required />
             </div>
             <div className="space-y-1.5">
               <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide px-1">Fecha Emisión</label>
               <input type="date" name="fecha_emision" value={formData.fecha_emision} onChange={handleGeneralChange} className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 px-4 py-2.5 rounded-lg font-medium text-sm text-slate-800 outline-none transition-all focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10" required />
             </div>
             <div className="space-y-1.5">
               <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide px-1">Vencimiento</label>
               <input type="date" name="fecha_venc" value={formData.fecha_venc} onChange={handleGeneralChange} className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 px-4 py-2.5 rounded-lg font-medium text-sm text-slate-800 outline-none transition-all focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10" required />
             </div>
          </div>
        </div>

        {/* SECCIÓN 2: PRODUCTOS */}
        <div className="space-y-4 pt-6 border-t border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide flex items-center gap-2"><Package size={18} className="text-blue-500"/> Detalle de Ítems</h3>
          <div className="space-y-4">
            {formData.items.map((it, idx) => (
              <div key={idx} className="bg-slate-50 p-4 lg:p-5 rounded-xl border border-slate-200/60 space-y-3 relative group hover:bg-white hover:shadow-sm hover:border-slate-300 transition-all">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide px-1">Descripción del Ítem</label>
                  <input value={it.detalle} onChange={(e) => handleItemChange(idx, 'detalle', e.target.value)} className="w-full bg-white border border-slate-200 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-slate-400" placeholder="Ej: Fertilizante Triple 15..." />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide px-1">Cantidad</label>
                    <input type="number" step="0.01" value={it.cantidad} onChange={(e) => handleItemChange(idx, 'cantidad', e.target.value)} className="w-full bg-white border border-slate-200 px-4 py-2.5 rounded-lg text-sm text-center font-medium text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all" placeholder="1.00" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-emerald-600 uppercase tracking-wide px-1">Total (Sin IVA)</label>
                    <div className="bg-emerald-50/50 border border-emerald-200 px-4 py-2.5 rounded-lg flex items-center transition-all focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:bg-white focus-within:border-emerald-400">
                      <span className="text-emerald-600 font-semibold mr-2 text-sm">$</span>
                      <input 
                        type={focusField === `i-${idx}` ? "number" : "text"}
                        value={focusField === `i-${idx}` ? it.total_item : formatCLP(it.total_item)}
                        onChange={(e) => handleItemChange(idx, 'total_item', e.target.value)}
                        onFocus={() => setFocusField(`i-${idx}`)} onBlur={() => setFocusField(null)}
                        className="w-full bg-transparent text-right font-semibold text-emerald-900 text-sm font-mono outline-none" 
                      />
                    </div>
                  </div>
                </div>
                {formData.items.length > 1 && (
                  <button type="button" onClick={() => setFormData({...formData, items: formData.items.filter((_,i) => i !== idx)})} className="absolute -top-3 -right-3 bg-white shadow-md text-rose-500 rounded-full p-1.5 border border-slate-100 transition-transform hover:scale-110 hover:text-rose-600 active:scale-[0.98]"><MinusCircle size={20}/></button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => setFormData({...formData, items: [...formData.items, {detalle: '', cantidad: 1, total_item: 0}]})} className="w-full py-3 border-2 border-dashed border-slate-200 rounded-lg text-xs font-semibold uppercase tracking-wide text-slate-400 hover:bg-blue-50/50 hover:text-blue-600 hover:border-blue-300 transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2">
              <PlusCircle size={18} /> Agregar Línea de Producto
            </button>
          </div>
        </div>

        {/* SECCIÓN 3: TOTALES */}
        <div className="bg-slate-900 p-6 lg:p-8 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full opacity-10 blur-[80px]"></div>
          
          <div className="space-y-2 z-10">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide block px-1">Total Neto</label>
            <input name="total_bruto" type={focusField === 'neto' ? "number" : "text"} value={focusField === 'neto' ? formData.total_bruto : formatCLP(formData.total_bruto)} onChange={handleGeneralChange} onFocus={() => setFocusField('neto')} onBlur={() => setFocusField(null)} className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 font-semibold text-lg text-white font-mono outline-none transition-all focus:bg-white/10 focus:ring-2 focus:ring-blue-500/30 ${hasItems ? 'opacity-50 pointer-events-none' : ''}`} required readOnly={hasItems} />
          </div>
          <div className="space-y-2 z-10">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide block px-1">IVA (19%)</label>
            <input name="iva" type={focusField === 'iva' ? "number" : "text"} value={focusField === 'iva' ? formData.iva : formatCLP(formData.iva)} onChange={handleGeneralChange} onFocus={() => setFocusField('iva')} onBlur={() => setFocusField(null)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 font-semibold text-lg text-blue-300 font-mono outline-none transition-all focus:bg-white/10 focus:ring-2 focus:ring-blue-500/30" />
          </div>
          <div className="space-y-2 z-10">
            <label className="text-xs font-semibold text-blue-300 uppercase tracking-wide block px-1">Total a Pagar</label>
            <div className="bg-blue-600 px-4 py-3.5 rounded-xl font-mono text-lg font-bold text-white border border-blue-500/40 flex items-center justify-end">
              ${formatCLP(formData.total_a_pagar)}
            </div>
          </div>
        </div>

        {/* SECCIÓN 4: CLASIFICACIÓN Y ACCIONES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide px-1">Centro de Costo</label>
            <input name="centro_costo" value={formData.centro_costo} onChange={handleGeneralChange} className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 px-4 py-2.5 rounded-lg outline-none font-medium text-slate-800 uppercase text-sm transition-all focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 placeholder:text-slate-400 placeholder:normal-case" placeholder="Ej: Agrícola Central" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide px-1">Categoría Contable</label>
            <input name="item" value={formData.item} onChange={handleGeneralChange} className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 px-4 py-2.5 rounded-lg outline-none font-medium text-slate-800 uppercase text-sm transition-all focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 placeholder:text-slate-400 placeholder:normal-case" placeholder="Ej: Insumos Químicos" />
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-end gap-3 pt-6 border-t border-slate-100">
          <button type="button" onClick={onSuccess} className="w-full md:w-auto px-5 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all rounded-lg order-2 md:order-1 active:scale-[0.98] outline-none">Cancelar</button>
          <button type="submit" disabled={loading} className="w-full md:w-auto px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg text-sm shadow-sm shadow-blue-600/20 hover:shadow-md active:scale-[0.98] transition-all hover:bg-blue-700 outline-none order-1 md:order-2 flex justify-center items-center gap-2">
            {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Guardando...</> : 'Guardar Documento'}
          </button>
        </div>
      </form>
    </div>
  );
}