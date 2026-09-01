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
  { id: 'dashboard', nome: 'Início', ic: 'inicio' },
  { id: 'orcamento', nome: 'Orçamento', ic: 'orcamento' },
  { id: 'missoes', nome: 'Missões', ic: 'missoes' },
  { id: 'estrategias', nome: 'Estratégias', ic: 'estrategias' },
  { id: 'assistente', nome: 'Assistente', ic: 'assistente' },
];

const MENU_EXTRA = [
  { id: 'prioridades', nome: 'Prioridades', ic: 'estrela', desc: 'O que é inegociável para você' },
  { id: 'convidados', nome: 'Lista de convidados', ic: 'pessoas', desc: 'Nomes, círculos e confirmação' },
  { id: 'fornecedores', nome: 'Fornecedores', ic: 'proposta', desc: 'Cadastrar e comparar propostas' },
  { id: 'cenarios', nome: 'Simulador de cenários', ic: 'balanca', desc: 'Comparar dois formatos de casamento' },
  { id: 'cronograma', nome: 'Cronograma', ic: 'calendario', desc: 'O que fazer em cada fase' },
  { id: 'calculadoras', nome: 'Calculadoras', ic: 'calculadora', desc: 'Quantidades, parcelas e poupança' },
  { id: 'documentos', nome: 'Contratos e documentos', ic: 'documentacao', desc: 'Registrar valores, prazos e multas' },
  { id: 'modo7mil', nome: 'Modo R$7 mil', ic: 'raio', desc: 'Meta de planejamento enxuto' },
  { id: 'perfil', nome: 'Meus dados', ic: 'pessoas', desc: 'Orçamento, data, convidados, estilo' },
  { id: 'perfis', nome: 'Trocar de perfil', ic: 'troca', desc: 'Mais de uma pessoa neste aparelho' },
  { id: 'config', nome: 'Configurações', ic: 'engrenagem', desc: 'Margem de segurança, backup, reiniciar' },
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
      <span class="menu-ic">${icone(m.ic, 20)}</span>
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
  const ic = a.nivel === 'alto' ? 'alerta' : a.nivel === 'medio' ? 'sino' : a.nivel === 'ok' ? 'ok' : 'info';
  return `<div class="alerta ${a.nivel}"><span class="ic">${icone(ic, 17)}</span><span>${escapar(a.texto || a.titulo)}</span></div>`;
}

function componenteVazio(nomeIcone, titulo, texto, botao) {
  return `<div class="vazio">
    <span class="vazio-ic">${icone(nomeIcone, 34)}</span>
    <div style="font-family:var(--display);font-size:18px;color:var(--carvao);margin-bottom:6px">${escapar(titulo)}</div>
    <p style="font-size:13px">${escapar(texto)}</p>
    ${botao || ''}
  </div>`;
}

/* Avaliação pessoal em estrelas desenhadas (preenchidas e vazias) */
function estrelas(n) {
  const total = 5;
  let html = '<span class="estrelas">';
  for (let i = 1; i <= total; i++) {
    html += `<span class="${i <= n ? 'cheia' : 'vazia'}">${icone('estrela', 12)}</span>`;
  }
  return html + '</span>';
}

/* ------------------------------------------------------- movimento */

/*
 * Anima a contagem de um número. Só roda quando a pessoa não pediu
 * "reduzir movimento" no sistema — acessibilidade antes de efeito.
 */
function animarNumeros(raiz) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  $$('[data-contar]', raiz || document).forEach((el) => {
    const alvo = Number(el.dataset.contar) || 0;
    const prefixo = el.dataset.prefixo || '';
    const duracao = 620;
    const inicio = performance.now();
    const passo = (agora) => {
      const t = Math.min(1, (agora - inicio) / duracao);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = prefixo + formatarMoeda(Math.round(alvo * eased));
      if (t < 1) requestAnimationFrame(passo);
    };
    requestAnimationFrame(passo);
  });
}

/* Entrada escalonada dos cards, para a tela "montar" em vez de aparecer pronta */
function animarEntrada(raiz) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const alvos = $$('.conteudo > .card, .conteudo > .secao, .conteudo > .grade-2, .conteudo > .grade-3', raiz || document);
  alvos.slice(0, 14).forEach((el, i) => {
    el.style.animation = `sobe .42s cubic-bezier(.22,1,.36,1) ${i * 45}ms both`;
  });
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
