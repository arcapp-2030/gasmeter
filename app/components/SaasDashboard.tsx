'use client'

import React, { useState, useMemo } from 'react';
import {
  Building2,
  Building,
  Flame,
  AlertTriangle,
  Receipt,
  FileText,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Printer,
  ChevronRight,
  DollarSign,
  BarChart3,
  Calendar,
  Zap,
  ArrowDownRight,
  X,
  Eye,
  Camera
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { saveReading, createCondo, createUnit } from '@/app/actions/saas';

const HISTORICAL_CONSUMPTION = [
  { month: 'Maio', consumo: 320, valor: 2720 },
  { month: 'Junho', consumo: 380, valor: 3230 },
  { month: 'Julho', consumo: 450, valor: 3825 },
  { month: 'Agosto', consumo: 420, valor: 3570 },
  { month: 'Setembro', consumo: 390, valor: 3315 },
  { month: 'Outubro', consumo: 410, valor: 3485 },
];

export default function SaasDashboard({ initialData }: { initialData: any[] }) {
  const [companies, setCompanies] = useState(initialData);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Seleções iniciais baseadas no banco Neon
  const [selectedCompanyId, setSelectedCompanyId] = useState(companies[0]?.id || '');
  
  const currentCompany = useMemo(() => {
    return companies.find((c: any) => c.id === selectedCompanyId) || companies[0];
  }, [companies, selectedCompanyId]);

  const condominiums = currentCompany?.condos || [];
  const [selectedCondoId, setSelectedCondoId] = useState(condominiums[0]?.id || '');

  const activeCondo = useMemo(() => {
    return condominiums.find((c: any) => c.id === selectedCondoId) || condominiums[0];
  }, [condominiums, selectedCondoId]);

  const units = activeCondo?.units || [];
  const [selectedMonth, setSelectedMonth] = useState('Outubro / 2026');

  // Modais
  const [isReadingModalOpen, setIsReadingModalOpen] = useState(false);
  const [selectedUnitForReading, setSelectedUnitForReading] = useState<any>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceUnit, setInvoiceUnit] = useState<any>(null);
  const [isCondoModalOpen, setIsCondoModalOpen] = useState(false);
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);

  // Forms
  const [currentReadingInput, setCurrentReadingInput] = useState('');
  const [newCondoForm, setNewCondoForm] = useState({ name: '', address: '', totalUnits: '', gasPricePerM3: '8.50', fixedFee: '15.00' });
  const [newUnitForm, setNewUnitForm] = useState({ block: '', unitNumber: '', residentName: '', meterNumber: '', initialReading: '0' });

  // Métricas Calculadas
  const metrics = useMemo(() => {
    const totalUnitsCount = units.length;
    const readUnits = units.filter((u: any) => u.readings && u.readings.length > 0 && u.readings[0].currentValue !== null);
    const pendingUnits = units.filter((u: any) => !u.readings || u.readings.length === 0);
    const alertUnits = units.filter((u: any) => u.readings && u.readings[0]?.status === 'ANOMALY');

    let totalM3Consumed = 0;
    readUnits.forEach((u: any) => {
      const r = u.readings[0];
      if (r) totalM3Consumed += r.consumption;
    });

    const gasRate = activeCondo?.gasRate || 8.5;
    const fixedFee = activeCondo?.fixedFee || 15;
    const totalRevenue = (totalM3Consumed * gasRate) + (readUnits.length * fixedFee);

    return {
      totalUnitsCount,
      readCount: readUnits.length,
      pendingCount: pendingUnits.length,
      alertCount: alertUnits.length,
      totalM3Consumed: totalM3Consumed.toFixed(1),
      totalRevenue: totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      gasRate,
      fixedFee
    };
  }, [units, activeCondo]);

  const handleOpenReadingModal = (unit: any) => {
    setSelectedUnitForReading(unit);
    setCurrentReadingInput(unit.readings?.[0]?.currentValue?.toString() || '');
    setIsReadingModalOpen(true);
  };

  const handleSaveReadingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnitForReading || !currentReadingInput) return;

    const res = await saveReading(selectedUnitForReading.id, parseFloat(currentReadingInput));
    if (res.success) {
      setIsReadingModalOpen(false);
      window.location.reload();
    } else {
      alert('Erro ao salvar leitura: ' + res.error);
    }
  };

  const handleCreateCondoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('companyId', selectedCompanyId);
    formData.append('name', newCondoForm.name);
    formData.append('address', newCondoForm.address);
    formData.append('gasPricePerM3', newCondoForm.gasPricePerM3);
    formData.append('fixedFee', newCondoForm.fixedFee);

    const res = await createCondo(formData);
    if (res.success) {
      setIsCondoModalOpen(false);
      window.location.reload();
    } else {
      alert('Erro: ' + res.error);
    }
  };

  const handleCreateUnitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCondo) return;
    const formData = new FormData();
    formData.append('condoId', activeCondo.id);
    formData.append('block', newUnitForm.block);
    formData.append('unitNumber', newUnitForm.unitNumber);
    formData.append('residentName', newUnitForm.residentName);
    formData.append('initialReading', newUnitForm.initialReading);

    const res = await createUnit(formData);
    if (res.success) {
      setIsUnitModalOpen(false);
      window.location.reload();
    } else {
      alert('Erro: ' + res.error);
    }
  };

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 font-sans overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between shrink-0">
        <div>
          <div className="p-5 flex items-center gap-3 border-b border-slate-800">
            <div className="bg-gradient-to-tr from-amber-500 to-orange-600 p-2.5 rounded-xl shadow-lg shadow-orange-500/20">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-white tracking-wide">GasMeter</h1>
              <p className="text-xs text-slate-400">SaaS Gestão de Gás</p>
            </div>
          </div>

          <nav className="p-3 space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'dashboard' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-4 h-4" /> Dashboard Geral
            </button>
            <button
              onClick={() => setActiveTab('condos')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'condos' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <Building className="w-4 h-4" /> Condomínios
            </button>
            <button
              onClick={() => setActiveTab('reading')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'reading' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <Zap className="w-4 h-4" /> Lançamento / Leitura
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'reports' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" /> Relatórios
            </button>
            <button
              onClick={() => setActiveTab('invoices')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'invoices' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <Receipt className="w-4 h-4" /> Faturas e Cobranças
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center font-bold text-orange-400 border border-slate-700">
              AD
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-slate-200 truncate">Admin SaaS</p>
              <p className="text-xs text-emerald-400 truncate">● Conectado (Neon DB)</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-900">
        
        {/* TOP BAR */}
        <header className="h-16 border-b border-slate-800 bg-slate-950 px-6 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-4">
            {/* Empresa Selector */}
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-sm">
              <Building2 className="w-4 h-4 text-orange-400" />
              <span className="text-xs text-slate-400">Gestora:</span>
              <select
                className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
                value={selectedCompanyId}
                onChange={(e) => {
                  setSelectedCompanyId(e.target.value);
                  const comp = companies.find((c: any) => c.id === e.target.value);
                  if (comp?.condos?.[0]) setSelectedCondoId(comp.condos[0].id);
                }}
              >
                {companies.map((c: any) => (
                  <option key={c.id} value={c.id} className="bg-slate-900 text-slate-200">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Condomínio Selector */}
            {condominiums.length > 0 && (
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-sm">
                <Building className="w-4 h-4 text-orange-400" />
                <span className="text-xs text-slate-400">Condomínio:</span>
                <select
                  className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
                  value={selectedCondoId}
                  onChange={(e) => setSelectedCondoId(e.target.value)}
                >
                  {condominiums.map((condo: any) => (
                    <option key={condo.id} value={condo.id} className="bg-slate-900 text-slate-200">
                      {condo.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Ref: <strong>{selectedMonth}</strong></span>
            </div>
            <button
              onClick={() => setIsCondoModalOpen(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-lg shadow-orange-500/20 transition-all"
            >
              <Plus className="w-4 h-4" /> Novo Condomínio
            </button>
          </div>
        </header>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">Visão Geral do Condomínio</h2>
                <p className="text-xs text-slate-400">{activeCondo?.name || 'Nenhum condomínio selecionado'} &bull; {activeCondo?.address}</p>
              </div>

              {!activeCondo ? (
                <div className="p-12 text-center bg-slate-950 border border-slate-800 rounded-xl text-slate-400">
                  Cadastre ou selecione um condomínio para visualizar os dados.
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                      <div className="flex items-center justify-between text-slate-400 mb-2">
                        <span className="text-xs font-medium">Consumo Total (Mês)</span>
                        <Flame className="w-4 h-4 text-orange-500" />
                      </div>
                      <div className="text-2xl font-bold text-white">{metrics.totalM3Consumed} <span className="text-sm font-normal text-slate-400">m³</span></div>
                    </div>

                    <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                      <div className="flex items-center justify-between text-slate-400 mb-2">
                        <span className="text-xs font-medium">Faturamento Estimado</span>
                        <DollarSign className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div className="text-2xl font-bold text-white">{metrics.totalRevenue}</div>
                      <p className="text-xs text-slate-400 mt-2">Tarifa: R$ {metrics.gasRate.toFixed(2)}/m³</p>
                    </div>

                    <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                      <div className="flex items-center justify-between text-slate-400 mb-2">
                        <span className="text-xs font-medium">Status da Leitura</span>
                        <CheckCircle2 className="w-4 h-4 text-blue-500" />
                      </div>
                      <div className="text-2xl font-bold text-white">
                        {metrics.readCount} <span className="text-sm text-slate-400">/ {metrics.totalUnitsCount}</span>
                      </div>
                    </div>

                    <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                      <div className="flex items-center justify-between text-slate-400 mb-2">
                        <span className="text-xs font-medium">Alertas de Vazamento</span>
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                      </div>
                      <div className="text-2xl font-bold text-amber-400">{metrics.alertCount} <span className="text-sm font-normal text-slate-400">unidade(s)</span></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-slate-950 border border-slate-800 p-5 rounded-xl">
                      <h3 className="text-sm font-semibold text-slate-200 mb-4">Histórico de Consumo (m³)</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={HISTORICAL_CONSUMPTION}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                            <YAxis stroke="#94a3b8" fontSize={12} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                            <Bar dataKey="consumo" fill="#f97316" radius={[4, 4, 0, 0]} name="Consumo (m³)" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-200 mb-4">Progresso de Medições</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-3 bg-slate-900 rounded-lg border border-slate-800">
                            <span className="text-xs text-slate-400">Concluídas</span>
                            <span className="text-sm font-bold text-emerald-400">{metrics.readCount} Unidades</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-slate-900 rounded-lg border border-slate-800">
                            <span className="text-xs text-slate-400">Pendentes</span>
                            <span className="text-sm font-bold text-amber-400">{metrics.pendingCount} Unidades</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveTab('reading')}
                        className="w-full mt-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2.5 rounded-lg border border-slate-700"
                      >
                        Ir para Lançamentos
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* CONDOMÍNIOS TAB */}
          {activeTab === 'condos' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Condomínios da Gestora</h2>
                <button
                  onClick={() => setIsCondoModalOpen(true)}
                  className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-3.5 py-2 rounded-lg flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Novo Condomínio
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {condominiums.map((condo: any) => (
                  <div key={condo.id} className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-slate-100 text-base">{condo.name}</h3>
                      <p className="text-xs text-slate-400 mt-1">{condo.address}</p>
                      <div className="mt-4 p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Tarifa m³:</span>
                          <span className="text-emerald-400 font-semibold">R$ {condo.gasRate.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Taxa Fixa:</span>
                          <span className="text-slate-200">R$ {condo.fixedFee.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => { setSelectedCondoId(condo.id); setActiveTab('reading'); }}
                      className="mt-4 text-orange-400 hover:text-orange-300 text-xs font-semibold flex items-center gap-1"
                    >
                      Gerenciar Unidades <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LEITURA / LANÇAMENTO TAB */}
          {activeTab === 'reading' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Lançamento de Leituras</h2>
                  <p className="text-xs text-slate-400">Condomínio: {activeCondo?.name}</p>
                </div>
                <button
                  onClick={() => setIsUnitModalOpen(true)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3.5 py-2 rounded-lg border border-slate-700 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Nova Unidade
                </button>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-400 font-semibold">
                        <th className="p-3.5">Bloco / Ap</th>
                        <th className="p-3.5">Morador</th>
                        <th className="p-3.5">Leitura Anterior (m³)</th>
                        <th className="p-3.5">Leitura Atual (m³)</th>
                        <th className="p-3.5">Consumo ($m^3$)</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {units.map((unit: any) => {
                        const latestReading = unit.readings?.[0];
                        const prev = latestReading?.previousValue ?? 0;
                        const curr = latestReading?.currentValue ?? null;
                        const consumed = curr !== null ? latestReading.consumption : '-';

                        return (
                          <tr key={unit.id} className="hover:bg-slate-900/40">
                            <td className="p-3.5 font-semibold text-white">{unit.block} - Apt {unit.unitNumber}</td>
                            <td className="p-3.5">{unit.resident || 'Não informado'}</td>
                            <td className="p-3.5 font-mono">{prev.toFixed(1)}</td>
                            <td className="p-3.5 font-mono font-semibold text-white">{curr !== null ? curr.toFixed(1) : '---'}</td>
                            <td className="p-3.5 font-mono font-bold text-orange-400">{consumed !== '-' ? `${consumed} m³` : '-'}</td>
                            <td className="p-3.5">
                              {curr !== null ? (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold">Lido</span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-semibold">Pendente</span>
                              )}
                            </td>
                            <td className="p-3.5 text-right">
                              <button
                                onClick={() => handleOpenReadingModal(unit)}
                                className="bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2.5 py-1 rounded text-[11px] font-semibold"
                              >
                                Lançar m³
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* RELATÓRIOS TAB */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white">Relatórios Gerenciais</h2>
              <div className="bg-slate-950 border border-slate-800 p-6 rounded-xl text-slate-300 text-sm">
                <p>Relatórios consolidados de consumo e auditoria fiscal do condomínio {activeCondo?.name}.</p>
              </div>
            </div>
          )}

          {/* FATURAS TAB */}
          {activeTab === 'invoices' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white">Faturas e Espelhos de Cobrança</h2>
              <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800">
                {units.filter((u: any) => u.readings?.[0]?.currentValue !== null).map((unit: any) => {
                  const r = unit.readings[0];
                  const total = r.totalAmount;
                  return (
                    <div key={unit.id} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-100 text-sm">{unit.block} - Apt {unit.unitNumber}</p>
                        <p className="text-xs text-slate-400">Morador: {unit.resident}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-emerald-400 font-bold text-sm">R$ {total.toFixed(2)}</span>
                        <button
                          onClick={() => { setInvoiceUnit(unit); setIsInvoiceModalOpen(true); }}
                          className="bg-slate-800 hover:bg-slate-700 text-orange-400 text-xs font-semibold px-3 py-2 rounded-lg border border-slate-700 flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" /> Ver Fatura
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* MODAL: LANÇAR LEITURA */}
      {isReadingModalOpen && selectedUnitForReading && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 space-y-5 relative">
            <button onClick={() => setIsReadingModalOpen(false)} className="absolute top-4 right-4 text-slate-400"><X className="w-5 h-5" /></button>
            <h3 className="font-bold text-lg text-white">Registrar Medição</h3>
            <form onSubmit={handleSaveReadingSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Leitura Atual (m³)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={currentReadingInput}
                  onChange={(e) => setCurrentReadingInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-mono text-lg focus:outline-none focus:border-orange-500"
                />
              </div>
              <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-xl text-sm">
                Salvar no Neon DB
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NOVO CONDOMÍNIO */}
      {isCondoModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 space-y-4 relative">
            <button onClick={() => setIsCondoModalOpen(false)} className="absolute top-4 right-4 text-slate-400"><X className="w-5 h-5" /></button>
            <h3 className="font-bold text-lg text-white">Cadastrar Condomínio</h3>
            <form onSubmit={handleCreateCondoSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Nome do Condomínio</label>
                <input type="text" required value={newCondoForm.name} onChange={e => setNewCondoForm({...newCondoForm, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white" />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Endereço</label>
                <input type="text" required value={newCondoForm.address} onChange={e => setNewCondoForm({...newCondoForm, address: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Preço m³ (R$)</label>
                  <input type="number" step="0.01" value={newCondoForm.gasPricePerM3} onChange={e => setNewCondoForm({...newCondoForm, gasPricePerM3: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white" />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Taxa Fixa (R$)</label>
                  <input type="number" step="0.01" value={newCondoForm.fixedFee} onChange={e => setNewCondoForm({...newCondoForm, fixedFee: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white" />
                </div>
              </div>
              <button type="submit" className="w-full mt-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-xl text-xs">
                Salvar Condomínio
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NOVA UNIDADE */}
      {isUnitModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 space-y-4 relative">
            <button onClick={() => setIsUnitModalOpen(false)} className="absolute top-4 right-4 text-slate-400"><X className="w-5 h-5" /></button>
            <h3 className="font-bold text-lg text-white">Nova Unidade / Medidor</h3>
            <form onSubmit={handleCreateUnitSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Bloco / Torre</label>
                  <input type="text" required placeholder="Bloco A" value={newUnitForm.block} onChange={e => setNewUnitForm({...newUnitForm, block: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white" />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Apto</label>
                  <input type="text" required placeholder="101" value={newUnitForm.unitNumber} onChange={e => setNewUnitForm({...newUnitForm, unitNumber: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white" />
                </div>
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Morador</label>
                <input type="text" required value={newUnitForm.residentName} onChange={e => setNewUnitForm({...newUnitForm, residentName: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white" />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Leitura Inicial (m³)</label>
                <input type="number" step="0.1" value={newUnitForm.initialReading} onChange={e => setNewUnitForm({...newUnitForm, initialReading: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white" />
              </div>
              <button type="submit" className="w-full mt-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-xl text-xs">
                Cadastrar Unidade
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: FATURA INDIVIDUAL */}
      {isInvoiceModalOpen && invoiceUnit && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white text-slate-900 w-full max-w-lg rounded-2xl p-6 space-y-6 relative shadow-2xl">
            <button onClick={() => setIsInvoiceModalOpen(false)} className="absolute top-4 right-4 text-slate-400"><X className="w-5 h-5" /></button>
            <div className="border-b border-slate-200 pb-4 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-slate-900">GasMeter - Fatura</h3>
                <p className="text-xs text-slate-500">Consumo de Gás Encanado</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-600">{activeCondo?.name}</p>
                <p className="text-xs text-slate-400">{invoiceUnit.block} - Apt {invoiceUnit.unitNumber}</p>
              </div>
            </div>
            <div className="space-y-2 text-xs">
              <p className="text-slate-600">Morador: <strong>{invoiceUnit.resident}</strong></p>
              <p className="text-slate-600">Consumo Medido: <strong className="text-orange-600">{invoiceUnit.readings[0]?.consumption} m³</strong></p>
              <p className="text-slate-600">Valor Total: <strong className="text-emerald-600 text-sm">R$ {invoiceUnit.readings[0]?.totalAmount.toFixed(2)}</strong></p>
            </div>
            <button onClick={() => window.print()} className="w-full bg-slate-900 text-white font-semibold py-2.5 rounded-xl text-xs">
              Imprimir / Salvar PDF
            </button>
          </div>
        </div>
      )}

    </div>
  );
}