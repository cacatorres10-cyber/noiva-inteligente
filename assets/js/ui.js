/* NOIVA INTELIGENTE — Utilitários de interface, navegação e componentes */

/* ------------------------------------------------------------ formato */

function formatarMoeda(v, curto) {
  const n = Number(v) || 0;
  if (curto && Math.abs(n) >= 1000) {
    return 'R$ ' + (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1).replace('.', ',') + 'k';
  }
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
}

function formatarData(iso) {
  if (!iso) return '—';
  const d = new Date(iso.length <= 10 ? iso + 'T12:00:00' : iso);
  if (isNaN(d)) return '—';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function pct(parte, total) {
  if (!total) return 0;
  return Math.min(100, Math.max(0, (parte / total) * 100));
}

function escapar(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/* Markdown mínimo usado nas respostas do assistente: **negrito**, _leve_ */
function textoRico(t) {
  return escapar(t)
    .split('\n\n')
    .map((p) => {
      const html = p
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/_(.+?)_/g, '<em>$1</em>')
        .replace(/\n/g, '<br>');
      return `<p>${html}</p>`;
    })
    .join('');
}

/* ------------------------------------------------------------- DOM */

function $(sel, raiz) {
  return (raiz || document).querySelector(sel);
}
function $$(sel, raiz) {
  return Array.from((raiz || document).querySelectorAll(sel));
}

/* ------------------------------------------------------ navegação */

const TELAS_NAV = [
  { id: 'dashboard', nome: 'Início', ic: '🏠' },
  { id: 'orcamento', nome: 'Orçamento', ic: '💰' },
  { id: 'missoes', nome: 'Missões', ic: '🎯' },
  { id: 'estrategias', nome: 'Estratégias', ic: '📚' },
  { id: 'assistente', nome: 'Assistente', ic: '💬' },
];

const MENU_EXTRA = [
  { id: 'prioridades', nome: 'Prioridades', ic: '⭐', desc: 'O que é inegociável para você' },
  { id: 'fornecedores', nome: 'Fornecedores', ic: '🤝', desc: 'Cadastrar e comparar propostas' },
  { id: 'cenarios', nome: 'Simulador de cenários', ic: '⚖️', desc: 'Comparar dois formatos de casamento' },
  { id: 'cronograma', nome: 'Cronograma', ic: '🗓️', desc: 'O que fazer em cada fase' },
  { id: 'calculadoras', nome: 'Calculadoras', ic: '🧮', desc: 'Quantidades, parcelas e poupança' },
  { id: 'documentos', nome: 'Contratos e documentos', ic: '📄', desc: 'Registrar valores, prazos e multas' },
  { id: 'modo7mil', nome: 'Modo R$7 mil', ic: '✨', desc: 'Meta de planejamento enxuto' },
  { id: 'perfil', nome: 'Meus dados', ic: '👤', desc: 'Orçamento, data, convidados, estilo' },
  { id: 'config', nome: 'Configurações', ic: '⚙️', desc: 'Margem de segurança, backup, reiniciar' },
];

const App = {
  telaAtual: 'dashboard',

  ir(tela, params) {
    this.telaAtual = tela;
    fecharGaveta();
    $$('.tela').forEach((t) => t.classList.remove('ativa'));
    const alvo = $('#tela-' + tela);
    if (alvo) alvo.classList.add('ativa');
    $$('.nav button').forEach((b) => b.classList.toggle('ativo', b.dataset.tela === tela));
    Telas.renderizar(tela, params);
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  },

  atualizar() {
    Telas.renderizar(this.telaAtual);
  },
};

/* --------------------------------------------------------- gaveta */

function abrirGaveta(titulo, subtitulo, htmlCorpo) {
  $('#gaveta-titulo').innerHTML = escapar(titulo);
  $('#gaveta-sub').innerHTML = subtitulo ? escapar(subtitulo) : '';
  $('#gaveta-corpo').innerHTML = htmlCorpo;
  $('#gaveta').classList.add('aberta');
  $('#gaveta-fundo').classList.add('aberta');
  $('#gaveta').scrollTop = 0;
}

function fecharGaveta() {
  $('#gaveta').classList.remove('aberta');
  $('#gaveta-fundo').classList.remove('aberta');
}

function abrirMenu() {
  const html = MENU_EXTRA.map(
    (m) => `
    <button class="opcao" onclick="App.ir('${m.id}')">
      <span class="emoji">${m.ic}</span>
      <span><strong>${m.nome}</strong><span class="desc">${m.desc}</span></span>
    </button>`
  ).join('');
  abrirGaveta('Mais ferramentas', 'Tudo que compõe o seu plano', html);
}

/* ---------------------------------------------------- componentes */

function componenteBarraOrcamento(r) {
  const pPago = pct(r.pago, r.total);
  const pContratado = pct(Math.max(0, r.contratado - r.pago), r.total);
  const pPlanejado = pct(Math.max(0, r.planejado - r.contratado), r.total);
  const pReserva = pct(r.reserva, r.total);
  return `
    <div class="barra">
      <span class="b-pago" style="width:${pPago}%"></span>
      <span class="b-contratado" style="width:${pContratado}%"></span>
      <span class="b-planejado" style="width:${pPlanejado}%"></span>
      <span class="b-reserva" style="width:${pReserva}%"></span>
    </div>
    <div class="legenda">
      <span class="legenda-item"><i class="ponto b-pago"></i> Pago</span>
      <span class="legenda-item"><i class="ponto b-contratado"></i> Contratado</span>
      <span class="legenda-item"><i class="ponto b-planejado"></i> Planejado</span>
      <span class="legenda-item"><i class="ponto b-reserva"></i> Reserva</span>
    </div>`;
}

function componenteAlerta(a) {
  const ic = a.nivel === 'alto' ? '⚠️' : a.nivel === 'medio' ? '🔔' : a.nivel === 'ok' ? '✓' : 'ℹ️';
  return `<div class="alerta ${a.nivel}"><span class="ic">${ic}</span><span>${escapar(a.texto || a.titulo)}</span></div>`;
}

function componenteVazio(emoji, titulo, texto, botao) {
  return `<div class="vazio">
    <span class="emoji">${emoji}</span>
    <div style="font-family:var(--display);font-size:18px;color:var(--carvao);margin-bottom:6px">${escapar(titulo)}</div>
    <p style="font-size:13px">${escapar(texto)}</p>
    ${botao || ''}
  </div>`;
}

function selectOpcoes(lista, valor, chaveId, chaveNome) {
  return lista
    .map((o) => {
      const id = chaveId ? o[chaveId] : o.id;
      const nome = chaveNome ? o[chaveNome] : o.nome;
      return `<option value="${escapar(id)}" ${id === valor ? 'selected' : ''}>${escapar(nome)}</option>`;
    })
    .join('');
}

function toast(msg) {
  let t = $('#toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.style.cssText =
      'position:fixed;bottom:88px;left:50%;transform:translateX(-50%);background:var(--carvao);color:#fff;padding:11px 20px;border-radius:99px;font-size:13.5px;z-index:80;box-shadow:0 8px 24px rgba(0,0,0,.25);opacity:0;transition:opacity .2s ease;pointer-events:none;max-width:88%;text-align:center';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  requestAnimationFrame(() => (t.style.opacity = '1'));
  clearTimeout(t._timer);
  t._timer = setTimeout(() => (t.style.opacity = '0'), 2600);
}

/* Aviso obrigatório sobre estimativas */
const AVISO_ESTIMATIVA =
  'Os valores calculados aqui são estimativas de planejamento. Custos reais variam conforme cidade, data, número de convidados, fornecedores e escolhas. Substitua por orçamentos reais assim que tiver os primeiros.';
