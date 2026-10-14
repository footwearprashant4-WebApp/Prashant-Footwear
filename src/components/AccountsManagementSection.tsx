import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, UserPlus, Shield, ShieldCheck, Key, Lock, Phone, 
  CheckCircle2, XCircle, Trash2, Edit3, Check, X, Eye, EyeOff,
  AlertCircle, Sparkles, RefreshCw, Smartphone, Search
} from 'lucide-react';

export interface ManagedUserAccount {
  id: string;
  username: string;
  fullName: string;
  mobile: string;
  role: 'main_admin' | 'administrative' | 'admin' | 'cashier';
  pin: string;
  status: 'on_duty' | 'off_duty';
  permissions: string[];
  lastLogin?: string;
  createdAt: string;
}

const DEFAULT_ACCOUNTS: ManagedUserAccount[] = [
  {
    id: 'usr-001',
    username: 'prashant_admin',
    fullName: 'Prashant Footwear (Store Owner)',
    mobile: '+91 94123 88776',
    role: 'main_admin',
    pin: '1234',
    status: 'on_duty',
    permissions: ['all_access', 'billing_counter', 'refund_return', 'manage_stock', 'view_reports', 'brand_config', 'erp_config', 'manage_accounts'],
    createdAt: '2026-01-01T00:00:00.000Z',
    lastLogin: new Date().toISOString()
  },
  {
    id: 'usr-002',
    username: 'store_manager_1',
    fullName: 'Ramesh Kumar (Store Manager)',
    mobile: '+91 98970 12345',
    role: 'administrative',
    pin: '2244',
    status: 'on_duty',
    permissions: ['billing_counter', 'refund_return', 'manage_stock', 'view_reports', 'brand_config'],
    createdAt: '2026-02-15T00:00:00.000Z',
    lastLogin: new Date().toISOString()
  },
  {
    id: 'usr-003',
    username: 'counter_cashier_1',
    fullName: 'Suresh Verma (Billing Desk)',
    mobile: '+91 94120 55432',
    role: 'cashier',
    pin: '5566',
    status: 'on_duty',
    permissions: ['billing_counter', 'refund_return'],
    createdAt: '2026-03-01T00:00:00.000Z',
    lastLogin: new Date().toISOString()
  }
];

const PERMISSION_OPTIONS = [
  { id: 'billing_counter', label: 'Make Bills & Invoices', desc: 'Create retail customer invoices at billing desk' },
  { id: 'refund_return', label: 'Refund & Returns', desc: 'Process shoe exchanges and credit refunds' },
  { id: 'manage_stock', label: 'Inventory & Stock Management', desc: 'Add purchase ledgers and adjust quantities' },
  { id: 'view_reports', label: 'Sales Reports & Analytics', desc: 'Inspect monthly revenue, daily stats and profits' },
  { id: 'brand_config', label: 'Brand Config & Media', desc: 'Update hero video banners and brand profiles' },
  { id: 'erp_config', label: 'ERP Settings', desc: 'Configure system presets and background audio' },
  { id: 'manage_accounts', label: 'Manage Staff Roles', desc: 'Add new staff users and edit credentials' }
];

interface AccountsManagementSectionProps {
  isDark: boolean;
}

export const AccountsManagementSection: React.FC<AccountsManagementSectionProps> = ({ isDark }) => {
  const [accounts, setAccounts] = useState<ManagedUserAccount[]>(() => {
    try {
      const saved = localStorage.getItem('prashant_managed_user_accounts');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_ACCOUNTS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | string>('all');
  const [isAdding, setIsAdding] = useState(false);
  const [editingUser, setEditingUser] = useState<ManagedUserAccount | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<ManagedUserAccount | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    mobile: '',
    role: 'cashier' as ManagedUserAccount['role'],
    pin: '',
    permissions: ['billing_counter'] as string[]
  });

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('prashant_managed_user_accounts', JSON.stringify(accounts));
    } catch (e) {}
  }, [accounts]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleStartEdit = (user: ManagedUserAccount) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      fullName: user.fullName,
      mobile: user.mobile,
      role: user.role,
      pin: user.pin,
      permissions: user.permissions
    });
    setIsAdding(true);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingUser(null);
    setFormData({
      username: '',
      fullName: '',
      mobile: '',
      role: 'cashier',
      pin: '',
      permissions: ['billing_counter']
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.username.trim() || !formData.pin.trim()) {
      alert('Please fill in Name, Username, and Security PIN.');
      return;
    }

    if (editingUser) {
      setAccounts(prev => prev.map(u => {
        if (u.id === editingUser.id) {
          return {
            ...u,
            username: formData.username.trim(),
            fullName: formData.fullName.trim(),
            mobile: formData.mobile.trim() || '+91 -',
            role: formData.role,
            pin: formData.pin.trim(),
            permissions: formData.permissions
          };
        }
        return u;
      }));
      showToast(`Updated "${formData.fullName}" successfully!`);
    } else {
      const newUser: ManagedUserAccount = {
        id: `usr-${Date.now()}`,
        username: formData.username.trim().toLowerCase(),
        fullName: formData.fullName.trim(),
        mobile: formData.mobile.trim() || '+91 -',
        role: formData.role,
        pin: formData.pin.trim(),
        status: 'on_duty',
        permissions: formData.permissions,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };
      setAccounts(prev => [newUser, ...prev]);
      showToast(`Added staff account "${formData.fullName}"!`);
    }
    handleCancel();
  };

  const toggleDutyStatus = (id: string) => {
    setAccounts(prev => prev.map(u => {
      if (u.id === id) {
        const nextStatus = u.status === 'on_duty' ? 'off_duty' : 'on_duty';
        showToast(`${u.fullName} is now ${nextStatus === 'on_duty' ? 'ON DUTY' : 'OFF DUTY'}`);
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  const handleDeleteUser = () => {
    if (!userToDelete) return;
    if (userToDelete.role === 'main_admin') {
      alert('Cannot delete the primary Store Owner / Main Admin account.');
      setUserToDelete(null);
      return;
    }
    setAccounts(prev => prev.filter(u => u.id !== userToDelete.id));
    showToast(`Deleted staff account "${userToDelete.fullName}".`);
    setUserToDelete(null);
  };

  const filteredAccounts = useMemo(() => {
    return accounts.filter(u => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        u.fullName.toLowerCase().includes(q) || 
        u.username.toLowerCase().includes(q) || 
        u.mobile.includes(q);

      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [accounts, searchQuery, roleFilter]);

  return (
    <div id="accounts-management-section" className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-[100] animate-bounce px-4 py-3 rounded-2xl bg-emerald-600 text-white font-mono text-xs font-bold shadow-2xl flex items-center gap-2 border border-emerald-400">
          <CheckCircle2 size={16} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className={`p-6 md:p-8 rounded-3xl border transition-all duration-300 shadow-xl ${
        isDark 
          ? 'bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 border-zinc-800 text-white' 
          : 'bg-gradient-to-br from-white via-[#FAF7F2] to-amber-50/30 border-[#E8DFC2] text-zinc-900 shadow-amber-900/5'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck size={12} />
                Access Control & Security
              </span>
              <span className="text-xs font-mono text-zinc-500">
                {accounts.length} Registered Team Members
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tight font-display">
              Manage Staff & Accounts
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1">
              Configure cashier credentials, store manager roles, security PIN codes, and POS desk permissions.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingUser(null);
              setIsAdding(true);
            }}
            className="px-5 py-3 rounded-2xl bg-[#C5A059] hover:bg-[#b08e4d] text-zinc-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-[#C5A059]/25 flex items-center gap-2 cursor-pointer transition-all active:scale-95 self-start md:self-auto"
          >
            <UserPlus size={16} className="stroke-[3px]" />
            <span>+ Add Staff Member</span>
          </button>
        </div>
      </div>

      {/* Add / Edit Form Modal */}
      {isAdding && (
        <form onSubmit={handleSubmit} className={`p-6 sm:p-8 rounded-3xl border space-y-6 shadow-2xl transition-all ${
          isDark ? 'bg-zinc-900/90 border-zinc-800 text-white' : 'bg-white border-[#E8DFC2] text-zinc-900'
        }`}>
          <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-[#C5A059]/15 text-[#C5A059]">
                <Users size={20} />
              </div>
              <div>
                <h3 className="font-black text-base uppercase font-display">
                  {editingUser ? `Edit Staff: ${editingUser.fullName}` : 'Add New Staff Account'}
                </h3>
                <p className="text-xs font-mono text-zinc-500">
                  Assign user role, security PIN, and workspace access permissions.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCancel}
              className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase font-mono text-zinc-500">Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Verma"
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                className={`w-full p-2.5 rounded-xl border text-xs font-bold outline-none ${
                  isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-slate-50 border-zinc-300 text-zinc-900'
                }`}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase font-mono text-zinc-500">Username / Handle</label>
              <input
                type="text"
                required
                placeholder="e.g. cashier_1"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                className={`w-full p-2.5 rounded-xl border text-xs font-mono outline-none ${
                  isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-slate-50 border-zinc-300 text-zinc-900'
                }`}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase font-mono text-zinc-500">Mobile Number</label>
              <input
                type="text"
                placeholder="e.g. +91 94123 45678"
                value={formData.mobile}
                onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
                className={`w-full p-2.5 rounded-xl border text-xs font-mono outline-none ${
                  isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-slate-50 border-zinc-300 text-zinc-900'
                }`}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase font-mono text-zinc-500">Account Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as any }))}
                className={`w-full p-2.5 rounded-xl border text-xs font-bold outline-none ${
                  isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-slate-50 border-zinc-300 text-zinc-900'
                }`}
              >
                <option value="cashier">Counter Cashier (Billing & Returns)</option>
                <option value="administrative">Store Manager / Admin</option>
                <option value="main_admin">Store Owner (Super Admin)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase font-mono text-zinc-500">Security Login PIN (4-6 digits)</label>
              <input
                type="password"
                required
                maxLength={6}
                placeholder="e.g. 1234"
                value={formData.pin}
                onChange={(e) => setFormData(prev => ({ ...prev, pin: e.target.value }))}
                className={`w-full p-2.5 rounded-xl border text-xs font-mono font-bold tracking-widest outline-none ${
                  isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-slate-50 border-zinc-300 text-zinc-900'
                }`}
              />
            </div>
          </div>

          {/* Granular Permissions */}
          <div className="space-y-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <label className="text-[11px] font-black uppercase font-mono text-zinc-500">
              Workspace Permissions & Access Control:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PERMISSION_OPTIONS.map(p => {
                const isSelected = formData.permissions.includes(p.id) || formData.permissions.includes('all_access');
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      if (isSelected) {
                        setFormData(prev => ({
                          ...prev,
                          permissions: prev.permissions.filter(x => x !== p.id && x !== 'all_access')
                        }));
                      } else {
                        setFormData(prev => ({
                          ...prev,
                          permissions: [...prev.permissions, p.id]
                        }));
                      }
                    }}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                      isSelected
                        ? isDark ? 'bg-[#C5A059]/10 border-[#C5A059] text-white' : 'bg-amber-50/80 border-[#C5A059] text-zinc-900'
                        : isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-400' : 'bg-slate-50 border-zinc-200 text-zinc-500'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border shrink-0 ${
                      isSelected ? 'bg-[#C5A059] border-[#C5A059] text-zinc-950' : 'border-zinc-400'
                    }`}>
                      {isSelected && <Check size={12} className="stroke-[3]" />}
                    </div>
                    <div>
                      <span className="font-bold text-xs block">{p.label}</span>
                      <span className="text-[10px] text-zinc-500 block mt-0.5">{p.desc}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={handleCancel}
              className="px-5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-500 font-bold text-xs uppercase cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#C5A059] hover:bg-[#b08e4d] text-zinc-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg shadow-[#C5A059]/25"
            >
              <Check size={14} className="stroke-[3px]" />
              <span>{editingUser ? 'Save Changes' : 'Create Account'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Accounts Directory List */}
      <div className={`p-6 rounded-3xl border transition-all duration-300 space-y-5 ${
        isDark ? 'bg-zinc-900/60 border-zinc-800 text-white shadow-xl' : 'bg-white border-zinc-200 text-zinc-900 shadow-sm'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="relative flex-1 max-w-md">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search staff by Name, Username, Mobile..."
              className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs border outline-none font-mono transition-all ${
                isDark ? 'bg-zinc-950 border-zinc-800 text-white focus:border-[#C5A059]' : 'bg-slate-50 border-zinc-200 text-zinc-900 focus:border-[#C5A059]'
              }`}
            />
          </div>

          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-950 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
            {(['all', 'main_admin', 'administrative', 'cashier'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1 rounded-lg text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
                  roleFilter === r ? 'bg-[#C5A059] text-zinc-950 shadow-xs' : 'text-zinc-500'
                }`}
              >
                {r === 'all' ? 'All Roles' : r === 'main_admin' ? 'Owner' : r === 'administrative' ? 'Manager' : 'Cashier'}
              </button>
            ))}
          </div>
        </div>

        {/* Directory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAccounts.map(user => {
            const isOwner = user.role === 'main_admin';
            const isOnDuty = user.status === 'on_duty';

            return (
              <div 
                key={user.id}
                className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
                  isDark ? 'bg-zinc-950/60 border-zinc-800' : 'bg-slate-50/70 border-zinc-200'
                }`}
              >
                <div className="space-y-3">
                  {/* Top: Avatar & Role */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm ${
                        isOwner ? 'bg-[#C5A059] text-zinc-950 font-black' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                      }`}>
                        {user.fullName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs font-sans">{user.fullName}</h4>
                        <span className="text-[10px] font-mono text-zinc-500 block">@{user.username}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleDutyStatus(user.id)}
                      className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border cursor-pointer transition-all ${
                        isOnDuty
                          ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
                          : 'bg-zinc-500/15 text-zinc-500 border-zinc-500/30'
                      }`}
                    >
                      {isOnDuty ? 'On Duty' : 'Off Duty'}
                    </button>
                  </div>

                  {/* Meta */}
                  <div className="space-y-1 text-[11px] font-mono text-zinc-500 pt-1">
                    <div className="flex items-center gap-1.5">
                      <Smartphone size={12} />
                      <span>{user.mobile || 'No Mobile'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Lock size={12} />
                      <span>PIN: ••••</span>
                    </div>
                  </div>

                  {/* Permissions Pills */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {user.permissions.includes('all_access') ? (
                      <span className="px-2 py-0.5 rounded-md bg-[#C5A059]/15 text-[#C5A059] border border-[#C5A059]/30 text-[9px] font-bold">
                        Super Admin (All Access)
                      </span>
                    ) : (
                      user.permissions.slice(0, 3).map(p => (
                        <span key={p} className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-[9px] font-mono font-medium">
                          {p.replace('_', ' ')}
                        </span>
                      ))
                    )}
                    {user.permissions.length > 3 && (
                      <span className="text-[9px] text-zinc-400 font-mono self-center">
                        +{user.permissions.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-1.5 pt-3 mt-3 border-t border-zinc-200 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(user)}
                    className="px-2.5 py-1 rounded-lg bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-[10px] uppercase flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <Edit3 size={11} />
                    <span>Edit</span>
                  </button>

                  {!isOwner && (
                    <button
                      type="button"
                      onClick={() => setUserToDelete(user)}
                      className="p-1 rounded-lg hover:bg-rose-500/20 text-zinc-400 hover:text-rose-500 cursor-pointer transition-all"
                      title="Delete User"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Delete User Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 ${
            isDark ? 'bg-zinc-900 border border-zinc-800 text-zinc-100' : 'bg-white border border-slate-200 text-slate-900'
          }`}>
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-500 flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>
            <div className="text-center">
              <h4 className="font-black text-base uppercase font-display">Remove Staff Account?</h4>
              <p className="text-xs text-zinc-500 mt-1">
                Are you sure you want to remove <span className="font-bold text-zinc-900 dark:text-white">"{userToDelete.fullName}"</span>? They will no longer be able to log in to the billing desk.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-500 font-bold text-xs uppercase cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider cursor-pointer shadow-lg shadow-rose-600/20"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
