/* NOIVA INTELIGENTE — Telas */

const Telas = {
  renderizar(id, params) {
    const alvo = $('#tela-' + id);
    if (!alvo || typeof this[id] !== 'function') return;
    alvo.innerHTML = this[id](params || {});
    if (typeof this['pos_' + id] === 'function') this['pos_' + id](params || {});
    animarEntrada(alvo);
    animarNumeros(alvo);
    this.animarBarras(alvo);
  },

  /* As barras nascem em zero e crescem — o progresso fica legível como movimento */
  animarBarras(raiz) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    $$('.barra span, .barra-cat span', raiz).forEach((el) => {
      const largura = el.style.width;
      el.style.width = '0%';
      requestAnimationFrame(() => requestAnimationFrame(() => (el.style.width = largura)));
    });
  },

  cabecalho(titulo, sub, comMenu) {
    return `
      <div class="topo">
        <div class="topo-linha">
          <div>
            <div class="sub">${escapar(sub || '')}</div>
            <h2>${escapar(titulo)}</h2>
          </div>
          ${comMenu === false ? '' : `<button class="fechar" style="background:rgba(255,255,255,.18);color:#fff" onclick="abrirMenu()">${icone("menu", 18)}</button>`}
        </div>
      </div>`;
  },

  /* ==================================================== MEU PLANO INTELIGENTE */

  plano() {
    const r = Motor.resumo();
    const dist = Motor.distribuir();
    const meta = Motor.metaMensal();
    const p = Motor.perfil();
    const tarefas = Motor.proximasTarefas(5);
    const missoes = Motor.missoesRecomendadas(3);
    const alertas = Motor.alertas();
    const est = Motor.estimativaTotal();

    const ordenadas = Object.entries(dist)
      .map(([id, d]) => ({ id, ...d, cat: Motor.categoria(id) }))
      .sort((a, b) => b.planejado - a.planejado)
      .slice(0, 8);

    const sonhos = (p.tresSonhos || []).filter(Boolean);

    return `
      <div class="topo ${temFoto('plano') ? 'com-foto' : ''}">
        ${temFoto('plano') ? foto('plano', { classe: 'foto-topo', scrim: true }) : ''}
        <div class="sub">Pronto</div>
        <h1>Seu plano<br>inteligente</h1>
        <p style="color:rgba(255,255,255,.82);font-size:13.5px;margin-top:8px;position:relative">
          Agora você sabe onde gastar, onde economizar e por onde começar.
        </p>
      </div>

      <div class="conteudo">
        ${sonhos.length ? `
        <div class="card card-destaque">
          <div class="rotulo">Inegociável</div>
          <div style="margin-top:8px">
            ${sonhos.map((s) => `<div style="font-family:var(--display);font-size:17px;color:var(--vinho);margin-bottom:4px"><span class="sonho-ic">${icone("coracao",15)}</span>${escapar(s)}</div>`).join('')}
          </div>
          <p class="card-sub" style="margin:var(--e3) 0 0">Enquanto sobrar alternativa em outro lugar, eu não encosto nisso.</p>
        </div>` : ''}

        <div class="card">
          <div class="rotulo">Seu orçamento</div>
          <div class="numero-grande" data-contar="${r.total}">${formatarMoeda(r.total)}</div>
          <p class="card-sub" style="margin-top:4px">
            Reservando ${r.margemPct}% de margem de segurança (${formatarMoeda(r.reserva)}),
            sobram <strong>${formatarMoeda(r.distribuivel)}</strong> para distribuir entre as categorias.
          </p>
          <div style="margin-top:14px">${componenteBarraOrcamento(r)}</div>
        </div>

        <div class="grade-2">
          <div class="mini-stat">
            <div class="rotulo">Meta mensal</div>
            <div class="valor ${meta.viavel ? 'positivo' : 'negativo'}">${formatarMoeda(meta.meta)}</div>
            <div style="font-size:11.5px;color:var(--grafite)">por ${meta.meses} meses</div>
          </div>
          <div class="mini-stat">
            <div class="rotulo">Projeção na data</div>
            <div class="valor">${formatarMoeda(meta.projetado)}</div>
            <div style="font-size:11.5px;color:var(--grafite)">${meta.diferenca >= 0 ? 'acima' : 'abaixo'} do orçamento em ${formatarMoeda(Math.abs(meta.diferenca))}</div>
          </div>
        </div>

        <div class="secao" style="margin-top:22px">
          <div class="secao-titulo">Formato sugerido</div>
          <div class="card compacto">
            <div class="lista-item">
              <span class="icone">${icone("pessoas",18)}</span>
              <div class="corpo"><div class="nome">${p.convidados} convidados</div>
              <div class="meta">Estimativa do formato completo: ${formatarMoeda(est)}</div></div>
            </div>
            <div class="lista-item">
              <span class="icone">${icone("relogio",18)}</span>
              <div class="corpo"><div class="nome">${Assistente.nomeDia()}, ${Assistente.nomePeriodo()}</div>
              <div class="meta">${(PERIODOS.find((x) => x.id === p.periodo) || {}).nome} · padrão ${Assistente.nomePadrao()}</div></div>
            </div>
            <div class="lista-item">
              <span class="icone">${icone("decoracao",18)}</span>
              <div class="corpo"><div class="nome">Estilo ${(ESTILOS.find((x) => x.id === p.estilo) || {}).nome}</div>
              <div class="meta">${escapar(p.cidade || 'região não informada')}</div></div>
            </div>
          </div>
          ${est > r.total ? `<div class="alerta medio"><span class="ic">${icone("sino",16)}</span><span>A estimativa do formato atual (${formatarMoeda(est)}) está acima do orçamento (${formatarMoeda(r.total)}). Reduzir convidados, mudar o período ou o dia da semana são os ajustes de maior efeito.</span></div>` : ''}
        </div>

        <div class="secao">
          <div class="secao-titulo">Distribuição da verba</div>
          <p class="secao-desc">Peso típico de cada categoria, ajustado pelo que você marcou como prioridade.</p>
          <div class="card compacto">
            ${ordenadas.map((d) => `
              <div style="padding:9px 0;border-bottom:1px solid var(--linha)">
                <div style="display:flex;justify-content:space-between;align-items:baseline;gap:10px">
                  <span style="font-size:14px"><span class="cat-nome">${miniaturaCategoria(d.id, 16)}${d.cat.nome}</span> <span style="color:var(--neblina);font-size:11.5px">· ${d.prioridade}/10</span></span>
                  <strong style="font-family:var(--display);font-size:15px;white-space:nowrap">${formatarMoeda(d.planejado)}</strong>
                </div>
                <div class="barra-cat"><span style="width:${pct(d.planejado, r.total)}%"></span></div>
              </div>`).join('')}
          </div>
          <button class="btn btn-contorno btn-bloco btn-mini" onclick="App.ir('orcamento')">Ver todas as categorias</button>
        </div>

        <div class="secao">
          <div class="secao-titulo">Comece por aqui</div>
          <div class="card compacto">
            ${tarefas.map((t, i) => `
              <div class="lista-item">
                <span class="icone" style="background:var(--vinho);color:#fff;font-family:var(--display);font-weight:600">${i + 1}</span>
                <div class="corpo"><div class="nome">${escapar(t.titulo)}</div>
                <div class="meta">${t.mesInicio > 0 ? `a partir de ${t.mesInicio} meses antes` : 'na semana do casamento'}</div></div>
              </div>`).join('')}
          </div>
        </div>

        <div class="secao">
          <div class="secao-titulo">Onde tem dinheiro sobrando</div>
          <p class="secao-desc">As três ações de maior retorno para o seu caso, hoje.</p>
          ${missoes.map((m) => {
            const eco = Motor.economiaMissao(m);
            return `<div class="card compacto" onclick="Telas.abrirMissao('${m.id}')" style="cursor:pointer">
              <div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start">
                <div><div class="card-titulo">${escapar(m.titulo)}</div>
                <div class="card-sub">${escapar(m.motivo)}</div></div>
                <span style="color:var(--neblina)">${icone("seta",15)}</span>
              </div>
              ${eco ? `<div class="pill-linha"><span class="chip tag-ouro">Potencial: ${formatarMoeda(eco.min)} – ${formatarMoeda(eco.max)}</span></div>` : ''}
            </div>`;
          }).join('')}
        </div>

        ${alertas.filter((a) => a.nivel !== 'ok').length ? `
        <div class="secao">
          <div class="secao-titulo">Alertas</div>
          ${alertas.filter((a) => a.nivel !== 'ok').map(componenteAlerta).join('')}
        </div>` : ''}

        <div class="aviso-legal" style="margin-bottom:16px">${AVISO_ESTIMATIVA}</div>

        <button class="btn btn-primario btn-bloco" onclick="App.ir('dashboard')">Começar a planejar</button>
        <div class="pulo"></div>
      </div>`;
  },

  /* ================================================================ DASHBOARD */

  dashboard() {
    const r = Motor.resumo();
    const p = Motor.perfil();
    const meta = Motor.metaMensal();
    const eco = Motor.economiaResumo();
    const alertas = Motor.alertas();
    const missao = Motor.missoesRecomendadas(1)[0];
    const tarefa = Motor.proximasTarefas(1)[0];
    const dias = Motor.diasRestantes();

    return `
      <div class="topo">
        <div class="topo-linha">
          ${logoMarca(36)}
          <button class="fechar" style="background:rgba(255,255,255,.18);color:#fff" onclick="abrirMenu()">${icone("menu",18)}</button>
        </div>
        <div style="margin-top:16px;position:relative">
          <div class="sub">${p.dataCasamento ? 'Seu grande dia' : 'Seu casamento'}</div>
          <h1 style="font-size:28px;margin-top:2px">
            ${p.dataCasamento ? formatarData(p.dataCasamento) : `Daqui a ${Motor.mesesRestantes()} meses`}
          </h1>
          <p style="color:rgba(255,255,255,.82);font-size:13px;margin-top:4px;position:relative">
            ${dias !== null && dias >= 0 ? `Faltam ${dias} dias · ` : ''}${p.convidados} convidados${p.cidade ? ' · ' + escapar(p.cidade) : ''}
            ${Store.estado.config.modo7mil ? ' · <strong>Modo R$7 mil</strong>' : ''}
          </p>
        </div>
      </div>

      <div class="conteudo">
        <div class="card">
          <div style="display:flex;justify-content:space-between;align-items:baseline">
            <div><div class="rotulo">Orçamento</div>
            <div class="numero-grande" data-contar="${r.total}">${formatarMoeda(r.total)}</div></div>
            <button class="btn btn-secundario btn-mini" onclick="App.ir('orcamento')">Detalhar</button>
          </div>
          <div style="margin-top:14px">${componenteBarraOrcamento(r)}</div>
          <div class="grade-3" style="margin-top:14px">
            <div><div class="rotulo">Planejado</div><div style="font-family:var(--display);font-size:16px;font-weight:600">${formatarMoeda(r.planejado, true)}</div></div>
            <div><div class="rotulo">Pago</div><div style="font-family:var(--display);font-size:16px;font-weight:600">${formatarMoeda(r.pago, true)}</div></div>
            <div><div class="rotulo">Restante</div><div style="font-family:var(--display);font-size:16px;font-weight:600;color:${r.restante < 0 ? 'var(--vermelho)' : 'var(--verde)'}">${formatarMoeda(r.restante, true)}</div></div>
          </div>
        </div>

        <div class="grade-2">
          <div class="mini-stat">
            <div class="rotulo">Economia potencial</div>
            <div class="valor positivo" data-contar="${eco.potencial}">${formatarMoeda(eco.potencial)}</div>
            <div style="font-size:var(--t-nota);color:var(--grafite)">ainda não confirmada</div>
          </div>
          <div class="mini-stat">
            <div class="rotulo">Meta mensal</div>
            <div class="valor ${meta.viavel ? '' : 'negativo'}">${formatarMoeda(meta.meta)}</div>
            <div style="font-size:var(--t-nota);color:var(--grafite)">${meta.viavel ? 'cabe no seu bolso' : 'acima do que você guarda'}</div>
          </div>
        </div>

        <div class="secao" style="margin-top:20px">
          <div class="secao-titulo">Alertas</div>
          ${alertas.slice(0, 3).map(componenteAlerta).join('')}
        </div>

        ${missao ? `
        <div class="secao">
          <div class="secao-titulo">Próxima missão</div>
          <div class="card card-destaque" onclick="Telas.abrirMissao('${missao.id}')" style="cursor:pointer">
            <div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start">
              <div>
                <div class="card-titulo"><span class="titulo-ic">${icone("alvo",17)}</span>${escapar(missao.titulo)}</div>
                <div class="card-sub">${escapar(missao.objetivo)}</div>
              </div>
              <span style="color:var(--neblina)">${icone("seta",15)}</span>
            </div>
            ${(() => { const e = Motor.economiaMissao(missao); return e ? `<div class="pill-linha"><span class="chip tag-ouro">Potencial: ${formatarMoeda(e.min)} – ${formatarMoeda(e.max)}</span><span class="chip tag">${missao.tempo}</span></div>` : ''; })()}
          </div>
        </div>` : ''}

        ${tarefa ? `
        <div class="secao">
          <div class="secao-titulo">Próximo prazo</div>
          <div class="card compacto" onclick="App.ir('cronograma')" style="cursor:pointer">
            <div class="lista-item" style="padding:0">
              <span class="icone">${icone("calendario",18)}</span>
              <div class="corpo">
                <div class="nome">${escapar(tarefa.titulo)}</div>
                <div class="meta">${tarefa.atrasada ? '<span style="color:var(--vermelho)">Atrasada</span> — ' : ''}fase de ${tarefa.mesInicio} meses antes</div>
              </div>
              <span style="color:var(--neblina)">${icone("seta",15)}</span>
            </div>
          </div>
        </div>` : ''}

        <div class="secao">
          <div class="secao-titulo">Atalhos</div>
          <div class="grade-2">
            <button class="card compacto" style="text-align:left;border:1px solid var(--linha);cursor:pointer;font-family:var(--corpo)" onclick="App.ir('cenarios')">
              <div class="atalho-ic">${icone("balanca",22)}</div><div style="font-weight:600;font-size:13.5px;margin-top:4px">Simular cenários</div>
              <div style="font-size:var(--t-nota);color:var(--grafite)">Dois formatos lado a lado</div>
            </button>
            <button class="card compacto" style="text-align:left;border:1px solid var(--linha);cursor:pointer;font-family:var(--corpo)" onclick="App.ir('fornecedores')">
              <div class="atalho-ic">${icone("proposta",22)}</div><div style="font-weight:600;font-size:13.5px;margin-top:4px">Comparar fornecedores</div>
              <div style="font-size:var(--t-nota);color:var(--grafite)">Preço não é tudo</div>
            </button>
          </div>
        </div>

        <div class="rodape-app">
          Seus dados ficam só neste aparelho. Nada sai daqui.
        </div>
      </div>`;
  },

  /* ================================================================ ORÇAMENTO */

  orcamento() {
    const r = Motor.resumo();
    const dist = Motor.distribuir();
    const grupos = {};
    CATEGORIAS.forEach((c) => {
      if (Store.estado.categoriasAtivas[c.id] === false) return;
      (grupos[c.grupo] = grupos[c.grupo] || []).push(c);
    });

    return `
      ${this.cabecalho('Orçamento', 'Categoria por categoria')}
      <div class="conteudo">
        <div class="card">
          ${componenteBarraOrcamento(r)}
          <div class="grade-2" style="margin-top:14px;gap:8px">
            <div><div class="rotulo">Total</div><div class="numero-medio">${formatarMoeda(r.total)}</div></div>
            <div><div class="rotulo">Reserva (${r.margemPct}%)</div><div class="numero-medio">${formatarMoeda(r.reserva)}</div></div>
            <div><div class="rotulo">Contratado</div><div class="numero-medio">${formatarMoeda(r.contratado)}</div></div>
            <div><div class="rotulo">A pagar</div><div class="numero-medio">${formatarMoeda(r.aPagar)}</div></div>
          </div>
        </div>

        <div class="btn-linha" style="margin-bottom:16px">
          <button class="btn btn-primario" onclick="Telas.abrirNovoGasto()">+ Registrar gasto</button>
          <button class="btn btn-contorno" onclick="Telas.abrirAnalise()">Analisar</button>
        </div>

        ${Object.entries(grupos).map(([grupo, cats]) => `
          <div class="secao">
            <div class="secao-titulo" style="font-size:16px">${escapar(grupo)}</div>
            <div class="card compacto">
              ${cats.map((c) => {
                const d = dist[c.id];
                const excedido = d.contratado > d.planejado && d.planejado > 0;
                return `
                <div style="padding:11px 0;border-bottom:1px solid var(--linha);cursor:pointer" onclick="Telas.abrirCategoria('${c.id}')">
                  <div style="display:flex;justify-content:space-between;align-items:baseline;gap:10px">
                    <span style="font-size:14.5px"><span class="cat-nome">${miniaturaCategoria(c.id, 16)}${c.nome}</span>
                      <span style="color:var(--neblina);font-size:11px">· prioridade ${d.prioridade}</span>
                    </span>
                    <span style="text-align:right;white-space:nowrap">
                      <strong style="font-family:var(--display);font-size:15px">${formatarMoeda(d.planejado, true)}</strong>
                      ${d.contratado ? `<br><span style="font-size:11px;color:${excedido ? 'var(--vermelho)' : 'var(--grafite)'}">contratado ${formatarMoeda(d.contratado, true)}</span>` : ''}
                    </span>
                  </div>
                  <div class="barra-cat"><span class="${excedido ? 'excedido' : ''}" style="width:${pct(d.contratado || 0, d.planejado || 1)}%"></span></div>
                </div>`;
              }).join('')}
            </div>
          </div>`).join('')}

        <div class="secao">
          <div class="secao-titulo" style="font-size:16px">Gastos registrados</div>
          <div class="card compacto">
            ${Store.estado.despesas.length
              ? Store.estado.despesas.map((d) => `
                <div class="lista-item">
                  <span class="icone">${icone(Motor.categoria(d.categoria) ? Motor.categoria(d.categoria).icone : 'outros', 18)}</span>
                  <div class="corpo">
                    <div class="nome">${escapar(d.descricao)}</div>
                    <div class="meta">${Motor.categoria(d.categoria) ? Motor.categoria(d.categoria).nome : ''}${d.vencimento ? ' · vence ' + formatarData(d.vencimento) : ''}${d.parcelas > 1 ? ' · ' + d.parcelas + 'x' : ''}</div>
                  </div>
                  <div>
                    <div class="valor">${formatarMoeda(d.valor)}</div>
                    <div style="font-size:11px;color:var(--grafite);text-align:right">pago ${formatarMoeda(d.pago || 0, true)}</div>
                  </div>
                  <button class="fechar" style="width:26px;height:26px;font-size:12px" onclick="event.stopPropagation();Acoes.removerDespesa('${d.id}')">${icone("fechar",13)}</button>
                </div>`).join('')
              : componenteVazio('recibo', 'Nenhum gasto registrado', 'Todo gasto passa pelo Detector de Prejuízo antes de entrar no plano.', '')}
          </div>
        </div>

        <div class="aviso-legal">${AVISO_ESTIMATIVA}</div>
        <div class="pulo"></div>
      </div>`;
  },

  /* ============================================================== PRIORIDADES */

  prioridades() {
    const dist = Motor.distribuir();
    const r = Motor.resumo();
    const p = Motor.perfil();
    const sonhos = (p.tresSonhos || []).filter(Boolean);

    return `
      ${this.cabecalho('Prioridades', 'O que você não abre mão')}
      <div class="conteudo">
        ${sonhos.length ? `
        <div class="card card-destaque">
          <div class="rotulo">Suas 3 coisas inegociáveis</div>
          ${sonhos.map((s) => `<div style="font-family:var(--display);font-size:16px;color:var(--vinho);margin-top:4px"><span class="sonho-ic">${icone("coracao",15)}</span>${escapar(s)}</div>`).join('')}
        </div>` : ''}

        <div class="alerta info">
          <span class="ic">ℹ️</span>
          <span>Mudar uma prioridade redistribui automaticamente a verba entre as categorias abertas. Categorias já contratadas mantêm o valor real.</span>
        </div>

        ${CATEGORIAS.map((c) => {
          const d = dist[c.id] || { planejado: 0, prioridade: Store.estado.prioridades[c.id] || 5 };
          const ativa = Store.estado.categoriasAtivas[c.id] !== false;
          return `
          <div class="card compacto" style="opacity:${ativa ? 1 : 0.5}">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:10px">
              <div style="flex:1">
                <div style="font-size:14.5px;font-weight:600"><span class="cat-nome">${miniaturaCategoria(c.id, 16)}${c.nome}</span></div>
                <div style="font-size:11.5px;color:var(--grafite)">
                  ${ativa ? `${formatarMoeda(d.planejado)} · ${pct(d.planejado, r.total).toFixed(0)}% do orçamento` : 'categoria desativada'}
                </div>
              </div>
              <label class="switch">
                <input type="checkbox" ${ativa ? 'checked' : ''} onchange="Acoes.alternarCategoria('${c.id}', this.checked)">
                <span class="trilho"></span>
              </label>
            </div>
            ${ativa ? `
            <div style="margin-top:10px;display:flex;align-items:center;gap:10px">
              <input type="range" min="1" max="10" value="${d.prioridade}"
                     oninput="this.nextElementSibling.textContent=this.value+'/10'"
                     onchange="Acoes.definirPrioridade('${c.id}', this.value)">
              <strong style="font-family:var(--display);font-size:15px;min-width:44px;text-align:right">${d.prioridade}/10</strong>
            </div>` : ''}
          </div>`;
        }).join('')}
        <div class="pulo"></div>
      </div>`;
  },

  /* ============================================================ FORNECEDORES */

  fornecedores() {
    const f = Store.estado.fornecedores;
    const porCat = {};
    f.forEach((x) => (porCat[x.categoria] = porCat[x.categoria] || []).push(x));

    return `
      ${this.cabecalho('Fornecedores', 'Preço não é a única variável')}
      <div class="conteudo">
        <button class="btn btn-primario btn-bloco" onclick="Telas.abrirNovoFornecedor()">+ Cadastrar fornecedor</button>
        <div class="pulo"></div>

        <div class="alerta info">
          <span class="ic">${icone("balanca",16)}</span>
          <span>Comparar só o preço é fingir que dois contratos diferentes são iguais. Eu comparo <strong>preço, inclusos, extras e condições</strong>.</span>
        </div>

        ${f.length === 0
          ? componenteVazio('proposta', 'Nenhum fornecedor ainda', 'Três propostas por categoria, com o mesmo briefing. É a regra que mais economiza no casamento inteiro.', '')
          : Object.entries(porCat).map(([catId, lista]) => {
              const cat = Motor.categoria(catId);
              return `
              <div class="secao">
                <div class="secao-titulo" style="font-size:16px">
                  <span>${cat ? icone(cat.icone, 17) + cat.nome : escapar(catId)}</span>
                  ${lista.length >= 2 ? `<button class="btn btn-secundario btn-mini" onclick="Telas.abrirComparador('${catId}')">Comparar</button>` : ''}
                </div>
                ${lista.length < 3 ? `<p class="secao-desc">${3 - lista.length} proposta(s) a menos do que o ideal para negociar com base.</p>` : ''}
                <div class="card compacto">
                  ${lista.map((x) => `
                    <div class="lista-item" style="cursor:pointer" onclick="Telas.abrirFornecedor('${x.id}')">
                      <span class="icone">${x.contratado ? icone('ok',18) : icone('documentacao',18)}</span>
                      <div class="corpo">
                        <div class="nome">${escapar(x.nome)}</div>
                        <div class="meta">${escapar(x.localizacao || '')}${x.avaliacao ? ' · ' + estrelas(x.avaliacao) : ''}</div>
                      </div>
                      <div class="valor">${formatarMoeda(x.preco)}</div>
                    </div>`).join('')}
                </div>
              </div>`;
            }).join('')}
        <div class="pulo"></div>
      </div>`;
  },

  /* ================================================================ CENÁRIOS */

  cenarios() {
    const p = Motor.perfil();
    const cA = Store.estado.cenarioA || { convidados: p.convidados, periodo: p.periodo, diaSemana: p.diaSemana, formatoComida: 'jantar', musica: 'dj', vestido: 'comprado', convite: 'impresso', bebidas: 'completo', lembrancinhas: 'sim', localTipo: 'espaco' };
    const cB = Store.estado.cenarioB || { convidados: Math.round(p.convidados * 0.7), periodo: 'tarde', diaSemana: 'domingo', formatoComida: 'brunch', musica: 'playlist', vestido: 'alugado', convite: 'digital', bebidas: 'selfService', lembrancinhas: 'nao', localTipo: 'alternativo' };
    const comp = Motor.compararCenarios(cA, cB);

    const campos = [
      { k: 'convidados', label: 'Convidados', tipo: 'num' },
      { k: 'periodo', label: 'Período', opcoes: PERIODOS.map((x) => ({ id: x.id, nome: x.nome })) },
      { k: 'diaSemana', label: 'Dia', opcoes: DIAS_SEMANA.map((x) => ({ id: x.id, nome: x.nome })) },
      { k: 'localTipo', label: 'Local', opcoes: [{ id: 'espaco', nome: 'Espaço de eventos' }, { id: 'alternativo', nome: 'Local alternativo' }, { id: 'casa', nome: 'Casa / sítio da família' }] },
      { k: 'formatoComida', label: 'Comida', opcoes: [{ id: 'jantar', nome: 'Jantar completo' }, { id: 'estacoes', nome: 'Estações' }, { id: 'fingerfood', nome: 'Finger food' }, { id: 'brunch', nome: 'Brunch' }] },
      { k: 'bebidas', label: 'Bebidas', opcoes: [{ id: 'completo', nome: 'Bar completo' }, { id: 'selfService', nome: 'Self-service' }, { id: 'semAlcool', nome: 'Sem álcool' }] },
      { k: 'musica', label: 'Música', opcoes: [{ id: 'dj', nome: 'DJ / banda' }, { id: 'musicoCerimonia', nome: 'Só na cerimônia' }, { id: 'playlist', nome: 'Playlist' }] },
      { k: 'vestido', label: 'Vestido', opcoes: [{ id: 'comprado', nome: 'Comprado novo' }, { id: 'usado', nome: 'Seminovo' }, { id: 'alugado', nome: 'Alugado' }] },
      { k: 'convite', label: 'Convite', opcoes: [{ id: 'impresso', nome: 'Impresso' }, { id: 'digital', nome: 'Digital' }] },
      { k: 'lembrancinhas', label: 'Lembrancinha', opcoes: [{ id: 'sim', nome: 'Sim' }, { id: 'nao', nome: 'Não' }] },
    ];

    const coluna = (letra, c) => `
      <div class="cenario-col ${letra.toLowerCase()}">
        <h4>Cenário ${letra}</h4>
        <div class="numero-medio">${formatarMoeda(letra === 'A' ? comp.a.total : comp.b.total)}</div>
        <div style="margin-top:10px">
          ${campos.map((f) => `
            <div class="campo" style="margin-bottom:8px">
              <label style="font-size:11px;color:var(--neblina);text-transform:uppercase;letter-spacing:.6px">${f.label}</label>
              ${f.tipo === 'num'
                ? `<input type="number" min="10" max="500" value="${c[f.k]}" style="padding:8px 10px;font-size:14px" onchange="Acoes.setCenario('${letra}','${f.k}', Number(this.value))">`
                : `<select style="padding:8px 10px;font-size:13.5px" onchange="Acoes.setCenario('${letra}','${f.k}', this.value)">${selectOpcoes(f.opcoes, c[f.k])}</select>`}
            </div>`).join('')}
        </div>
      </div>`;

    const economia = comp.diferenca < 0;

    return `
      ${this.cabecalho('Cenários', 'Dois casamentos, lado a lado')}
      <div class="conteudo">
        <div class="card card-destaque" style="text-align:center">
          <div class="rotulo">Diferença estimada</div>
          <div class="numero-grande" style="color:${economia ? 'var(--verde)' : 'var(--vermelho)'}">
            ${economia ? '−' : '+'}${formatarMoeda(Math.abs(comp.diferenca))}
          </div>
          <p class="card-sub" style="margin:6px 0 0">
            O cenário B ficaria ${economia ? 'mais barato' : 'mais caro'} que o A${comp.a.total ? ` (${Math.abs((comp.diferenca / comp.a.total) * 100).toFixed(0)}%)` : ''}.
          </p>
        </div>

        <div class="grade-2" style="align-items:start">
          ${coluna('A', cA)}
          ${coluna('B', cB)}
        </div>

        <div class="secao" style="margin-top:20px">
          <div class="secao-titulo">Categorias afetadas</div>
          <p class="secao-desc">Mexer em uma coisa mexe em várias. Aqui está o efeito completo.</p>
          <div class="card compacto">
            ${comp.afetadas.length
              ? comp.afetadas.map((c) => `
                <div class="diff">
                  <span><span class="cat-nome">${miniaturaCategoria(c.id, 16)}${c.nome}</span></span>
                  <span>
                    <span style="color:var(--grafite);font-size:12px">${formatarMoeda(c.a, true)} → ${formatarMoeda(c.b, true)}</span>
                    <strong class="${c.dif < 0 ? 'menos' : 'mais'}" style="margin-left:8px">${c.dif < 0 ? '−' : '+'}${formatarMoeda(Math.abs(c.dif), true)}</strong>
                  </span>
                </div>`).join('')
              : '<p class="card-sub">Os dois cenários estão praticamente iguais. Mude alguma variável para ver o impacto.</p>'}
          </div>
        </div>

        <div class="secao">
          <div class="secao-titulo">O que muda na experiência</div>
          <div class="card compacto">
            ${this.impactoExperiencia(cA, cB)}
          </div>
        </div>

        <div class="aviso-legal">${AVISO_ESTIMATIVA}</div>
        <div class="pulo"></div>
      </div>`;
  },

  impactoExperiencia(a, b) {
    const notas = [];
    if (b.convidados < a.convidados) notas.push(['ok', `${a.convidados - b.convidados} pessoas a menos — mais verba por convidado, mas exige conversas difíceis.`]);
    if (b.convidados > a.convidados) notas.push(['alerta', `${b.convidados - a.convidados} pessoas a mais — multiplica comida, bebida, convites e espaço.`]);
    if (b.periodo !== a.periodo) notas.push(['relogio', `Mudança de período: muda o cardápio esperado, o consumo de bebida e a necessidade de iluminação.`]);
    if (b.diaSemana !== a.diaSemana) notas.push(['calendario', `Dia diferente costuma abrir margem de negociação, mas pode reduzir a presença de convidados.`]);
    if (b.formatoComida !== a.formatoComida) notas.push(['alimentacao', `Formato de comida diferente: confirme se a duração do evento combina com o que será servido.`]);
    if (b.musica === 'playlist' && a.musica !== 'playlist') notas.push(['musica', `Playlist economiza muito, mas ninguém conduz a pista. Defina um responsável e teste o som antes.`]);
    if (b.vestido !== a.vestido) notas.push(['vestido', `Mudança na estratégia do vestido — o resultado visual costuma ser equivalente se o ajuste for bem feito.`]);
    if (b.convite === 'digital' && a.convite !== 'digital') notas.push(['convites', `Convite digital economiza e organiza a confirmação de presença. Envie nominalmente, nunca em grupo.`]);
    if (b.localTipo === 'casa' && a.localTipo !== 'casa') notas.push(['casa', `Casa/sítio só economiza se o custo de tenda, banheiro, mesas, louça e limpeza for menor que a locação. Faça essa conta.`]);
    if (b.lembrancinhas === 'nao' && a.lembrancinhas === 'sim') notas.push(['lembrancinhas', `Sem lembrancinha: é a categoria com menor impacto percebido por real gasto.`]);
    if (!notas.length) notas.push(['info', 'Os cenários estão iguais. Altere uma variável no cenário B para ver a comparação.']);
    return notas.map(([ic, t]) => `<div class="lista-item"><span class="icone">${icone(ic,18)}</span><div class="corpo"><div class="meta" style="font-size:13px;color:var(--carvao)">${escapar(t)}</div></div></div>`).join('');
  },

  /* ================================================================= MISSÕES */

  missoes() {
    const lista = Motor.missoesRecomendadas();
    const eco = Motor.economiaResumo();
    const concluidas = lista.filter((m) => (Store.estado.missoes[m.id] || {}).status === 'concluida').length;

    return `
      ${this.cabecalho('Missões', 'Ações curtas, retorno real')}
      <div class="conteudo">
        <div class="grade-3">
          <div class="mini-stat"><div class="rotulo">Economizado</div><div class="valor positivo">${formatarMoeda(eco.economizado, true)}</div></div>
          <div class="mini-stat"><div class="rotulo">Potencial</div><div class="valor">${formatarMoeda(eco.potencial, true)}</div></div>
          <div class="mini-stat"><div class="rotulo">Evitado</div><div class="valor">${formatarMoeda(eco.evitado, true)}</div></div>
        </div>
        <p class="secao-desc" style="margin-top:8px">
          <strong>Economizado</strong> é o que você confirmou ter economizado. <strong>Potencial</strong> é estimativa das missões abertas.
          <strong>Evitado</strong> é gasto que deixou de existir por uma decisão. Eu nunca invento economia.
        </p>

        <div class="secao">
          <div class="secao-titulo">${concluidas}/${MISSOES.length} concluídas</div>
          ${lista.map((m) => {
            const st = Store.estado.missoes[m.id] || {};
            const e = Motor.economiaMissao(m);
            const feita = st.status === 'concluida';
            return `
            <div class="card compacto" style="cursor:pointer;${feita ? 'opacity:.6' : ''}" onclick="Telas.abrirMissao('${m.id}')">
              <div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start">
                <div style="flex:1">
                  <div class="card-titulo">${feita ? icone("ok",16) + " " : ""}${escapar(m.titulo)}</div>
                  <div class="card-sub">${escapar(m.objetivo)}</div>
                  <div class="pill-linha">
                    ${e ? `<span class="chip tag-ouro">${formatarMoeda(e.min, true)} – ${formatarMoeda(e.max, true)}</span>` : ''}
                    <span class="chip tag">${m.dificuldade === 'baixa' ? 'Fácil' : m.dificuldade === 'media' ? 'Média' : 'Exige conversa'}</span>
                    <span class="chip tag">${m.tempo}</span>
                  </div>
                </div>
                <span style="color:var(--neblina)">${icone("seta",15)}</span>
              </div>
            </div>`;
          }).join('')}
        </div>
        <div class="pulo"></div>
      </div>`;
  },

  /* ============================================================= ESTRATÉGIAS */

  estrategias(params) {
    const filtro = params.filtro || Store.estado._filtroEstrategia || 'todas';
    let lista = Motor.estrategiasRecomendadas();
    if (filtro !== 'todas') lista = lista.filter((s) => s.categorias.includes(filtro));

    return `
      ${this.cabecalho('Estratégias', `${ESTRATEGIAS.length} decisões prontas para usar`)}
      <div class="conteudo">
        <div class="chips" style="margin-bottom:14px;overflow-x:auto;flex-wrap:nowrap;padding-bottom:6px">
          <button class="chip ${filtro === 'todas' ? 'ativo' : ''}" onclick="Acoes.filtrarEstrategias('todas')">Para você</button>
          ${CATEGORIAS_ESTRATEGIA.map((c) => `<button class="chip ${filtro === c.id ? 'ativo' : ''}" onclick="Acoes.filtrarEstrategias('${c.id}')">${c.nome}</button>`).join('')}
        </div>

        <div class="legenda-niveis">
          ${Object.entries(NIVEIS_ECONOMIA).map(([k, n]) => `
            <span title="${escapar(n.desc)}"><span class="nivel-ponto ${k}"></span>${n.nome.replace('Economia ', '')}</span>`).join('')}
        </div>

        ${lista.length ? lista.map((s) => `
          <button class="card compacto cartao-estrategia" onclick="Telas.abrirEstrategia('${s.id}')">
            <span class="ce-topo">
              <span class="nivel-ponto ${s.nivel}"></span>
              <span class="ce-titulo">${escapar(s.titulo)}</span>
              <span class="ce-seta">${icone('seta', 15)}</span>
            </span>
            <span class="ce-problema">${escapar(s.problema)}</span>
            <span class="ce-rodape">
              <span class="ce-economia">${s.economia.min}–${s.economia.max}%</span>
              <span class="ce-base">sobre ${escapar(s.economia.base)}</span>
              <span class="ce-dif">${s.dificuldade === 'baixa' ? 'Fácil' : s.dificuldade === 'media' ? 'Média' : 'Difícil'}</span>
            </span>
          </button>`).join('')
        : componenteVazio('lupa', 'Nada nessa categoria', 'Troque o filtro para ver outras estratégias.', '')}

        <div class="aviso-legal">Percentuais de economia são estimativas de planejamento sobre a categoria indicada, não garantias de preço.</div>
        <div class="pulo"></div>
      </div>`;
  },

  /* ============================================================== CRONOGRAMA */

  cronograma() {
    const tarefas = Motor.cronogramaAtivo();
    const meses = Motor.mesesRestantes();
    const pendentes = tarefas.filter((t) => t.pendente);
    const futuras = tarefas.filter((t) => t.futura && !t.feita);
    const feitas = tarefas.filter((t) => t.feita);

    /* Fases futuras continuam agrupadas por mês; o acúmulo vira um bloco só. */
    const fases = {};
    futuras.forEach((t) => {
      const chave = `${t.mesInicio} ${t.mesInicio === 1 ? 'mês' : 'meses'} antes`;
      (fases[chave] = fases[chave] || []).push(t);
    });

    const linha = (t) => `
      <div class="tl-item ${t.feita ? 'feita' : ''}">
        <label>
          <input type="checkbox" ${t.feita ? 'checked' : ''} onchange="Acoes.alternarTarefa('${t.id}', this.checked)">
          <span class="tl-marca"></span>
          <span class="tl-titulo">${escapar(t.titulo)}</span>
        </label>
      </div>`;

    return `
      ${this.cabecalho('Cronograma', meses > 0 ? `Faltam ${meses} meses` : 'É agora')}
      <div class="conteudo">
        ${pendentes.length ? `
        <div class="secao">
          <div class="secao-titulo">Comece por aqui</div>
          <p class="secao-desc">
            ${pendentes.length} ${pendentes.length === 1 ? 'tarefa faz parte' : 'tarefas fazem parte'} do estágio em que você está.
            Não é atraso — é a sua fila. Marque à medida que resolver.
          </p>
          <div class="card"><div class="timeline agora">${pendentes.map(linha).join('')}</div></div>
        </div>` : ''}

        ${Object.keys(fases).length ? `
        <div class="secao">
          <div class="secao-titulo">Pela frente</div>
          <p class="secao-desc">Cada bloco abre quando faltar esse tempo para a data.</p>
          <div class="card">
            <div class="timeline">
              ${Object.entries(fases).map(([fase, lista]) => `
                <div class="tl-fase">${escapar(fase)}</div>
                ${lista.map(linha).join('')}`).join('')}
            </div>
          </div>
        </div>` : ''}

        ${feitas.length ? `
        <div class="secao">
          <div class="secao-titulo">Já resolvido <span class="chip tag">${feitas.length}</span></div>
          <div class="card"><div class="timeline">${feitas.map(linha).join('')}</div></div>
        </div>` : ''}

        ${!pendentes.length && !Object.keys(fases).length && !feitas.length
          ? componenteVazio('calendario', 'Nada no cronograma', 'Informe sua data ou o prazo estimado em Meus dados para eu montar as fases.', '')
          : ''}
        <div class="pulo"></div>
      </div>`;
  },

  /* =========================================================== CALCULADORAS */

  calculadoras() {
    const p = Motor.perfil();
    return `
      ${this.cabecalho('Calculadoras', 'Sem caixa-preta')}
      <div class="conteudo">
        <div class="alerta info">
          <span class="ic">${icone("calculadora",16)}</span>
          <span>Quantidade por pessoa é <strong>ponto de partida</strong>, não regra. Confirme com quem vai produzir.</span>
        </div>

        <div class="card">
          <div class="card-titulo">Quantidades para a festa</div>
          <div class="campo"><label>Convidados</label><input type="number" id="cl-conv" value="${p.convidados}" oninput="Telas.calcularQuantidades()"></div>
          <div class="campo"><label>Duração estimada (horas)</label><input type="number" id="cl-horas" value="5" min="1" max="12" oninput="Telas.calcularQuantidades()"></div>
          <div class="campo"><label>Formato da comida</label>
            <select id="cl-formato" onchange="Telas.calcularQuantidades()">
              <option value="jantar">Jantar completo</option><option value="almoco">Almoço</option>
              <option value="estacoes">Estações</option><option value="fingerfood">Finger food</option><option value="brunch">Brunch</option>
            </select>
          </div>
          <div class="campo"><label>Com bebida alcoólica?</label>
            <select id="cl-alcool" onchange="Telas.calcularQuantidades()"><option value="1">Sim</option><option value="0">Não</option></select>
          </div>
          <div id="cl-resultado"></div>
        </div>

        <div class="card">
          <div class="card-titulo">Parcelas</div>
          <div class="grade-2">
            <div class="campo"><label>Valor total</label><input type="number" id="cp-valor" placeholder="0" oninput="Telas.calcularParcelas()"></div>
            <div class="campo"><label>Entrada</label><input type="number" id="cp-entrada" placeholder="0" oninput="Telas.calcularParcelas()"></div>
          </div>
          <div class="campo"><label>Número de parcelas</label><input type="number" id="cp-n" value="10" min="1" oninput="Telas.calcularParcelas()"></div>
          <div id="cp-resultado"></div>
        </div>

        <div class="card">
          <div class="card-titulo">Poupança até a data</div>
          <div class="grade-2">
            <div class="campo"><label>Objetivo</label><input type="number" id="cs-obj" value="${p.orcamentoTotal}" oninput="Telas.calcularPoupanca()"></div>
            <div class="campo"><label>Já tenho</label><input type="number" id="cs-tem" value="${p.disponivelHoje}" oninput="Telas.calcularPoupanca()"></div>
          </div>
          <div class="campo"><label>Meses até o casamento</label><input type="number" id="cs-meses" value="${Motor.mesesRestantes() || 12}" min="1" oninput="Telas.calcularPoupanca()"></div>
          <div id="cs-resultado"></div>
        </div>
        <div class="pulo"></div>
      </div>`;
  },

  pos_calculadoras() {
    this.calcularQuantidades();
    this.calcularParcelas();
    this.calcularPoupanca();
  },

  linhaResultado(k, v, formula) {
    return `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--linha)">
      <span style="font-size:13.5px">${k}</span><strong style="font-family:var(--display);font-size:15px">${v}</strong>
    </div>${formula ? `<p style="font-size:11px;color:var(--neblina);margin:6px 0 0">Fórmula: ${escapar(formula)}</p>` : ''}`;
  },

  calcularQuantidades() {
    const conv = Number($('#cl-conv').value) || 0;
    const horas = Number($('#cl-horas').value) || 4;
    const formato = $('#cl-formato').value;
    const alcool = $('#cl-alcool').value === '1';
    const c = Motor.calc;
    const comida = c.comida(conv, formato, horas);
    const beb = c.bebidas(conv, horas, Motor.perfil().periodo, alcool);
    const bolo = c.bolo(conv);
    const doces = c.doces(conv, 4);
    const conv2 = c.convites(conv);
    const mesas = c.mesas(conv, 8);

    $('#cl-resultado').innerHTML = `
      <div style="margin-top:10px">
        ${this.linhaResultado('Pratos / porções principais', comida.pratos)}
        ${comida.salgados ? this.linhaResultado('Salgados (finger food)', comida.salgados + ' un.') : ''}
        ${this.linhaResultado('Água', beb.agua + ' L')}
        ${this.linhaResultado('Refrigerante / suco', beb.refrigerante + ' L')}
        ${alcool ? this.linhaResultado('Bebidas alcoólicas', beb.alcoolicas + ' L') : ''}
        ${this.linhaResultado('Bolo', bolo.fatias + ' fatias · ' + bolo.kg + ' kg')}
        ${this.linhaResultado('Doces', doces.unidades + ' un.')}
        ${this.linhaResultado('Convites', conv2.convites + ' un.')}
        ${this.linhaResultado('Mesas / cadeiras', mesas.mesas + ' mesas · ' + mesas.cadeiras + ' cadeiras', 'litros = convidados × horas × consumo por pessoa/hora · fatias = convidados × 1,1 · convites = convidados ÷ 2')}
      </div>`;
  },

  calcularParcelas() {
    const r = Motor.calc.parcelas($('#cp-valor').value, $('#cp-n').value, $('#cp-entrada').value);
    $('#cp-resultado').innerHTML = this.linhaResultado('Valor de cada parcela', formatarMoeda(r.parcela), r.formula) +
      `<div class="alerta info" style="margin-top:10px"><span class="ic">${icone("coracao",16)}</span><span>Só parcele o que cabe na sua capacidade mensal. Chegar ao casamento com dívida é o único resultado que eu quero te ajudar a evitar.</span></div>`;
  },

  calcularPoupanca() {
    const r = Motor.calc.poupanca($('#cs-obj').value, $('#cs-tem').value, $('#cs-meses').value);
    const cap = Motor.perfil().poupancaMensal;
    $('#cs-resultado').innerHTML =
      this.linhaResultado('Falta juntar', formatarMoeda(r.falta)) +
      this.linhaResultado('Por mês', formatarMoeda(r.mensal), r.formula) +
      (cap ? `<div class="alerta ${r.mensal <= cap ? 'ok' : 'medio'}" style="margin-top:10px"><span class="ic">${icone(r.mensal <= cap ? "ok" : "sino",16)}</span><span>Você informou que guarda ${formatarMoeda(cap)}/mês. ${r.mensal <= cap ? 'A meta cabe.' : `Faltariam ${formatarMoeda(r.mensal - cap)}/mês — vale ajustar o formato ou a data antes de pensar em crédito.`}</span></div>` : '');
  },

  /* ============================================================= DOCUMENTOS */

  documentos() {
    const docs = Store.estado.documentos;
    return `
      ${this.cabecalho('Documentos', 'Prazos, multas e o que ficou de fora')}
      <div class="conteudo">
        <button class="btn btn-primario btn-bloco" onclick="Telas.abrirNovoDocumento()">+ Registrar documento</button>
        <div class="pulo"></div>
        <div class="alerta medio">
          <span class="ic">${icone("balanca",16)}</span>
          <span>Eu ajudo você a organizar valores, prazos e pontos de atenção. <strong>Isso não substitui a avaliação de um profissional do direito.</strong></span>
        </div>
        ${docs.length
          ? docs.map((d) => `
            <div class="card compacto">
              <div style="display:flex;justify-content:space-between;gap:10px">
                <div style="flex:1">
                  <div class="card-titulo">${escapar(d.titulo)}</div>
                  <div class="card-sub">${escapar(d.tipo)}${d.vencimento ? ' · vence ' + formatarData(d.vencimento) : ''}</div>
                  ${d.pontos && d.pontos.length ? `<ul class="passos">${d.pontos.map((p) => `<li>${escapar(p)}</li>`).join('')}</ul>` : ''}
                </div>
                <div style="text-align:right">
                  <div class="valor" style="font-family:var(--display);font-size:16px;font-weight:600">${formatarMoeda(d.valor)}</div>
                  <button class="fechar" style="width:26px;height:26px;font-size:12px;margin-top:6px" onclick="Acoes.removerDocumento('${d.id}')">${icone("fechar",13)}</button>
                </div>
              </div>
            </div>`).join('')
          : componenteVazio('documentacao', 'Nenhum documento registrado', 'Registre contratos, propostas e recibos com valor, vencimento, multa e o que está incluso.', '')}
        <div class="pulo"></div>
      </div>`;
  },

  /* ============================================================== MODO 7 MIL */

  modo7mil() {
    const ativo = Store.estado.config.modo7mil;
    const r = Motor.resumo();
    const est = Motor.estimativaTotal();
    const p = Motor.perfil();
    const enxuto = Motor.simularCenario({
      convidados: Math.min(p.convidados, 50), periodo: 'tarde', diaSemana: 'domingo',
      formatoComida: 'brunch', musica: 'playlist', vestido: 'alugado', convite: 'digital',
      bebidas: 'selfService', lembrancinhas: 'nao', localTipo: 'alternativo', padrao: 'baixo',
    });

    return `
      ${this.cabecalho('Modo R$7 mil', 'Meta de planejamento, não promessa')}
      <div class="conteudo">
        <div class="alerta medio">
          <span class="ic">${icone("alerta",16)}</span>
          <span>Os custos variam conforme cidade, número de convidados, data, fornecedores e escolhas.
          <strong>O Modo R$7 mil é uma meta de planejamento, não uma garantia de preço.</strong></span>
        </div>

        <div class="card card-destaque">
          <div class="rotulo">Status</div>
          <div class="numero-grande">${ativo ? 'Ativo' : 'Desativado'}</div>
          <p class="card-sub">${ativo
            ? `Orçamento fixado em R$7.000, padrão econômico e estratégias de maior economia priorizadas. Contratado até agora: ${formatarMoeda(r.contratado)}.`
            : 'Ao ativar, eu defino o orçamento em R$7.000, mudo o padrão de execução para econômico e passo a priorizar as alternativas de maior economia.'}</p>
          <div class="pulo"></div>
          <button class="btn ${ativo ? 'btn-contorno' : 'btn-ouro'} btn-bloco" onclick="Acoes.alternarModo7mil()">
            ${ativo ? 'Desativar o modo' : 'Ativar o Modo R$7 mil'}
          </button>
        </div>

        <div class="secao">
          <div class="secao-titulo">Onde você está</div>
          <div class="grade-2">
            <div class="mini-stat"><div class="rotulo">Formato atual</div><div class="valor">${formatarMoeda(est, true)}</div><div style="font-size:11px;color:var(--grafite)">${p.convidados} convidados</div></div>
            <div class="mini-stat"><div class="rotulo">Formato enxuto</div><div class="valor positivo">${formatarMoeda(enxuto.total, true)}</div><div style="font-size:11px;color:var(--grafite)">${Math.min(p.convidados, 50)} convidados</div></div>
          </div>
          <p class="secao-desc" style="margin-top:10px">
            O "formato enxuto" é a combinação de domingo à tarde, brunch, playlist, vestido alugado,
            convite digital, bar self-service, sem lembrancinha e local alternativo.
            ${enxuto.total <= 7000 ? 'Nessa configuração, a estimativa cabe na meta.' : `Nessa configuração a estimativa ainda fica ${formatarMoeda(enxuto.total - 7000)} acima da meta — o próximo ajuste de maior efeito é reduzir convidados.`}
          </p>
        </div>

        <div class="secao">
          <div class="secao-titulo">Substituições sugeridas</div>
          <p class="secao-desc">Meu princípio não é cortar. É entregar a mesma função por menos.</p>
          <div class="card compacto">
            ${[
              ['bolo', 'Bolo sofisticado', 'Bolo cenográfico para a foto + bolo simples para servir'],
              ['vestido', 'Vestido de coleção', 'Aluguel, seminovo ou vestido pronto customizado'],
              ['musica', 'DJ a noite toda', 'Playlist estruturada + som alugado + responsável designado'],
              ['convites', 'Convite impresso', 'Convite digital com confirmação online'],
              ['flores', 'Volume floral', 'Flores da estação, folhagem e velas nos pontos de foto'],
              ['alimentacao', 'Jantar completo', 'Brunch ou finger food com duração compatível'],
            ].map(([ic, de, para]) => `
              <div class="lista-item">
                <span class="icone">${icone(ic,18)}</span>
                <div class="corpo">
                  <div class="meta" style="text-decoration:line-through">${de}</div>
                  <div class="nome" style="font-size:13.5px">${para}</div>
                </div>
              </div>`).join('')}
          </div>
        </div>

        <div class="aviso-legal">${AVISO_ESTIMATIVA}</div>
        <div class="pulo"></div>
      </div>`;
  },

  /* ================================================================== PERFIS */

  perfis() {
    const lista = Store.listarPerfis().sort((a, b) => (b.visto || '').localeCompare(a.visto || ''));
    const ativo = Store.perfilAtivoId;

    return `
      ${this.cabecalho('Perfis', 'Vários casamentos, um aparelho')}
      <div class="conteudo">
        <div class="alerta info">
          <span class="ic">${icone('info', 16)}</span>
          <span>Cada perfil guarda o próprio orçamento, fornecedores e cronograma.
          Nada é compartilhado entre eles — e nada sai deste aparelho.</span>
        </div>

        ${lista
          .map((x) => {
            const meu = x.id === ativo;
            return `
          <div class="card compacto perfil-item ${meu ? 'ativo' : ''}">
            <div class="perfil-linha">
              <span class="perfil-ic">${icone(meu ? 'ok' : 'pessoas', 20)}</span>
              <div class="perfil-corpo">
                <div class="perfil-nome">${escapar(x.nome)}</div>
                <div class="card-sub">${meu ? 'Em uso agora' : 'Última vez em ' + formatarData(x.visto || x.criadoEm)}</div>
              </div>
              ${meu ? '' : `<button class="btn btn-secundario btn-mini" onclick="Acoes.trocarPerfil('${x.id}')">Abrir</button>`}
            </div>
            <div class="perfil-acoes">
              <button class="btn-texto" onclick="Acoes.renomearPerfil('${x.id}')">Renomear</button>
              ${lista.length > 1 ? `<button class="btn-texto perigo" onclick="Acoes.excluirPerfil('${x.id}')">Excluir</button>` : ''}
            </div>
          </div>`;
          })
          .join('')}

        <button class="btn btn-primario btn-bloco" onclick="Acoes.criarPerfil()">Novo perfil</button>

        <div class="aviso-legal" style="margin-top:var(--e4)">
          Perfis separam pessoas <strong>neste aparelho</strong>. Para levar um planejamento
          para outro celular, use o backup em Ajustes — sem servidor, não existe sincronização automática.
        </div>
        <div class="pulo"></div>
      </div>`;
  },

  /* =================================================================== PERFIL */

  perfil() {
    const p = Motor.perfil();
    return `
      ${this.cabecalho('Meus dados', 'Mudou? Eu recalculo tudo')}
      <div class="conteudo">
        <div class="card">
          <div class="card-titulo">Dinheiro</div>
          <div class="campo"><label>Orçamento total</label><input type="number" id="pf-orcamentoTotal" value="${p.orcamentoTotal}"></div>
          <div class="campo"><label>Disponível hoje</label><input type="number" id="pf-disponivelHoje" value="${p.disponivelHoje}"></div>
          <div class="campo"><label>Poupança mensal</label><input type="number" id="pf-poupancaMensal" value="${p.poupancaMensal}"></div>
        </div>

        <div class="card">
          <div class="card-titulo">Data e local</div>
          <div class="campo"><label>Data do casamento</label><input type="date" id="pf-dataCasamento" value="${escapar(p.dataCasamento || '')}"></div>
          <div class="campo"><label>Se não há data: meses estimados</label><input type="number" id="pf-mesesEstimados" value="${p.mesesEstimados}"></div>
          <div class="campo"><label>Dia da semana</label><select id="pf-diaSemana">${selectOpcoes(DIAS_SEMANA, p.diaSemana)}</select></div>
          <div class="campo"><label>Cidade / região</label><input type="text" id="pf-cidade" value="${escapar(p.cidade || '')}"></div>
          <div class="campo"><label>Custo de vida da região</label><select id="pf-nivelRegiao">${selectOpcoes(NIVEL_REGIAO, p.nivelRegiao)}</select>
            <p class="ajuda">Calibra as estimativas. É a sua leitura, não um dado de mercado.</p></div>
        </div>

        <div class="card">
          <div class="card-titulo">Formato</div>
          <div class="campo"><label>Convidados</label><input type="number" id="pf-convidados" value="${p.convidados}"></div>
          <div class="campo"><label>Período</label><select id="pf-periodo">${selectOpcoes(PERIODOS, p.periodo)}</select></div>
          <div class="campo"><label>Estilo</label><select id="pf-estilo">${selectOpcoes(ESTILOS, p.estilo)}</select></div>
          <div class="campo"><label>Padrão de execução</label><select id="pf-padrao">${selectOpcoes(PADRAO_EXECUCAO, p.padrao)}</select></div>
        </div>

        <div class="card">
          <div class="card-titulo">O que vocês aceitam</div>
          ${[['aceitaDiy', 'Fazer por conta (DIY)'], ['aceitaAluguel', 'Alugar em vez de comprar'], ['aceitaUsado', 'Itens usados ou seminovos'], ['aceitaLocalAlternativo', 'Local alternativo'], ['recebeAjuda', 'Recebemos ajuda de família/amigos']]
            .map(([k, t]) => `<label class="toggle"><span class="txt">${t}</span>
              <span class="switch"><input type="checkbox" id="pf-${k}" ${p[k] ? 'checked' : ''}><span class="trilho"></span></span></label>`).join('')}
        </div>

        <div class="card">
          <div class="card-titulo">Suas 3 coisas inegociáveis</div>
          ${[0, 1, 2].map((i) => `<div class="campo"><input type="text" id="pf-sonho-${i}" placeholder="${i + 1}ª" value="${escapar((p.tresSonhos || [])[i] || '')}"></div>`).join('')}
          <div class="campo"><label>Restrições importantes</label><textarea id="pf-restricoes">${escapar(p.restricoes || '')}</textarea></div>
        </div>

        <button class="btn btn-primario btn-bloco" onclick="Acoes.salvarPerfil()">Salvar e recalcular</button>
        <div class="pulo"></div>
      </div>`;
  },

  /* ============================================================= CONFIGURAÇÕES */

  config() {
    const c = Store.estado.config;
    return `
      ${this.cabecalho('Ajustes', 'Margem, backup e as contas por trás')}
      <div class="conteudo">
        <div class="card">
          <div class="card-titulo">Margem de segurança</div>
          <p class="card-sub">Casamentos podem gerar custos inesperados. Considere reservar uma margem de segurança.
          Não existe percentual universal — este app usa o que você configurar aqui.</p>
          <div style="display:flex;align-items:center;gap:12px;margin-top:12px">
            <input type="range" min="0" max="30" step="1" value="${c.margemSeguranca}"
                   oninput="this.nextElementSibling.textContent=this.value+'%'"
                   onchange="Acoes.definirMargem(this.value)">
            <strong style="font-family:var(--display);font-size:18px;min-width:48px;text-align:right">${c.margemSeguranca}%</strong>
          </div>
          <p class="card-sub" style="margin-top:8px">Reserva atual: <strong>${formatarMoeda(Motor.resumo().reserva)}</strong></p>
        </div>

        <div class="card">
          <div class="card-titulo">Seus dados</div>
          <p class="card-sub">Tudo fica neste navegador. Nada sai daqui. O backup é a sua garantia se você trocar de aparelho ou limpar os dados.</p>
          <div class="btn-linha" style="margin-top:12px">
            <button class="btn btn-contorno btn-mini" onclick="Acoes.exportar()">Exportar backup</button>
            <button class="btn btn-contorno btn-mini" onclick="Acoes.importarTexto()">Restaurar</button>
          </div>
          <input type="file" id="arquivo-import" accept="application/json" style="display:none" onchange="Acoes.importar(this)">
        </div>

        <div class="card">
          <div class="card-titulo">Recomeçar</div>
          <p class="card-sub">Apaga tudo e refaz o onboarding do zero.</p>
          <button class="btn btn-contorno btn-bloco btn-mini" style="margin-top:10px;color:var(--vermelho);border-color:#f2ccd4" onclick="Acoes.resetar()">Apagar meus dados</button>
        </div>

        <div class="card">
          <div class="card-titulo">Como eu calculo</div>
          <div class="acordeao">
            <div class="acordeao-topo" onclick="this.parentElement.classList.toggle('aberto')"><span>Distribuição da verba</span><span class="seta">${icone("seta",13)}</span></div>
            <div class="acordeao-corpo">
              distribuível = orçamento × (1 − margem)<br>
              peso da categoria = peso típico × (0,55 + 0,09 × prioridade)<br>
              sugerido = distribuível × peso ÷ soma dos pesos<br><br>
              Categorias já contratadas saem do rateio pelo valor real e o restante é redistribuído.
            </div>
          </div>
          <div class="acordeao">
            <div class="acordeao-topo" onclick="this.parentElement.classList.toggle('aberto')"><span>Estimativa por categoria</span><span class="seta">${icone("seta",13)}</span></div>
            <div class="acordeao-corpo">
              estimativa = semente do padrão × quantidade × fator região × fator estilo × fator período × fator dia<br><br>
              As sementes são pontos de partida editáveis, não preços de mercado. Substitua por orçamentos reais.
            </div>
          </div>
          <div class="acordeao">
            <div class="acordeao-topo" onclick="this.parentElement.classList.toggle('aberto')"><span>Meta mensal</span><span class="seta">${icone("seta",13)}</span></div>
            <div class="acordeao-corpo">meta = (orçamento total − disponível hoje) ÷ meses restantes</div>
          </div>
          <div class="acordeao">
            <div class="acordeao-topo" onclick="this.parentElement.classList.toggle('aberto')"><span>Economia potencial</span><span class="seta">${icone("seta",13)}</span></div>
            <div class="acordeao-corpo">
              Soma, para cada missão em aberto, o ponto médio do intervalo percentual aplicado sobre a base indicada.
              Economia potencial nunca vira "economizado" sozinha — você confirma o valor real.
            </div>
          </div>
        </div>

        <div class="rodape-app">Noiva Inteligente</div>
        <div class="pulo"></div>
      </div>`;
  },

  /* ============================================================== ASSISTENTE */

  assistente() {
    return `
      ${this.cabecalho('Assistente', 'Conhece o seu plano inteiro')}
      <div class="chat" id="chat-historico"></div>
      <div style="padding:0 16px 8px">
        <div class="chips" id="chat-sugestoes"></div>
      </div>
      <div class="chat-entrada">
        <textarea id="chat-input" placeholder="Pergunte qualquer coisa sobre o seu plano..." rows="1"
                  onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();Acoes.perguntar()}"></textarea>
        <button class="btn btn-primario" onclick="Acoes.perguntar()">↑</button>
      </div>
      <div style="padding:4px 16px 0">
        <p style="font-size:11px;color:var(--neblina);text-align:center;line-height:1.5">
          Respondo pelos seus números. Não invento preço, fornecedor, lei nem disponibilidade.
        </p>
      </div>
      <div class="pulo"></div>`;
  },

  pos_assistente() {
    const hist = $('#chat-historico');
    if (!Store.estado._chat) {
      Store.estado._chat = [
        {
          quem: 'ia',
          texto: `Oi! Eu já conheço o seu plano: orçamento de ${formatarMoeda(Motor.resumo().total)}, ${Motor.perfil().convidados} convidados e ${Motor.mesesRestantes()} meses até a data.\n\nPode perguntar o que quiser — inclusive as coisas difíceis, tipo "isso cabe no meu bolso?".`,
        },
      ];
    }
    hist.innerHTML = Store.estado._chat
      .map((m) => `<div class="msg ${m.quem}">${m.quem === 'ia' ? textoRico(m.texto) : escapar(m.texto)}</div>` +
        (m.acoes && m.acoes.length
          ? `<div class="chips" style="margin:-2px 0 12px">${m.acoes
              .map((a) => {
                const acao = a.tela
                  ? `App.ir(&quot;${escapar(a.tela)}&quot;)`
                  : `Acoes.perguntar(${JSON.stringify(a.pergunta || '').replace(/"/g, '&quot;')})`;
                return `<button class="chip" onclick="${acao}">${escapar(a.texto)}</button>`;
              })
              .join('')}</div>`
          : ''))
      .join('');

    $('#chat-sugestoes').innerHTML = Assistente.sugestoes()
      .map((s) => `<button class="chip" onclick="Acoes.perguntar(${JSON.stringify(s).replace(/"/g, '&quot;')})">${escapar(s)}</button>`)
      .join('');

    hist.scrollIntoView({ block: 'end' });
    window.scrollTo(0, document.body.scrollHeight);
  },

  /* ================================================================= GAVETAS */

  abrirCategoria(catId) {
    const cat = Motor.categoria(catId);
    const d = Motor.distribuir()[catId];
    const r = Motor.resumo();
    const estr = Motor.estrategiasPara(catId).slice(0, 4);
    const despesas = Store.estado.despesas.filter((x) => x.categoria === catId);

    abrirGaveta(
      cat.nome,
      `Prioridade ${d.prioridade}/10 · ${pct(d.planejado, r.total).toFixed(0)}% do orçamento`,
      `
      ${capaCategoria(catId)}
      <div class="grade-2">
        <div class="mini-stat"><div class="rotulo">Planejado</div><div class="valor">${formatarMoeda(d.planejado)}</div></div>
        <div class="mini-stat"><div class="rotulo">Contratado</div><div class="valor ${d.contratado > d.planejado ? 'negativo' : ''}">${formatarMoeda(d.contratado)}</div></div>
      </div>
      <div class="campo" style="margin-top:14px">
        <label>Ajustar valor planejado</label>
        <input type="number" value="${d.planejado}" onchange="Acoes.definirPlanejado('${catId}', this.value)">
        <p class="ajuda">Deixe em branco para eu voltar a calcular automaticamente (sugestão: ${formatarMoeda(d.sugerido)}).</p>
      </div>
      <div class="alerta info">
        <span class="ic">${icone("grafico",16)}</span>
        <span>Estimativa para o seu formato: <strong>${formatarMoeda(d.estimativa)}</strong>. É um ponto de partida — orçamentos reais mandam mais.</span>
      </div>
      ${cat.dica ? `<div class="card compacto"><div class="card-sub"><span class="titulo-ic">${icone("info",15)}</span>${escapar(cat.dica)}</div></div>` : ''}

      ${cat.naoIncluiCostuma.length ? `
      <div class="secao">
        <div class="secao-titulo" style="font-size:16px">O que costuma não estar incluso</div>
        <div class="card compacto">
          ${cat.naoIncluiCostuma.map((i) => `<div style="padding:6px 0;font-size:13.5px;border-bottom:1px solid var(--linha)">— ${escapar(i)}</div>`).join('')}
        </div>
      </div>` : ''}

      ${despesas.length ? `
      <div class="secao">
        <div class="secao-titulo" style="font-size:16px">Gastos nesta categoria</div>
        <div class="card compacto">
          ${despesas.map((x) => `<div class="lista-item"><div class="corpo"><div class="nome">${escapar(x.descricao)}</div>
            <div class="meta">${x.vencimento ? 'vence ' + formatarData(x.vencimento) : 'sem vencimento'}</div></div>
            <div class="valor">${formatarMoeda(x.valor)}</div></div>`).join('')}
        </div>
      </div>` : ''}

      ${estr.length ? `
      <div class="secao">
        <div class="secao-titulo" style="font-size:16px">Estratégias para economizar aqui</div>
        ${estr.map((s) => `<div class="card compacto" style="cursor:pointer" onclick="Telas.abrirEstrategia('${s.id}')">
          <div class="card-titulo" style="font-size:15px"><span class="nivel-ponto ${s.nivel}"></span> ${escapar(s.titulo)}</div>
          <div class="card-sub">${escapar(s.solucao)}</div>
          <div class="pill-linha"><span class="chip tag-ouro">${s.economia.min}–${s.economia.max}% (estimativa)</span></div>
        </div>`).join('')}
      </div>` : ''}
      <div class="pulo"></div>`
    );
  },

  abrirEstrategia(id) {
    const s = ESTRATEGIAS.find((x) => x.id === id);
    if (!s) return;
    const n = NIVEIS_ECONOMIA[s.nivel];
    abrirGaveta(
      s.titulo,
      `${n.nome}`,
      `
      <div class="pill-linha" style="margin-bottom:14px">
        <span class="selo ${s.nivel}">${n.nome}</span>
        <span class="chip tag-ouro">${s.economia.min}–${s.economia.max}% sobre ${escapar(s.economia.base)}</span>
        <span class="chip tag">${s.dificuldade === 'baixa' ? 'Fácil' : s.dificuldade === 'media' ? 'Média' : 'Difícil'}</span>
      </div>

      <div class="card compacto"><div class="rotulo">O problema</div><p style="margin:6px 0 0;font-size:14px">${escapar(s.problema)}</p></div>
      <div class="card compacto"><div class="rotulo">A solução</div><p style="margin:6px 0 0;font-size:14px">${escapar(s.solucao)}</p></div>

      <div class="grade-2">
        <div class="card compacto"><div class="rotulo">Quando usar</div><p style="margin:6px 0 0;font-size:13px">${escapar(s.quandoUsar)}</p></div>
        <div class="card compacto"><div class="rotulo">Quando não usar</div><p style="margin:6px 0 0;font-size:13px">${escapar(s.quandoNaoUsar)}</p></div>
      </div>

      <div class="card compacto">
        <div class="rotulo">Impacto na experiência</div>
        <p style="margin:6px 0 0;font-size:13.5px">${escapar(s.impacto)}</p>
      </div>

      ${s.materiais && s.materiais.length ? `<div class="card compacto"><div class="rotulo">Materiais necessários</div>
        <div class="pill-linha">${s.materiais.map((m) => `<span class="chip tag">${escapar(m)}</span>`).join('')}</div></div>` : ''}

      <div class="card compacto">
        <div class="rotulo">Passo a passo</div>
        <ol class="passos">${s.passos.map((p) => `<li>${escapar(p)}</li>`).join('')}</ol>
      </div>

      ${s.riscos && s.riscos.length ? `<div class="card compacto">
        <div class="rotulo">Riscos</div>
        <ul class="passos">${s.riscos.map((rr) => `<li>${escapar(rr)}</li>`).join('')}</ul>
      </div>` : ''}

      ${s.afeta && s.afeta.length ? `<div class="card compacto"><div class="rotulo">Categorias afetadas</div>
        <div class="pill-linha">${s.afeta.map((a) => { const c = Motor.categoria(a); return c ? `<span class="chip tag"><span class="cat-nome">${miniaturaCategoria(c.id, 16)}${c.nome}</span></span>` : ''; }).join('')}</div></div>` : ''}

      <div class="alerta info"><span class="ic">${icone("documentacao",16)}</span><span>${escapar(s.observacoes)}</span></div>
      <div class="aviso-legal">Percentuais são estimativas de planejamento sobre a categoria indicada, não garantias de preço.</div>
      <div class="pulo"></div>`
    );
  },

  abrirMissao(id) {
    const m = MISSOES.find((x) => x.id === id);
    if (!m) return;
    const st = Store.estado.missoes[id] || {};
    const eco = Motor.economiaMissao(m);
    const feita = st.status === 'concluida';

    abrirGaveta(
      m.titulo,
      `${m.tempo} · ${m.dificuldade === 'baixa' ? 'fácil' : m.dificuldade === 'media' ? 'dificuldade média' : 'exige conversa'}`,
      `
      ${eco ? `<div class="card card-destaque" style="text-align:center">
        <div class="rotulo">Economia potencial estimada</div>
        <div class="numero-medio">${formatarMoeda(eco.min)} – ${formatarMoeda(eco.max)}</div>
        <p class="card-sub" style="margin:4px 0 0">Potencial, ainda não confirmada.</p>
      </div>` : ''}

      <div class="card compacto"><div class="rotulo">Objetivo</div><p style="margin:6px 0 0;font-size:14px">${escapar(m.objetivo)}</p></div>
      <div class="card compacto"><div class="rotulo">Por que isso importa</div><p style="margin:6px 0 0;font-size:14px">${escapar(m.motivo)}</p></div>

      <div class="card compacto">
        <div class="rotulo">Como fazer</div>
        <ol class="passos">${m.passos.map((p) => `<li>${escapar(p)}</li>`).join('')}</ol>
      </div>

      ${m.estrategias && m.estrategias.length ? `<div class="secao">
        <div class="secao-titulo" style="font-size:16px">Estratégias relacionadas</div>
        ${m.estrategias.map((sid) => { const s = ESTRATEGIAS.find((x) => x.id === sid); return s ? `<div class="card compacto" style="cursor:pointer" onclick="Telas.abrirEstrategia('${s.id}')">
          <div class="card-titulo" style="font-size:15px"><span class="nivel-ponto ${s.nivel}"></span> ${escapar(s.titulo)}</div></div>` : ''; }).join('')}
      </div>` : ''}

      ${feita
        ? `<div class="alerta ok"><span class="ic">${icone("ok",16)}</span><span>Missão concluída${st.economiaConfirmada ? ` — você registrou ${formatarMoeda(st.economiaConfirmada)} de economia.` : '.'}</span></div>
           <button class="btn btn-contorno btn-bloco" onclick="Acoes.reabrirMissao('${id}')">Reabrir missão</button>`
        : `<div class="card">
            <div class="card-titulo">Concluir missão</div>
            <p class="card-sub">Se essa missão gerou economia real, registre o valor. Se não gerou, deixe em branco — eu não invento economia.</p>
            <div class="campo" style="margin-top:10px">
              <label>Economia real confirmada (opcional)</label>
              <input type="number" id="missao-economia" placeholder="0">
            </div>
            <button class="btn btn-primario btn-bloco" onclick="Acoes.concluirMissao('${id}')">Marcar como concluída</button>
          </div>`}
      <div class="pulo"></div>`
    );
  },

  abrirNovoGasto(catPre) {
    const cats = CATEGORIAS.filter((c) => Store.estado.categoriasAtivas[c.id] !== false);
    abrirGaveta(
      'Registrar gasto',
      'Eu analiso antes de entrar no plano',
      `
      <div class="campo"><label>Categoria</label>
        <select id="g-categoria" onchange="Telas.previewDetector()">${selectOpcoes(cats, catPre || 'local')}</select></div>
      <div class="campo"><label>Descrição</label><input type="text" id="g-descricao" placeholder="Ex.: Buffet Casa da Serra"></div>
      <div class="campo"><label>Valor total</label><input type="number" id="g-valor" placeholder="0" oninput="Telas.previewDetector()"></div>
      <div class="grade-2">
        <div class="campo"><label>Já pago</label><input type="number" id="g-pago" placeholder="0"></div>
        <div class="campo"><label>Parcelas</label><input type="number" id="g-parcelas" value="1" min="1"></div>
      </div>
      <div class="campo"><label>Próximo vencimento</label><input type="date" id="g-vencimento"></div>
      <div class="campo"><label>Observações</label><textarea id="g-obs" placeholder="O que está incluso? O que não está?"></textarea></div>

      <div id="detector-preview"></div>

      <button class="btn btn-primario btn-bloco" onclick="Acoes.salvarGasto()">Salvar gasto</button>
      <div class="pulo"></div>`
    );
  },

  previewDetector() {
    const cat = $('#g-categoria').value;
    const valor = Number($('#g-valor').value) || 0;
    const alvo = $('#detector-preview');
    if (!valor) {
      alvo.innerHTML = '';
      return;
    }
    const d = Motor.detectarPrejuizo(cat, valor);
    alvo.innerHTML = `
      <div class="card card-destaque">
        <div class="card-titulo"><span class="titulo-ic">${icone("lupa",17)}</span>Detector de prejuízo</div>
        ${d.sinais.map((s) => `<div class="alerta ${s.nivel === 'alto' ? 'alto' : s.nivel === 'medio' ? 'medio' : 'ok'}" style="margin-top:8px"><span class="ic">${icone(s.nivel === "alto" ? "alerta" : s.nivel === "medio" ? "sino" : "ok",16)}</span><span>${escapar(s.texto)}</span></div>`).join('')}
        ${d.checklist.length ? `<div style="margin-top:10px"><div class="rotulo">Antes de fechar, confirme por escrito</div>
          ${d.checklist.map((c) => `<div style="font-size:13px;padding:4px 0">${escapar(c)}</div>`).join('')}</div>` : ''}
        ${d.alternativas.length ? `<div style="margin-top:10px"><div class="rotulo">Alternativas</div>
          ${d.alternativas.map((a) => `<div style="font-size:13px;padding:4px 0;cursor:pointer" onclick="Telas.abrirEstrategia('${a.id}')"><span class="nivel-ponto ${a.nivel}"></span> ${escapar(a.titulo)} ›</div>`).join('')}</div>` : ''}
      </div>`;
  },

  abrirAnalise() {
    const achados = Motor.analisarOrcamento();
    abrirGaveta(
      'Análise do seu orçamento',
      'O que eu vejo nos seus números',
      achados.map((a) => `
        <div class="card compacto">
          <div class="card-titulo" style="font-size:15px"><span class="titulo-ic">${icone(a.nivel === "alto" ? "alerta" : a.nivel === "medio" ? "sino" : "ok",16)}</span>${escapar(a.titulo)}</div>
          <p class="card-sub" style="margin-top:4px">${escapar(a.texto)}</p>
          ${a.categoria ? `<button class="btn btn-secundario btn-mini" style="margin-top:8px" onclick="Telas.abrirCategoria('${a.categoria}')">Abrir categoria</button>` : ''}
        </div>`).join('') + `<div class="aviso-legal">${AVISO_ESTIMATIVA}</div><div class="pulo"></div>`
    );
  },

  abrirNovoFornecedor() {
    const cats = CATEGORIAS.filter((c) => Store.estado.categoriasAtivas[c.id] !== false);
    abrirGaveta(
      'Cadastrar fornecedor',
      'Preço é só uma das colunas',
      `
      <div class="campo"><label>Categoria</label><select id="f-categoria">${selectOpcoes(cats, 'alimentacao')}</select></div>
      <div class="campo"><label>Nome</label><input type="text" id="f-nome" placeholder="Nome do fornecedor"></div>
      <div class="grade-2">
        <div class="campo"><label>Preço proposto</label><input type="number" id="f-preco" placeholder="0"></div>
        <div class="campo"><label>Cidade</label><input type="text" id="f-localizacao" placeholder="Cidade"></div>
      </div>
      <div class="campo"><label>Contato</label><input type="text" id="f-contato" placeholder="Telefone, e-mail ou @"></div>
      <div class="campo"><label>O que ESTÁ incluso</label><textarea id="f-incluso" placeholder="Um item por linha"></textarea></div>
      <div class="campo"><label>O que NÃO está incluso</label><textarea id="f-naoIncluso" placeholder="Taxa de serviço, hora extra, deslocamento..."></textarea></div>
      <div class="grade-2">
        <div class="campo"><label>Custos extras previstos</label><input type="number" id="f-extras" placeholder="0"></div>
        <div class="campo"><label>Parcelas</label><input type="number" id="f-parcelas" value="1" min="1"></div>
      </div>
      <div class="campo"><label>Condições de pagamento</label><input type="text" id="f-pagamento" placeholder="Ex.: 30% de entrada, saldo 30 dias antes"></div>
      <div class="campo"><label>Sua avaliação pessoal</label>
        <select id="f-avaliacao"><option value="0">Ainda não avaliei</option><option value="5">5 — excelente</option><option value="4">4 — muito bom</option><option value="3">3 — bom</option><option value="2">2 — regular</option><option value="1">1 — fraco</option></select></div>
      <div class="campo"><label>Observações</label><textarea id="f-obs"></textarea></div>
      <label class="toggle"><span class="txt">Já contratei este fornecedor<small>Se marcar, o valor entra no orçamento como contratado</small></span>
        <span class="switch"><input type="checkbox" id="f-contratado"><span class="trilho"></span></span></label>
      <div class="pulo"></div>
      <button class="btn btn-primario btn-bloco" onclick="Acoes.salvarFornecedor()">Salvar fornecedor</button>
      <div class="pulo"></div>`
    );
  },

  abrirFornecedor(id) {
    const f = Store.estado.fornecedores.find((x) => x.id === id);
    if (!f) return;
    const cat = Motor.categoria(f.categoria);
    const total = Number(f.preco) + Number(f.extras || 0);
    abrirGaveta(
      f.nome,
      cat ? cat.nome : '',
      `
      <div class="card card-destaque">
        <div class="rotulo">Custo total considerando extras</div>
        <div class="numero-grande">${formatarMoeda(total)}</div>
        <p class="card-sub">Preço proposto ${formatarMoeda(f.preco)}${f.extras ? ` + extras previstos ${formatarMoeda(f.extras)}` : ''}</p>
      </div>
      ${f.contato ? `<div class="card compacto"><div class="rotulo">Contato</div><p style="margin:6px 0 0">${escapar(f.contato)}</p></div>` : ''}
      ${f.incluso ? `<div class="card compacto"><div class="rotulo">Está incluso</div><p style="margin:6px 0 0;font-size:13.5px;white-space:pre-line">${escapar(f.incluso)}</p></div>` : ''}
      ${f.naoIncluso ? `<div class="card compacto"><div class="rotulo">Não está incluso</div><p style="margin:6px 0 0;font-size:13.5px;white-space:pre-line">${escapar(f.naoIncluso)}</p></div>` : ''}
      ${f.pagamento ? `<div class="card compacto"><div class="rotulo">Condições</div><p style="margin:6px 0 0;font-size:13.5px">${escapar(f.pagamento)}${f.parcelas > 1 ? ` · ${f.parcelas}x de ${formatarMoeda(f.preco / f.parcelas)}` : ''}</p></div>` : ''}
      ${f.obs ? `<div class="card compacto"><div class="rotulo">Observações</div><p style="margin:6px 0 0;font-size:13.5px">${escapar(f.obs)}</p></div>` : ''}
      <div class="btn-linha" style="margin-top:14px">
        <button class="btn btn-contorno" onclick="Acoes.removerFornecedor('${f.id}')">Excluir</button>
        <button class="btn btn-primario" onclick="fecharGaveta();Telas.abrirNovoGasto('${f.categoria}')">Registrar como gasto</button>
      </div>
      <div class="pulo"></div>`
    );
  },

  abrirComparador(catId) {
    const lista = Store.estado.fornecedores.filter((f) => f.categoria === catId);
    const cat = Motor.categoria(catId);
    const menor = Math.min(...lista.map((f) => Number(f.preco) + Number(f.extras || 0)));

    abrirGaveta(
      `Comparar ${cat ? cat.nome.toLowerCase() : ''}`,
      'Preço + inclusos + extras + condições',
      `
      <div class="rolagem">
        <table class="tabela">
          <thead><tr><th>Critério</th>${lista.map((f) => `<th>${escapar(f.nome)}</th>`).join('')}</tr></thead>
          <tbody>
            <tr><td>Preço proposto</td>${lista.map((f) => `<td>${formatarMoeda(f.preco)}</td>`).join('')}</tr>
            <tr><td>Extras previstos</td>${lista.map((f) => `<td>${formatarMoeda(f.extras || 0)}</td>`).join('')}</tr>
            <tr><td><strong>Custo total</strong></td>${lista.map((f) => { const t = Number(f.preco) + Number(f.extras || 0); return `<td><strong style="color:${t === menor ? 'var(--verde)' : 'inherit'}">${formatarMoeda(t)}</strong></td>`; }).join('')}</tr>
            <tr><td>Parcelas</td>${lista.map((f) => `<td>${f.parcelas || 1}x</td>`).join('')}</tr>
            <tr><td>Condições</td>${lista.map((f) => `<td>${escapar(f.pagamento || '—')}</td>`).join('')}</tr>
            <tr><td>Incluso</td>${lista.map((f) => `<td style="white-space:pre-line">${escapar(f.incluso || '—')}</td>`).join('')}</tr>
            <tr><td>Não incluso</td>${lista.map((f) => `<td style="white-space:pre-line">${escapar(f.naoIncluso || '—')}</td>`).join('')}</tr>
            <tr><td>Sua nota</td>${lista.map((f) => `<td>${f.avaliacao ? estrelas(f.avaliacao) : '—'}</td>`).join('')}</tr>
          </tbody>
        </table>
      </div>
      <div class="alerta info" style="margin-top:14px">
        <span class="ic">${icone("balanca",16)}</span>
        <span>O menor preço quase nunca é o menor custo. Olhe a linha <strong>custo total</strong> e leia <strong>não incluso</strong> antes de decidir.</span>
      </div>
      ${lista.length < 3 ? `<div class="alerta medio"><span class="ic">${icone("sino",16)}</span><span>Com ${lista.length} propostas você ainda tem pouca base de comparação. Três é o número que costuma abrir margem de negociação real.</span></div>` : ''}
      <div class="pulo"></div>`
    );
  },

  abrirNovoDocumento() {
    abrirGaveta(
      'Registrar documento',
      'Contrato, proposta, recibo ou comprovante',
      `
      <div class="campo"><label>Tipo</label>
        <select id="d-tipo">
          <option>Contrato</option><option>Proposta</option><option>Recibo</option>
          <option>Comprovante</option><option>Orçamento</option><option>Documento</option>
        </select></div>
      <div class="campo"><label>Título</label><input type="text" id="d-titulo" placeholder="Ex.: Contrato do buffet"></div>
      <div class="grade-2">
        <div class="campo"><label>Valor</label><input type="number" id="d-valor" placeholder="0"></div>
        <div class="campo"><label>Vencimento</label><input type="date" id="d-vencimento"></div>
      </div>
      <div class="campo"><label>Pontos que merecem atenção</label>
        <p class="ajuda">Um por linha. Ex.: multa de cancelamento, hora extra, prazo de entrega, o que não está incluso.</p>
        <textarea id="d-pontos" style="min-height:110px" placeholder="Multa de 30% em caso de cancelamento&#10;Hora extra: valor por hora&#10;Prazo de entrega das fotos"></textarea></div>
      <div class="alerta medio"><span class="ic">${icone("balanca",16)}</span><span>Organizar não é analisar juridicamente. <strong>Isso não substitui a avaliação de um profissional do direito.</strong></span></div>
      <button class="btn btn-primario btn-bloco" onclick="Acoes.salvarDocumento()">Salvar</button>
      <div class="pulo"></div>`
    );
  },
};
