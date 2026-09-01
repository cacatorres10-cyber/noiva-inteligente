/*
 * NOIVA INTELIGENTE — Assistente contextual
 *
 * Este assistente roda 100% no dispositivo, a partir do estado real da usuária.
 * Ele NÃO inventa preços, fornecedores, leis, disponibilidade nem descontos.
 * Quando não tem dados suficientes, ele diz isso e faz uma pergunta objetiva.
 *
 * Antes de responder, ele sempre percorre a mesma sequência:
 *   1. Qual é o orçamento?      2. Qual é a prioridade?
 *   3. Qual é o impacto?        4. Existe alternativa?
 *   5. O casal aceita?          6. Quais categorias são afetadas?
 */

const Assistente = {
  contexto() {
    const p = Motor.perfil();
    const r = Motor.resumo();
    const meta = Motor.metaMensal();
    return { perfil: p, resumo: r, meta, dist: Motor.distribuir() };
  },

  /*
   * Contexto da camada de consultoria. É mais enxuto que o de cima e usa
   * nomes curtos porque cada tópico o recebe como argumento único.
   *
   * custoConvidado é o número que mais muda conversa no app inteiro: soma o
   * planejado de todas as categorias que escalam com gente e divide pelo
   * número de convidados. É o que transforma "corta a lista" — que é um
   * conselho vazio — em "cada nome custa tanto, decida sabendo".
   */
  contextoConsultoria() {
    const p = Motor.perfil();
    const r = Motor.resumo();
    const dist = Motor.distribuir();

    let custoConvidado = null;
    if (p.convidados > 0) {
      const soma = CATEGORIAS.filter((c) => c.dependeConvidados).reduce(
        (acc, c) => acc + ((dist[c.id] && dist[c.id].planejado) || 0),
        0
      );
      if (soma > 0) custoConvidado = soma / p.convidados;
    }

    return { p, r, dist, custoConvidado, meses: Motor.mesesRestantes() };
  },

  faltaContexto() {
    const p = Motor.perfil();
    const faltas = [];
    if (!p.orcamentoTotal) faltas.push('seu orçamento total');
    if (!p.convidados) faltas.push('o número aproximado de convidados');
    if (!p.dataCasamento && !p.mesesEstimados) faltas.push('quando você pretende casar');
    return faltas;
  },

  /* ------------------------------------------------------------ intents */

  responder(pergunta) {
    const q = (pergunta || '').toLowerCase().trim();
    if (!q) return this.bloco('Pode escrever sua pergunta — eu respondo com base no seu plano.');

    /*
     * A camada de consultoria vem antes da checagem de contexto de propósito.
     * "Como eu corto a lista sem magoar ninguém?" e "o que olhar no contrato?"
     * não dependem de número nenhum — e barrar essas perguntas por falta de
     * orçamento preenchido era mandar embora justamente quem ainda não tinha
     * terminado de configurar o app.
     *
     * Ela vem depois dos intents financeiros, porém, porque quem pergunta
     * "quanto eu guardo por mês" quer a conta dela, não um texto sobre prazos.
     */
    const achado = consultoriaMatch(q);
    const faltas = this.faltaContexto();
    if (faltas.length && !/orçamento total|quanto posso/.test(q)) {
      if (achado) return this.responderConsultoria(achado.topico);
      return this.bloco(
        `Ainda me falta ${faltas.join(', ')}. Sem isso qualquer resposta minha seria chute, e eu prefiro não chutar.`,
        [{ tipo: 'acao', texto: 'Completar meus dados', tela: 'perfil' }]
      );
    }

    const intents = [
      { re: /(o que você acha|analis|avalia|diagn).*(orçamento|plano)|meu orçamento/, fn: () => this.analiseOrcamento() },
      { re: /(onde|como|posso).*(economiz|cortar|reduzir custo|gastar menos)|economia/, fn: () => this.ondeEconomizar() },
      { re: /(quanto).*(guardar|poupar|juntar|mês|mes)/, fn: () => this.metaMensal() },
      { re: /(convidad)/, fn: () => this.impactoConvidados(q) },
      { re: /(vale a pena|devo (contratar|fechar)|posso (contratar|fechar|gastar))/, fn: () => this.avaliarGasto(q) },
      { re: /(o que faço agora|próxim|proxim|primeiro passo|por onde começ)/, fn: () => this.proximosPassos() },
      { re: /(prioridade)/, fn: () => this.sobrePrioridades() },
      { re: /(prazo|vencimento|pagamento|parcela)/, fn: () => this.sobrePagamentos() },
      { re: /(7 ?mil|sete mil|7000|7\.000)/, fn: () => this.sobreModo7mil() },
      { re: /(fornecedor|orçamentos|cotaç|comparar)/, fn: () => this.sobreFornecedores() },
      { re: /(data|dia da semana|sábado|sabado|domingo|horário|horario|manhã|manha|noite)/, fn: () => this.sobreData() },
      { re: /(cabe|dá para|da para|consigo|é possível|e possivel|viável|viavel)/, fn: () => this.viabilidade() },
      { re: /(vestido|foto|buffet|comida|bebida|decoraç|decorac|flores|música|musica|bolo|local|convite|lembrancinha)/, fn: () => this.sobreCategoria(q) },
    ];

    /* frase específica de consultoria ganha dos intents de palavra única */
    if (achado && achado.ponto >= CONSULTORIA_FRASE) return this.responderConsultoria(achado.topico);

    for (const it of intents) {
      if (it.re.test(q)) return it.fn();
    }

    if (achado) return this.responderConsultoria(achado.topico);

    return this.fallback(q);
  },

  /* Monta a resposta de um tópico de consultoria com os números dela. */
  responderConsultoria(topico) {
    const acoes = (topico.acoes || []).map((a) =>
      a.tela ? { tipo: 'acao', texto: a.texto, tela: a.tela } : { tipo: 'pergunta', texto: a.texto, pergunta: a.pergunta }
    );
    return this.bloco(topico.resposta(this.contextoConsultoria()), acoes);
  },

  /* --------------------------------------------------------- respostas */

  analiseOrcamento() {
    const achados = Motor.analisarOrcamento();
    const r = Motor.resumo();
    const linhas = [
      `Seu orçamento é ${formatarMoeda(r.total)}. Hoje você tem ${formatarMoeda(r.contratado)} contratados e ${formatarMoeda(r.pago)} já pagos.`,
      `Sua margem de segurança está em ${r.margemPct}% (${formatarMoeda(r.reserva)}), então o valor realmente distribuível é ${formatarMoeda(r.distribuivel)}.`,
    ];
    achados.forEach((a) => {
      const marcador = a.nivel === 'alto' ? '!' : a.nivel === 'medio' ? '•' : '✓';
      linhas.push(`${marcador} **${a.titulo}** — ${a.texto}`);
    });
    return this.bloco(linhas.join('\n\n'), [
      { tipo: 'acao', texto: 'Ver orçamento por categoria', tela: 'orcamento' },
      { tipo: 'acao', texto: 'Ajustar prioridades', tela: 'prioridades' },
    ]);
  },

  ondeEconomizar() {
    const dist = Motor.distribuir();
    const r = Motor.resumo();
    const estrategias = Motor.estrategiasRecomendadas(4);

    /*
     * As três inegociáveis saem da lista de candidatas, e não apenas ficam
     * mal colocadas nela. Ordenar por "muito dinheiro e pouca prioridade"
     * já as empurrava para o fim, mas "quase nunca aparece" não é a mesma
     * promessa que "eu não encosto" — e é a segunda que a abertura faz.
     */
    const protegidas = Motor.inegociaveis();
    const candidatas = Object.entries(dist)
      .map(([id, d]) => ({ id, ...d, nome: Motor.categoria(id).nome }))
      .filter((d) => d.contratado === 0 && d.planejado > 0 && !protegidas.includes(d.id))
      .sort((a, b) => {
        /* o que ela marcou como simplificável vem primeiro: é onde ela já
           disse que pode mexer, e procurar em outro lugar antes seria
           ignorar uma resposta que ela deu */
        const peso = (x) => (Motor.ehSimplificavel(x.id) ? 2.5 : 1);
        return (b.planejado * peso(b)) / Math.max(1, b.prioridade) - (a.planejado * peso(a)) / Math.max(1, a.prioridade);
      })
      .slice(0, 3);

    const nomesProtegidos = protegidas.map((id) => Motor.categoria(id).nome);
    const linhas = [
      nomesProtegidos.length
        ? `Antes de tudo: **${nomesProtegidos.join(', ')}** ${nomesProtegidos.length === 1 ? 'está fora' : 'estão fora'} desta busca. ${nomesProtegidos.length === 1 ? 'É a sua inegociável' : 'São as suas inegociáveis'}, e eu só volto aqui se não sobrar alternativa em lugar nenhum.`
        : 'Eu procuro economia primeiro onde tem muito dinheiro e pouca prioridade.',
      '**Onde eu olharia primeiro:**',
    ];
    candidatas.forEach((c) => {
      const marca = Motor.ehSimplificavel(c.id) ? ' _Você marcou como simplificável._' : '';
      linhas.push(
        `• ${c.nome} — ${formatarMoeda(c.planejado)} (${((c.planejado / Math.max(1, r.total)) * 100).toFixed(0)}% do orçamento) com prioridade ${c.prioridade}/10.${marca}`
      );
    });
    if (!candidatas.length) {
      linhas.push('Todas as categorias abertas do seu plano são inegociáveis ou já estão contratadas. Aqui não há corte indolor — o caminho é mexer no formato: convidados, período ou dia da semana.');
    }
    linhas.push('**Estratégias que se aplicam ao seu caso:**');
    estrategias.forEach((s) => {
      const n = NIVEIS_ECONOMIA[s.nivel];
      linhas.push(`**${s.titulo}** — economia estimada de ${s.economia.min}% a ${s.economia.max}% sobre ${s.economia.base}. ${s.impacto}`);
    });
    linhas.push('_Percentuais são estimativas de planejamento, não garantias de preço._');

    return this.bloco(linhas.join('\n\n'), [
      { tipo: 'acao', texto: 'Abrir a biblioteca de estratégias', tela: 'estrategias' },
      { tipo: 'acao', texto: 'Ver missões de economia', tela: 'missoes' },
    ]);
  },

  metaMensal() {
    const m = Motor.metaMensal();
    const p = Motor.perfil();
    if (m.meses <= 0) {
      return this.bloco('Pelo que você registrou, a data já chegou ou não há meses restantes para poupar. Quer revisar a data no seu perfil?', [
        { tipo: 'acao', texto: 'Revisar dados', tela: 'perfil' },
      ]);
    }
    const linhas = [
      `Faltam **${m.meses} meses**. Você tem ${formatarMoeda(p.disponivelHoje)} e precisa chegar em ${formatarMoeda(p.orcamentoTotal)}.`,
      `**Meta: ${formatarMoeda(m.meta)} por mês.** (fórmula: (orçamento − disponível) ÷ meses)`,
    ];
    if (m.viavel) {
      linhas.push(`Você informou que consegue guardar ${formatarMoeda(p.poupancaMensal)}/mês — a meta cabe. Na projeção, você chega na data com ${formatarMoeda(m.projetado)}.`);
    } else {
      linhas.push(
        `Você informou ${formatarMoeda(p.poupancaMensal)}/mês, então faltariam ${formatarMoeda(m.meta - p.poupancaMensal)} por mês. Na projeção atual você chegaria com ${formatarMoeda(m.projetado)} — ${formatarMoeda(Math.abs(m.diferenca))} ${m.diferenca < 0 ? 'a menos' : 'a mais'} que o orçamento.`
      );
      linhas.push(
        'Três saídas, da menos dolorosa para a mais: **adiar a data** (mais meses de poupança), **reduzir o formato** (convidados, período, dia da semana) ou **reduzir o orçamento** e replanejar as categorias. Eu não recomendaria fechar essa diferença com crédito.'
      );
    }
    return this.bloco(linhas.join('\n\n'), [{ tipo: 'acao', texto: 'Simular outro formato', tela: 'cenarios' }]);
  },

  impactoConvidados(q) {
    const p = Motor.perfil();
    const num = this.extrairNumero(q);
    const alvo = num && num < 1000 ? num : Math.max(10, Math.round(p.convidados * 0.75));
    const atual = Motor.simularCenario({ convidados: p.convidados });
    const novo = Motor.simularCenario({ convidados: alvo });
    const dif = atual.total - novo.total;

    const dep = DEPENDENCIAS.convidados;
    const nomes = dep.afeta.map((id) => Motor.categoria(id).nome).join(', ');

    return this.bloco(
      [
        `Hoje você está planejando para **${p.convidados} convidados**. Passando para **${alvo}**, a estimativa do seu formato sai de ${formatarMoeda(atual.total)} para ${formatarMoeda(novo.total)} — uma diferença estimada de **${formatarMoeda(Math.abs(dif))}**.`,
        `Convidados não mexem só na comida. No seu plano, mudar esse número afeta: ${nomes}.`,
        '_É uma estimativa baseada nas referências do app e no formato que você configurou. Orçamentos reais mandam mais que qualquer estimativa._',
      ].join('\n\n'),
      [
        { tipo: 'acao', texto: 'Comparar cenários lado a lado', tela: 'cenarios' },
        { tipo: 'acao', texto: 'Missão: revisar a lista', tela: 'missoes' },
      ]
    );
  },

  avaliarGasto(q) {
    const valor = this.extrairValor(q);
    const catId = this.detectarCategoria(q);
    if (!valor) {
      return this.bloco(
        'Me passa o valor e a categoria que eu analiso na hora. Exemplo: "vale a pena fechar buffet por 4200?" — eu comparo com seu orçamento, sua prioridade e o que costuma ficar de fora do contrato.'
      );
    }
    const cat = catId || 'outros';
    const d = Motor.detectarPrejuizo(cat, valor);
    const linhas = [`**Detector de prejuízo — ${d.categoria.nome}, ${formatarMoeda(valor)}**`];
    d.sinais.forEach((s) => linhas.push(`${s.nivel === 'alto' ? '!' : s.nivel === 'medio' ? '•' : '✓'} ${s.texto}`));
    if (d.checklist.length) {
      linhas.push('**Antes de assinar, confirme por escrito se está incluso:**');
      d.checklist.forEach((c) => linhas.push(`— ${c}`));
    }
    if (d.alternativas.length) {
      linhas.push('**Alternativas que preservam a função gastando menos:**');
      d.alternativas.forEach((a) => linhas.push(`${a.titulo} — ${a.solucao}`));
    }
    linhas.push('_Não tenho como dizer se esse preço é bom para a sua região. Posso comparar propostas se você cadastrar as opções em Fornecedores._');
    return this.bloco(linhas.join('\n\n'), [{ tipo: 'acao', texto: 'Cadastrar fornecedores e comparar', tela: 'fornecedores' }]);
  },

  proximosPassos() {
    const tarefas = Motor.proximasTarefas(5);
    const missoes = Motor.missoesRecomendadas(2);
    const meses = Motor.mesesRestantes();
    const linhas = [`Faltam **${meses} meses** para a data. Nesse estágio, isso é o que muda o jogo:`];
    /* "já dava para começar" no lugar de "atrasada": a tarefa entrou na fila,
       não passou do prazo. O motor deixou de marcar atraso e o assistente,
       que é a voz do produto, não podia ser o único lugar a cobrar. */
    tarefas.forEach((t, i) => linhas.push(`${i + 1}. ${t.titulo}${t.pendente ? ' _(já dava para começar)_' : ''}`));
    if (missoes.length) {
      linhas.push('**E as missões com maior retorno agora:**');
      missoes.forEach((m) => {
        const eco = Motor.economiaMissao(m);
        linhas.push(`• ${m.titulo}${eco ? ` — economia potencial estimada de ${formatarMoeda(eco.min)} a ${formatarMoeda(eco.max)}` : ''}`);
      });
    }
    return this.bloco(linhas.join('\n\n'), [
      { tipo: 'acao', texto: 'Abrir cronograma', tela: 'cronograma' },
      { tipo: 'acao', texto: 'Abrir missões', tela: 'missoes' },
    ]);
  },

  sobrePrioridades() {
    const dist = Motor.distribuir();
    const r = Motor.resumo();
    const ordenada = Object.entries(dist)
      .map(([id, d]) => ({ id, ...d, nome: Motor.categoria(id).nome }))
      .sort((a, b) => b.prioridade - a.prioridade);
    const altas = ordenada.filter((d) => d.prioridade >= 8).slice(0, 4);
    const baixas = ordenada.filter((d) => d.prioridade <= 4).slice(0, 4);

    const linhas = ['**Suas prioridades altas** (é onde eu evito cortar):'];
    altas.forEach((d) => linhas.push(`• ${d.nome} — ${d.prioridade}/10 · ${formatarMoeda(d.planejado)} (${((d.planejado / Math.max(1, r.total)) * 100).toFixed(0)}%)`));
    if (!altas.length) linhas.push('_Você ainda não marcou nenhuma categoria com prioridade 8 ou mais._');
    linhas.push('**Prioridades baixas** (é onde eu procuro folga primeiro):');
    baixas.forEach((d) => linhas.push(`• ${d.nome} — ${d.prioridade}/10 · ${formatarMoeda(d.planejado)}`));
    if (!baixas.length) linhas.push('_Nenhuma categoria com prioridade 4 ou menos. Se tudo é prioridade, nada é — vale reavaliar._');

    return this.bloco(linhas.join('\n\n'), [{ tipo: 'acao', texto: 'Ajustar prioridades', tela: 'prioridades' }]);
  },

  sobrePagamentos() {
    const venc = Motor.vencimentosProximos(60);
    const r = Motor.resumo();
    if (!venc.length) {
      return this.bloco(
        `Você não tem vencimentos cadastrados para os próximos 60 dias. Do total contratado (${formatarMoeda(r.contratado)}), já foram pagos ${formatarMoeda(r.pago)} e faltam ${formatarMoeda(r.aPagar)}.`,
        [{ tipo: 'acao', texto: 'Registrar um gasto', tela: 'orcamento' }]
      );
    }
    const linhas = [`**Próximos 60 dias** — ${venc.length} pagamento(s):`];
    venc.forEach((d) => linhas.push(`• ${formatarData(d.vencimento)} — ${d.descricao}: ${formatarMoeda(Number(d.valor) - Number(d.pago || 0))}`));
    const soma = venc.reduce((s, d) => s + Number(d.valor) - Number(d.pago || 0), 0);
    linhas.push(`Total do período: **${formatarMoeda(soma)}**. Você informou ${formatarMoeda(Motor.perfil().disponivelHoje)} disponíveis hoje e ${formatarMoeda(Motor.perfil().poupancaMensal)}/mês de capacidade.`);
    return this.bloco(linhas.join('\n\n'), [{ tipo: 'acao', texto: 'Ver orçamento', tela: 'orcamento' }]);
  },

  sobreModo7mil() {
    const ativo = Store.estado.config.modo7mil;
    const r = Motor.resumo();
    const est = Motor.estimativaTotal();
    const linhas = [
      ativo
        ? `O Modo R$7 mil está **ativo**. Você tem ${formatarMoeda(r.contratado)} contratados dentro da meta de R$7.000.`
        : 'O Modo R$7 mil define o orçamento em R$7.000, muda o padrão de execução para econômico e passa a priorizar alternativas de maior economia.',
      `Para o seu formato atual (${Motor.perfil().convidados} convidados, ${this.nomePeriodo()}, ${this.nomeDia()}), minha estimativa é ${formatarMoeda(est)}.`,
      est > 7000
        ? `Isso está **acima** de R$7.000. Os ajustes de maior efeito, na ordem: reduzir convidados, mudar para período diurno, trocar o dia da semana e rever local, música e vestido.`
        : 'Isso está dentro da meta considerando as estimativas do app.',
      '**Atenção: os custos variam conforme cidade, número de convidados, data, fornecedores e escolhas. O Modo R$7 mil é uma meta de planejamento, não uma garantia de preço.**',
    ];
    return this.bloco(linhas.join('\n\n'), [
      { tipo: 'acao', texto: ativo ? 'Ver o plano no modo' : 'Ativar o Modo R$7 mil', tela: 'modo7mil' },
      { tipo: 'acao', texto: 'Simular cenários', tela: 'cenarios' },
    ]);
  },

  sobreFornecedores() {
    const f = Store.estado.fornecedores;
    if (!f.length) {
      return this.bloco(
        'Você ainda não cadastrou fornecedores. A regra que mais economiza dinheiro no casamento inteiro é simples: **3 propostas escritas por categoria, com o mesmo briefing**. Sem isso não existe negociação, só aceitação.\n\nQuando cadastrar, eu comparo preço + o que está incluso + custos extras + condições — não só o preço.',
        [{ tipo: 'acao', texto: 'Cadastrar fornecedor', tela: 'fornecedores' }]
      );
    }
    const porCat = {};
    f.forEach((x) => {
      porCat[x.categoria] = (porCat[x.categoria] || 0) + 1;
    });
    const linhas = [`Você tem **${f.length} fornecedor(es)** cadastrado(s).`];
    Object.entries(porCat).forEach(([cat, n]) => {
      const nome = Motor.categoria(cat) ? Motor.categoria(cat).nome : cat;
      linhas.push(`• ${nome}: ${n} proposta(s)${n < 3 ? ' — faltam ' + (3 - n) + ' para ter comparação real' : ' ✓'}`);
    });
    return this.bloco(linhas.join('\n\n'), [{ tipo: 'acao', texto: 'Abrir comparador', tela: 'fornecedores' }]);
  },

  sobreData() {
    const p = Motor.perfil();
    const atual = Motor.simularCenario({});
    const alt = Motor.simularCenario({ diaSemana: 'domingo', periodo: 'tarde' });
    const dep = DEPENDENCIAS.data;
    return this.bloco(
      [
        `Hoje seu plano é **${this.nomeDia()}, ${this.nomePeriodo()}** — estimativa de ${formatarMoeda(atual.total)}.`,
        `Um cenário de **domingo à tarde** ficaria em cerca de ${formatarMoeda(alt.total)} — diferença estimada de ${formatarMoeda(atual.total - alt.total)}.`,
        `Mudar a data mexe em: ${dep.afeta.map((id) => Motor.categoria(id).nome).join(', ')}. ${dep.explicacao}`,
        p.dataDefinida ? '_Como sua data já está definida, tratei isso só como referência._' : '_Sua data ainda é flexível — dá para usar isso como argumento de negociação._',
        '_Estimativa de planejamento. Os fatores de desconto por dia e período variam muito por região e fornecedor._',
      ].join('\n\n'),
      [{ tipo: 'acao', texto: 'Comparar cenários', tela: 'cenarios' }]
    );
  },

  sobreCategoria(q) {
    const catId = this.detectarCategoria(q);
    if (!catId) return this.fallback(q);
    const cat = Motor.categoria(catId);
    const d = Motor.distribuir()[catId];
    const r = Motor.resumo();
    const estr = Motor.estrategiasPara(catId).slice(0, 3);

    const linhas = [
      `**${cat.nome}** — prioridade ${d.prioridade}/10`,
      `Planejado: ${formatarMoeda(d.planejado)} (${((d.planejado / Math.max(1, r.total)) * 100).toFixed(0)}% do orçamento) · Contratado: ${formatarMoeda(d.contratado)} · Estimativa para o seu formato: ${formatarMoeda(d.estimativa)}.`,
      cat.dica,
    ];
    if (cat.naoIncluiCostuma.length) {
      linhas.push('**O que costuma NÃO estar incluso:**');
      cat.naoIncluiCostuma.forEach((c) => linhas.push(`— ${c}`));
    }
    if (estr.length) {
      linhas.push('**Estratégias para essa categoria:**');
      estr.forEach((s) => linhas.push(`${s.titulo} — ${s.economia.min}% a ${s.economia.max}% sobre ${s.economia.base} (estimativa)`));
    }
    return this.bloco(linhas.join('\n\n'), [{ tipo: 'acao', texto: 'Ver estratégias', tela: 'estrategias' }]);
  },

  viabilidade() {
    const r = Motor.resumo();
    const est = Motor.estimativaTotal();
    const p = Motor.perfil();
    const dif = est - r.total;
    const linhas = [
      `Seu formato atual: **${p.convidados} convidados**, ${this.nomePeriodo()}, ${this.nomeDia()}, padrão ${this.nomePadrao()}.`,
      `Estimativa do app: **${formatarMoeda(est)}**. Seu orçamento: **${formatarMoeda(r.total)}**.`,
    ];
    if (dif <= 0) {
      linhas.push(`Cabe, com folga estimada de ${formatarMoeda(Math.abs(dif))}. Isso ainda não considera imprevistos — por isso a margem de segurança existe.`);
    } else {
      const semConvidados = Motor.simularCenario({ convidados: Math.round(p.convidados * 0.7) });
      const diurno = Motor.simularCenario({ periodo: 'tarde', diaSemana: 'domingo' });
      linhas.push(`Faltam cerca de **${formatarMoeda(dif)}** para o formato caber no orçamento. Os dois ajustes de maior efeito:`);
      linhas.push(`• Reduzir para ${Math.round(p.convidados * 0.7)} convidados → estimativa ${formatarMoeda(semConvidados.total)}`);
      linhas.push(`• Domingo à tarde → estimativa ${formatarMoeda(diurno.total)}`);
      linhas.push('Combinando os dois, a diferença costuma ser bem maior que a soma isolada de cada um.');
    }
    linhas.push('_Tudo aqui é estimativa de planejamento. Substitua por orçamentos reais assim que tiver os primeiros._');
    return this.bloco(linhas.join('\n\n'), [{ tipo: 'acao', texto: 'Simular no comparador', tela: 'cenarios' }]);
  },

  fallback(q) {
    const catId = this.detectarCategoria(q);
    if (catId) return this.sobreCategoria(q);
    /*
     * Beco sem saída era o pior desfecho possível: a pessoa perguntava, ouvia
     * "não sei" e saía da tela. Agora o não-sei vem acompanhado do mapa do que
     * ele sabe — e os assuntos vêm da própria lista de tópicos, então incluir
     * um tópico novo já o coloca aqui sem ninguém lembrar de atualizar nada.
     */
    const assuntos = CONSULTORIA.map((t) => t.titulo.toLowerCase());
    return this.bloco(
      [
        'Essa eu não sei responder com segurança, e prefiro dizer isso a chutar.',
        '**Sobre o seu dinheiro** eu respondo bem: analiso o orçamento, digo onde economizar sem mexer nas suas prioridades, calculo quanto guardar por mês, avalio um gasto antes de você fechar e comparo cenários.',
        `**Sobre organizar o casamento** eu falo de ${assuntos.slice(0, 6).join(', ')} e mais alguns.`,
        'O que eu não tenho é preço de fornecedor da sua região — isso ninguém consegue saber sem cotar. Mas me passe os valores que você recebeu e eu comparo com você.',
      ].join('\n\n'),
      [
        { tipo: 'acao', texto: 'Analisar meu orçamento', pergunta: 'o que você acha do meu orçamento?' },
        { tipo: 'acao', texto: 'Cortar a lista de convidados', pergunta: 'como cortar a lista de convidados?' },
        { tipo: 'acao', texto: 'O que eu faço agora?', pergunta: 'o que eu faço agora?' },
      ]
    );
  },

  /* ------------------------------------------------------------ apoio */

  bloco(texto, acoes) {
    return { texto, acoes: acoes || [] };
  },

  extrairValor(q) {
    const m = q.replace(/\./g, '').match(/(?:r?\$\s*)?(\d{2,7})(?:,(\d{2}))?/);
    if (!m) return null;
    const v = Number(m[1]) + (m[2] ? Number(m[2]) / 100 : 0);
    return v >= 50 ? v : null;
  },

  extrairNumero(q) {
    const m = q.match(/\b(\d{1,4})\b/);
    return m ? Number(m[1]) : null;
  },

  detectarCategoria(q) {
    const mapa = {
      local: ['local', 'espaço', 'espaco', 'salão', 'salao', 'chácara', 'chacara', 'sítio', 'sitio'],
      alimentacao: ['comida', 'buffet', 'bufê', 'bufe', 'catering', 'jantar', 'almoço', 'almoco', 'cardápio', 'cardapio', 'alimentação', 'alimentacao'],
      bebidas: ['bebida', 'drink', 'bar', 'álcool', 'alcool', 'open bar'],
      bolo: ['bolo'],
      doces: ['doce', 'sobremesa', 'brigadeiro'],
      decoracao: ['decoração', 'decoracao', 'decor'],
      flores: ['flor', 'flores', 'buquê', 'buque', 'arranjo'],
      vestido: ['vestido', 'noiva veste'],
      traje: ['terno', 'traje', 'noivo'],
      beleza: ['maquiagem', 'cabelo', 'beleza', 'penteado'],
      fotografia: ['foto', 'fotografia', 'fotógrafo', 'fotografo'],
      filmagem: ['vídeo', 'video', 'filmagem', 'filme'],
      musica: ['música', 'musica', 'dj', 'banda', 'som', 'playlist'],
      convites: ['convite'],
      lembrancinhas: ['lembrancinha', 'lembrança', 'lembranca'],
      transporte: ['transporte', 'carro', 'motorista'],
      aliancas: ['aliança', 'alianca'],
      cerimonia: ['cerimônia', 'cerimonia', 'celebrante'],
      documentacao: ['documento', 'cartório', 'cartorio'],
    };
    for (const [id, termos] of Object.entries(mapa)) {
      if (termos.some((t) => q.includes(t))) return id;
    }
    return null;
  },

  nomePeriodo() {
    const p = PERIODOS.find((x) => x.id === Motor.perfil().periodo);
    return p ? p.nome.toLowerCase() : '';
  },
  nomeDia() {
    const d = DIAS_SEMANA.find((x) => x.id === Motor.perfil().diaSemana);
    return d ? d.nome.toLowerCase() : '';
  },
  nomePadrao() {
    const p = PADRAO_EXECUCAO.find((x) => x.id === Motor.perfil().padrao);
    return p ? p.nome.toLowerCase() : '';
  },

  /*
   * Sugestões acima do campo de escrever.
   * São quatro, não seis: seis empurravam o campo para fora da tela, e a
   * quinta e a sexta nunca eram lidas de qualquer jeito. A ordem é
   * deliberada — as perguntas que dependem da situação real dela vêm
   * primeiro, e as genéricas só completam a lista se sobrar espaço.
   */
  sugestoes() {
    const r = Motor.resumo();
    const p = Motor.perfil();
    const meses = Motor.mesesRestantes();

    /* Uma de dinheiro e uma de organização sempre convivem na lista: quem
       chega aqui não sabe que o assistente faz as duas coisas, e sugestão
       só de orçamento faz parecer que ele é uma calculadora. */
    const dinheiro = ['O que eu faço agora?'];
    if (r.estimativaBottomUp > r.total) dinheiro.push('Meu casamento cabe no orçamento?');
    if (p.convidados > 60) dinheiro.push('E se eu reduzir os convidados?');
    dinheiro.push('Onde eu posso economizar?', 'Quanto preciso guardar por mês?');

    const organizar = [];
    if (p.convidados > 60) organizar.push('Como cortar a lista de convidados?');
    if (!Store.estado.fornecedores.length) organizar.push('O que eu devo perguntar a um fornecedor?');
    if (Store.estado.fornecedores.length) organizar.push('O que eu devo olhar no contrato?');
    if (meses !== null && meses <= 3) organizar.push('Como fazer o roteiro do dia?');
    organizar.push('Como lidar com a família sobre a lista?', 'Estou ansiosa, e agora?');

    /*
     * Fora o que ela já perguntou. Sugerir "Como cortar a lista?" logo abaixo
     * da resposta sobre cortar a lista faz o assistente parecer que não
     * escutou — e as respostas já trazem os próprios encaminhamentos, então
     * a lista fixa aqui só precisa cobrir o que ainda não foi conversado.
     */
    const jaPerguntou = new Set(
      (Store.estado._chat || [])
        .filter((m) => m.quem === 'eu')
        .map((m) => {
          const x = consultoriaMatch(m.texto);
          return x ? x.topico.id : null;
        })
        .filter(Boolean)
    );
    const inedita = (s) => {
      const x = consultoriaMatch(s);
      return !x || !jaPerguntou.has(x.topico.id);
    };

    return [dinheiro[0], organizar[0], dinheiro[1], organizar[1], dinheiro[2], organizar[2]]
      .filter(Boolean)
      .filter(inedita)
      .slice(0, 3);
  },
};
