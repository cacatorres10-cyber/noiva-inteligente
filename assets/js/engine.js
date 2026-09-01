/*
 * NOIVA INTELIGENTE — Motor de cálculo
 *
 * TODAS as fórmulas usadas no produto estão documentadas neste arquivo.
 * Nenhum valor calculado aqui é apresentado como preço garantido:
 * a camada de interface sempre rotula os resultados como ESTIMATIVA.
 */

const Motor = {
  /* ------------------------------------------------------------------ base */

  perfil() {
    return Store.estado.perfil;
  },

  /*
   * As três inegociáveis e as simplificáveis, pelo nome.
   *
   * O onboarding já traduzia as duas listas em nota — 10 e 9 para as três,
   * 3 para as simplificáveis — e depois disso ninguém mais olhava para elas.
   * O motor só via números, com duas consequências:
   *
   *   1. a proteção era por procuração. "Nota >= 9" pega as três, mas pega
   *      junto qualquer categoria que ela tenha subido depois no slider — e
   *      deixa de pegar uma das três se ela mexer para baixo sem querer;
   *   2. o app não conseguia NOMEAR o que estava protegendo. Dizer "essa é
   *      uma das suas três" é uma frase completamente diferente de dizer
   *      "essa é prioridade 9/10", e é a frase que a abertura promete.
   *
   * Lendo a lista original, a proteção passa a ser exata e dizível.
   */
  inegociaveis() {
    return (this.perfil().prioridadesTop || []).filter(Boolean);
  },

  ehInegociavel(catId) {
    return this.inegociaveis().includes(catId);
  },

  simplificaveis() {
    return (this.perfil().simplificaveis || []).filter(Boolean);
  },

  ehSimplificavel(catId) {
    return this.simplificaveis().includes(catId);
  },

  /*
   * Custo de um convidado: soma o planejado de todas as categorias que
   * escalam com gente e divide pelo número de convidados do plano.
   *
   * É a conta que transforma "corta a lista" — conselho vazio — em "cada
   * nome custa tanto, decida sabendo". Usa o planejado e não a estimativa
   * porque o planejado é o dinheiro que ela de fato reservou.
   */
  custoPorConvidado() {
    const p = this.perfil();
    if (!p.convidados || p.convidados <= 0) return 0;
    const dist = this.distribuir();
    const soma = CATEGORIAS.filter((c) => c.dependeConvidados).reduce(
      (acc, c) => acc + ((dist[c.id] && dist[c.id].planejado) || 0),
      0
    );
    return soma / p.convidados;
  },

  /*
   * Retrato da lista: quem confirmou, quem falta, quantos assentos a lista
   * realmente ocupa e como isso se compara ao número que alimenta o plano.
   *
   * "Assentos" não é o mesmo que "linhas da lista": um convidado com
   * acompanhante ocupa dois lugares e come duas vezes. Contar linhas seria
   * subestimar o custo em exatamente o erro que mais estoura orçamento.
   */
  resumoConvidados() {
    const lista = Store.estado.convidados || [];
    const assentos = (g) => 1 + (g.acompanhante ? 1 : 0);

    const conta = (filtro) => lista.filter(filtro).reduce((a, g) => a + assentos(g), 0);
    const confirmados = conta((g) => g.status === 'confirmado');
    const recusados = conta((g) => g.status === 'recusado');
    const pendentes = conta((g) => g.status !== 'confirmado' && g.status !== 'recusado');
    const total = confirmados + pendentes; /* quem recusou não ocupa lugar */

    const porCirculo = { 1: 0, 2: 0, 3: 0 };
    lista.forEach((g) => {
      if (g.status === 'recusado') return;
      porCirculo[g.circulo || 3] += assentos(g);
    });

    const criancas = conta((g) => g.crianca && g.status !== 'recusado');
    const custo = this.custoPorConvidado();
    const noPlano = this.perfil().convidados || 0;

    return {
      linhas: lista.length,
      total, confirmados, pendentes, recusados, criancas, porCirculo,
      custoPorConvidado: custo,
      custoTotal: total * custo,
      noPlano,
      diferenca: total - noPlano,
      /* margem de 2 assentos: divergência de um ou dois nomes é ruído de
         cadastro, não um descompasso que mereça alerta */
      divergente: noPlano > 0 && lista.length > 0 && Math.abs(total - noPlano) > 2,
    };
  },

  fatorRegiao(nivel) {
    const n = NIVEL_REGIAO.find((x) => x.id === (nivel || this.perfil().nivelRegiao));
    return n ? n.fator : 1;
  },

  fatorDia(dia) {
    const d = DIAS_SEMANA.find((x) => x.id === (dia || this.perfil().diaSemana));
    return d ? d.fator : 1;
  },

  fatorEstilo(catId, estiloId) {
    const e = ESTILOS.find((x) => x.id === (estiloId || this.perfil().estilo));
    if (!e || !e.fator[catId]) return 1;
    return e.fator[catId];
  },

  fatorPeriodo(catId, periodoId) {
    const p = PERIODOS.find((x) => x.id === (periodoId || this.perfil().periodo));
    if (!p || !p.fator[catId]) return 1;
    return p.fator[catId];
  },

  categoria(id) {
    return CATEGORIAS.find((c) => c.id === id);
  },

  categoriasAtivas() {
    return CATEGORIAS.filter((c) => Store.estado.categoriasAtivas[c.id] !== false);
  },

  /* --------------------------------------------------------- estimativas */

  /*
   * FÓRMULA — Estimativa de custo por categoria
   *
   *   base       = semente do padrão escolhido (econômico / intermediário / elevado)
   *   quantidade = nº de convidados, nº de convites (convidados/2) ou 1 (custo fixo)
   *   estimativa = base × quantidade × fatorRegião × fatorEstilo × fatorPeríodo × fatorDia
   *
   * fatorDia só se aplica a categorias sensíveis à data (local, alimentação,
   * fotografia, música, flores, decoração).
   */
  estimarCategoria(catId, o) {
    const cat = this.categoria(catId);
    if (!cat) return 0;
    const p = Object.assign({}, this.perfil(), o || {});
    const base = cat.est[p.padrao] !== undefined ? cat.est[p.padrao] : cat.est.medio;

    let quantidade = 1;
    if (cat.est.tipo === 'convidado') quantidade = Math.max(0, p.convidados || 0);
    if (cat.est.tipo === 'convite') quantidade = Math.ceil(Math.max(0, p.convidados || 0) / 2);

    const sensivelData = ['local', 'alimentacao', 'fotografia', 'musica', 'flores', 'decoracao'];
    const fDia = sensivelData.includes(catId) ? this.fatorDia(p.diaSemana) : 1;

    // Espaços grandes escalam com o nº de convidados mesmo tendo custo "fixo".
    let escalaLocal = 1;
    if (catId === 'local' && cat.est.tipo === 'fixo') {
      escalaLocal = 0.5 + 0.5 * (Math.max(10, p.convidados || 0) / 80);
    }
    if (catId === 'decoracao' && cat.est.tipo === 'fixo') {
      escalaLocal = 0.6 + 0.4 * (Math.max(10, p.convidados || 0) / 80);
    }

    const valor =
      base *
      quantidade *
      escalaLocal *
      this.fatorRegiao(p.nivelRegiao) *
      this.fatorEstilo(catId, p.estilo) *
      this.fatorPeriodo(catId, p.periodo) *
      fDia;

    return Math.round(valor);
  },

  estimativaTotal(o) {
    return this.categoriasAtivas().reduce((s, c) => s + this.estimarCategoria(c.id, o), 0);
  },

  /* ------------------------------------------------------- distribuição */

  /*
   * FÓRMULA — Peso de prioridade
   *   fatorPrioridade(p) = 0,55 + 0,09 × p     (p de 1 a 10)
   *   p=1  → 0,64   p=5 → 1,00   p=10 → 1,45
   *
   * FÓRMULA — Distribuição sugerida
   *   distribuível   = orçamento total × (1 − margem de segurança)
   *   peso_i         = pesoBase_i × fatorPrioridade(prioridade_i)
   *   sugerido_i     = distribuível × peso_i ÷ Σpesos
   *
   * A distribuição respeita valores já contratados: categorias com contrato
   * assinado saem do rateio pelo valor real, e o restante é redistribuído.
   */
  distribuir() {
    const e = Store.estado;
    const total = Number(e.perfil.orcamentoTotal) || 0;
    const margem = Number(e.config.margemSeguranca) || 0;
    const distribuivel = total * (1 - margem / 100);

    const ativas = this.categoriasAtivas();
    const contratadoPorCat = this.contratadoPorCategoria();

    // categorias já fechadas consomem valor real
    let consumidoFixo = 0;
    const abertas = [];
    ativas.forEach((c) => {
      const contratado = contratadoPorCat[c.id] || 0;
      if (contratado > 0) consumidoFixo += contratado;
      else abertas.push(c);
    });

    const restante = Math.max(0, distribuivel - consumidoFixo);
    const pesos = {};
    let soma = 0;
    abertas.forEach((c) => {
      const prio = e.prioridades[c.id] || 5;
      const w = c.pesoBase * (0.55 + 0.09 * prio);
      pesos[c.id] = w;
      soma += w;
    });

    /*
     * Arredondamento por maior resto.
     *
     * Arredondando cada categoria por conta própria, a soma da coluna não
     * fechava com o distribuível: 21 arredondamentos independentes erram
     * alguns reais para baixo ou para cima, e quem somasse a tela encontrava
     * dinheiro que não existe em lugar nenhum. Num app cuja promessa é
     * "nenhuma conta é caixa-preta", coluna que não fecha custa confiança.
     *
     * Então arredonda para baixo, mede quanto sobrou do alvo e devolve um
     * real de cada vez para as categorias de maior parte fracionária — que
     * são exatamente as que mais perderam no corte.
     */
    const alvo = Math.round(restante);
    const bruto = {};
    abertas.forEach((c) => {
      bruto[c.id] = soma > 0 ? (restante * pesos[c.id]) / soma : 0;
    });
    const ajustado = {};
    let distribuido = 0;
    abertas.forEach((c) => {
      ajustado[c.id] = Math.floor(bruto[c.id]);
      distribuido += ajustado[c.id];
    });
    const sobra = alvo - distribuido;
    if (sobra > 0) {
      abertas
        .slice()
        .sort((a, b) => (bruto[b.id] % 1) - (bruto[a.id] % 1))
        .slice(0, sobra)
        .forEach((c) => (ajustado[c.id] += 1));
    }

    const resultado = {};
    ativas.forEach((c) => {
      const contratado = contratadoPorCat[c.id] || 0;
      const manual = e.orcamento[c.id] && e.orcamento[c.id].planejado;
      const sugerido = contratado > 0 ? contratado : ajustado[c.id] || 0;
      resultado[c.id] = {
        sugerido: Math.round(sugerido),
        planejado: manual !== null && manual !== undefined && manual !== '' ? Number(manual) : Math.round(sugerido),
        manual: manual !== null && manual !== undefined && manual !== '',
        contratado,
        pago: this.pagoPorCategoria()[c.id] || 0,
        estimativa: this.estimarCategoria(c.id),
        prioridade: e.prioridades[c.id] || 5,
      };
    });
    return resultado;
  },

  contratadoPorCategoria() {
    const mapa = {};
    Store.estado.despesas.forEach((d) => {
      mapa[d.categoria] = (mapa[d.categoria] || 0) + (Number(d.valor) || 0);
    });
    return mapa;
  },

  pagoPorCategoria() {
    const mapa = {};
    Store.estado.despesas.forEach((d) => {
      mapa[d.categoria] = (mapa[d.categoria] || 0) + (Number(d.pago) || 0);
    });
    return mapa;
  },

  /* ------------------------------------------------------------ resumo */

  resumo() {
    const e = Store.estado;
    const total = Number(e.perfil.orcamentoTotal) || 0;
    const margemPct = Number(e.config.margemSeguranca) || 0;
    const reserva = Math.round((total * margemPct) / 100);
    const dist = this.distribuir();

    let planejado = 0;
    Object.values(dist).forEach((d) => (planejado += d.planejado));

    const contratado = e.despesas.reduce((s, d) => s + (Number(d.valor) || 0), 0);
    const pago = e.despesas.reduce((s, d) => s + (Number(d.pago) || 0), 0);
    const aPagar = Math.max(0, contratado - pago);
    const restante = total - contratado;
    const naoComprometido = total - reserva - planejado;

    return {
      total,
      reserva,
      margemPct,
      distribuivel: total - reserva,
      planejado: Math.round(planejado),
      contratado: Math.round(contratado),
      pago: Math.round(pago),
      aPagar: Math.round(aPagar),
      restante: Math.round(restante),
      naoComprometido: Math.round(naoComprometido),
      estimativaBottomUp: this.estimativaTotal(),
    };
  },

  /* --------------------------------------------------------- calendário */

  mesesRestantes() {
    const p = this.perfil();
    if (p.dataCasamento) {
      const alvo = new Date(p.dataCasamento + 'T12:00:00');
      const hoje = new Date();
      const meses = (alvo.getFullYear() - hoje.getFullYear()) * 12 + (alvo.getMonth() - hoje.getMonth());
      const ajuste = alvo.getDate() >= hoje.getDate() ? 0 : -1;
      return Math.max(0, meses + ajuste);
    }
    return Math.max(0, Number(p.mesesEstimados) || 0);
  },

  diasRestantes() {
    const p = this.perfil();
    if (!p.dataCasamento) return null;
    const alvo = new Date(p.dataCasamento + 'T12:00:00');
    const hoje = new Date();
    return Math.ceil((alvo - hoje) / 86400000);
  },

  /*
   * FÓRMULA — Meta mensal de poupança
   *   faltaGuardar = orçamento total − dinheiro disponível hoje
   *   metaMensal   = faltaGuardar ÷ meses restantes
   */
  metaMensal() {
    const p = this.perfil();
    const meses = this.mesesRestantes();
    const falta = Math.max(0, (Number(p.orcamentoTotal) || 0) - (Number(p.disponivelHoje) || 0));
    if (meses <= 0) return { meta: falta, meses: 0, falta, viavel: false, projetado: Number(p.disponivelHoje) || 0 };
    const meta = falta / meses;
    const projetado = (Number(p.disponivelHoje) || 0) + (Number(p.poupancaMensal) || 0) * meses;
    return {
      meta: Math.round(meta),
      meses,
      falta: Math.round(falta),
      viavel: (Number(p.poupancaMensal) || 0) >= meta,
      projetado: Math.round(projetado),
      diferenca: Math.round(projetado - (Number(p.orcamentoTotal) || 0)),
    };
  },

  /* --------------------------------------------- detector de prejuízo */

  /*
   * DETECTOR DE PREJUÍZO
   * Analisa um gasto (existente ou em avaliação) contra:
   *  - percentual do orçamento total
   *  - percentual sobre o planejado da categoria
   *  - prioridade declarada da categoria
   *  - itens que costumam NÃO estar inclusos
   *  - impacto sobre o saldo restante
   *  - alternativas disponíveis na biblioteca de estratégias
   *
   * Nunca afirma que um preço é "caro" — afirma quanto do orçamento ele consome.
   */
  detectarPrejuizo(catId, valor) {
    const r = this.resumo();
    const dist = this.distribuir();
    const cat = this.categoria(catId);
    const d = dist[catId] || { planejado: 0, prioridade: 5 };
    const v = Number(valor) || 0;

    const pctOrcamento = r.total > 0 ? (v / r.total) * 100 : 0;
    const pctPlanejado = d.planejado > 0 ? (v / d.planejado) * 100 : null;
    const prioridade = d.prioridade;
    const sobra = r.total - r.contratado - v;

    const sinais = [];

    if (pctOrcamento >= 35) {
      sinais.push({
        nivel: 'alto',
        texto: `Esse gasto representa ${pctOrcamento.toFixed(0)}% do seu orçamento total. É uma concentração alta em uma única categoria.`,
      });
    } else if (pctOrcamento >= 22) {
      sinais.push({
        nivel: 'medio',
        texto: `Esse gasto consome ${pctOrcamento.toFixed(0)}% do orçamento. Vale conferir os pontos abaixo antes de assinar.`,
      });
    }

    if (pctPlanejado !== null && pctPlanejado > 120) {
      sinais.push({
        nivel: 'alto',
        texto: `Está ${(pctPlanejado - 100).toFixed(0)}% acima do que você planejou para ${cat.nome}. Se fechar assim, outra categoria precisa ceder.`,
      });
    }

    if (this.ehSimplificavel(catId) && pctOrcamento >= 10) {
      sinais.push({
        nivel: 'alto',
        texto: `Você marcou ${cat.nome} como algo que pode ser simplificado sem dor — e esse gasto consumiria ${pctOrcamento.toFixed(0)}% do orçamento. É a maior contradição que eu vejo aqui, e o melhor lugar para procurar alternativa.`,
      });
    } else if (prioridade <= 4 && pctOrcamento >= 12) {
      sinais.push({
        nivel: 'alto',
        texto: `${cat.nome} está marcada como prioridade ${prioridade}/10, mas consumiria ${pctOrcamento.toFixed(0)}% do orçamento. Categorias de baixa prioridade costumam ser o melhor lugar para cortar.`,
      });
    }

    /*
     * Nomear vale mais que numerar. "É uma das suas três" é a frase que a
     * abertura do app promete; "é prioridade 9/10" é a mesma informação sem
     * o compromisso — e sem o compromisso, a promessa não é cumprida.
     */
    if (this.ehInegociavel(catId)) {
      const outras = this.inegociaveis().filter((id) => id !== catId).map((id) => this.categoria(id).nome);
      sinais.push({
        nivel: 'info',
        texto: `${cat.nome} é uma das suas três inegociáveis${outras.length ? ` — junto com ${outras.join(' e ')}` : ''}. Eu não vou sugerir corte aqui enquanto existir alternativa em qualquer outro lugar.`,
      });
    } else if (prioridade >= 8) {
      sinais.push({
        nivel: 'info',
        texto: `${cat.nome} é prioridade ${prioridade}/10 para você. Antes de cortar aqui, procure alternativas nas categorias de prioridade mais baixa.`,
      });
    }

    if (sobra < 0) {
      sinais.push({
        nivel: 'alto',
        texto: `Com esse gasto, o total contratado ultrapassa o orçamento em ${formatarMoeda(Math.abs(sobra))}.`,
      });
    } else if (sobra < r.reserva) {
      sinais.push({
        nivel: 'medio',
        texto: `Depois desse gasto sobram ${formatarMoeda(sobra)} — menos que a sua margem de segurança de ${formatarMoeda(r.reserva)}.`,
      });
    }

    if (!sinais.length) {
      sinais.push({
        nivel: 'ok',
        texto: `Esse gasto representa ${pctOrcamento.toFixed(0)}% do orçamento e está dentro do que você planejou para ${cat.nome}.`,
      });
    }

    return {
      categoria: cat,
      valor: v,
      pctOrcamento,
      pctPlanejado,
      prioridade,
      sobra,
      sinais,
      checklist: cat.naoIncluiCostuma || [],
      alternativas: this.estrategiasPara(catId).slice(0, 4),
    };
  },

  estrategiasPara(catId) {
    return ESTRATEGIAS.filter((s) => (s.afeta || []).includes(catId)).sort(
      (a, b) => b.economia.max - a.economia.max
    );
  },

  /* --------------------------------------------- analisador de orçamento */

  analisarOrcamento() {
    const e = Store.estado;
    const r = this.resumo();
    const dist = this.distribuir();
    const achados = [];

    if (r.total <= 0) {
      achados.push({ nivel: 'alto', titulo: 'Orçamento não definido', texto: 'Informe o orçamento total para que eu consiga analisar qualquer coisa.' });
      return achados;
    }

    // 1. Concentração de gastos
    const ordenadas = Object.entries(dist)
      .map(([id, d]) => ({ id, ...d, nome: this.categoria(id).nome }))
      .sort((a, b) => b.planejado - a.planejado);

    const maior = ordenadas[0];
    if (maior && maior.planejado / r.total > 0.4) {
      achados.push({
        nivel: 'alto',
        titulo: 'Concentração alta em uma categoria',
        texto: `${maior.nome} concentra ${((maior.planejado / r.total) * 100).toFixed(0)}% do orçamento. Concentração acima de 40% deixa pouca margem para o resto.`,
        categoria: maior.id,
      });
    }

    // 2. Prioridade alta com verba baixa / prioridade baixa com verba alta
    const subestimadas = [];
    ordenadas.forEach((d) => {
      const pctCat = (d.planejado / r.total) * 100;
      if (d.prioridade >= 8 && pctCat < 4 && d.planejado < d.estimativa * 0.6) {
        achados.push({
          nivel: 'medio',
          titulo: `${d.nome} está subfinanciada para a prioridade que você deu`,
          texto: `Você marcou ${d.nome} como prioridade ${d.prioridade}/10, mas destinou ${formatarMoeda(d.planejado)} (${pctCat.toFixed(0)}% do orçamento). A estimativa para o seu formato é ${formatarMoeda(d.estimativa)}.`,
          categoria: d.id,
        });
      }
      /*
       * Nunca nas três. Verba concentrada numa inegociável não é desvio —
       * é exatamente o que ela pediu, e apontar isso como problema seria o
       * app discutindo com a própria promessa que fez na abertura.
       */
      if (d.prioridade <= 4 && pctCat > 10 && !this.ehInegociavel(d.id)) {
        const sugestao = this.ehSimplificavel(d.id)
          ? ' Você marcou essa categoria como simplificável, então aqui a alternativa custa pouco.'
          : ' Se precisar cortar, eu começaria por aqui antes de mexer nas suas prioridades altas.';
        achados.push({
          nivel: 'medio',
          titulo: `${d.nome} recebe mais verba do que a prioridade sugere`,
          texto: `${d.nome} é prioridade ${d.prioridade}/10 e está com ${formatarMoeda(d.planejado)} (${pctCat.toFixed(0)}%).${sugestao}`,
          categoria: d.id,
        });
      }
      if (d.estimativa > d.planejado * 1.5 && d.planejado > 0 && d.contratado === 0) {
        subestimadas.push({ ...d, gap: d.estimativa - d.planejado });
      }
    });

    // As categorias subestimadas viram UM achado consolidado — não uma lista de avisos repetidos.
    if (subestimadas.length) {
      const top = subestimadas.sort((a, b) => b.gap - a.gap).slice(0, 4);
      const gapTotal = subestimadas.reduce((s, d) => s + d.gap, 0);
      achados.push({
        nivel: subestimadas.length >= 5 ? 'alto' : 'medio',
        titulo: `${subestimadas.length} ${subestimadas.length === 1 ? 'categoria pode estar subestimada' : 'categorias podem estar subestimadas'}`,
        texto:
          `Somando todas, a diferença entre o que você planejou e a minha estimativa é de cerca de ${formatarMoeda(gapTotal)}. As maiores: ` +
          top.map((d) => `${d.nome} (${formatarMoeda(d.planejado)} planejados x ${formatarMoeda(d.estimativa)} estimados)`).join('; ') +
          '. Isso é estimativa do app para o seu formato — a primeira cotação real vale mais que qualquer número meu.',
        categoria: top[0].id,
      });
    }

    // 3. Margem de segurança
    if (r.margemPct <= 0) {
      achados.push({
        nivel: 'medio',
        titulo: 'Sem margem de segurança',
        texto: 'Casamentos podem gerar custos inesperados. Considere reservar uma margem de segurança em Configurações.',
      });
    }

    // 4. Estouro
    if (r.contratado > r.total) {
      achados.push({
        nivel: 'alto',
        titulo: 'Contratado acima do orçamento',
        texto: `Você já contratou ${formatarMoeda(r.contratado)} contra um orçamento de ${formatarMoeda(r.total)}.`,
      });
    } else if (r.contratado > r.distribuivel) {
      achados.push({
        nivel: 'medio',
        titulo: 'Margem de segurança comprometida',
        texto: `O contratado (${formatarMoeda(r.contratado)}) já entrou na sua margem de segurança.`,
      });
    }

    // 5. Estimativa bottom-up x orçamento
    if (r.estimativaBottomUp > r.total * 1.05) {
      achados.push({
        nivel: 'alto',
        titulo: 'O formato atual não cabe no orçamento',
        texto: `A estimativa para ${this.perfil().convidados} convidados no formato escolhido é ${formatarMoeda(r.estimativaBottomUp)}, contra um orçamento de ${formatarMoeda(r.total)}. Reduzir convidados, mudar o período ou o dia da semana são os ajustes de maior efeito.`,
      });
    }

    // 6. Capacidade de poupança
    const meta = this.metaMensal();
    if (!meta.viavel && meta.meses > 0) {
      achados.push({
        nivel: 'alto',
        titulo: 'A meta mensal não cabe na sua capacidade de poupança',
        texto: `Para chegar em ${formatarMoeda(r.total)} em ${meta.meses} meses você precisaria guardar ${formatarMoeda(meta.meta)} por mês, mas informou ${formatarMoeda(this.perfil().poupancaMensal)}. Na projeção atual você chegaria com ${formatarMoeda(meta.projetado)}. Ajustar formato ou data resolve melhor que recorrer a crédito.`,
      });
    }

    // 7. Vencimentos próximos
    const proximos = this.vencimentosProximos(30);
    const somaProx = proximos.reduce((s, d) => s + (Number(d.valor) - Number(d.pago || 0)), 0);
    if (somaProx > (this.perfil().disponivelHoje || 0)) {
      achados.push({
        nivel: 'medio',
        titulo: 'Pagamentos próximos acima do disponível',
        texto: `Você tem ${formatarMoeda(somaProx)} vencendo nos próximos 30 dias e informou ${formatarMoeda(this.perfil().disponivelHoje)} disponíveis.`,
      });
    }

    if (!achados.length) {
      achados.push({
        nivel: 'ok',
        titulo: 'Nenhum risco evidente no momento',
        texto: 'Sua distribuição está coerente com as prioridades declaradas e o orçamento comporta o formato atual — considerando as estimativas do app.',
      });
    }

    return achados;
  },

  vencimentosProximos(dias) {
    const limite = new Date();
    limite.setDate(limite.getDate() + (dias || 30));
    const hoje = new Date();
    return Store.estado.despesas
      .filter((d) => d.vencimento && (Number(d.valor) - Number(d.pago || 0)) > 0)
      .filter((d) => {
        const v = new Date(d.vencimento + 'T12:00:00');
        return v >= new Date(hoje.toDateString()) && v <= limite;
      })
      .sort((a, b) => a.vencimento.localeCompare(b.vencimento));
  },

  /* ------------------------------------------------------- simulador */

  /*
   * SIMULADOR DE CENÁRIOS
   * Recalcula a estimativa bottom-up trocando as variáveis do cenário.
   * Retorna total, quebra por categoria e as categorias afetadas.
   */
  simularCenario(params) {
    const p = Object.assign({}, this.perfil(), params);
    const detalhe = {};
    let total = 0;

    this.categoriasAtivas().forEach((c) => {
      let v = this.estimarCategoria(c.id, p);

      // ajustes de formato do cenário
      if (params.formatoComida === 'brunch' && c.id === 'alimentacao') v *= 0.65;
      if (params.formatoComida === 'fingerfood' && c.id === 'alimentacao') v *= 0.7;
      if (params.formatoComida === 'estacoes' && c.id === 'alimentacao') v *= 0.85;

      if (params.musica === 'playlist' && c.id === 'musica') v *= 0.25;
      if (params.musica === 'musicoCerimonia' && c.id === 'musica') v *= 0.45;

      if (params.vestido === 'alugado' && c.id === 'vestido') v *= 0.4;
      if (params.vestido === 'usado' && c.id === 'vestido') v *= 0.5;

      if (params.convite === 'digital' && c.id === 'convites') v *= 0.15;

      if (params.bebidas === 'semAlcool' && c.id === 'bebidas') v *= 0.45;
      if (params.bebidas === 'selfService' && c.id === 'bebidas') v *= 0.7;

      if (params.lembrancinhas === 'nao' && c.id === 'lembrancinhas') v = 0;

      if (params.localTipo === 'alternativo' && c.id === 'local') v *= 0.6;
      if (params.localTipo === 'casa' && c.id === 'local') v *= 0.25;

      detalhe[c.id] = Math.round(v);
      total += v;
    });

    return { total: Math.round(total), detalhe, params: p };
  },

  compararCenarios(a, b) {
    const rA = this.simularCenario(a);
    const rB = this.simularCenario(b);
    const afetadas = [];
    CATEGORIAS.forEach((c) => {
      const va = rA.detalhe[c.id] || 0;
      const vb = rB.detalhe[c.id] || 0;
      if (Math.abs(va - vb) >= Math.max(50, va * 0.05)) {
        afetadas.push({ id: c.id, nome: c.nome, icone: c.icone, a: va, b: vb, dif: vb - va });
      }
    });
    afetadas.sort((x, y) => Math.abs(y.dif) - Math.abs(x.dif));
    return { a: rA, b: rB, diferenca: rB.total - rA.total, afetadas };
  },

  /* -------------------------------------------------------- economia */

  economiaResumo() {
    const regs = Store.estado.economia.registros;
    const soma = (tipo) => regs.filter((r) => r.tipo === tipo).reduce((s, r) => s + (Number(r.valor) || 0), 0);
    return {
      economizado: soma('economizado'),
      potencial: this.economiaPotencialEstimada(),
      potencialRegistrado: soma('potencial'),
      evitado: soma('evitado'),
      registros: regs,
    };
  },

  /*
   * FÓRMULA — Economia potencial estimada
   * Soma, para cada missão ainda não concluída, o ponto médio do intervalo
   * percentual aplicado sobre a base indicada (categoria ou orçamento).
   * É sempre exibida como POTENCIAL — nunca como economia realizada.
   */
  economiaPotencialEstimada() {
    const dist = this.distribuir();
    const r = this.resumo();
    let total = 0;
    MISSOES.forEach((m) => {
      const st = Store.estado.missoes[m.id];
      if (st && st.status === 'concluida') return;
      if (!m.economiaPct || (!m.economiaPct.min && !m.economiaPct.max)) return;
      let base = 0;
      if (m.economiaPct.base === 'orcamento') base = r.total;
      else if (dist[m.economiaPct.base]) base = dist[m.economiaPct.base].planejado;
      else return;
      const medio = (m.economiaPct.min + m.economiaPct.max) / 2 / 100;
      total += base * medio;
    });
    return Math.round(total);
  },

  registrarEconomia(tipo, valor, descricao, origem) {
    Store.estado.economia.registros.unshift({
      id: novoId('eco'),
      tipo,
      valor: Number(valor) || 0,
      descricao,
      origem: origem || '',
      data: new Date().toISOString(),
    });
    Store.registrarHistorico('Economia registrada', `${tipo}: ${formatarMoeda(valor)} — ${descricao}`);
    Store.salvar();
  },

  /* --------------------------------------------------------- alertas */

  alertas() {
    const r = this.resumo();
    const dist = this.distribuir();
    const lista = [];

    if (r.total > 0) {
      Object.entries(dist).forEach(([id, d]) => {
        const pct = (d.contratado / r.total) * 100;
        if (d.contratado > 0 && pct >= 30) {
          lista.push({
            nivel: 'alto',
            texto: `${this.categoria(id).nome} está consumindo ${pct.toFixed(0)}% do seu orçamento.`,
            acao: { tela: 'orcamento' },
          });
        }
      });
    }

    /*
     * Duas situações diferentes, que estavam recebendo a mesma frase.
     *
     * Passar do distribuível significa começar a comer a reserva — é sério,
     * mas ainda cabe no orçamento. Passar do orçamento inteiro é outra coisa,
     * e dizer "entrou na sua margem de segurança" nesse caso era errado duas
     * vezes: subestimava o problema e, com margem zerada, falava de uma
     * margem que não existe. Quem está R$ 1.000 acima do teto precisa ler
     * o número, não um eufemismo.
     */
    if (r.total > 0 && r.contratado > r.total) {
      lista.push({
        nivel: 'alto',
        texto: `O contratado (${formatarMoeda(r.contratado)}) ultrapassou o seu orçamento em ${formatarMoeda(r.contratado - r.total)}. Antes de fechar mais alguma coisa, vale rever o que ainda está em aberto.`,
        acao: { tela: 'orcamento' },
      });
    } else if (r.total > 0 && r.contratado > r.distribuivel && r.reserva > 0) {
      lista.push({
        nivel: 'alto',
        texto: `O total contratado já entrou na sua margem de segurança — sobram ${formatarMoeda(r.total - r.contratado)} de reserva.`,
        acao: { tela: 'orcamento' },
      });
    }

    if (r.total > 0 && r.estimativaBottomUp > r.total * 1.05) {
      lista.push({
        nivel: 'alto',
        texto: `A estimativa do formato atual (${formatarMoeda(r.estimativaBottomUp)}) está ${formatarMoeda(r.estimativaBottomUp - r.total)} acima do seu orçamento. Reduzir convidados, período e dia da semana são os ajustes de maior efeito.`,
        acao: { tela: 'cenarios' },
      });
    }

    const venc = this.vencimentosProximos(15);
    if (venc.length) {
      const d = venc[0];
      lista.push({
        nivel: 'medio',
        texto: `${d.descricao} vence em ${formatarData(d.vencimento)} — faltam ${formatarMoeda(Number(d.valor) - Number(d.pago || 0))}.`,
        acao: { tela: 'orcamento' },
      });
    }

    const meta = this.metaMensal();
    if (!meta.viavel && meta.meses > 0) {
      lista.push({
        nivel: 'medio',
        texto: `Sua meta é guardar ${formatarMoeda(meta.meta)}/mês e a capacidade informada é ${formatarMoeda(this.perfil().poupancaMensal)}/mês.`,
        acao: { tela: 'assistente' },
      });
    }

    if (Store.estado.config.modo7mil && r.contratado > 7000) {
      lista.push({ nivel: 'alto', texto: 'No Modo R$7 mil, o contratado já ultrapassou a meta de R$7.000.', acao: { tela: 'orcamento' } });
    }

    if (!lista.length) {
      lista.push({ nivel: 'ok', texto: 'Nenhum alerta ativo. Seu plano está dentro do previsto.', acao: { tela: 'missoes' } });
    }

    return lista;
  },

  /* ------------------------------------------------------ cronograma */

  cronogramaAtivo() {
    const meses = this.mesesRestantes();
    const contratado = this.contratadoPorCategoria();
    const ativas = Store.estado.categoriasAtivas;

    return CRONOGRAMA.filter((t) => {
      if (t.categoria && ativas[t.categoria] === false) return false;
      return true;
    })
      .map((t) => {
        const estado = Store.estado.tarefas[t.id] || {};
        const feita = !!estado.feita || (contratado[t.categoria] > 0 && t.titulo.toLowerCase().includes('fechar'));
        /*
         * "Pendente" em vez de "atrasada": quem começa a planejar faltando
         * 6 meses não está atrasada em nada — ela só tem um acúmulo para
         * resolver primeiro. Rotular isso de atraso é culpa gratuita, e o
         * produto existe para reduzir ansiedade, não para produzi-la.
         * A informação vira agrupamento, não etiqueta vermelha.
         */
        return {
          ...t,
          feita,
          pendente: !feita && meses <= t.mesInicio,
          futura: meses > t.mesInicio,
        };
      })
      .sort((a, b) => b.mesInicio - a.mesInicio);
  },

  proximasTarefas(n) {
    const meses = this.mesesRestantes();
    const abertas = this.cronogramaAtivo().filter((t) => !t.feita);
    /* o que já deveria estar em curso vem primeiro, depois o que se aproxima */
    const pendentes = abertas.filter((t) => t.pendente).sort((a, b) => b.mesInicio - a.mesInicio);
    const futuras = abertas.filter((t) => !t.pendente).sort((a, b) => b.mesInicio - a.mesInicio);
    return pendentes.concat(futuras).slice(0, n || 5);
  },

  /* --------------------------------------------------------- missões */

  missoesRecomendadas(n) {
    const dist = this.distribuir();
    const e = Store.estado;
    const abertas = MISSOES.filter((m) => {
      const st = e.missoes[m.id];
      return !st || st.status !== 'concluida';
    });

    const pontuada = abertas.map((m) => {
      let score = 0;
      const catBase = m.economiaPct && dist[m.economiaPct.base] ? dist[m.economiaPct.base] : null;
      if (m.economiaPct && m.economiaPct.base === 'orcamento') score += 60;
      if (catBase) {
        score += (catBase.planejado / Math.max(1, this.resumo().total)) * 120;
        score += (11 - catBase.prioridade) * 2; // cortar primeiro onde a prioridade é menor
      }
      score += ((m.economiaPct ? m.economiaPct.max : 0) / 100) * 25;
      if (m.dificuldade === 'baixa') score += 8;
      if (e.config.modo7mil && m.economiaPct && m.economiaPct.max >= 30) score += 20;
      // respeita as preferências declaradas
      if (m.categoria === 'diy' && !this.perfil().aceitaDiy) score -= 100;
      if (m.id === 'm-vestido-alternativas' && !this.perfil().aceitaUsado && !this.perfil().aceitaAluguel) score -= 60;
      if (m.id === 'm-local-alternativo' && !this.perfil().aceitaLocalAlternativo) score -= 60;
      return { ...m, score };
    });

    return pontuada.sort((a, b) => b.score - a.score).slice(0, n || MISSOES.length);
  },

  economiaMissao(m) {
    const dist = this.distribuir();
    const r = this.resumo();
    let base = 0;
    if (!m.economiaPct) return null;
    if (m.economiaPct.base === 'orcamento') base = r.total;
    else if (dist[m.economiaPct.base]) base = dist[m.economiaPct.base].planejado;
    else return null;
    if (!base) return null;
    return {
      min: Math.round((base * m.economiaPct.min) / 100),
      max: Math.round((base * m.economiaPct.max) / 100),
    };
  },

  /* ---------------------------------------------------- estratégias */

  estrategiasRecomendadas(n) {
    const p = this.perfil();
    const dist = this.distribuir();
    const r = this.resumo();

    const pontuada = ESTRATEGIAS.map((s) => {
      let score = 0;
      (s.afeta || []).forEach((catId) => {
        const d = dist[catId];
        if (!d) return;
        score += (d.planejado / Math.max(1, r.total)) * 100;
        score += (11 - d.prioridade) * 1.5;
      });
      score += s.economia.max / 10;
      if (s.nivel === 'leve') score += 12;
      if (s.nivel === 'agressivo') score -= Store.estado.config.modo7mil ? 0 : 10;

      if (s.categorias.includes('diy') && !p.aceitaDiy) score -= 100;
      if (s.id === 'vestido-alugado' && !p.aceitaAluguel) score -= 100;
      if (s.id === 'vestido-usado' && !p.aceitaUsado) score -= 100;
      if (s.id === 'decoracao-alugada' && !p.aceitaAluguel) score -= 100;
      if ((s.id === 'local-alternativo' || s.id === 'casamento-em-casa' || s.id === 'espaco-publico') && !p.aceitaLocalAlternativo) score -= 100;
      if (s.id === 'data-baixa-temporada' && p.dataDefinida) score -= 60;
      if (s.id === 'dia-alternativo' && p.dataDefinida) score -= 60;

      /*
       * As três inegociáveis, pelo nome — não mais por "nota >= 9".
       * A penalidade é maior que a antiga porque agora é certeira: antes ela
       * podia estar punindo uma categoria que a pessoa só tinha subido no
       * slider, e ser tímida era a defesa contra o próprio erro de mira.
       * Estratégia leve continua passando: ela não tira nada de ninguém.
       *
       * Mudança de formato é exceção deliberada. Reduzir convidados, mudar
       * a data ou mudar o estilo mexem em quase todas as categorias por
       * arrasto de escala, não por rebaixar nenhuma delas. Quem diz que o
       * LOCAL é inegociável está falando do espaço que quer, e cortar
       * convidados não piora esse espaço — muitas vezes é justamente o que
       * o torna possível. Punir essas três aqui removeria as alavancas mais
       * fortes do app para proteger algo que elas não ameaçam.
       */
      const mudaFormato = (s.categorias || []).some((t) => t === 'convidados' || t === 'data' || t === 'estilo');
      if (!mudaFormato) {
        (s.afeta || []).forEach((catId) => {
          if (this.ehInegociavel(catId) && s.nivel !== 'leve') score -= 70;
        });
      }

      /*
       * E o inverso, que não existia: o que ela marcou como simplificável é
       * onde ela JÁ DISSE que pode mexer. Procurar dinheiro em outro lugar
       * antes de olhar aqui é ignorar uma resposta que ela deu.
       */
      (s.afeta || []).forEach((catId) => {
        if (this.ehSimplificavel(catId)) score += 25;
      });

      return { ...s, score };
    });

    return pontuada.filter((s) => s.score > -50).sort((a, b) => b.score - a.score).slice(0, n || ESTRATEGIAS.length);
  },

  /* ---------------------------------------------------- modo 7 mil */

  ativarModo7mil() {
    const e = Store.estado;
    e.config.modo7mil = true;
    e.perfil.orcamentoTotal = 7000;
    e.perfil.padrao = 'baixo';
    Store.registrarHistorico('Modo R$7 mil ativado', 'Orçamento definido em R$7.000 e padrão econômico.');
    Store.salvar();
  },

  desativarModo7mil() {
    Store.estado.config.modo7mil = false;
    Store.registrarHistorico('Modo R$7 mil desativado', '');
    Store.salvar();
  },

  /* --------------------------------------------------- calculadoras */

  /*
   * CALCULADORAS — todas as fórmulas explícitas.
   * Quantidades por pessoa são REFERÊNCIAS iniciais e devem ser confirmadas
   * com o fornecedor que vai produzir. Não são padrões universais.
   */
  calc: {
    // comida: porções por pessoa conforme formato e duração
    comida(convidados, formato, horas) {
      const refs = { jantar: 1, almoco: 1, brunch: 0.8, fingerfood: 0, estacoes: 0.9 };
      const salgadosHora = { fingerfood: 4, estacoes: 1, jantar: 1, almoco: 1, brunch: 1 };
      return {
        pratos: Math.ceil(convidados * (refs[formato] !== undefined ? refs[formato] : 1)),
        salgados: formato === 'fingerfood' ? Math.ceil(convidados * salgadosHora.fingerfood * Math.max(1, horas)) : null,
        formula: 'porções = convidados × fator do formato (× horas, no caso de finger food)',
      };
    },
    // bebidas: litros estimados
    bebidas(convidados, horas, periodo, comAlcool) {
      const aguaPorPessoaHora = 0.25;
      const refriPorPessoaHora = periodo === 'noite' ? 0.2 : 0.3;
      const alcoolPorPessoaHora = comAlcool ? (periodo === 'noite' ? 0.35 : 0.2) : 0;
      return {
        agua: +(convidados * horas * aguaPorPessoaHora).toFixed(1),
        refrigerante: +(convidados * horas * refriPorPessoaHora).toFixed(1),
        alcoolicas: +(convidados * horas * alcoolPorPessoaHora).toFixed(1),
        formula: 'litros = convidados × horas × consumo por pessoa/hora (referência ajustável)',
      };
    },
    // bolo: fatias e kg
    bolo(convidados) {
      const fatias = Math.ceil(convidados * 1.1);
      return { fatias, kg: +(fatias * 0.1).toFixed(1), formula: 'fatias = convidados × 1,1 · kg = fatias × 0,1' };
    },
    doces(convidados, unidadesPorPessoa) {
      const u = unidadesPorPessoa || 4;
      return { unidades: Math.ceil(convidados * u), formula: 'unidades = convidados × unidades por pessoa' };
    },
    convites(convidados) {
      return { convites: Math.ceil(convidados / 2), formula: 'convites = convidados ÷ 2 (1 convite por casal/família)' };
    },
    mesas(convidados, porMesa) {
      const p = porMesa || 8;
      return { mesas: Math.ceil(convidados / p), cadeiras: convidados, formula: 'mesas = convidados ÷ lugares por mesa' };
    },
    parcelas(valor, n, entrada) {
      const e = Number(entrada) || 0;
      const restante = Math.max(0, Number(valor) - e);
      const nn = Math.max(1, Number(n) || 1);
      return { parcela: Math.round(restante / nn), total: Number(valor), formula: 'parcela = (valor − entrada) ÷ nº de parcelas' };
    },
    poupanca(objetivo, disponivel, meses) {
      const falta = Math.max(0, Number(objetivo) - Number(disponivel));
      const m = Math.max(1, Number(meses) || 1);
      return { mensal: Math.round(falta / m), falta, formula: 'mensal = (objetivo − disponível) ÷ meses' };
    },
  },
};
