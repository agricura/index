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
  Download
} from 'lucide-react';

// ==========================================
// CARGA DINÁMICA DE LIBRERÍAS
// ==========================================
const loadScript = (url) => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

const supabaseUrl = 'https://obobxoubzosqylpzadsh.supabase.co';
const supabaseAnonKey = 'sb_publishable_w5Sy0ZRcp5rYQzKJl7RkmQ_HPCjOXY5';

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
      <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-white transition-all focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
      >
        <span className="truncate">{displayText}</span>
        <ChevronDown size={14} className={`ml-2 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full max-h-72 bg-white border border-slate-200 rounded-xl shadow-xl flex flex-col py-2 animate-in fade-in zoom-in duration-150">
          <div className="px-3 pb-2 pt-1 border-b border-slate-100 mb-1 sticky top-0 bg-white z-10 text-left">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
              <input 
                type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          <div className="overflow-y-auto max-h-48 text-left">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-2 text-xs text-slate-400 italic">No hay resultados</div>
            ) : (
              filteredOptions.map((opt) => (
                <button
                  key={opt} type="button" onClick={() => {
                    if (selectedValues.includes(opt)) onChange(selectedValues.filter(v => v !== opt));
                    else onChange([...selectedValues, opt]);
                  }}
                  className="w-full flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 transition-colors text-left"
                >
                  <div className={`w-4 h-4 border rounded mr-3 flex items-center justify-center transition-colors ${selectedValues.includes(opt) ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'}`}>
                    {selectedValues.includes(opt) && <Check size={10} className="text-white" />}
                  </div>
                  <span className={selectedValues.includes(opt) ? 'font-bold text-blue-700' : ''}>{opt}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- MODAL DE IMPORTACIÓN EXCEL ---
const ExcelImportModal = ({ onClose, onImported, supabase }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const processExcel = async () => {
    if (!file || !window.XLSX) return;
    setLoading(true);
    setStatus('Iniciando importación directa...');

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = window.XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = window.XLSX.utils.sheet_to_json(worksheet, { defval: "" });
        
        const grouped = jsonData.reduce((acc, curr) => {
          const provKey = (curr.proveedor || curr.Proveedor || "").toString().trim().toUpperCase();
          const folioKey = (curr.no_documento || curr.folio || "").toString().trim();
          if (!provKey || !folioKey) return acc;

          const key = `${provKey}-${folioKey}`;
          if (!acc[key]) acc[key] = [];
          
          // Se toma el valor final por línea desde "total_items"
          const totalItem = parseInt(curr.total_items || curr.total_linea || curr.total_item || 0);
          
          acc[key].push({
            detalle: curr.detalle || curr.Detalle || curr.descripcion || "",
            cantidad: parseFloat(curr.cantidad || 0),
            total_item: totalItem
          });
          return acc;
        }, {});

        let successCount = 0;
        for (const [key, items] of Object.entries(grouped)) {
          const [prov, folio] = key.split('-');
          setStatus(`Actualizando Factura #${folio}...`);

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
        setStatus(`¡Éxito! ${successCount} documentos procesados correctamente.`);
        setTimeout(() => { onImported(); onClose(); }, 1500);
      } catch (err) { setStatus(`Error: ${err.message}`); } finally { setLoading(false); }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-10 text-left relative overflow-hidden">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4 text-left text-left">
            <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100 text-left"><FileSpreadsheet className="text-emerald-500" size={28} /></div>
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight text-left">Importar Detalles Excel</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-left text-left"><X size={24}/></button>
        </div>

        <div className="space-y-8 text-left text-left">
          <div className="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100/50 text-left text-left text-left">
            <h4 className="text-xs font-black text-blue-800 uppercase tracking-[0.15em] mb-4 text-left">Estructura del archivo:</h4>
            <p className="text-[13px] text-gray-600 mb-4 font-medium text-left">Usa la columna <span className="font-bold text-blue-800">total_items</span> para el valor final por línea.</p>
            <p className="text-[13px] text-gray-600 mb-4 font-medium text-left">Los valores deben ser <span className="font-bold text-blue-800">SIN IVA</span>:</p>
            <div className="bg-white/80 border border-blue-200/50 rounded-xl px-4 py-3 shadow-sm mb-6 text-left">
              <p className="font-mono text-[10px] md:text-xs font-bold text-blue-800 tracking-tight leading-relaxed text-left text-left text-left">
                proveedor, no_documento, detalle, cantidad, total_items
              </p>
            </div>
            <div className="flex justify-center">
              <a href="/detalle_facturas.xlsx" download className="flex items-center gap-2 px-6 py-2.5 bg-[#4169E1] text-white text-xs font-black uppercase rounded-lg shadow-lg hover:bg-blue-700 transition-all active:scale-95 tracking-widest text-center">
                <Download size={16} strokeWidth={3} /> Descargar Template
              </a>
            </div>
          </div>

          <div className="relative group text-left">
            <input type="file" accept=".xlsx, .xls" onChange={(e) => setFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
            <div className="border-2 border-dashed border-slate-200 rounded-[2rem] py-12 text-center bg-slate-50 transition-all group-hover:bg-blue-50/30 group-hover:border-blue-300">
              <Upload className="mx-auto text-slate-300 mb-3 group-hover:text-blue-500 transition-colors text-left" size={40} />
              <p className="text-sm font-bold text-slate-600 tracking-tight text-center">{file ? file.name : "Carga tu archivo .xlsx"}</p>
            </div>
          </div>

          {status && <p className="text-center text-xs font-black uppercase text-blue-600 animate-pulse text-center">{status}</p>}

          <div className="flex justify-between items-center pt-2 text-left">
            <button onClick={onClose} className="text-xs font-black uppercase text-slate-400 hover:text-slate-600 tracking-widest text-left">Cerrar</button>
            <button onClick={processExcel} disabled={!file || loading} className="px-10 py-5 bg-[#9499A1] text-white text-xs font-black uppercase rounded-[2rem] shadow-xl disabled:opacity-50 hover:bg-slate-700 transition-all text-center">
              {loading ? 'Procesando...' : 'Importar a Supabase'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MODAL DE DETALLE ---
const InvoiceDetailModal = ({ invoice, onClose }) => {
  if (!invoice) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-slate-800 p-6 flex justify-between items-center text-white">
          <div className="flex items-center gap-4 text-left">
            <div className="bg-blue-600 p-2 rounded-lg shadow-lg text-left"><Package size={24} className="text-white" /></div>
            <div className="text-left text-white text-left text-left">
              <h3 className="text-lg font-bold uppercase tracking-widest leading-tight text-white text-left">
                {invoice.tipo_doc} <span className="text-blue-400">#{invoice.no_documento}</span>
              </h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-tight text-left">{invoice.proveedor}</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full text-white text-left"><X size={24} /></button>
        </div>
        <div className="p-8 overflow-y-auto space-y-8 text-left bg-white text-left text-left">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 rounded-2xl border border-slate-100 bg-slate-50/50 text-left text-left text-left">
            <div className="text-left">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest text-left">Emisión</p>
              <p className="font-mono text-sm text-slate-700 font-bold text-left">{invoice.fecha_emision}</p>
            </div>
            <div className="text-left text-left">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest text-left text-left text-left">Vencimiento</p>
              <p className="font-mono text-sm text-slate-700 font-bold text-left">{invoice.fecha_venc}</p>
            </div>
            <div className="text-left text-left text-left">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest text-left text-left text-left">Centro de Costo</p>
              <span className="bg-slate-200 text-slate-700 text-[10px] px-2.5 py-1 rounded-md font-black uppercase shadow-sm text-left">{invoice.centro_costo || 'N/A'}</span>
            </div>
            <div className="text-left text-left text-left text-left text-left">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest text-left text-left text-left text-left">Estado</p>
              <span className={`w-24 py-1 rounded text-[10px] font-black uppercase inline-flex items-center justify-center shadow-sm text-left ${invoice.status_pago === 'PAGADO' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
                {invoice.status_pago}
              </span>
            </div>
          </div>
          <div className="text-left">
            <h4 className="text-xs font-black text-slate-800 uppercase mb-4 tracking-[0.2em] flex items-center gap-2 text-left">
              <div className="w-1.5 h-4 bg-blue-600 rounded-full text-left"></div> Detalle de Factura
            </h4>
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm text-left">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest text-left text-left text-left">
                  <tr>
                    <th className="p-4 text-left text-white">Producto / Descripción</th>
                    <th className="p-4 text-center text-white text-center">Cant.</th>
                    <th className="p-4 text-right text-white text-right">Subtotal ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-left">
                  {invoice.items && Array.isArray(invoice.items) && invoice.items.length > 0 ? (
                    invoice.items.map((it, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors group text-left">
                        <td className="p-4 text-left font-bold text-slate-800">{it.detalle}</td>
                        <td className="p-4 text-center font-mono font-bold text-slate-600 text-center">{it.cantidad}</td>
                        <td className="p-4 text-right font-black text-slate-900 font-mono text-base text-right">${Number(it.total_item).toLocaleString('es-CL')}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="3" className="p-16 text-center text-slate-400 italic font-medium text-center">No hay ítems registrados.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex justify-end pt-4 text-left text-left text-left">
            <div className="w-full md:w-80 space-y-4 bg-slate-900 text-white p-8 rounded-[2rem] shadow-2xl relative overflow-hidden text-left">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-[60px] rounded-full -mr-10 -mt-10 text-left"></div>
              <div className="flex justify-between text-xs opacity-60 uppercase font-black text-white text-left text-left">
                <span className="text-white text-left">Monto Neto</span>
                <span className="font-mono text-sm text-white text-right">${Number(invoice.total_bruto).toLocaleString('es-CL')}</span>
              </div>
              <div className="flex justify-between text-xs opacity-60 uppercase font-black border-b border-white/10 pb-4 text-white text-left text-left text-left">
                <span className="text-white text-left">IVA (19%)</span>
                <span className="font-mono text-sm text-white text-right">${Number(invoice.iva).toLocaleString('es-CL')}</span>
              </div>
              <div className="flex justify-between items-center pt-2 text-white text-left">
                <div className="text-left text-white text-left text-left">
                  <span className="text-[10px] font-black uppercase text-blue-400 block mb-1 text-left">Total a Pagar</span>
                  <span className="text-3xl font-black font-mono text-white text-left">${Number(invoice.total_a_pagar).toLocaleString('es-CL')}</span>
                </div>
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

  if (!isReady) return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-bold text-xl tracking-widest uppercase animate-pulse">AGRICURA</div>;
  if (!session) return <Auth supabase={supabaseClient} />;

  return (
    <div className="h-screen bg-gray-100 flex font-sans text-left overflow-hidden text-left text-left text-left">
      <nav className="w-64 bg-slate-800 text-white flex flex-col shadow-xl z-10 shrink-0 h-full text-left">
        <div className="p-6 border-b border-slate-700 text-left">
          <h1 className="text-3xl font-bold text-left text-white tracking-widest uppercase">AGRICURA</h1>
          <p className="text-slate-400 text-sm mt-1 font-medium text-left">Panel Administración</p>
        </div>
        <div className="flex-1 px-4 space-y-2 mt-6 overflow-y-auto text-left text-left text-left">
          <button onClick={() => { setCurrentView('dashboard'); setInvoiceToEdit(null); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${currentView === 'dashboard' ? 'bg-blue-600 shadow-md text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
            <LayoutDashboard size={20} /><span className="font-medium text-left text-left">Panel de Control</span>
          </button>
          <button onClick={() => { setCurrentView('form'); setInvoiceToEdit(null); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${currentView === 'form' ? 'bg-blue-600 shadow-md text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
            <Plus size={20} /><span className="font-medium text-left text-left">Nuevo Documento</span>
          </button>
          <div className="pt-4 mt-4 border-t border-slate-700 text-left text-left">
            <button onClick={() => setIsImporting(true)} className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-all border border-emerald-500/20 text-left text-left text-left">
              <FileSpreadsheet size={20} /><span className="font-medium text-left text-left text-left">Importar Datos</span>
            </button>
          </div>
        </div>
        <div className="p-4 border-t border-slate-700 bg-black/10 text-left text-left text-left">
          <p className="text-xs text-slate-400 mb-3 truncate px-2 text-left">Usuario: {session?.user?.email}</p>
          <button onClick={() => supabaseClient.auth.signOut()} className="w-full flex items-center space-x-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 transition rounded px-2 py-2 text-left text-left">
            <LogOut size={16} /><span className="text-left text-left text-left">Cerrar Sesión</span>
          </button>
        </div>
      </nav>

      <main className="flex-1 overflow-auto bg-[#F8F9FA] h-full relative text-left text-left text-left">
        {currentView === 'dashboard' ? (
          <Dashboard supabase={supabaseClient} onEdit={(inv) => { setInvoiceToEdit(inv); setCurrentView('form'); }} onViewDetail={(inv) => setViewingInvoice(inv)} />
        ) : (
          <InvoiceForm supabase={supabaseClient} invoiceToEdit={invoiceToEdit} onSuccess={() => { setCurrentView('dashboard'); setInvoiceToEdit(null); }} />
        )}
        {viewingInvoice && <InvoiceDetailModal invoice={viewingInvoice} onClose={() => setViewingInvoice(null)} />}
        {isImporting && <ExcelImportModal supabase={supabaseClient} onClose={() => setIsImporting(false)} onImported={() => window.location.reload()} />}
      </main>
    </div>
  );
}

function Auth({ supabase }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 text-left text-left text-left text-left">
      <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-xl border-t-8 border-blue-600 text-left text-left text-left">
        <div className="text-center mb-8 text-left text-left">
          <h2 className="text-4xl font-bold text-slate-800 uppercase tracking-widest text-left">Agricura</h2>
          <p className="text-slate-500 font-semibold mt-2 uppercase tracking-widest text-sm text-left">Control de Gastos</p>
        </div>
        {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm mb-6 border border-red-100 text-left">{error}</div>}
        <form onSubmit={handleLogin} className="space-y-5 text-left text-left">
          <div className="text-left text-left text-left"><label className="block text-sm font-semibold text-slate-700 mb-1 text-left text-left">Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg outline-none font-medium text-left text-left" required /></div>
          <div className="text-left text-left text-left"><label className="block text-sm font-semibold text-slate-700 mb-1 text-left text-left">Contraseña</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg outline-none font-medium text-left text-left text-left" required /></div>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-4 rounded-lg shadow-md uppercase text-center">{loading ? 'Entrando...' : 'Entrar'}</button>
        </form>
      </div>
    </div>
  );
}

function Dashboard({ supabase, onEdit, onViewDetail }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [filters, setFilters] = useState({ search: '', providers: [], costCenters: [], types: [], status: [], startDate: '', endDate: '' });

  useEffect(() => { fetchInvoices(true); }, []);

  const fetchInvoices = async (initial = false) => {
    if (initial) setLoading(true); else setIsRefreshing(true);
    let allInvoices = [];
    let from = 0;
    let keepFetching = true;
    try {
      while (keepFetching) {
        const { data, error } = await supabase.from('invoices').select('*').order('fecha_emision', { ascending: false }).range(from, from + 999);
        if (error) throw error;
        allInvoices = [...allInvoices, ...data];
        if (data.length < 1000) keepFetching = false; else from += 1000;
      }
      setInvoices(allInvoices);
    } catch (e) { console.error(e); } finally { setLoading(false); setIsRefreshing(false); }
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'PENDIENTE' ? 'PAGADO' : 'PENDIENTE';
    await supabase.from('invoices').update({ status_pago: newStatus, fecha_pago: newStatus === 'PAGADO' ? new Date().toISOString() : null }).eq('id', id);
    fetchInvoices();
  };

  const deleteInvoice = async (id) => {
    if (!window.confirm('¿Eliminar registro?')) return;
    await supabase.from('invoices').delete().eq('id', id);
    fetchInvoices();
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
      const matchesSearch = !filters.search || 
        inv.proveedor?.toLowerCase().includes(filters.search.toLowerCase()) ||
        inv.no_documento?.toString().includes(filters.search) ||
        inv.centro_costo?.toLowerCase().includes(filters.search.toLowerCase());
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
    <div className="p-8 max-w-7xl mx-auto relative h-full flex flex-col text-left text-left text-left">
      <header className="mb-6 text-left">
        <h2 className="text-3xl font-bold text-slate-800 uppercase tracking-tight text-left text-left">Panel de Control</h2>
        <p className="text-slate-500 mt-1 text-sm font-medium text-left text-left">Gestionando {filteredInvoices.length} registros.</p>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 text-left text-left text-left text-left">
        <div className="bg-white p-5 rounded-xl border-l-4 border-red-500 flex items-center justify-between shadow-sm text-left text-left text-left">
          <div className="text-left text-left"><h3 className="text-slate-400 text-xs font-bold uppercase mb-1 text-left text-left">Total Pendiente</h3><p className="text-xl font-bold text-red-600 text-left text-left">${stats.pend.toLocaleString('es-CL')}</p></div>
          <Clock className="text-red-200 text-left text-left" size={28} />
        </div>
        <div className="bg-white p-5 rounded-xl border-l-4 border-emerald-500 flex items-center justify-between shadow-sm text-left text-left text-left">
          <div className="text-left text-left text-left"><h3 className="text-slate-400 text-xs font-bold uppercase mb-1 text-left text-left">Total Pagado</h3><p className="text-xl font-bold text-emerald-600 text-left text-left text-left">${stats.paid.toLocaleString('es-CL')}</p></div>
          <Wallet className="text-emerald-200 text-left text-left text-left" size={28} />
        </div>
        <div className="bg-white p-5 rounded-xl border-l-4 border-blue-500 flex items-center justify-between shadow-sm text-left text-left text-left text-left">
          <div className="text-left text-left text-left text-left text-left"><h3 className="text-slate-400 text-xs font-bold uppercase mb-1 text-left text-left">Documentos</h3><p className="text-xl font-bold text-slate-800 text-left text-left text-left">{filteredInvoices.length}</p></div>
          <FileText className="text-blue-200 text-left text-left" size={28} />
        </div>
        <div className="bg-white p-5 rounded-xl border-l-4 border-emerald-400 flex items-center justify-between shadow-sm text-left text-left text-left text-left">
          <div className="text-left text-left text-left text-left text-left text-left text-left"><h3 className="text-slate-400 text-xs font-bold uppercase mb-1 text-left text-left">Estado</h3><p className="text-sm font-bold text-emerald-600 uppercase text-left">Online</p></div>
          <CheckCircle className="text-emerald-200 text-left text-left" size={28} />
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6 space-y-4 text-left text-left text-left">
        <div className="flex items-center justify-between text-left text-left">
          <div className="flex items-center gap-2 text-slate-700 font-bold uppercase text-xs tracking-widest text-left text-left"><Filter size={16} className="text-left" /> Filtros</div>
          <button onClick={() => setFilters({search:'', providers:[], costCenters:[], types:[], status:[], startDate:'', endDate:''})} className="text-blue-600 hover:text-blue-800 text-xs font-bold transition-colors text-left text-left">Limpiar Filtros</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-left text-left text-left text-left">
          <div className="md:col-span-2 text-left text-left text-left">
            <label className="text-xs font-bold text-slate-400 uppercase mb-1 block text-left text-left text-left text-left text-left">Búsqueda Rápida</label>
            <div className="relative text-left text-left text-left text-left text-left text-left">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-left text-left text-left" size={14} />
              <input value={filters.search} onChange={e => setFilters({...filters, search: e.target.value})} placeholder="Folio, Proveedor..." className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none text-left" />
            </div>
          </div>
          <div className="text-left text-left"><label className="text-xs font-bold text-slate-400 uppercase mb-1 block text-left text-left">Desde</label><input type="date" value={filters.startDate} onChange={e => setFilters({...filters, startDate: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-left text-left" /></div>
          <div className="text-left text-left text-left"><label className="text-xs font-bold text-slate-400 uppercase mb-1 block text-left text-left">Hasta</label><input type="date" value={filters.endDate} onChange={e => setFilters({...filters, endDate: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-left text-left" /></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-left text-left text-left text-left text-left text-left">
          <MultiSelect label="Proveedor" options={filterOptions.providers} selectedValues={filters.providers} onChange={(vals) => setFilters({...filters, providers: vals})} placeholder="Todos" />
          <MultiSelect label="C. Costo" options={filterOptions.costCenters} selectedValues={filters.costCenters} onChange={(vals) => setFilters({...filters, costCenters: vals})} placeholder="Todos" />
          <MultiSelect label="Tipo Doc." options={filterOptions.types} selectedValues={filters.types} onChange={(vals) => setFilters({...filters, types: vals})} placeholder="Todos" />
          <MultiSelect label="Estado Pago" options={filterOptions.status} selectedValues={filters.status} onChange={(vals) => setFilters({...filters, status: vals})} placeholder="Todos" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col flex-1 text-left text-left text-left text-left text-left">
        <div className="overflow-auto flex-1 text-left text-left text-left text-left text-left text-left text-left text-left text-left">
          <table className="w-full text-left border-collapse min-w-[1000px] text-left text-left text-left text-left text-left text-left">
            <thead className="sticky top-0 z-20 shadow-sm text-left text-white bg-slate-800 text-left text-left text-left text-left">
              <tr className="text-xs uppercase tracking-widest font-bold text-left text-left text-left text-left">
                <th className="p-4 w-1/4 text-left text-left">Proveedor</th>
                <th className="p-4 w-32 text-left text-left text-left text-left">Folio / Tipo</th>
                <th className="p-4 w-40 text-left text-left text-left text-left text-left text-left">Emisión</th>
                <th className="p-4 w-40 text-left text-left text-left text-left text-left text-left">Vencimiento</th>
                <th className="p-4 w-32 text-left text-left text-left text-left">C. Costo</th>
                <th className="p-4 text-right w-36 text-right text-right text-right">Total ($)</th>
                <th className="p-4 w-32 text-center text-center">Estado</th>
                <th className="p-4 text-center w-36 text-center text-center text-center text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-medium text-left">
              {paginatedInvoices.map((inv) => {
                const isOverdue = inv.status_pago === 'PENDIENTE' && todayStr > inv.fecha_venc;
                return (
                  <tr key={inv.id} className={`hover:bg-slate-50 transition-colors ${isOverdue ? 'bg-red-50/40' : ''} text-left text-left text-left text-left text-left text-left`}>
                    <td className="p-4 font-bold text-slate-800 leading-tight text-left text-left text-left text-left">{inv.proveedor}</td>
                    <td className="p-4 text-slate-500 text-left text-left text-left text-left text-left">
                      <span className="font-bold text-slate-700 text-left text-left text-left text-left">#{inv.no_documento}</span> <br/>
                      <span className="text-[10px] uppercase font-black tracking-tighter opacity-70 text-left text-left text-left">{inv.tipo_doc}</span>
                    </td>
                    <td className="p-4 text-slate-600 font-mono text-xs text-left text-left text-left">{inv.fecha_emision}</td>
                    <td className="p-4 text-left text-left text-left">
                      <span className={`font-mono text-xs text-left text-left text-left ${isOverdue ? 'text-red-600 font-black' : 'text-emerald-600'}`}>{inv.fecha_venc}</span>
                    </td>
                    <td className="p-4 text-left text-left text-left text-left text-left text-left">
                      <span className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded border border-slate-200 font-black uppercase text-left text-left text-left">{inv.centro_costo || 'N/A'}</span>
                    </td>
                    <td className={`p-4 text-right font-black font-mono text-right text-right text-right ${Number(inv.total_a_pagar) < 0 ? 'text-red-600' : 'text-slate-900'}`}>
                      ${Number(inv.total_a_pagar).toLocaleString('es-CL')}
                    </td>
                    <td className="p-4 text-center text-center">
                      <div className="flex justify-center text-center text-center text-center">
                        <span className={`w-24 py-1 rounded text-[10px] font-black uppercase inline-flex items-center justify-center shadow-sm text-center text-center ${isOverdue ? 'bg-red-600 text-white' : (inv.status_pago === 'PAGADO' ? 'bg-emerald-600 text-white' : 'bg-red-100 text-red-800')}`}>
                          {isOverdue ? 'VENCIDA' : inv.status_pago}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-center text-center text-center text-center">
                      <div className="flex items-center justify-center space-x-3 text-center text-center text-center text-center">
                        <button onClick={() => onViewDetail(inv)} className="text-slate-400 hover:text-indigo-600 hover:scale-125 transition-transform text-center" title="Ver Detalle">
                          <Search size={22} className={inv.items?.length > 0 ? 'text-indigo-600' : 'text-slate-300'} />
                        </button>
                        <button onClick={() => toggleStatus(inv.id, inv.status_pago)} className="text-slate-400 hover:scale-125 transition-transform text-center text-center text-center">
                          {inv.status_pago === 'PAGADO' ? <CheckCircle size={22} className="text-emerald-500 text-center" /> : <Clock size={22} className={isOverdue ? 'text-red-600 animate-pulse text-center' : 'text-red-400 text-center'} />}
                        </button>
                        <button onClick={() => onEdit(inv)} className="text-slate-400 hover:text-blue-600 hover:scale-125 transition-transform text-center"><Pencil size={20} /></button>
                        <button onClick={() => deleteInvoice(inv.id)} className="text-slate-400 hover:text-red-600 hover:scale-125 transition-transform text-center text-center text-center"><Trash2 size={20} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function InvoiceForm({ supabase, onSuccess, invoiceToEdit }) {
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
    detalle: invoiceToEdit?.detalle || '',
    items: invoiceToEdit?.items || [] 
  });

  const updateSummary = (items, netoManual = null) => {
    let neto = netoManual !== null ? Number(netoManual) : items.reduce((sum, it) => sum + (Number(it.total_item) || 0), 0);
    let iva = Math.round(neto * 0.19);
    let total = neto + iva;
    return { neto, iva, total };
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    const { neto, iva, total } = updateSummary(newItems);
    setFormData({ ...formData, items: newItems, total_bruto: neto, iva, total_a_pagar: total });
  };

  const addItem = () => {
    setFormData({ ...formData, items: [...formData.items, { detalle: '', cantidad: 0, total_item: 0 }] });
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    const { neto, iva, total } = updateSummary(newItems);
    setFormData({ ...formData, items: newItems, total_bruto: neto, iva, total_a_pagar: total });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newData = { ...formData, [name]: value };
    if (name === 'total_bruto' && formData.items.length === 0) {
      const { iva, total } = updateSummary([], value);
      newData.iva = iva;
      newData.total_a_pagar = total;
    }
    setFormData(newData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    let error;
    if (invoiceToEdit) {
      const { error: err } = await supabase.from('invoices').update(formData).eq('id', invoiceToEdit.id);
      error = err;
    } else {
      const { error: err } = await supabase.from('invoices').insert([formData]);
      error = err;
    }
    setLoading(false);
    if (!error) onSuccess();
  };

  return (
    <div className="p-8 max-w-5xl mx-auto text-left overflow-auto h-full text-left text-left text-left">
      <header className="mb-6 border-b border-slate-200 pb-4 text-left">
        <h2 className="text-3xl font-bold text-slate-800 uppercase tracking-tight text-left text-left">{invoiceToEdit ? 'Editar Registro' : 'Nuevo Registro Agricura'}</h2>
      </header>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg space-y-8 text-sm font-medium text-left">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="md:col-span-2 text-left">
            <label className="block text-xs font-black text-slate-400 mb-1 uppercase tracking-widest text-left text-left">Proveedor</label>
            <input name="proveedor" value={formData.proveedor} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-lg outline-none font-bold text-left text-left" required />
          </div>
          <div className="text-left text-left">
            <label className="block text-xs font-black text-slate-400 mb-1 uppercase tracking-widest text-left text-left">Tipo</label>
            <select name="tipo_doc" value={formData.tipo_doc} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-lg font-bold text-left text-left">
              <option value="Factura">Factura</option>
              <option value="Boleta">Boleta</option>
              <option value="Nota de Credito">Nota de Crédito</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left text-left text-left">
          <div className="text-left"><label className="block text-xs font-black text-slate-400 mb-1 uppercase tracking-widest text-left text-left">Folio</label><input name="no_documento" value={formData.no_documento} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-lg outline-none font-bold text-left text-left" required /></div>
          <div className="text-left"><label className="block text-xs font-black text-slate-400 mb-1 uppercase tracking-widest text-left text-left">Emisión</label><input type="date" name="fecha_emision" value={formData.fecha_emision} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-lg outline-none font-bold text-left text-left text-left" required /></div>
          <div className="text-left"><label className="block text-xs font-black text-slate-400 mb-1 uppercase tracking-widest text-left text-left text-left">Vencimiento</label><input type="date" name="fecha_venc" value={formData.fecha_venc} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-lg outline-none font-bold text-left text-left text-left" required /></div>
        </div>

        <div className="space-y-4 text-left text-left text-left text-left">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2 text-left">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 text-left text-left text-left text-left"><CheckCircle size={14} className="text-emerald-600 text-left text-left" /> Detalle Directo</h3>
            <button type="button" onClick={addItem} className="flex items-center gap-1.5 text-blue-600 text-xs font-bold uppercase active:scale-95 transition-all text-left text-left text-left text-left"><PlusCircle size={16} /> Agregar Ítem</button>
          </div>
          {formData.items.map((it, idx) => (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100 text-left text-left">
              <div className="md:col-span-7 text-left">
                <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block text-left">Descripción del Ítem</label>
                <input value={it.detalle} onChange={(e) => handleItemChange(idx, 'detalle', e.target.value)} className="w-full bg-white border border-slate-200 p-2 rounded-lg text-xs outline-none font-bold text-left text-left" placeholder="Producto" />
              </div>
              <div className="md:col-span-1 text-center text-left text-left">
                <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block text-center text-left text-left">Cant.</label>
                <input type="number" step="0.001" value={it.cantidad} onChange={(e) => handleItemChange(idx, 'cantidad', e.target.value)} className="w-full bg-white border border-slate-200 p-2 rounded-lg text-xs text-center font-mono text-left text-left" />
              </div>
              <div className="md:col-span-3 text-right text-left text-left text-left">
                <label className="text-[10px] font-black text-emerald-600 uppercase mb-1 block text-right text-left text-left text-left text-left">Subtotal Ítem ($)</label>
                <input type="number" value={it.total_item} onChange={(e) => handleItemChange(idx, 'total_item', e.target.value)} className="w-full bg-emerald-50 border border-emerald-200 p-2 rounded-lg text-xs text-right font-black text-emerald-800 text-left text-left" />
              </div>
              <div className="md:col-span-1 flex items-end justify-center pb-1 text-left text-left text-left text-left"><button type="button" onClick={() => removeItem(idx)} className="text-red-400 text-left text-left text-left text-left"><MinusCircle size={20} /></button></div>
            </div>
          ))}
        </div>

        <div className="bg-blue-50/50 p-6 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-6 text-left border border-blue-100 text-left text-left">
          <div className="text-left text-left text-left text-left"><label className="block text-xs font-black text-emerald-600 mb-1 uppercase tracking-widest text-left text-left text-left text-left">Monto Neto</label><input type="number" name="total_bruto" value={formData.total_bruto} onChange={handleChange} className={`w-full bg-white border border-emerald-200 p-3 rounded-lg outline-none font-black text-lg text-left text-left ${formData.items.length > 0 ? 'opacity-70 cursor-not-allowed' : ''}`} required readOnly={formData.items.length > 0} /></div>
          <div className="text-left text-left text-left text-left text-left"><label className="block text-xs font-black text-emerald-600 mb-1 uppercase tracking-widest text-left text-left text-left text-left">IVA (19%)</label><input type="number" name="iva" value={formData.iva} readOnly className="w-full bg-blue-100/50 border border-blue-200 p-3 rounded-lg font-black text-lg text-left text-left text-left" /></div>
          <div className="text-left text-left text-left text-left text-left text-left text-left"><label className="block text-xs font-black text-emerald-600 mb-1 uppercase tracking-widest text-left text-left text-left text-left text-left">Total</label><input type="number" name="total_a_pagar" value={formData.total_a_pagar} readOnly className="w-full bg-emerald-600 text-white p-3 rounded-lg font-black text-xl text-left shadow-lg text-left text-left" /></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left text-left text-left text-left text-left">
          <div className="text-left text-left text-left text-left text-left text-left"><label className="block text-xs font-black text-slate-400 mb-1 uppercase tracking-widest text-left text-left text-left text-left text-left">Centro de Costo</label><input name="centro_costo" placeholder="Ej: AGRICURA" value={formData.centro_costo} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-lg outline-none font-bold text-left text-left text-left" /></div>
          <div className="text-left text-left text-left text-left text-left text-left text-left"><label className="block text-xs font-black text-slate-400 mb-1 uppercase tracking-widest text-left text-left text-left text-left text-left">Categoría / Item</label><input name="item" placeholder="Ej: Insumos" value={formData.item} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-lg outline-none font-bold text-left text-left text-left" /></div>
        </div>

        <div className="flex justify-end gap-4 text-left text-left text-left">
          <button type="button" onClick={onSuccess} className="px-6 py-3 border border-slate-200 rounded-lg text-slate-400 font-bold uppercase text-left text-left">Cancelar</button>
          <button type="submit" disabled={loading} className="px-10 py-3 bg-blue-600 text-white font-black rounded-lg shadow-xl uppercase transition-all hover:bg-blue-700 text-center text-center">{loading ? 'Guardando...' : 'Registrar Documento'}</button>
        </div>
      </form>
    </div>
  );
}