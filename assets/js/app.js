/* NOIVA INTELIGENTE — Inicialização */

(function iniciar() {
  Store.carregar();

  // monta a navegação inferior
  $('#nav').innerHTML = TELAS_NAV.map(
    (t) => `<button data-tela="${t.id}" onclick="App.ir('${t.id}')"><span class="ic">${t.ic}</span><span>${t.nome}</span></button>`
  ).join('');

  if (!Store.estado.onboardingConcluido) {
    $('#nav').style.display = 'none';
    $('#tela-onboarding').classList.add('ativa');
    Onboarding.iniciar();
  } else {
    $('#nav').style.display = 'flex';
    App.ir('dashboard');
  }

  // fecha a gaveta com Esc
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') fecharGaveta();
  });

  // arrastar a gaveta para baixo fecha
  let toqueY = null;
  const gaveta = $('#gaveta');
  gaveta.addEventListener('touchstart', (e) => {
    if (gaveta.scrollTop <= 0) toqueY = e.touches[0].clientY;
  }, { passive: true });
  gaveta.addEventListener('touchmove', (e) => {
    if (toqueY === null) return;
    const delta = e.touches[0].clientY - toqueY;
    if (delta > 90) {
      fecharGaveta();
      toqueY = null;
    }
  }, { passive: true });
  gaveta.addEventListener('touchend', () => (toqueY = null));
})();
