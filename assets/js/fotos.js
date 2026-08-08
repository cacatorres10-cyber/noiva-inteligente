/*
 * NOIVA INTELIGENTE — Fotografias
 *
 * O app funciona sem nenhuma foto: cada slot cai na ilustração vetorial
 * quando o arquivo não existe. Isso é proposital — a ferramenta não pode
 * depender de um asset que talvez não tenha sido baixado ainda.
 *
 * Para usar fotos de verdade:
 *   1. baixe as imagens (Pexels, Unsplash — licenças que permitem uso
 *      comercial sem atribuição obrigatória);
 *   2. salve em assets/fotos/ com exatamente o nome indicado em `arquivo`;
 *   3. recarregue. Nada mais precisa ser alterado.
 *
 * Para embutir as fotos no HTML de arquivo único, rode `node build.js`:
 * ele converte o conteúdo de assets/fotos/ em data URI automaticamente.
 */

const FOTOS_BASE = 'assets/fotos/';

/* Preenchido pelo build.js quando as fotos são embutidas no arquivo único. */
const FOTOS_EMBUTIDAS = window.FOTOS_EMBUTIDAS || {};

const FOTOS = {
  capa: {
    arquivo: 'capa.jpg',
    alt: 'Casal de noivos durante a cerimônia',
    foco: 'center 42%',
    proporcao: '16 / 10',
    ilustracao: 'ilustracaoCapa',
    briefing: 'Cerimônia ou casal em plano médio, luz natural, tons quentes e claros. Evite closes de rosto — a foto fica atrás de texto.',
  },
  plano: {
    arquivo: 'plano.jpg',
    alt: 'Mesa posta de recepção de casamento',
    foco: 'center 55%',
    proporcao: '16 / 9',
    ilustracao: 'ilustracaoCapa',
    briefing: 'Mesa posta, taças ou arranjo em plano aberto. Composição com área vazia à esquerda, onde entra o título.',
  },
};

/*
 * Devolve o HTML de um slot de foto.
 * Se o arquivo não estiver presente, o onerror troca pela ilustração vetorial,
 * então nunca sobra um ícone de imagem quebrada na tela.
 */
function foto(id, opcoes) {
  const f = FOTOS[id];
  if (!f) return '';
  const o = opcoes || {};
  const src = FOTOS_EMBUTIDAS[f.arquivo] || FOTOS_BASE + f.arquivo;
  const idFallback = 'foto-fb-' + id + '-' + Math.random().toString(36).slice(2, 7);

  return `
    <figure class="foto-slot ${o.classe || ''}" style="--proporcao:${f.proporcao};--foco:${f.foco}">
      <img src="${escapar(src)}" alt="${escapar(f.alt)}" loading="lazy" decoding="async"
           onload="this.closest('.foto-slot').classList.add('carregada')"
           onerror="this.remove();document.getElementById('${idFallback}').hidden=false">
      <div class="foto-fallback" id="${idFallback}" hidden>${typeof window[f.ilustracao] === 'function' ? window[f.ilustracao]() : ''}</div>
      ${o.scrim ? '<div class="foto-scrim"></div>' : ''}
      ${o.legenda ? `<figcaption>${escapar(o.legenda)}</figcaption>` : ''}
    </figure>`;
}

/*
 * Capa do onboarding: foto quando existir, ilustração quando não.
 * A ilustração não é um "placeholder feio" — é uma saída legítima,
 * então a tela nunca parece incompleta enquanto as fotos não chegam.
 */
function capaVisual() {
  return foto('capa');
}

/* Existe uma foto disponível para este slot? Usado para decidir layout. */
function temFoto(id) {
  return !!(FOTOS[id] && FOTOS_EMBUTIDAS[FOTOS[id].arquivo]);
}

/* ====================================================== por categoria */

/*
 * Uma foto por categoria do orçamento. O arquivo tem o mesmo nome do id da
 * categoria — assets/fotos/categorias/alimentacao.jpg, vestido.jpg, e assim
 * por diante. Onde a foto não existe, o ícone vetorial continua no lugar dela.
 */
const FOTOS_CATEGORIA_BASE = 'assets/fotos/categorias/';

/* Briefing de enquadramento por categoria, usado na documentação e na geração. */
const BRIEFING_CATEGORIA = {
  local: 'Espaço de celebração vazio e arrumado, luz natural, plano aberto.',
  cerimonia: 'Altar ou arco decorado, sem rostos em close.',
  alimentacao: 'Prato montado ou mesa de buffet, luz suave, cores quentes.',
  bebidas: 'Taças servidas em bandeja ou bar montado, foco raso.',
  bolo: 'Bolo de casamento inteiro sobre a mesa, fundo limpo.',
  doces: 'Mesa de doces em plano médio, poucas variedades bem dispostas.',
  decoracao: 'Mesa posta com arranjo central e velas.',
  flores: 'Buquê ou arranjo de flores em plano fechado.',
  vestido: 'Vestido de noiva pendurado ou detalhe do tecido, luz natural.',
  traje: 'Terno com gravata e acessórios dispostos sobre superfície clara.',
  beleza: 'Bancada de maquiagem ou detalhe de penteado, sem rosto identificável.',
  fotografia: 'Câmera fotográfica sobre superfície clara, ou fotógrafo de costas.',
  filmagem: 'Câmera de vídeo em tripé, plano médio.',
  musica: 'Instrumento ou mesa de som, luz ambiente quente.',
  convites: 'Convite impresso com envelope e detalhes, vista de cima.',
  lembrancinhas: 'Lembrancinhas embaladas e alinhadas, vista de cima.',
  transporte: 'Carro clássico decorado, plano aberto.',
  aliancas: 'Par de alianças em plano fechado sobre superfície neutra.',
  documentacao: 'Documentos e caneta sobre mesa, vista de cima.',
  taxas: 'Papelada e calculadora sobre mesa, vista de cima.',
  outros: 'Composição neutra de detalhes de casamento.',
};

/*
 * Devolve a miniatura da categoria: foto quando houver, ícone quando não.
 * Assinatura pensada para substituir `icone(cat.icone, n)` sem outra mudança.
 */
function miniaturaCategoria(catId, tamanho) {
  const arquivo = catId + '.jpg';
  const src = FOTOS_EMBUTIDAS[arquivo] || FOTOS_EMBUTIDAS['categorias/' + arquivo];
  if (!src) return icone(catId, tamanho);
  return `<img class="cat-foto" src="${escapar(src)}" alt="" loading="lazy" decoding="async"
            style="width:${tamanho * 1.6}px;height:${tamanho * 1.6}px"
            onerror="this.outerHTML=${escapar(JSON.stringify(icone(catId, tamanho)))}">`;
}

/* Capa da gaveta de categoria — só aparece quando existe foto para ela. */
function capaCategoria(catId) {
  const arquivo = catId + '.jpg';
  const src = FOTOS_EMBUTIDAS[arquivo] || FOTOS_EMBUTIDAS['categorias/' + arquivo];
  if (!src) return '';
  const cat = CATEGORIAS.find((c) => c.id === catId);
  return `<figure class="foto-slot carregada foto-categoria" style="--proporcao:16 / 7;--foco:center 50%">
      <img src="${escapar(src)}" alt="${escapar(cat ? cat.nome : '')}" loading="lazy" decoding="async">
    </figure>`;
}
