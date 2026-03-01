import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard, CheckCircle, Clock, FileText,
  TrendingUp, AlertTriangle, BarChart3, Loader2,
} from 'lucide-react';
import { formatCLP } from '../utils/formatters';

// ── Helpers ───────────────────────────────────────────────────────────────────
const Skeleton = () => (
  <div className="h-7 bg-slate-100 rounded-lg animate-pulse w-28" />
);

const KpiCard = ({ label, value, prefix = '$', color, icon, loading }) => {
  const colors = {
    amber:   { bg: 'bg-amber-50',   text: 'text-amber-600',   icon: 'bg-amber-50 text-amber-600'   },
    rose:    { bg: 'bg-rose-50',    text: 'text-rose-600',    icon: 'bg-rose-50 text-rose-600'     },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: 'bg-emerald-50 text-emerald-600'},
    blue:    { bg: 'bg-blue-50',    text: 'text-blue-600',    icon: 'bg-blue-50 text-blue-600'     },
    violet:  { bg: 'bg-violet-50',  text: 'text-violet-600',  icon: 'bg-violet-50 text-violet-600' },
    indigo:  { bg: 'bg-indigo-50',  text: 'text-indigo-600',  icon: 'bg-indigo-50 text-indigo-600' },
    slate:   { bg: 'bg-slate-100',  text: 'text-slate-700',   icon: 'bg-slate-100 text-slate-600'  },
  };
  const c = colors[color] ?? colors.blue;
  return (
    <div className="bg-white p-4 lg:p-5 rounded-xl border border-slate-200/60 flex items-start gap-3 hover:shadow-md transition-all duration-200">
      <div className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${c.icon}`}>{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-slate-400 mb-1 truncate">{label}</p>
        {loading
          ? <Skeleton />
          : <p className={`text-xl font-bold font-mono truncate ${c.text}`}>
              {prefix}{prefix === '$' ? formatCLP(value) : value}
            </p>
        }
      </div>
    </div>
  );
};

const SectionHeading = ({ color, title, badge }) => (
  <div className="flex items-center gap-2 mb-4">
    <div className={`w-2 h-5 rounded-full ${color}`} />
    <h3 className="text-base font-bold text-slate-800">{title}</h3>
    {badge && <span className="text-xs text-slate-400 font-medium">{badge}</span>}
  </div>
);

// ── Component ─────────────────────────────────────────────────────────────────
export default function ControlPanel({ supabase }) {
  const [invoices,    setInvoices]    = useState([]);
  const [siiRecords,  setSiiRecords]  = useState([]);
  const [loadingInv,  setLoadingInv]  = useState(true);
  const [loadingSII,  setLoadingSII]  = useState(true);

  useEffect(() => {
    const fetchAll = async (table, setter, setLoading) => {
      let all = [], from = 0;
      while (true) {
        const { data, error } = await supabase.from(table).select('*').range(from, from + 999);
        if (error || !data) break;
        all = all.concat(data);
        if (data.length < 1000) break;
        from += 1000;
      }
      setter(all);
      setLoading(false);
    };
    fetchAll('invoices',    setInvoices,   setLoadingInv);
    fetchAll('sii_records', setSiiRecords, setLoadingSII);
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];

  // ── Agricura stats ────────────────────────────────────────────────────────
  const agriStats = useMemo(() => {
    const pendList   = invoices.filter(i => i.status_pago === 'PENDIENTE' && (i.fecha_venc ?? '') >= todayStr);
    const overdueList= invoices.filter(i => i.status_pago === 'PENDIENTE' && (i.fecha_venc ?? '') <  todayStr);
    const paidList   = invoices.filter(i => i.status_pago === 'PAGADO');
    const sum = (arr, k) => arr.reduce((s, i) => s + Number(i[k] || 0), 0);

    // By tipo_doc
    const byTipo = {};
    invoices.forEach(inv => {
      const k = inv.tipo_doc || 'Otro';
      if (!byTipo[k]) byTipo[k] = { count: 0, total: 0 };
      byTipo[k].count += 1;
      byTipo[k].total += Number(inv.total_a_pagar || 0);
    });

    // Upcoming: pending docs sorted by fecha_venc asc (soonest first), top 8
    const upcoming = invoices
      .filter(i => i.status_pago === 'PENDIENTE' && (i.fecha_venc ?? ''))
      .sort((a, b) => (a.fecha_venc ?? '').localeCompare(b.fecha_venc ?? ''))
      .slice(0, 8);

    // Recent 5
    const recent = [...invoices]
      .sort((a, b) => (b.fecha_emision ?? '').localeCompare(a.fecha_emision ?? ''))
      .slice(0, 5);

    return {
      totalPending: sum(pendList,    'total_a_pagar'),
      totalOverdue: sum(overdueList, 'total_a_pagar'),
      totalPaid:    sum(paidList,    'total_a_pagar'),
      countPending: pendList.length,
      countOverdue: overdueList.length,
      countPaid:    paidList.length,
      byTipo, upcoming, recent,
    };
  }, [invoices, todayStr]);

  // ── SII stats ─────────────────────────────────────────────────────────────
  const siiStats = useMemo(() => {
    const totalNeto  = siiRecords.reduce((s, r) => s + Number(r.monto_neto || 0), 0);
    const totalIVA   = siiRecords.reduce((s, r) => s + Number(r.monto_iva_recuperable || 0), 0);
    const totalMonto = siiRecords.reduce((s, r) => s + Number(r.monto_total || 0), 0);

    // By tipo_compra
    const byTipo = {};
    siiRecords.forEach(r => {
      const k = r.tipo_compra?.trim() || 'Sin Tipo';
      if (!byTipo[k]) byTipo[k] = { count: 0, neto: 0, total: 0 };
      byTipo[k].count += 1;
      byTipo[k].neto  += Number(r.monto_neto  || 0);
      byTipo[k].total += Number(r.monto_total || 0);
    });

    // Recent 5 by date
    const recent = [...siiRecords]
      .sort((a, b) => (b.fecha_docto ?? '').localeCompare(a.fecha_docto ?? ''))
      .slice(0, 5);

    // Monthly totals (last 6 months) based on fecha_docto
    const monthly = {};
    siiRecords.forEach(r => {
      const d = String(r.fecha_docto ?? '').slice(0, 7).replace('/', '-'); // "yyyy/mm" → "yyyy-mm"
      if (!d || d.length < 7) return;
      if (!monthly[d]) monthly[d] = { neto: 0, total: 0, count: 0 };
      monthly[d].neto  += Number(r.monto_neto  || 0);
      monthly[d].total += Number(r.monto_total || 0);
      monthly[d].count += 1;
    });
    const monthlyTop = Object.entries(monthly)
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 6)
      .reverse();

    return { totalNeto, totalIVA, totalMonto, byTipo, recent, monthlyTop };
  }, [siiRecords]);

  const loading = loadingInv || loadingSII;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="px-1 flex items-center justify-between">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <LayoutDashboard size={28} className="text-blue-600" />
            Panel de Control
          </h2>
          <p className="text-slate-400 text-sm font-medium mt-1">Resumen ejecutivo de documentos Agricura y registros SII.</p>
        </div>
        {loading && (
          <div className="flex items-center gap-2 text-sm text-slate-400 font-medium">
            <Loader2 size={16} className="animate-spin" /> Cargando datos…
          </div>
        )}
      </header>

      {/* ═══════════════════════════════════════════════════════════════════════
          DATOS AGRICURA
      ════════════════════════════════════════════════════════════════════════ */}
      <section>
        <SectionHeading
          color="bg-blue-500"
          title="Datos Agricura"
          badge={!loadingInv ? `${invoices.length} documentos` : null}
        />

        {/* KPI row */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-4 mb-6">
          <KpiCard label="Pendiente"   value={agriStats.totalPending} color="amber"   icon={<Clock size={18} />}          loading={loadingInv} />
          <KpiCard label="Vencido"     value={agriStats.totalOverdue} color="rose"    icon={<AlertTriangle size={18} />}  loading={loadingInv} />
          <KpiCard label="Pagado"      value={agriStats.totalPaid}    color="emerald" icon={<CheckCircle size={18} />}    loading={loadingInv} />
          <KpiCard label="Total Docs"  value={invoices.length}        color="blue"    icon={<FileText size={18} />}       loading={loadingInv} prefix="" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Próximos Vencimientos */}
          {!loadingInv && agriStats.upcoming.length > 0 && (
            <div className="bg-white border border-slate-200/60 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock size={15} className="text-amber-500" />
                  <h4 className="text-sm font-bold text-slate-700">Próximos Vencimientos</h4>
                </div>
                <span className="text-xs text-slate-400 font-medium">{agriStats.countPending + agriStats.countOverdue} pendientes en total</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50/60 text-xs text-slate-400 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-5 py-3 text-left">Proveedor</th>
                      <th className="px-5 py-3 text-left">Vence</th>
                      <th className="px-5 py-3 text-left">Centro</th>
                      <th className="px-5 py-3 text-right">Monto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {agriStats.upcoming.map(inv => {
                      const isOverdue = (inv.fecha_venc ?? '') < todayStr;
                      const daysLeft = inv.fecha_venc
                        ? Math.ceil((new Date(inv.fecha_venc) - new Date(todayStr)) / 86400000)
                        : null;
                      const isImminent = !isOverdue && daysLeft !== null && daysLeft <= 7;
                      return (
                        <tr key={inv.id} className={`transition-colors ${
                          isOverdue ? 'bg-rose-50/30 hover:bg-rose-50/50' :
                          isImminent ? 'bg-amber-50/30 hover:bg-amber-50/50' :
                          'hover:bg-slate-50/50'
                        }`}>
                          <td className="px-5 py-3">
                            <p className="font-semibold text-slate-800 text-xs truncate max-w-[140px]">{inv.proveedor}</p>
                            <span className="font-mono text-xs text-slate-400">#{inv.folio}</span>
                          </td>
                          <td className="px-5 py-3 whitespace-nowrap">
                            <p className={`font-mono text-xs font-semibold ${
                              isOverdue ? 'text-rose-600' : isImminent ? 'text-amber-600' : 'text-slate-600'
                            }`}>{inv.fecha_venc ?? '—'}</p>
                            {daysLeft !== null && (
                              <p className={`text-xs mt-0.5 font-medium ${
                                isOverdue ? 'text-rose-400' : isImminent ? 'text-amber-400' : 'text-slate-400'
                              }`}>
                                {isOverdue ? `Venció hace ${Math.abs(daysLeft)}d` : daysLeft === 0 ? 'Vence hoy' : `En ${daysLeft}d`}
                              </p>
                            )}
                          </td>
                          <td className="px-5 py-3">
                            <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-md border border-slate-200 font-medium">
                              {inv.centro_costo || 'N/A'}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-right">
                            <span className={`font-mono font-bold text-xs ${
                              isOverdue ? 'text-rose-600' : isImminent ? 'text-amber-600' : 'text-slate-700'
                            }`}>${formatCLP(inv.total_a_pagar)}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Recent Agricura docs */}
          {!loadingInv && agriStats.recent.length > 0 && (
            <div className="bg-white border border-slate-200/60 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                <FileText size={15} className="text-blue-500" />
                <h4 className="text-sm font-bold text-slate-700">Últimos Documentos</h4>
              </div>
              <div className="divide-y divide-slate-100">
                {agriStats.recent.map(inv => {
                  const isOverdue = inv.status_pago === 'PENDIENTE' && (inv.fecha_venc ?? '') < todayStr;
                  return (
                    <div key={inv.id} className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-slate-50/40 transition-colors">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{inv.proveedor}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-xs text-slate-400">#{inv.folio}</span>
                          <span className="text-xs text-slate-400">{inv.fecha_emision}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`font-mono text-sm font-bold ${isOverdue ? 'text-rose-500' : inv.status_pago === 'PAGADO' ? 'text-emerald-600' : 'text-amber-600'}`}>
                          ${formatCLP(inv.total_a_pagar)}
                        </p>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isOverdue ? 'bg-rose-50 text-rose-600' : inv.status_pago === 'PAGADO' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                          {isOverdue ? 'VENCIDA' : inv.status_pago}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          DATOS SII
      ════════════════════════════════════════════════════════════════════════ */}
      <section>
        <SectionHeading
          color="bg-violet-500"
          title="Datos SII"
          badge={!loadingSII ? `${siiRecords.length} registros` : null}
        />

        {/* KPI row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4 mb-6">
          <KpiCard label="Total Neto"       value={siiStats.totalNeto}  color="violet" icon={<TrendingUp size={18} />} loading={loadingSII} />
          <KpiCard label="IVA Recuperable"  value={siiStats.totalIVA}   color="indigo" icon={<TrendingUp size={18} />} loading={loadingSII} />
          <KpiCard label="Total Compras"    value={siiStats.totalMonto} color="slate"  icon={<TrendingUp size={18} />} loading={loadingSII} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* By tipo_compra */}
          {!loadingSII && Object.keys(siiStats.byTipo).length > 0 && (
            <div className="bg-white border border-slate-200/60 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                <BarChart3 size={15} className="text-violet-500" />
                <h4 className="text-sm font-bold text-slate-700">Por Tipo de Compra</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50/60 text-xs text-slate-400 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-5 py-3 text-left">Tipo</th>
                      <th className="px-5 py-3 text-right">Docs</th>
                      <th className="px-5 py-3 text-right">Neto</th>
                      <th className="px-5 py-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {Object.entries(siiStats.byTipo)
                      .sort(([, a], [, b]) => b.total - a.total)
                      .map(([tipo, v]) => (
                        <tr key={tipo} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-5 py-3">
                            <span className="bg-violet-50 text-violet-700 text-xs px-2.5 py-1 rounded-lg border border-violet-100 font-medium">{tipo}</span>
                          </td>
                          <td className="px-5 py-3 text-right text-slate-500 font-medium text-xs">{v.count}</td>
                          <td className="px-5 py-3 text-right font-mono text-slate-600 text-xs">${formatCLP(v.neto)}</td>
                          <td className="px-5 py-3 text-right font-mono text-violet-700 font-semibold text-xs">${formatCLP(v.total)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Monthly SII */}
          {!loadingSII && siiStats.monthlyTop.length > 0 && (
            <div className="bg-white border border-slate-200/60 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                <BarChart3 size={15} className="text-violet-500" />
                <h4 className="text-sm font-bold text-slate-700">Resumen Mensual (últimos 6 meses)</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50/60 text-xs text-slate-400 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-5 py-3 text-left">Mes</th>
                      <th className="px-5 py-3 text-right">Docs</th>
                      <th className="px-5 py-3 text-right">Neto</th>
                      <th className="px-5 py-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {siiStats.monthlyTop.map(([mes, v]) => (
                      <tr key={mes} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3 font-medium text-slate-700 text-xs font-mono">{mes}</td>
                        <td className="px-5 py-3 text-right text-slate-500 font-medium text-xs">{v.count}</td>
                        <td className="px-5 py-3 text-right font-mono text-slate-600 text-xs">${formatCLP(v.neto)}</td>
                        <td className="px-5 py-3 text-right font-mono text-violet-700 font-semibold text-xs">${formatCLP(v.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Empty state */}
      {!loading && invoices.length === 0 && siiRecords.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
            <LayoutDashboard size={28} className="text-slate-400" />
          </div>
          <p className="text-base font-semibold text-slate-600">Sin datos todavía</p>
          <p className="text-sm text-slate-400 mt-1">Importa datos desde <span className="font-medium text-slate-500">Manejo de Datos</span> para ver el resumen aquí.</p>
        </div>
      )}
    </div>
  );
}
