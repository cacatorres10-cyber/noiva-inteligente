/*
 * NOIVA INTELIGENTE — Cenas ilustradas por tema
 *
 * Cada categoria ganha uma cena própria: fundo em degradê e uma vinheta
 * desenhada que evoca o assunto. Não são ícones (pequenos, funcionais) nem
 * fotos (pesadas, licenciadas, difíceis de manter coerentes entre si).
 * São ilustrações de sistema: a mesma linguagem visual em todas as telas,
 * peso próximo de zero, nítidas em qualquer densidade e funcionando offline.
 *
 * Todas usam o viewBox 400x240 e a paleta da marca, para que qualquer duas
 * cenas lado a lado pareçam da mesma família.
 */

const PALETAS_CENA = {
  local:        ['#f3e6ea', '#a9718a'],
  cerimonia:    ['#f6e3e6', '#a85f7c'],
  alimentacao:  ['#f7ecdf', '#a97a44'],
  bebidas:      ['#f6eede', '#a8862f'],
  bolo:         ['#fbeaf0', '#b06584'],
  doces:        ['#fceee6', '#b06f45'],
  decoracao:    ['#f2e9f2', '#8a6193'],
  flores:       ['#fae7ea', '#ad4468'],
  vestido:      ['#f8f3f0', '#9c7f8d'],
  traje:        ['#eceaef', '#66607a'],
  beleza:       ['#fbe9ec', '#b45f77'],
  fotografia:   ['#efe9ee', '#75596e'],
  filmagem:     ['#eae9f0', '#5f5a7a'],
  musica:       ['#f0e8f0', '#805590'],
  convites:     ['#f6f0e8', '#96774d'],
  lembrancinhas:['#f7ebe9', '#a5644f'],
  transporte:   ['#eaeef0', '#587480'],
  aliancas:     ['#f9f1e2', '#a8811f'],
  documentacao: ['#eef0f1', '#5f6c74'],
  taxas:        ['#eef0f1', '#5f6c74'],
  outros:       ['#f2eeec', '#7d6b71'],
};

/* Vinhetas: desenho de frente de cada cena, sobre o degradê. */
const VINHETAS = {
  /* salão com arcos e piso */
  local: `
    <path d="M70 172V96a34 34 0 0 1 68 0v76M150 172v-64a28 28 0 0 1 56 0v64M218 172V88a38 38 0 0 1 76 0v84"
          fill="none" stroke="var(--t)" stroke-width="3" opacity=".85"/>
    <path d="M40 172h320" stroke="var(--t)" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M60 186h280" stroke="var(--t)" stroke-width="2" opacity=".4"/>
    <circle cx="104" cy="118" r="5" fill="var(--t)" opacity=".6"/>
    <circle cx="178" cy="126" r="4" fill="var(--t)" opacity=".6"/>
    <circle cx="256" cy="112" r="5" fill="var(--t)" opacity=".6"/>`,

  /* arco de cerimônia com tapete */
  cerimonia: `
    <path d="M120 178V104a80 80 0 0 1 160 0v74" fill="none" stroke="var(--t)" stroke-width="4"/>
    <path d="M136 96c14-12 26-6 32 6M264 96c-14-12-26-6-32 6" fill="none" stroke="var(--t)" stroke-width="2.5" opacity=".7"/>
    <path d="M170 178l30-46 30 46z" fill="var(--t)" opacity=".16"/>
    <path d="M150 178h100l24 34H126z" fill="var(--t)" opacity=".12"/>
    <circle cx="146" cy="120" r="6" fill="var(--t)" opacity=".55"/>
    <circle cx="254" cy="120" r="6" fill="var(--t)" opacity=".55"/>
    <circle cx="200" cy="70" r="7" fill="var(--t)" opacity=".7"/>`,

  /* prato montado com talheres */
  alimentacao: `
    <circle cx="200" cy="120" r="58" fill="none" stroke="var(--t)" stroke-width="3.5"/>
    <circle cx="200" cy="120" r="40" fill="var(--t)" opacity=".14"/>
    <circle cx="188" cy="112" r="13" fill="var(--t)" opacity=".5"/>
    <circle cx="212" cy="126" r="9" fill="var(--t)" opacity=".4"/>
    <path d="M104 76v34a10 10 0 0 0 20 0V76M114 120v52" stroke="var(--t)" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <path d="M288 76c-7 0-11 9-11 22s4 17 11 17 11-4 11-17-4-22-11-22zM288 115v57"
          stroke="var(--t)" stroke-width="3.5" fill="none" stroke-linecap="round"/>`,

  /* taças brindando */
  bebidas: `
    <path d="M132 62h54l-11 54a16 16 0 0 1-32 0z" fill="var(--t)" opacity=".2" stroke="var(--t)" stroke-width="3"/>
    <path d="M159 116v56M139 176h40" stroke="var(--t)" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M214 62h54l-11 54a16 16 0 0 1-32 0z" fill="var(--t)" opacity=".2" stroke="var(--t)" stroke-width="3"/>
    <path d="M241 116v56M221 176h40" stroke="var(--t)" stroke-width="3.5" stroke-linecap="round"/>
    <circle cx="200" cy="50" r="4" fill="var(--t)" opacity=".7"/>
    <circle cx="180" cy="38" r="3" fill="var(--t)" opacity=".5"/>
    <circle cx="222" cy="34" r="3.5" fill="var(--t)" opacity=".5"/>`,

  /* bolo de andares */
  bolo: `
    <rect x="150" y="140" width="100" height="38" rx="5" fill="var(--t)" opacity=".22" stroke="var(--t)" stroke-width="3"/>
    <rect x="163" y="104" width="74" height="38" rx="5" fill="var(--t)" opacity=".18" stroke="var(--t)" stroke-width="3"/>
    <rect x="176" y="70" width="48" height="36" rx="5" fill="var(--t)" opacity=".14" stroke="var(--t)" stroke-width="3"/>
    <path d="M200 70V52" stroke="var(--t)" stroke-width="3" stroke-linecap="round"/>
    <circle cx="200" cy="46" r="6" fill="var(--t)" opacity=".75"/>
    <path d="M124 178h152" stroke="var(--t)" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M163 104c8 8 16 2 24 8M213 104c8 8 16 2 24 8" fill="none" stroke="var(--t)" stroke-width="2" opacity=".5"/>`,

  /* mesa de doces */
  doces: `
    <path d="M112 118h56l-7 54h-42zM112 118a28 28 0 0 1 56 0z" fill="var(--t)" opacity=".2" stroke="var(--t)" stroke-width="3"/>
    <path d="M232 118h56l-7 54h-42zM232 118a28 28 0 0 1 56 0z" fill="var(--t)" opacity=".2" stroke="var(--t)" stroke-width="3"/>
    <circle cx="200" cy="128" r="26" fill="var(--t)" opacity=".18" stroke="var(--t)" stroke-width="3"/>
    <path d="M200 154v18M178 172h44" stroke="var(--t)" stroke-width="3" stroke-linecap="round"/>
    <path d="M90 178h220" stroke="var(--t)" stroke-width="3.5" stroke-linecap="round"/>`,

  /* mesa posta com velas */
  decoracao: `
    <path d="M70 156h260" stroke="var(--t)" stroke-width="4" stroke-linecap="round"/>
    <path d="M92 156v26M308 156v26" stroke="var(--t)" stroke-width="3" stroke-linecap="round"/>
    <rect x="140" y="96" width="16" height="60" rx="4" fill="var(--t)" opacity=".25" stroke="var(--t)" stroke-width="2.5"/>
    <rect x="244" y="110" width="16" height="46" rx="4" fill="var(--t)" opacity=".25" stroke="var(--t)" stroke-width="2.5"/>
    <path d="M148 96c0-8 6-10 6-16-6 4-12 8-6 16zM252 110c0-8 6-10 6-16-6 4-12 8-6 16z" fill="var(--t)" opacity=".7"/>
    <circle cx="200" cy="126" r="22" fill="var(--t)" opacity=".18" stroke="var(--t)" stroke-width="3"/>
    <circle cx="192" cy="120" r="6" fill="var(--t)" opacity=".55"/>
    <circle cx="207" cy="131" r="5" fill="var(--t)" opacity=".45"/>`,

  /* buquê */
  flores: `
    <g stroke="var(--t)" stroke-width="3" fill="none">
      <path d="M200 176v-52M200 140c-22 0-32-12-32-26 20 0 32 10 32 26zM200 132c20 0 30-12 30-26-19 0-30 10-30 26z"/>
    </g>
    <circle cx="200" cy="86" r="15" fill="var(--t)" opacity=".3" stroke="var(--t)" stroke-width="3"/>
    <circle cx="164" cy="102" r="12" fill="var(--t)" opacity=".25" stroke="var(--t)" stroke-width="2.5"/>
    <circle cx="236" cy="100" r="13" fill="var(--t)" opacity=".25" stroke="var(--t)" stroke-width="2.5"/>
    <circle cx="180" cy="70" r="9" fill="var(--t)" opacity=".2" stroke="var(--t)" stroke-width="2"/>
    <circle cx="222" cy="68" r="10" fill="var(--t)" opacity=".2" stroke="var(--t)" stroke-width="2"/>
    <path d="M176 176h48" stroke="var(--t)" stroke-width="4" stroke-linecap="round"/>`,

  /* vestido no cabide */
  vestido: `
    <path d="M200 40v14" stroke="var(--t)" stroke-width="3" stroke-linecap="round"/>
    <path d="M186 54h28l-6 16 18 18-9 12 15 76h-84l15-76-9-12 18-18z"
          fill="var(--t)" opacity=".18" stroke="var(--t)" stroke-width="3" stroke-linejoin="round"/>
    <path d="M200 88v88" stroke="var(--t)" stroke-width="2" opacity=".45"/>
    <path d="M172 140c10 6 46 6 56 0M168 158c12 7 52 7 64 0" fill="none" stroke="var(--t)" stroke-width="2" opacity=".35"/>
    <circle cx="200" cy="36" r="5" fill="var(--t)" opacity=".6"/>`,

  /* terno */
  traje: `
    <path d="M158 56l42 30 42-30 26 22v98H132V78z" fill="var(--t)" opacity=".18" stroke="var(--t)" stroke-width="3" stroke-linejoin="round"/>
    <path d="M200 86l-12 30 12 60 12-60z" fill="var(--t)" opacity=".4" stroke="var(--t)" stroke-width="2.5"/>
    <path d="M158 56l24 26M242 56l-24 26" fill="none" stroke="var(--t)" stroke-width="2.5" opacity=".6"/>`,

  /* bancada de beleza */
  beleza: `
    <circle cx="146" cy="98" r="34" fill="var(--t)" opacity=".16" stroke="var(--t)" stroke-width="3"/>
    <path d="M146 132v26M126 158h40" stroke="var(--t)" stroke-width="3" stroke-linecap="round"/>
    <rect x="222" y="92" width="24" height="66" rx="5" fill="var(--t)" opacity=".25" stroke="var(--t)" stroke-width="3"/>
    <path d="M228 92V72a6 6 0 0 1 12 0v20" fill="none" stroke="var(--t)" stroke-width="3"/>
    <rect x="264" y="116" width="18" height="42" rx="4" fill="var(--t)" opacity=".2" stroke="var(--t)" stroke-width="2.5"/>
    <path d="M96 176h220" stroke="var(--t)" stroke-width="3.5" stroke-linecap="round"/>`,

  /* câmera */
  fotografia: `
    <rect x="112" y="76" width="176" height="106" rx="16" fill="var(--t)" opacity=".16" stroke="var(--t)" stroke-width="3.5"/>
    <path d="M164 76l12-20h48l12 20" fill="none" stroke="var(--t)" stroke-width="3.5" stroke-linejoin="round"/>
    <circle cx="200" cy="130" r="34" fill="none" stroke="var(--t)" stroke-width="3.5"/>
    <circle cx="200" cy="130" r="18" fill="var(--t)" opacity=".35"/>
    <circle cx="258" cy="98" r="6" fill="var(--t)" opacity=".6"/>`,

  /* câmera de vídeo */
  filmagem: `
    <rect x="98" y="86" width="132" height="80" rx="14" fill="var(--t)" opacity=".18" stroke="var(--t)" stroke-width="3.5"/>
    <path d="M230 116l62-28v80l-62-28z" fill="var(--t)" opacity=".22" stroke="var(--t)" stroke-width="3.5" stroke-linejoin="round"/>
    <circle cx="140" cy="126" r="16" fill="none" stroke="var(--t)" stroke-width="3"/>
    <circle cx="190" cy="126" r="9" fill="var(--t)" opacity=".4"/>`,

  /* som e notas */
  musica: `
    <path d="M162 158V72l88-16v86" fill="none" stroke="var(--t)" stroke-width="3.5" stroke-linejoin="round"/>
    <circle cx="146" cy="158" r="20" fill="var(--t)" opacity=".28" stroke="var(--t)" stroke-width="3.5"/>
    <circle cx="234" cy="142" r="20" fill="var(--t)" opacity=".28" stroke="var(--t)" stroke-width="3.5"/>
    <path d="M162 96l88-16" stroke="var(--t)" stroke-width="3" opacity=".5"/>
    <path d="M96 118c8-10 8-22 0-32M310 118c-8-10-8-22 0-32" fill="none" stroke="var(--t)" stroke-width="3" opacity=".45" stroke-linecap="round"/>`,

  /* convite e envelope */
  convites: `
    <rect x="104" y="82" width="150" height="100" rx="8" fill="var(--t)" opacity=".16" stroke="var(--t)" stroke-width="3.5"/>
    <path d="M104 90l75 50 75-50" fill="none" stroke="var(--t)" stroke-width="3"/>
    <rect x="182" y="52" width="114" height="76" rx="7" fill="#fff" opacity=".75" stroke="var(--t)" stroke-width="3"/>
    <path d="M204 76h70M204 90h70M204 104h44" stroke="var(--t)" stroke-width="3" stroke-linecap="round" opacity=".55"/>`,

  /* caixinhas de lembrança */
  lembrancinhas: `
    <rect x="112" y="102" width="80" height="72" rx="7" fill="var(--t)" opacity=".18" stroke="var(--t)" stroke-width="3.5"/>
    <path d="M112 126h80M152 102v72" stroke="var(--t)" stroke-width="3"/>
    <path d="M152 102s-14-24-26-14 12 14 26 14zM152 102s14-24 26-14-12 14-26 14z" fill="none" stroke="var(--t)" stroke-width="3"/>
    <rect x="212" y="120" width="66" height="54" rx="6" fill="var(--t)" opacity=".14" stroke="var(--t)" stroke-width="3"/>
    <path d="M212 138h66M245 120v54" stroke="var(--t)" stroke-width="2.5" opacity=".7"/>`,

  /* carro */
  transporte: `
    <path d="M96 148v-24l22-40h164l22 40v24" fill="var(--t)" opacity=".18" stroke="var(--t)" stroke-width="3.5" stroke-linejoin="round"/>
    <path d="M84 148h232" stroke="var(--t)" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M126 84h148" stroke="var(--t)" stroke-width="2.5" opacity=".55"/>
    <circle cx="136" cy="160" r="16" fill="none" stroke="var(--t)" stroke-width="3.5"/>
    <circle cx="264" cy="160" r="16" fill="none" stroke="var(--t)" stroke-width="3.5"/>
    <path d="M172 62c14-10 42-10 56 0" fill="none" stroke="var(--t)" stroke-width="3" opacity=".5" stroke-linecap="round"/>`,

  /* alianças */
  aliancas: `
    <circle cx="168" cy="126" r="46" fill="none" stroke="var(--t)" stroke-width="6"/>
    <circle cx="236" cy="126" r="38" fill="none" stroke="var(--t)" stroke-width="6" opacity=".7"/>
    <path d="M236 76l-12-20h24z" fill="var(--t)" opacity=".8"/>
    <path d="M118 176h164" stroke="var(--t)" stroke-width="3" opacity=".35" stroke-linecap="round"/>`,

  /* documentos */
  documentacao: `
    <rect x="128" y="56" width="120" height="140" rx="8" fill="#fff" opacity=".72" stroke="var(--t)" stroke-width="3.5"/>
    <path d="M152 92h72M152 116h72M152 140h48" stroke="var(--t)" stroke-width="3" stroke-linecap="round" opacity=".55"/>
    <circle cx="252" cy="150" r="26" fill="var(--t)" opacity=".2" stroke="var(--t)" stroke-width="3"/>
    <path d="M240 150l8 9 16-18" fill="none" stroke="var(--t)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>`,
};
VINHETAS.taxas = VINHETAS.documentacao;
VINHETAS.outros = `
    <circle cx="200" cy="118" r="52" fill="var(--t)" opacity=".15" stroke="var(--t)" stroke-width="3.5"/>
    <path d="M200 92v52M174 118h52" stroke="var(--t)" stroke-width="4" stroke-linecap="round"/>`;

/*
 * Monta a cena de uma categoria.
 *  altura — 'capa' (faixa larga) ou 'quadro' (miniatura quadrada)
 */
function cenaCategoria(catId, formato) {
  const p = PALETAS_CENA[catId] || PALETAS_CENA.outros;
  const v = VINHETAS[catId] || VINHETAS.outros;
  const id = 'cena-' + catId + '-' + (formato || 'capa');
  const quadro = formato === 'quadro';

  return `
  <svg class="cena ${quadro ? 'cena-quadro' : 'cena-capa'}"
       viewBox="${quadro ? '96 44 208 152' : '18 26 364 172'}"
       preserveAspectRatio="${quadro ? 'xMidYMid slice' : 'xMidYMid meet'}" role="img" aria-hidden="true"
       style="--t:${p[1]}">
    <defs>
      <linearGradient id="${id}" x1="0" y1="0" x2="0.4" y2="1">
        <stop offset="0%" stop-color="#fff" stop-opacity=".65"/>
        <stop offset="100%" stop-color="${p[0]}"/>
      </linearGradient>
    </defs>
    <rect x="-20" y="-20" width="440" height="280" fill="${p[0]}"/>
    <rect x="-20" y="-20" width="440" height="280" fill="url(#${id})"/>
    <circle cx="352" cy="34" r="52" fill="#fff" opacity=".38"/>
    <circle cx="40" cy="212" r="40" fill="${p[1]}" opacity=".1"/>
    ${v}
  </svg>`;
}

/* Cena de abertura do onboarding — a única com noivos e arco completos. */
function cenaAbertura() {
  return `
  <svg class="cena cena-abertura" viewBox="0 0 400 250" role="img"
       aria-label="Ilustração de uma cerimônia de casamento" style="--t:#c8899b">
    <defs>
      <linearGradient id="ceu-abertura" x1="0" y1="0" x2="0.3" y2="1">
        <stop offset="0%" stop-color="#fffdfc"/><stop offset="100%" stop-color="#f6e3e6"/>
      </linearGradient>
      <linearGradient id="ouro-abertura" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#e8d5aa"/><stop offset="100%" stop-color="#c9a961"/>
      </linearGradient>
    </defs>
    <rect width="400" height="250" fill="url(#ceu-abertura)"/>
    <circle cx="330" cy="52" r="46" fill="#fff" opacity=".6"/>
    <circle cx="348" cy="38" r="26" fill="#fff" opacity=".5"/>

    <path d="M104 202V116a96 96 0 0 1 192 0v86" fill="none" stroke="#c8899b" stroke-width="4"/>
    <path d="M124 106c16-14 30-8 38 6M276 106c-16-14-30-8-38 6"
          fill="none" stroke="#5b2340" stroke-width="3" opacity=".55" stroke-linecap="round"/>
    <circle cx="134" cy="132" r="7" fill="#c8899b" opacity=".7"/>
    <circle cx="266" cy="132" r="7" fill="#c8899b" opacity=".7"/>
    <circle cx="158" cy="94" r="5.5" fill="#e8d5aa"/>
    <circle cx="242" cy="96" r="5.5" fill="#e8d5aa"/>
    <circle cx="200" cy="66" r="6" fill="#c8899b" opacity=".55"/>

    <circle cx="176" cy="150" r="27" fill="none" stroke="url(#ouro-abertura)" stroke-width="5.5"/>
    <circle cx="212" cy="150" r="27" fill="none" stroke="#5b2340" stroke-width="5.5" opacity=".8"/>

    <path d="M40 202h320" stroke="#efd3d8" stroke-width="4" stroke-linecap="round"/>
    <path d="M70 202c0-14 8-22 20-22M330 202c0-14-8-22-20-22" fill="none" stroke="#c8899b" stroke-width="2.5" opacity=".45"/>
    <path d="M150 202l50-34 50 34z" fill="#c8899b" opacity=".12"/>
  </svg>`;
}
