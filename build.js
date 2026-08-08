/*
 * NOIVA INTELIGENTE — Empacotador
 *
 * Junta CSS e JS em um único HTML autocontido. Serve para:
 *  - abrir o app offline a partir de um arquivo só;
 *  - publicar em qualquer lugar que aceite uma página estática.
 *
 * Uso: node build.js
 */

const fs = require('fs');
const path = require('path');

const RAIZ = __dirname;
const ORDEM_JS = [
  'icones.js',
  'fotos.js',
  'data-categorias.js',
  'data-estrategias.js',
  'data-missoes.js',
  'store.js',
  'ui.js',
  'engine.js',
  'assistente.js',
  'telas.js',
  'onboarding.js',
  'acoes.js',
  'app.js',
];

function ler(p) {
  return fs.readFileSync(path.join(RAIZ, p), 'utf8');
}

/*
 * As fotos de assets/fotos/ viram data URI, para o arquivo único não depender
 * de nenhum arquivo externo. Sem fotos na pasta, o mapa fica vazio e os slots
 * caem na ilustração vetorial — o app continua completo.
 */
function embutirFotos() {
  const dir = path.join(RAIZ, 'assets/fotos');
  if (!fs.existsSync(dir)) return {};
  const tipos = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.avif': 'image/avif' };
  const mapa = {};
  for (const nome of fs.readdirSync(dir)) {
    const tipo = tipos[path.extname(nome).toLowerCase()];
    if (!tipo) continue;
    const bytes = fs.readFileSync(path.join(dir, nome));
    mapa[nome] = `data:${tipo};base64,${bytes.toString('base64')}`;
    console.log(`  foto embutida: ${nome} (${(bytes.length / 1024).toFixed(0)} KB)`);
  }
  return mapa;
}

const fotos = embutirFotos();
const css = ler('assets/css/style.css');
const js =
  `/* ===== fotos embutidas ===== */\nwindow.FOTOS_EMBUTIDAS = ${JSON.stringify(fotos)};\n\n` +
  ORDEM_JS.map((f) => `/* ===== ${f} ===== */\n` + ler('assets/js/' + f)).join('\n\n');

/* O corpo da página é extraído do index.html, para não haver duas fontes de verdade. */
const indexHtml = ler('index.html');
const corpo = indexHtml
  .slice(indexHtml.indexOf('<div id="app">'), indexHtml.indexOf('<!-- Ícones -->'))
  .trim();

const fragmento = `<style>
${css}
</style>

${corpo}

<script>
${js}
</script>
`;

const completo = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, maximum-scale=1">
<meta name="theme-color" content="#5b2340">
<title>Noiva Inteligente</title>
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>&#128141;</text></svg>">
</head>
<body>
${fragmento}
</body>
</html>
`;

fs.mkdirSync(path.join(RAIZ, 'dist'), { recursive: true });
fs.writeFileSync(path.join(RAIZ, 'dist/noiva-inteligente.html'), completo);
fs.writeFileSync(path.join(RAIZ, 'dist/fragmento.html'), fragmento);

const kb = (s) => (Buffer.byteLength(s) / 1024).toFixed(0) + ' KB';
console.log('dist/noiva-inteligente.html  ', kb(completo));
console.log('dist/fragmento.html          ', kb(fragmento));
