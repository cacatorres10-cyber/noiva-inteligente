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

const css = ler('assets/css/style.css');
const js = ORDEM_JS.map((f) => `/* ===== ${f} ===== */\n` + ler('assets/js/' + f)).join('\n\n');

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
