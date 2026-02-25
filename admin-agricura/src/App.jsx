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
  Check
} from 'lucide-react';

// ==========================================
// IMPORTACIÓN COMPATIBLE PARA VISTA PREVIA:
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://obobxoubzosqylpzadsh.supabase.co';
const supabaseAnonKey = 'sb_publishable_w5Sy0ZRcp5rYQzKJl7RkmQ_HPCjOXY5';
const supabase = createClient(supabaseUrl, supabaseAnonKey);
// ==========================================

// --- COMPONENTE DE SELECCIÓN MÚLTIPLE PERSONALIZADO CON BÚSQUEDA ---
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

  useEffect(() => {
    if (!isOpen) setSearchTerm('');
  }, [isOpen]);

  const toggleOption = (val) => {
    if (selectedValues.includes(val)) {
      onChange(selectedValues.filter(v => v !== val));
    } else {
      onChange([...selectedValues, val]);
    }
  };

  const filteredOptions = useMemo(() => {
    return options.filter(opt => 
      opt.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  const displayText = selectedValues.length === 0 
    ? placeholder 
    : selectedValues.length === 1 
      ? selectedValues[0] 
      : `${selectedValues.length} seleccionados`;

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="text-xs font-bold text-slate-400 uppercase mb-1 block text-left">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-white transition-all focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
      >
        <span className="truncate">{displayText}</span>
        <ChevronDown size={14} className={`ml-2 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full max-h-72 bg-white border border-slate-200 rounded-xl shadow-xl flex flex-col py-2 animate-in fade-in zoom-in duration-150 text-left">
          <div className="px-3 pb-2 pt-1 border-b border-slate-100 mb-1 sticky top-0 bg-white z-10 text-left">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs focus:ring-2 focus:ring-blue-500 outline-none text-left"
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
                  key={opt}
                  type="button"
                  onClick={() => toggleOption(opt)}
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

export default function App() {
  const [session, setSession] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [invoiceToEdit, setInvoiceToEdit] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-slate-800 font-bold text-xl tracking-widest uppercase text-center p-4">Cargando Agricura...</div>;

  if (!session) return <Auth />;

  return (
    <div className="h-screen bg-gray-100 flex font-sans text-left overflow-hidden">
      {/* Navegación Lateral Fija */}
      <nav className="w-64 bg-slate-800 text-white flex flex-col shadow-xl z-10 shrink-0 h-full">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-3xl font-bold tracking-wider">AGRICURA</h1>
          <p className="text-slate-400 text-sm mt-1 font-medium">Panel Administración</p>
        </div>
        <div className="flex-1 px-4 space-y-2 mt-6 overflow-y-auto">
          <button 
            onClick={() => { setCurrentView('dashboard'); setInvoiceToEdit(null); }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${currentView === 'dashboard' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
          >
            <LayoutDashboard size={20} />
            <span className="font-medium">Panel Control</span>
          </button>
          <button 
            onClick={() => { setCurrentView('form'); setInvoiceToEdit(null); }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${currentView === 'form' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
          >
            <Plus size={20} />
            <span className="font-medium">Nuevo Documento</span>
          </button>
        </div>
        <div className="p-4 border-t border-slate-700 bg-black/10">
          <p className="text-xs text-slate-400 mb-3 truncate px-2">Usuario: {session?.user?.email}</p>
          <button 
            onClick={() => supabase.auth.signOut()}
            className="w-full flex items-center space-x-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 transition rounded px-2 py-2"
          >
            <LogOut size={16} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </nav>

      <main className="flex-1 overflow-auto bg-[#F8F9FA] h-full">
        {currentView === 'dashboard' ? (
          <Dashboard 
            session={session} 
            onEdit={(inv) => { setInvoiceToEdit(inv); setCurrentView('form'); }} 
          />
        ) : (
          <InvoiceForm 
            invoiceToEdit={invoiceToEdit} 
            onSuccess={() => { setCurrentView('dashboard'); setInvoiceToEdit(null); }} 
          />
        )}
      </main>
    </div>
  );
}

function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-xl border-t-8 border-blue-600 text-left">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-slate-800 tracking-wide uppercase">Agricura</h2>
          <p className="text-slate-500 font-semibold mt-2 uppercase tracking-widest text-sm">Control de Gastos</p>
        </div>
        {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm mb-6 border border-red-100">{error}</div>}
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="text-left">
            <label className="block text-sm font-semibold text-slate-700 mb-1">Correo Electrónico</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none font-medium" 
              required 
            />
          </div>
          <div className="text-left">
            <label className="block text-sm font-semibold text-slate-700 mb-1">Contraseña</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none font-medium" 
              required 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-4 px-4 rounded-lg hover:bg-opacity-90 transition-all shadow-md mt-4 uppercase tracking-wider"
          >
            {loading ? 'Iniciando sesión...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}

function Dashboard({ session, onEdit }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // ESTADOS DE FILTROS
  const [filters, setFilters] = useState({
    search: '',
    providers: [],
    costCenters: [],
    types: [],
    status: [],
    startDate: '',
    endDate: ''
  });

  const adminEmails = ['contacto@agricura.cl'];
  const isAdmin = session && adminEmails.includes(session?.user?.email);

  useEffect(() => { fetchInvoices(true); }, []);

  const fetchInvoices = async (initial = false) => {
    if (initial) setLoading(true);
    else setIsRefreshing(true);
    let allInvoices = [];
    let from = 0;
    let to = 999;
    let keepFetching = true;
    try {
      while (keepFetching) {
        const { data, error } = await supabase
          .from('invoices')
          .select('*')
          .order('fecha_emision', { ascending: false })
          .range(from, to);
        if (error) throw error;
        allInvoices = [...allInvoices, ...data];
        if (data.length < 1000) keepFetching = false;
        else { from += 1000; to += 1000; }
      }
      setInvoices(allInvoices);
    } catch (e) { console.error(e.message); } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'PENDIENTE' ? 'PAGADO' : 'PENDIENTE';
    const fechaPago = newStatus === 'PAGADO' ? new Date().toISOString() : null;
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status_pago: newStatus, fecha_pago: fechaPago } : inv));
    const { error } = await supabase.from('invoices').update({ status_pago: newStatus, fecha_pago: fechaPago }).eq('id', id);
    if (error) { alert("Error: " + error.message); fetchInvoices(); }
  };

  const deleteInvoice = async (id) => {
    if (!window.confirm('¿Eliminar permanentemente?')) return;
    const original = [...invoices];
    setInvoices(prev => prev.filter(inv => inv.id !== id));
    const { error } = await supabase.from('invoices').delete().eq('id', id);
    if (error) { alert('Error: ' + error.message); setInvoices(original); }
  };

  const filterOptions = useMemo(() => {
    const providers = [...new Set(invoices.map(i => i.proveedor).filter(Boolean))].sort();
    const costCenters = [...new Set(invoices.map(i => i.centro_costo).filter(Boolean))].sort();
    const types = [...new Set(invoices.map(i => i.tipo_doc).filter(Boolean))].sort();
    // Añadimos "VENCIDA" como opción de filtro
    const status = ["PENDIENTE", "PAGADO", "VENCIDA"];
    return { providers, costCenters, types, status };
  }, [invoices]);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const matchesSearch = !filters.search || 
        inv.proveedor?.toLowerCase().includes(filters.search.toLowerCase()) ||
        inv.no_documento?.toString().includes(filters.search) ||
        inv.centro_costo?.toLowerCase().includes(filters.search.toLowerCase());

      const matchesProvider = filters.providers.length === 0 || filters.providers.includes(inv.proveedor);
      const matchesCostCenter = filters.costCenters.length === 0 || filters.costCenters.includes(inv.centro_costo);
      const matchesType = filters.types.length === 0 || filters.types.includes(inv.tipo_doc);
      
      // Lógica de filtrado por estado incluyendo "VENCIDA"
      const isActuallyOverdue = inv.status_pago === 'PENDIENTE' && todayStr > inv.fecha_venc;
      const matchesStatus = filters.status.length === 0 || filters.status.some(s => {
        if (s === 'PAGADO') return inv.status_pago === 'PAGADO';
        if (s === 'VENCIDA') return isActuallyOverdue;
        if (s === 'PENDIENTE') return inv.status_pago === 'PENDIENTE' && !isActuallyOverdue;
        return false;
      });
      
      const matchesDate = (!filters.startDate || inv.fecha_emision >= filters.startDate) &&
                          (!filters.endDate || inv.fecha_emision <= filters.endDate);

      return matchesSearch && matchesProvider && matchesCostCenter && matchesType && matchesStatus && matchesDate;
    });
  }, [invoices, filters, todayStr]);

  const totalOutstanding = useMemo(() => 
    filteredInvoices.filter(inv => inv.status_pago === 'PENDIENTE').reduce((s, i) => s + Number(i.total_a_pagar), 0), 
  [filteredInvoices]);

  const totalPaidFiltered = useMemo(() => 
    filteredInvoices.filter(inv => inv.status_pago === 'PAGADO').reduce((s, i) => s + Number(i.total_a_pagar), 0), 
  [filteredInvoices]);

  const paginatedInvoices = useMemo(() => filteredInvoices.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage), [filteredInvoices, currentPage]);
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [filters]);

  if (loading && invoices.length === 0) return (
    <div className="h-full flex items-center justify-center bg-gray-50 text-slate-800 font-bold text-xl tracking-widest uppercase animate-pulse text-center p-4">
      Cargando Datos de Agricura...
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto relative h-full flex flex-col text-left">
      {isRefreshing && (
        <div className="absolute top-4 right-8 flex items-center space-x-2 text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 shadow-sm z-50 animate-bounce">
          <Clock size={12} className="animate-spin" />
          <span className="text-[10px] font-black uppercase tracking-widest text-xs">Sincronizando</span>
        </div>
      )}

      <header className="mb-6 shrink-0">
        <h2 className="text-3xl font-bold text-slate-800 uppercase tracking-tight">Panel de Control</h2>
        {/* Cambiado: se elimina 'italic' aquí */}
        <p className="text-slate-500 mt-1 text-sm font-medium">Gestionando {filteredInvoices.length} registros según filtros aplicados.</p>
      </header>

      {/* Widgets Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 shrink-0">
        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-red-500 flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Pendiente</h3>
            <p className="text-xl font-bold text-red-600">${totalOutstanding.toLocaleString('es-CL')}</p>
          </div>
          <Clock className="text-red-200" size={28} />
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-green-500 flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Pagado</h3>
            <p className="text-xl font-bold text-green-600">${totalPaidFiltered.toLocaleString('es-CL')}</p>
          </div>
          <Wallet className="text-green-200" size={28} />
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-blue-500 flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Documentos</h3>
            <p className="text-xl font-bold text-slate-800">{filteredInvoices.length}</p>
          </div>
          <FileText className="text-blue-200" size={28} />
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-emerald-400 flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Estado</h3>
            <p className="text-sm font-bold text-emerald-600 uppercase tracking-tighter text-left">Sistema Online</p>
          </div>
          <CheckCircle className="text-emerald-200" size={28} />
        </div>
      </div>

      {/* SECCIÓN DE FILTROS AVANZADOS */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6 shrink-0 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-700 font-bold uppercase text-xs tracking-widest">
            <Filter size={16} /> Filtros de Búsqueda
          </div>
          <button 
            onClick={() => setFilters({search:'', providers:[], costCenters:[], types:[], status:[], startDate:'', endDate:''})}
            className="text-blue-600 hover:text-blue-800 text-xs font-bold flex items-center gap-1 transition-colors"
          >
            <X size={14} /> Limpiar Filtros
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Búsqueda Rápida</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                value={filters.search}
                onChange={e => setFilters({...filters, search: e.target.value})}
                placeholder="Folio, Proveedor o C. Costo..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-left"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Fecha Desde</label>
            <input 
              type={filters.startDate ? "date" : "text"}
              onFocus={(e) => (e.target.type = "date")}
              onBlur={(e) => { if (!e.target.value) e.target.type = "text"; }}
              placeholder="dd/mm/yyyy"
              value={filters.startDate}
              onChange={e => setFilters({...filters, startDate: e.target.value})}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none font-medium text-left"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Fecha Hasta</label>
            <input 
              type={filters.endDate ? "date" : "text"}
              onFocus={(e) => (e.target.type = "date")}
              onBlur={(e) => { if (!e.target.value) e.target.type = "text"; }}
              placeholder="dd/mm/yyyy"
              value={filters.endDate}
              onChange={e => setFilters({...filters, endDate: e.target.value})}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none font-medium text-left"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MultiSelect 
            label="Proveedor"
            options={filterOptions.providers}
            selectedValues={filters.providers}
            onChange={(vals) => setFilters({...filters, providers: vals})}
            placeholder="Todos los Proveedores"
          />
          <MultiSelect 
            label="C. Costo"
            options={filterOptions.costCenters}
            selectedValues={filters.costCenters}
            onChange={(vals) => setFilters({...filters, costCenters: vals})}
            placeholder="Todos los Centros"
          />
          <MultiSelect 
            label="Tipo Doc."
            options={filterOptions.types}
            selectedValues={filters.types}
            onChange={(vals) => setFilters({...filters, types: vals})}
            placeholder="Todos los Tipos"
          />
          <MultiSelect 
            label="Estado Pago"
            options={filterOptions.status}
            selectedValues={filters.status}
            onChange={(vals) => setFilters({...filters, status: vals})}
            placeholder="Cualquier Estado"
          />
        </div>
      </div>

      {/* Tabla de Resultados */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col flex-1">
        <div className="overflow-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="sticky top-0 z-20 shadow-sm">
              <tr className="bg-slate-800 text-white text-xs uppercase tracking-widest font-bold">
                <th className="p-4 w-1/4">Proveedor</th>
                <th className="p-4 w-32">Folio / Tipo</th>
                <th className="p-4 w-40">Emisión</th>
                <th className="p-4 w-40 text-left">Vencimiento</th>
                <th className="p-4 w-32">C. Costo</th>
                <th className="p-4 text-right w-36 text-right">Total ($)</th>
                <th className="p-4 w-32 text-center">Estado</th>
                <th className="p-4 text-center w-28">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-medium">
              {paginatedInvoices.length === 0 ? (
                <tr><td colSpan="8" className="p-12 text-center text-slate-400 italic font-bold">No hay registros que coincidan con los filtros aplicados.</td></tr>
              ) : (
                paginatedInvoices.map((inv) => {
                  const isOverdue = inv.status_pago === 'PENDIENTE' && todayStr > inv.fecha_venc;
                  const isNegative = Number(inv.total_a_pagar) < 0;
                  
                  return (
                    <tr key={inv.id} className={`hover:bg-slate-50 transition-colors ${isOverdue ? 'bg-red-50/40' : ''}`}>
                      <td className="p-4">
                        <div className="font-bold text-slate-800 leading-tight text-sm">{inv.proveedor}</div>
                      </td>
                      <td className="p-4 text-slate-500">
                        <span className="font-bold text-slate-700 text-sm">#{inv.no_documento}</span> <br/>
                        <span className="text-[10px] uppercase font-black tracking-tighter opacity-70">{inv.tipo_doc}</span>
                      </td>
                      <td className="p-4 text-slate-600 font-mono text-sm whitespace-nowrap">
                        {inv.fecha_emision}
                      </td>
                      <td className="p-4 text-left">
                        {/* Cambiado: color verde si no ha vencido */}
                        <span className={`font-mono text-sm whitespace-nowrap ${isOverdue ? 'text-red-600 font-black' : 'text-green-600'}`}>
                          {inv.fecha_venc}
                        </span>
                      </td>
                      <td className="p-4 text-left">
                        <span className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded border border-slate-200 font-black uppercase tracking-tighter inline-block">{inv.centro_costo || 'N/A'}</span>
                      </td>
                      <td className={`p-4 text-right font-black font-mono text-sm ${isNegative ? 'text-red-600' : 'text-slate-900'}`}>
                        ${Number(inv.total_a_pagar).toLocaleString('es-CL')}
                      </td>
                      <td className="p-4 text-center text-center">
                        <div className="flex justify-center">
                          {isOverdue ? (
                            <span className="w-24 py-1 rounded text-[10px] font-black tracking-widest bg-red-600 text-white shadow-sm flex items-center justify-center text-center">
                              VENCIDA
                            </span>
                          ) : (
                            <span className={`w-24 py-1 rounded text-[10px] font-black tracking-widest uppercase flex items-center justify-center text-center ${inv.status_pago === 'PAGADO' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
                              {inv.status_pago}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center space-x-3 text-center">
                          <button onClick={() => toggleStatus(inv.id, inv.status_pago)} className="text-slate-400 hover:scale-125 transition-transform" title="Marcar Pagado/Pendiente">
                            {inv.status_pago === 'PAGADO' ? <CheckCircle size={22} className="text-green-500" /> : <Clock size={22} className={isOverdue ? 'text-red-600 animate-pulse' : 'text-red-400'} />}
                          </button>
                          <button onClick={() => onEdit(inv)} className="text-slate-400 hover:text-blue-600 hover:scale-125 transition-transform" title="Editar"><Pencil size={20} /></button>
                          {isAdmin && <button onClick={() => deleteInvoice(inv.id)} className="text-slate-400 hover:text-red-600 hover:scale-125 transition-transform" title="Eliminar"><Trash2 size={20} /></button>}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
              Mostrando <span className="text-blue-600">{paginatedInvoices.length}</span> de <span className="text-blue-600">{filteredInvoices.length}</span> registros
            </p>
            <div className="flex items-center space-x-2 text-left">
              <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="p-1.5 border border-slate-300 rounded hover:bg-white disabled:opacity-20 transition-all text-left"><ChevronLeft size={16} /></button>
              <div className="px-3 py-1 bg-white border border-slate-300 rounded font-black text-slate-700 text-sm tracking-tighter text-left">Pág. {currentPage} / {totalPages}</div>
              <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="p-1.5 border border-slate-300 rounded hover:bg-white disabled:opacity-20 transition-all text-left"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InvoiceForm({ onSuccess, invoiceToEdit }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tipo_doc: invoiceToEdit?.tipo_doc || 'Factura',
    no_documento: invoiceToEdit?.no_documento || '',
    proveedor: invoiceToEdit?.proveedor || '',
    fecha_emision: invoiceToEdit?.fecha_emision || '',
    fecha_venc: invoiceToEdit?.fecha_venc || '',
    total_bruto: invoiceToEdit?.total_bruto || '', 
    iva: invoiceToEdit?.iva || '',
    total_a_pagar: invoiceToEdit?.total_a_pagar || '',
    centro_costo: invoiceToEdit?.centro_costo || '',
    item: invoiceToEdit?.item || '',
    detalle: invoiceToEdit?.detalle || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newFormData = { ...formData, [name]: value };
    if (name === 'total_bruto') {
      const bruto = parseFloat(value) || 0;
      const calculatedIva = Math.round(bruto * 0.19);
      const total = bruto + calculatedIva;
      newFormData.iva = calculatedIva.toString();
      newFormData.total_a_pagar = total.toString();
    }
    setFormData(newFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    let error;
    if (invoiceToEdit) {
      const { error: updateError } = await supabase.from('invoices').update(formData).eq('id', invoiceToEdit.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from('invoices').insert([{ ...formData, created_by: user?.id }]);
      error = insertError;
    }
    setLoading(false);
    if (error) alert('Error: ' + error.message);
    else onSuccess(); 
  };

  return (
    <div className="p-8 max-w-4xl mx-auto text-left font-sans h-full overflow-auto">
      <header className="mb-6 border-b border-slate-200 pb-4">
        <h2 className="text-3xl font-bold text-slate-800 uppercase tracking-tight">
          {invoiceToEdit ? 'Editar Documento' : 'Nuevo Documento Agricura'}
        </h2>
        <p className="text-sm text-slate-500 mt-1 font-medium italic">Gestión de ingresos contables para el control de gastos de la empresa.</p>
      </header>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg border border-slate-100 space-y-6 text-sm font-medium">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <label className="block text-xs font-black text-slate-400 mb-1 uppercase tracking-widest text-left">Proveedor / Empresa</label>
            <input name="proveedor" value={formData.proveedor} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none font-bold text-sm text-left" required />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-400 mb-1 uppercase tracking-widest text-left">Tipo Doc.</label>
            <select name="tipo_doc" value={formData.tipo_doc} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none font-bold text-sm text-left appearance-none">
              <option value="Factura">Factura</option>
              <option value="Boleta">Boleta</option>
              <option value="Nota de Credito">Nota de Crédito</option>
              <option value="Sin Documento">Sin Documento</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-black text-slate-400 mb-1 uppercase tracking-widest text-left">Número de Folio</label>
            <input name="no_documento" value={formData.no_documento} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none font-bold text-sm text-left" required />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-400 mb-1 uppercase tracking-widest text-left text-left">Fecha Emisión</label>
            <input type="date" name="fecha_emision" value={formData.fecha_emision} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none font-bold text-sm text-left" required />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-400 mb-1 uppercase tracking-widest text-left text-left text-left">Vencimiento</label>
            <input type="date" name="fecha_venc" value={formData.fecha_venc} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none font-bold text-sm text-left" required />
          </div>
        </div>
        <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100 grid grid-cols-1 md:grid-cols-3 gap-6 text-left text-left text-left">
          <div>
            <label className="block text-xs font-black text-green-600 mb-1 uppercase tracking-widest">Monto Neto ($)</label>
            <input type="number" name="total_bruto" value={formData.total_bruto} onChange={handleChange} className="w-full bg-white border border-green-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none font-black text-lg text-left" required />
          </div>
          <div>
            <label className="block text-xs font-black text-green-600 mb-1 uppercase tracking-widest">IVA (19%)</label>
            <input type="number" name="iva" value={formData.iva} readOnly className="w-full bg-blue-100/50 border border-blue-200 p-3 rounded-lg font-black text-lg cursor-not-allowed opacity-60 text-left" />
          </div>
          <div>
            <label className="block text-xs font-black text-green-600 mb-1 uppercase tracking-widest">Total a Pagar</label>
            <input type="number" name="total_a_pagar" value={formData.total_a_pagar} readOnly className="w-full bg-green-600 border border-green-600 p-3 rounded-lg text-white font-black text-xl shadow-inner cursor-not-allowed text-left" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left text-left text-left">
          <div>
            <label className="block text-xs font-black text-slate-400 mb-1 uppercase tracking-widest">Centro de Costo</label>
            <input name="centro_costo" placeholder="Ej: AGRICURA" value={formData.centro_costo} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none font-bold text-sm text-left" />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-400 mb-1 uppercase tracking-widest">Categoría / Item</label>
            <input name="item" placeholder="Ej: Insumos" value={formData.item} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none font-bold text-sm text-left" />
          </div>
        </div>
        
        <div className="pt-6 border-t border-slate-100 flex justify-end space-x-4">
          <button type="button" onClick={onSuccess} className="px-6 py-3 border-2 border-slate-200 text-slate-500 font-bold rounded-lg hover:bg-slate-50 uppercase text-xs tracking-widest transition-all">Cancelar</button>
          <button type="submit" disabled={loading} className="px-10 py-3 bg-blue-600 text-white font-black rounded-lg shadow-xl uppercase text-xs tracking-[0.2em] transition-all hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Guardando...' : 'Registrar'}
          </button>
        </div>
      </form>
    </div>
  );
}