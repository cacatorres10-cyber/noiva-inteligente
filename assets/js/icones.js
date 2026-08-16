/*
 * NOIVA INTELIGENTE — Biblioteca de ícones
 *
 * Ícones SVG desenhados em traço, viewBox 24x24, herdando currentColor.
 * Vetor em vez de emoji e em vez de imagem externa porque:
 *  - escala sem perder nitidez em qualquer tela;
 *  - assume a cor do contexto (claro, escuro, sobre o vinho);
 *  - não faz nenhuma requisição de rede — o app abre offline;
 *  - tem identidade própria, em vez do desenho do sistema operacional.
 */

const ICONES = {
  proposta:
    '<rect x="4.5" y="4" width="15" height="17" rx="2.2"/><path d="M9 5.5V4.4A1.4 1.4 0 0 1 10.4 3h3.2A1.4 1.4 0 0 1 15 4.4v1.1z"/><path d="M8.5 12.8l2.4 2.4 4.6-4.6"/>',
  /* ---------------------------------------------------- categorias */
  local:
    '<path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6"/><path d="M9 12h.01M15 12h.01"/>',
  cerimonia:
    '<path d="M6 21V11a6 6 0 0 1 12 0v10"/><path d="M4 21h16"/><circle cx="12" cy="8" r="1.6"/>',
  alimentacao:
    '<path d="M4 3v7a2.5 2.5 0 0 0 5 0V3M6.5 10v11"/><path d="M17.5 3c-1.7 0-2.5 2-2.5 5s.8 4 2.5 4 2.5-1 2.5-4-.8-5-2.5-5zM17.5 12v9"/>',
  bebidas:
    '<path d="M5 3h6l-1.2 6a1.9 1.9 0 0 1-3.6 0z"/><path d="M8 9v9M6 21h4"/><path d="M14 3h6l-1.2 6a1.9 1.9 0 0 1-3.6 0z"/><path d="M17 9v9M15 21h4"/>',
  bolo:
    '<path d="M4 21h16v-6H4zM5 15v-4h14v4"/><path d="M6.5 11V8M12 11V8M17.5 11V8"/><path d="M6.5 5.5c0 .6-.7 1-.7 1.6M12 4.6c0 .7-.7 1.2-.7 1.9M17.5 5.5c0 .6-.7 1-.7 1.6"/>',
  doces:
    '<path d="M6 11h12l-1.3 9.4a1 1 0 0 1-1 .6H8.3a1 1 0 0 1-1-.6z"/><path d="M6 11a3 3 0 0 1 1.7-2.7 3.4 3.4 0 0 1 6.7-1A2.8 2.8 0 0 1 18 11z"/><path d="M12 4.4V3"/>',
  decoracao:
    '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M18.5 16.5l.7 1.9 1.9.7-1.9.7-.7 1.9-.7-1.9-1.9-.7 1.9-.7z"/>',
  flores:
    '<circle cx="12" cy="8" r="1.7"/><circle cx="12" cy="4.4" r="1.9"/><circle cx="15.4" cy="6.9" r="1.9"/><circle cx="14.1" cy="10.9" r="1.9"/><circle cx="9.9" cy="10.9" r="1.9"/><circle cx="8.6" cy="6.9" r="1.9"/><path d="M12 12.8V21"/><path d="M12 17c2.2 0 3.6-1.3 3.6-3.2-2.2 0-3.6 1.3-3.6 3.2z"/>',
  vestido:
    '<path d="M9 3h6l-1 3 3 3-1.5 2 2.5 10H6l2.5-10L7 6l3-3z"/><path d="M12 9v12"/>',
  traje:
    '<path d="M7 3l5 4 5-4 3 3v15H4V6z"/><path d="M12 7l-1.5 4L12 21l1.5-10z"/>',
  beleza:
    '<rect x="9" y="9" width="6" height="12" rx="1.2"/><path d="M10 9V5.5A2 2 0 0 1 12 3.5a2 2 0 0 1 2 2V9"/><path d="M9 13h6"/>',
  fotografia:
    '<rect x="2.5" y="6.5" width="19" height="14" rx="2.4"/><path d="M8.5 6.5l1.6-3h3.8l1.6 3"/><circle cx="12" cy="13.5" r="3.6"/>',
  filmagem:
    '<rect x="2.5" y="7" width="13" height="10" rx="2.2"/><path d="M15.5 11l6-3v8l-6-3z"/>',
  musica:
    '<path d="M9 18V5l11-2v13"/><circle cx="6.5" cy="18" r="2.6"/><circle cx="17.5" cy="16" r="2.6"/>',
  convites:
    '<rect x="2.5" y="5" width="19" height="14" rx="2.2"/><path d="M3 7l9 6 9-6"/>',
  lembrancinhas:
    '<rect x="3" y="9" width="18" height="12" rx="1.6"/><path d="M3 13h18M12 9v12"/><path d="M12 9S9.5 4.5 7.5 5.5 8 9 12 9zM12 9s2.5-4.5 4.5-3.5S16 9 12 9z"/>',
  transporte:
    '<path d="M4 16.5V12l2-5h12l2 5v4.5"/><path d="M2.5 16.5h19"/><path d="M4 16.5v2.5h3v-2.5M17 16.5V19h3v-2.5"/><path d="M6.5 12h11"/>',
  aliancas:
    '<circle cx="9" cy="14" r="5.5"/><circle cx="16" cy="11" r="4.5"/><path d="M16 6.5l-1.5-2.5h3z"/>',
  documentacao:
    '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/><path d="M9 12h6M9 16h6"/>',
  taxas:
    '<path d="M6 3h12v18l-2-1.5-2 1.5-2-1.5-2 1.5-2-1.5L6 21z"/><path d="M9 8h6M9 12h6"/>',
  outros:
    '<circle cx="12" cy="12" r="8.5"/><path d="M12 8.5v7M8.5 12h7"/>',

  /* ---------------------------------------------------- navegação */
  inicio: '<path d="M3 10.5L12 3l9 7.5"/><path d="M5.5 9.5V21h13V9.5"/><path d="M9.5 21v-6h5v6"/>',
  orcamento:
    '<rect x="2.5" y="6" width="19" height="13" rx="2.4"/><path d="M2.5 10h19"/><circle cx="17" cy="14.5" r="1.4"/>',
  missoes:
    '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.6"/><circle cx="12" cy="12" r=".9"/>',
  estrategias:
    '<path d="M4 4.5A2 2 0 0 1 6 3h5v16H6a2 2 0 0 0-2 1.5z"/><path d="M20 4.5A2 2 0 0 0 18 3h-5v16h5a2 2 0 0 1 2 1.5z"/>',
  assistente:
    '<path d="M21 11.5a8 8 0 0 1-11.6 7.1L3.5 20.5l1.9-5.8A8 8 0 1 1 21 11.5z"/><path d="M9 11h.01M12.5 11h.01M16 11h.01"/>',

  /* ------------------------------------------------------ interface */
  alerta: '<path d="M12 3.5L22 20H2z"/><path d="M12 10v4.5M12 17.2h.01"/>',
  ok: '<circle cx="12" cy="12" r="8.5"/><path d="M8.5 12.2l2.5 2.5 4.5-5"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 8h.01"/>',
  sino: '<path d="M18 9a6 6 0 1 0-12 0c0 5-2 6.5-2 6.5h16S18 14 18 9z"/><path d="M13.7 19a2 2 0 0 1-3.4 0"/>',
  calendario:
    '<rect x="3" y="5" width="18" height="16" rx="2.2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  relogio: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5.3l3.2 2"/>',
  pessoas:
    '<circle cx="9" cy="8" r="3.4"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 5.2a3.4 3.4 0 0 1 0 5.6M17.5 14.4A6.5 6.5 0 0 1 21.5 20"/>',
  balanca:
    '<path d="M12 3.2v17.8M8.5 21h7"/><path d="M4.5 7h15"/><path d="M4.5 7v2.4M19.5 7v2.4"/><path d="M1.7 12.2h5.6a2.8 2.8 0 0 1-5.6 0z"/><path d="M16.7 12.2h5.6a2.8 2.8 0 0 1-5.6 0z"/><circle cx="12" cy="5" r="1.3"/>',
  calculadora:
    '<rect x="4" y="2.5" width="16" height="19" rx="2.2"/><path d="M7.5 7h9"/><path d="M8 12h.01M12 12h.01M16 12h.01M8 16.5h.01M12 16.5h.01M16 16.5h.01"/>',
  engrenagem:
    '<circle cx="12" cy="12" r="3.2"/><path d="M19.4 14.5a1.7 1.7 0 0 0 .4 1.9l.1.1a2 2 0 1 1-2.9 2.9l-.1-.1a1.7 1.7 0 0 0-2.9 1.2v.2a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-3-1.2l-.1.1a2 2 0 1 1-2.9-2.9l.1-.1a1.7 1.7 0 0 0-1.2-2.9h-.2a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.2-3l-.1-.1a2 2 0 1 1 2.9-2.9l.1.1a1.7 1.7 0 0 0 2.9-1.2V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 3 1.2l.1-.1a2 2 0 1 1 2.9 2.9l-.1.1a1.7 1.7 0 0 0 1.2 2.9h.2a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.6 1.4z"/>',
  estrela: '<path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2-5.5-2.9-5.5 2.9 1-6.2L3 9.6l6.2-.9z"/>',
  coracao: '<path d="M12 20.5S3.5 15 3.5 9.2A4.7 4.7 0 0 1 12 6.4a4.7 4.7 0 0 1 8.5 2.8c0 5.8-8.5 11.3-8.5 11.3z"/>',
  lupa: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
  raio: '<path d="M13.5 2.5L4 13.5h6.5L10 21.5 20 10.5h-6.5z"/>',
  seta: '<path d="M9 5l7 7-7 7"/>',
  'seta-cima': '<path d="M12 19.5v-15M5.5 11L12 4.5 18.5 11"/>',
  mais: '<path d="M12 5.5v13M5.5 12h13"/>',
  fechar: '<path d="M6 6l12 12M18 6L6 18"/>',
  menu: '<circle cx="5.5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="18.5" cy="12" r="1.4"/>',
  anel: '<circle cx="12" cy="14.5" r="6"/><path d="M12 8.5L9 3.5h6z"/>',
  recibo:
    '<path d="M5 3h14v18l-2.3-1.7-2.4 1.7-2.3-1.7-2.3 1.7L7.3 19.3 5 21z"/><path d="M8.5 8h7M8.5 12h7"/>',
  amanhecer:
    '<circle cx="12" cy="13" r="3.6"/><path d="M12 5.5V3M18 7l1.4-1.4M4.6 5.6L6 7M2.5 13H4M20 13h1.5"/><path d="M3 18h18M6 21h12"/>',
  sol: '<circle cx="12" cy="12" r="4.2"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6L7 7M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4"/>',
  lua: '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/>',
  casa: '<path d="M3 10.5L12 3l9 7.5"/><path d="M5.5 9.5V21h13V9.5"/><path d="M10 21v-5h4v5"/>',
  folha: '<path d="M4 20c0-9 6-14 16-15 0 10-5 15-13 15H4z"/><path d="M4 20c3-5 6-7.5 10-9"/>',
  diamante: '<path d="M6 3h12l3.5 6L12 21 2.5 9z"/><path d="M2.5 9h19M6 3l-1 6 7 12 7-12-1-6M9 3l-.5 6M15 3l.5 6"/>',
  grafico: '<path d="M3.5 21h17"/><path d="M6.5 21V13M11 21V7M15.5 21v-6M20 21V10"/>',
  alvo: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.6"/><circle cx="12" cy="12" r=".9"/>',
  livro:
    '<path d="M4 4.5A2 2 0 0 1 6 3h5v16H6a2 2 0 0 0-2 1.5z"/><path d="M20 4.5A2 2 0 0 0 18 3h-5v16h5a2 2 0 0 1 2 1.5z"/>',
  troca: '<path d="M4 8h13l-3-3M20 16H7l3 3"/>',
  cadeado: '<rect x="4.5" y="10" width="15" height="11" rx="2.2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
};

/*
 * Devolve o SVG de um ícone.
 *  nome    — chave do catálogo acima
 *  tamanho — lado em px (padrão 24)
 *  classe  — classe CSS extra
 */
function icone(nome, tamanho, classe) {
  const d = ICONES[nome];
  if (!d) return '';
  const s = tamanho || 24;
  return (
    `<svg class="ic-svg ${classe || ''}" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" ` +
    `stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`
  );
}

/* Ilustração de abertura do onboarding — desenhada, não fotografada,
   para manter identidade própria e peso mínimo. */
function ilustracaoCapa() {
  return `
  <svg viewBox="0 0 320 200" class="capa-svg" role="img" aria-label="Ilustração de casamento">
    <defs>
      <linearGradient id="ceu" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#f6e3e6"/><stop offset="100%" stop-color="#faf6f3"/>
      </linearGradient>
      <linearGradient id="ouro" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#e8d5aa"/><stop offset="100%" stop-color="#c9a961"/>
      </linearGradient>
    </defs>
    <rect width="320" height="200" fill="url(#ceu)" rx="18"/>
    <circle cx="248" cy="52" r="30" fill="#fff" opacity=".55"/>
    <circle cx="262" cy="44" r="18" fill="#fff" opacity=".4"/>

    <!-- arco da cerimônia -->
    <path d="M96 168V104a64 64 0 0 1 128 0v64" fill="none" stroke="#c8899b" stroke-width="3" stroke-linecap="round"/>
    <path d="M104 96c10-8 18-4 22 4M216 96c-10-8-18-4-22 4M160 42c-8 6-8 14 0 20 8-6 8-14 0-20z"
          fill="none" stroke="#5b2340" stroke-width="2.4" stroke-linecap="round" opacity=".65"/>
    <circle cx="120" cy="88" r="5" fill="#c8899b" opacity=".75"/>
    <circle cx="200" cy="88" r="5" fill="#c8899b" opacity=".75"/>
    <circle cx="138" cy="66" r="4" fill="#e8d5aa"/>
    <circle cx="184" cy="68" r="4" fill="#e8d5aa"/>

    <!-- alianças -->
    <circle cx="150" cy="132" r="20" fill="none" stroke="url(#ouro)" stroke-width="4"/>
    <circle cx="176" cy="132" r="20" fill="none" stroke="#5b2340" stroke-width="4" opacity=".8"/>

    <!-- chão -->
    <path d="M40 168h240" stroke="#efd3d8" stroke-width="3" stroke-linecap="round"/>
    <path d="M62 168c0-10 6-16 14-16M258 168c0-10-6-16-14-16" stroke="#c8899b" stroke-width="2" fill="none" opacity=".5"/>
  </svg>`;
}
