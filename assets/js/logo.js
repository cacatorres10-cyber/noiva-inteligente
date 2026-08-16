/*
 * NOIVA INTELIGENTE — Marca
 *
 * Silhueta de noiva redesenhada em vetor a partir da referência enviada.
 * Vetor, e não o arquivo original, porque a marca aparece de 26px (barra
 * superior) a 260px (abertura do onboarding): um traçado escala nos dois
 * extremos sem borda serrilhada, pesa menos de 2 KB e assume a cor do
 * contexto — dourada sobre o vinho, vinho sobre a areia — sem exigir dois
 * arquivos e sem uma requisição de rede que o app não pode depender.
 *
 * O desenho é montado com uma máscara em vez de um traçado único.
 * A razão é prática: o buquê e os vincos do tecido precisam ser espaço
 * VAZADO, não pintados de branco. Vazado, o fundo aparece através deles e a
 * silhueta continua legível sobre qualquer cor; pintado de branco, ela só
 * funcionaria sobre fundo claro. A máscara também deixa cada parte (véu,
 * cabelo, vestido, buquê) editável em separado, sem reescrever um path de
 * 400 caracteres.
 *
 * Ordem na máscara: branco pinta, preto vaza, cinza pinta translúcido.
 *   1. véu        cinza  — fica atrás e mais claro que o vestido
 *   2. corpo      branco — cabeça, coque, tronco e saia
 *   3. vazados    preto  — buquê, braços e vincos da saia
 *   4. flores     branco — voltam a aparecer dentro do buquê vazado
 */

/* Cada instância precisa de um id próprio de máscara: a marca aparece na
   barra superior e na abertura ao mesmo tempo, e ids repetidos fazem o
   navegador resolver os dois para o primeiro elemento. */
let _logoSeq = 0;

/*
 * Silhueta completa.
 *   altura — em pixels; a largura sai da proporção do viewBox (3:7)
 *   classe — classe extra para posicionamento ou animação
 */
function logoNoiva(altura, classe) {
  const h = altura || 120;
  const id = `ni-marca-${++_logoSeq}`;
  return `
  <svg class="logo-noiva ${classe || ''}" viewBox="0 0 340 700" height="${h}"
       role="img" aria-label="Noiva Inteligente">
    <defs>
      <mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="340" height="700">

        <!-- véu: cai do coque e abre bem mais que o vestido, atrás de tudo.
             Termina em y≈530 de propósito: se descesse até a barra, chegaria
             lá com a mesma largura da saia e sumiria dentro dela. A barra é
             ondulada, não reta — corte reto lê como retângulo, não como tule. -->
        <path fill="#fff" opacity=".32" d="M170 40
          C197 40 216 60 217 88
          C238 148 262 246 280 348 C294 424 302 484 304 518
          C306 536 296 545 281 539 C262 531 244 543 224 535
          C206 528 188 537 170 531 C152 537 134 528 116 535
          C96 543 78 531 59 539 C44 545 34 536 36 518
          C38 484 46 424 60 348 C78 246 102 148 123 88
          C124 60 143 40 170 40 Z"/>

        <g fill="#fff">
          <!-- coque, cabeça e pescoço.
               O coque é baixo e sobreposto à cabeça; alto e solto, os dois
               viram duas bolas empilhadas em vez de um penteado. -->
          <ellipse cx="170" cy="50" rx="18" ry="14"/>
          <ellipse cx="170" cy="76" rx="23" ry="30"/>
          <path d="M158 98 C158 110 157 119 155 127 L185 127 C183 119 182 110 182 98 Z"/>

          <!-- corpete ajustado, cintura marcada e saia longa com cauda.
               A figura tem ~10 cabeças de altura: proporção de figurino, não
               anatômica, que é o que dá a leitura de vestido de noiva. -->
          <path d="M170 124
            C187 124 199 133 205 147
            C212 170 210 202 202 234 C199 249 199 258 199 268
            C201 294 208 318 217 346
            C238 406 259 488 275 568 C285 606 292 640 295 652
            C298 666 291 673 277 674 C242 678 206 676 170 675
            C134 676 98 678 63 674 C49 673 42 666 45 652
            C48 640 55 606 65 568 C81 488 102 406 123 346
            C132 318 139 294 141 268 C141 258 141 249 138 234
            C130 202 128 170 135 147 C141 133 153 124 170 124 Z"/>
        </g>

        <g fill="#000">
          <!-- braços: dois filetes que soltam o tronco da saia. Cinza, não
               preto — vazados por inteiro viravam um "U" branco que roubava
               a leitura do vestido; a meia-tinta sugere sem gritar. -->
          <g fill="#3a3a3a">
            <path d="M197 160 C202 184 201 218 195 250 C194 256 190 256 190 250
                     C196 218 196 184 192 162 Z"/>
            <path d="M143 160 C138 184 139 218 145 250 C146 256 150 256 150 250
                     C144 218 144 184 148 162 Z"/>
          </g>

          <!-- buquê: leque vazado, estreito em cima e aberto embaixo, na
               altura do quadril. Pequeno de propósito — grande e na cintura
               ele partia a figura em duas e virava babador. -->
          <path d="M170 322
            C178 322 183 327 185 334 C190 340 193 348 192 355
            C191 361 185 365 179 363 C176 367 170 368 166 365
            C161 368 155 365 154 359 C148 360 144 354 146 348
            C146 341 151 335 155 331 C158 325 164 322 170 322 Z"/>
        </g>

        <!-- fitas do buquê e vincos do tecido: traço vazado, some sozinho
             abaixo de ~40px, que é exatamente quando viraria borrão -->
        <g stroke="#000" stroke-linecap="round" fill="none">
          <g stroke-width="5" opacity=".85">
            <path d="M163 364 C157 386 161 402 155 422"/>
            <path d="M178 364 C184 384 180 400 186 420"/>
          </g>
          <g stroke-width="7" opacity=".8">
            <path d="M170 402 C171 480 171 572 170 660"/>
            <path d="M206 398 C220 480 234 566 245 648"/>
            <path d="M134 398 C120 480 106 566 95 648"/>
            <path d="M232 450 C248 520 262 590 272 656"/>
            <path d="M108 450 C92 520 78 590 68 656"/>
          </g>
        </g>

        <!-- flores: voltam a pintar dentro do vazado do buquê.
             Raios diferentes e posições irregulares — cinco círculos iguais
             em anel viram um mostrador de relógio. -->
        <g fill="#fff">
          <circle cx="170" cy="331" r="5"/>
          <circle cx="158" cy="344" r="4.5"/><circle cx="182" cy="343" r="4.5"/>
          <circle cx="165" cy="356" r="4"/><circle cx="178" cy="356" r="3.5"/>
        </g>
      </mask>
    </defs>

    <rect x="0" y="0" width="340" height="700" fill="currentColor" mask="url(#${id})"/>
  </svg>`;
}

/*
 * Lockup: silhueta + nome.
 * A silhueta é alta e estreita, então acompanha bem a altura de duas linhas
 * de texto sem roubar largura da barra — não precisa de versão simplificada.
 */
function logoMarca(altura, semNome) {
  return `
  <div class="marca">
    <div class="marca-simbolo">${logoNoiva(altura || 34)}</div>
    ${semNome ? '' : '<div class="marca-nome">Noiva Inteligente</div>'}
  </div>`;
}

/*
 * Favicon: versão reduzida ao essencial (coque, cabeça, vestido), sem véu,
 * vincos nem buquê. A aba do navegador desenha a marca com 16px de lado —
 * qualquer detalhe além da silhueta vira ruído cinza.
 */
function logoFavicon() {
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 700'>` +
    `<g fill='%235b2340'>` +
    `<ellipse cx='150' cy='34' rx='19' ry='16'/>` +
    `<ellipse cx='150' cy='74' rx='28' ry='33'/>` +
    `<path d='M150 112c20 0 34 10 38 30 5 24 2 52-4 78 28 40 51 122 68 218 11 60 20 118 25 161 2 18-8 31-26 36-34 8-68 12-100 11-38-1-72-7-96-19-15-7-20-21-14-36 18-47 36-109 50-165 17-86 28-156 25-206-6-31-8-61-1-81 6-20 20-27 35-27z'/>` +
    `</g></svg>`;
  return `data:image/svg+xml,${svg.replace(/"/g, "'").replace(/#/g, '%23')}`;
}
