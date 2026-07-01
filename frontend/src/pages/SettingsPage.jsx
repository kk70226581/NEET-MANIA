import React, { useEffect, useState } from 'react';
import { Bell, Lock, Save, Settings, ShieldCheck, User } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import AppShell from '../components/AppShell';
import { authAPI } from '../services/api';
import { setUser } from '../store/slices/userSlice';

const SettingsPage = () => {
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', targetYear: '2027' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) setForm({ firstName: user.firstName || '', lastName: user.lastName || '', phone: user.phone || '', targetYear: user.targetYear || '2027' });
  }, [user]);

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await authAPI.updateProfile({ ...form, targetYear: Number(form.targetYear) });
      const updated = response.data || { ...user, ...form };
      dispatch(setUser(updated));
      toast.success('Profile updated.');
    } catch (error) {
      toast.error(error.message || 'Could not update your profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell eyebrow="Account" title="Settings">
      <section className="product-hero compact"><div><span className="product-badge"><Settings size={15} /> Preferences</span><h2>Keep your study workspace personal and secure.</h2><p>Update your student profile and review the account details used across Solnut.</p></div></section>
      <section className="settings-layout">
        <form className="chalk-card settings-form" onSubmit={save}>
          <div className="settings-section-title"><span><User size={20} /></span><div><h2>Personal information</h2><p>Shown in your dashboard and reports.</p></div></div>
          <div className="settings-fields">
            <label><span>First name</span><input name="firstName" value={form.firstName} onChange={update} required /></label>
            <label><span>Last name</span><input name="lastName" value={form.lastName} onChange={update} required /></label>
            <label><span>Email address</span><input value={user?.email || ''} disabled /></label>
            <label><span>Phone</span><input name="phone" value={form.phone} onChange={update} placeholder="10-digit mobile number" /></label>
            <label><span>Target year</span><select name="targetYear" value={form.targetYear} onChange={update}><option>2026</option><option>2027</option><option>2028</option></select></label>
            <label><span>Target exam</span><input value="NEET UG" disabled /></label>
          </div>
          <button className="report-primary-button" disabled={saving}><Save size={16} /> {saving ? 'Saving…' : 'Save changes'}</button>
        </form>
        <aside className="settings-side">
          <div className="chalk-card account-card"><ShieldCheck size={22} /><div><h3>Account status</h3><p>Your JWT-protected student account is active.</p></div><span>Active</span></div>
          <div className="chalk-card setting-link"><Lock size={20} /><div><strong>Password & security</strong><small>Change your password regularly</small></div></div>
          <div className="chalk-card setting-link"><Bell size={20} /><div><strong>Study reminders</strong><small>Daily plan and revision alerts</small></div></div>
        </aside>
      </section>
    </AppShell>
  );
};

export default SettingsPage;
