// js/storage.js — Connecteur Supabase · Frigelis
const SUPABASE_URL = "https://sowykjqkyzsgsvrnxjho.supabase.co";
const SUPABASE_KEY = "sb_publishable_7Het16qABI-qLmSd5QzKKQ_hw7aG4iB";
export const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

export const db = {
  async getServices(activeOnly = false) {
    let q = supabase.from('services').select('*').order('id');
    if (activeOnly) q = q.eq('is_active', true);
    const { data, error } = await q; if (error) throw error; return data;
  },
  async updateService(id, fields) {
    const { error } = await supabase.from('services').update(fields).eq('id', id); if (error) throw error;
  },
  async insertService(d) {
    const { error } = await supabase.from('services').insert([d]); if (error) throw error;
  },
  async deleteService(id) {
    const { error } = await supabase.from('services').delete().eq('id', id); if (error) throw error;
  },
  async getContacts() {
    const { data, error } = await supabase.from('contacts').select('*').order('created_at',{ascending:false}); if (error) throw error; return data;
  },
  async insertContact(d) {
    const { error } = await supabase.from('contacts').insert([d]); if (error) throw error;
  },
  async updateContactStatus(id, status) {
    const { error } = await supabase.from('contacts').update({status}).eq('id',id); if (error) throw error;
  },
  async getAvis(visibleOnly = false) {
    let q = supabase.from('avis').select('*').order('created_at',{ascending:false});
    if (visibleOnly) q = q.eq('is_visible', true);
    const { data, error } = await q; if (error) throw error; return data;
  },
  async insertAvis(d) {
    const { error } = await supabase.from('avis').insert([d]); if (error) throw error;
  },
  async updateAvis(id, fields) {
    const { error } = await supabase.from('avis').update(fields).eq('id',id); if (error) throw error;
  },
  async deleteAvis(id) {
    const { error } = await supabase.from('avis').delete().eq('id',id); if (error) throw error;
  },
};
