// js/admin.js
import { db } from './storage.js';
import { toast, checkAdminAuth } from './app.js';
export { checkAdminAuth };

const $ = id => document.getElementById(id);
const val = id => $(id)?.value.trim() || '';
const clr = (...ids) => ids.forEach(id => { if($(id)) $(id).value=''; });
const set = (id,v) => { if($(id)) $(id).textContent = v; };
const fmtD = iso => iso ? new Date(iso).toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric'}) : '—';
const rowLoad = c => `<tr><td colspan="${c}" style="text-align:center;padding:2rem;color:#94a3b8">Chargement…</td></tr>`;
const rowEmpty = c => `<tr><td colspan="${c}" style="text-align:center;padding:2rem;color:#94a3b8">Aucune donnée.</td></tr>`;
const rowErr = c => `<tr><td colspan="${c}" style="text-align:center;padding:2rem;color:#ef4444">Erreur Supabase</td></tr>`;

export async function loadDashboard() {
  try {
    const [svcs, avis, contacts] = await Promise.all([db.getServices(), db.getAvis(), db.getContacts()]);
    set('stat-svc', svcs.filter(s=>s.is_active).length);
    set('stat-avis', avis.filter(a=>a.is_visible).length);
    set('stat-msgs', contacts.length);
    set('stat-new', contacts.filter(c=>c.status==='nouveau').length);
    const box = $('dash-msgs');
    if (!box) return;
    box.innerHTML = !contacts.length
      ? '<p style="color:#94a3b8;padding:.5rem 0">Aucun message reçu.</p>'
      : contacts.slice(0,6).map(c=>`
          <div style="display:flex;gap:.85rem;padding:.85rem 0;border-bottom:1px solid #f1f5f9">
            <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#0f2744,#2563eb);color:white;display:flex;align-items:center;justify-content:center;font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:.95rem;flex-shrink:0">${c.nom?.charAt(0).toUpperCase()||'?'}</div>
            <div style="flex:1;min-width:0">
              <div style="font-weight:600;color:#0f2744;font-size:.875rem;display:flex;align-items:center;gap:.4rem;margin-bottom:.15rem">
                ${c.nom}
                <span style="background:${c.status==='nouveau'?'#fffbeb':'#ecfdf5'};color:${c.status==='nouveau'?'#f59e0b':'#10b981'};font-size:.62rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;padding:.15rem .55rem;border-radius:999px">${c.status}</span>
              </div>
              <div style="color:#64748b;font-size:.8rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${c.message?.substring(0,80)}${c.message?.length>80?'…':''}</div>
              <div style="color:#94a3b8;font-size:.72rem;margin-top:.15rem">${c.email} · ${fmtD(c.created_at)}</div>
            </div>
          </div>`).join('');
  } catch(e) { toast('Erreur de chargement','error'); }
}

/* SERVICES */
export async function loadAdminServices() {
  const tb = $('svc-tbody'); if (!tb) return;
  tb.innerHTML = rowLoad(5);
  try {
    const list = await db.getServices();
    tb.innerHTML = list.map(s=>`
      <tr>
        <td class="td-ico">${s.icone||'🔧'}</td>
        <td class="td-b">${s.title}</td>
        <td style="color:#2563eb;font-family:'Barlow Condensed',sans-serif;font-weight:700">${s.price||'—'}</td>
        <td><span style="background:${s.is_active?'#ecfdf5':'#fef2f2'};color:${s.is_active?'#10b981':'#ef4444'};font-size:.62rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;padding:.2rem .65rem;border-radius:999px">${s.is_active?'Actif':'Inactif'}</span></td>
        <td class="td-act">
          <button class="tbl-btn" onclick="admToggleSvc(${s.id},${!s.is_active})">${s.is_active?'Désactiver':'Activer'}</button>
          <button class="tbl-btn danger" onclick="admDelSvc(${s.id})">Suppr.</button>
        </td>
      </tr>`).join('') || rowEmpty(5);
  } catch { tb.innerHTML = rowErr(5); }
}
window.admToggleSvc = async (id,v) => {
  try { await db.updateService(id,{is_active:v}); toast(v?'✅ Activé':'⏸ Désactivé','success'); loadAdminServices(); } catch { toast('Erreur','error'); }
};
window.admDelSvc = async id => {
  if(!confirm('Supprimer ce service ?')) return;
  try { await db.deleteService(id); toast('Supprimé','success'); loadAdminServices(); } catch { toast('Erreur','error'); }
};
window.admAddSvc = async () => {
  const title=val('s-title'), description=val('s-desc'), price=val('s-price')||'Sur devis', icone=val('s-icone')||'🔧';
  if(!title){ toast('Titre requis','warning'); return; }
  try { await db.insertService({title,description,price,icone,is_active:true}); toast('✅ Ajouté','success'); clr('s-title','s-desc','s-price','s-icone'); loadAdminServices(); } catch { toast('Erreur Supabase','error'); }
};

/* AVIS */
export async function loadAdminAvis() {
  const tb = $('avis-tbody'); if(!tb) return;
  tb.innerHTML = rowLoad(5);
  try {
    const list = await db.getAvis();
    tb.innerHTML = list.map(a=>`
      <tr>
        <td class="td-b">${a.client_name}</td>
        <td style="color:#f59e0b">${'★'.repeat(a.note||5)}</td>
        <td class="td-url">${a.commentaire}</td>
        <td><span style="background:${a.is_visible?'#ecfdf5':'#fef2f2'};color:${a.is_visible?'#10b981':'#ef4444'};font-size:.62rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;padding:.2rem .65rem;border-radius:999px">${a.is_visible?'Visible':'Masqué'}</span></td>
        <td class="td-act">
          <button class="tbl-btn" onclick="admToggleAvis(${a.id},${!a.is_visible})">${a.is_visible?'Masquer':'Afficher'}</button>
          <button class="tbl-btn danger" onclick="admDelAvis(${a.id})">Suppr.</button>
        </td>
      </tr>`).join('') || rowEmpty(5);
  } catch { tb.innerHTML = rowErr(5); }
}
window.admToggleAvis = async (id,v) => {
  try { await db.updateAvis(id,{is_visible:v}); toast(v?'👁 Visible':'🙈 Masqué','success'); loadAdminAvis(); } catch { toast('Erreur','error'); }
};
window.admDelAvis = async id => {
  if(!confirm('Supprimer ?')) return;
  try { await db.deleteAvis(id); toast('Supprimé','success'); loadAdminAvis(); } catch { toast('Erreur','error'); }
};
window.admAddAvis = async () => {
  const client_name=val('a-nom'), note=parseInt(val('a-note'))||5, commentaire=val('a-comment');
  if(!client_name||!commentaire){ toast('Champs requis','warning'); return; }
  try { await db.insertAvis({client_name,note:Math.min(5,Math.max(1,note)),commentaire,is_visible:true,created_at:new Date().toISOString()}); toast('✅ Ajouté','success'); clr('a-nom','a-comment'); $('a-note').value='5'; loadAdminAvis(); } catch { toast('Erreur','error'); }
};

/* MESSAGES */
export async function loadAdminMsgs() {
  const tb = $('msgs-tbody'); if(!tb) return;
  tb.innerHTML = rowLoad(7);
  try {
    const list = await db.getContacts();
    tb.innerHTML = list.map(c=>`
      <tr>
        <td class="td-b">${c.nom}</td>
        <td>${c.email}</td>
        <td>${c.telephone||'—'}</td>
        <td>${c.service||'—'}</td>
        <td class="td-url">${c.message}</td>
        <td><span style="background:${c.status==='nouveau'?'#fffbeb':'#ecfdf5'};color:${c.status==='nouveau'?'#f59e0b':'#10b981'};font-size:.62rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;padding:.2rem .65rem;border-radius:999px">${c.status}</span></td>
        <td>${fmtD(c.created_at)}</td>
        <td class="td-act"><button class="tbl-btn" onclick="admMarkRead(${c.id})">Lu ✓</button></td>
      </tr>`).join('') || rowEmpty(8);
  } catch { tb.innerHTML = rowErr(8); }
}
window.admMarkRead = async id => {
  try { await db.updateContactStatus(id,'lu'); toast('✅ Marqué lu','success'); loadAdminMsgs(); } catch { toast('Erreur','error'); }
};
