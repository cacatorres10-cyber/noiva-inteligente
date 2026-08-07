/* NOIVA INTELIGENTE — Ações do usuário (mutações de estado) */

const Acoes = {
  /* ------------------------------------------------------------ perfil */

  salvarPerfil() {
    const p = Store.estado.perfil;
    ['orcamentoTotal', 'disponivelHoje', 'poupancaMensal', 'mesesEstimados', 'convidados'].forEach((k) => {
      const el = $('#pf-' + k);
      if (el) p[k] = Number(el.value) || 0;
    });
    ['dataCasamento', 'diaSemana', 'cidade', 'nivelRegiao', 'periodo', 'estilo', 'padrao', 'restricoes'].forEach((k) => {
      const el = $('#pf-' + k);
      if (el) p[k] = el.value;
    });
    ['aceitaDiy', 'aceitaAluguel', 'aceitaUsado', 'aceitaLocalAlternativo', 'recebeAjuda'].forEach((k) => {
      const el = $('#pf-' + k);
      if (el) p[k] = el.checked;
    });
    p.dataDefinida = !!p.dataCasamento;
    p.tresSonhos = [0, 1, 2].map((i) => ($('#pf-sonho-' + i) || {}).value || '').map((s) => s.trim());

    Store.registrarHistorico('Dados atualizados', `${formatarMoeda(p.orcamentoTotal)} · ${p.convidados} convidados`);
    Store.salvar();
    toast('Recalculei tudo com os novos dados.');
    App.ir('dashboard');
  },

  definirPrioridade(catId, valor) {
    Store.estado.prioridades[catId] = Number(valor);
    Store.registrarHistorico('Prioridade alterada', `${Motor.categoria(catId).nome}: ${valor}/10`);
    Store.salvar();
    App.atualizar();
  },

  alternarCategoria(catId, ativa) {
    Store.estado.categoriasAtivas[catId] = ativa;
    Store.registrarHistorico(ativa ? 'Categoria ativada' : 'Categoria desativada', Motor.categoria(catId).nome);
    Store.salvar();
    App.atualizar();
  },

  definirPlanejado(catId, valor) {
    const v = String(valor).trim();
    Store.estado.orcamento[catId] = Store.estado.orcamento[catId] || {};
    Store.estado.orcamento[catId].planejado = v === '' ? null : Number(v);
    Store.salvar();
    toast('Valor planejado atualizado.');
    App.atualizar();
  },

  definirMargem(valor) {
    Store.estado.config.margemSeguranca = Number(valor);
    Store.salvar();
    App.atualizar();
  },

  /* ------------------------------------------------------------ gastos */

  salvarGasto() {
    const categoria = $('#g-categoria').value;
    const descricao = $('#g-descricao').value.trim();
    const valor = Number($('#g-valor').value) || 0;
    if (!descricao || !valor) {
      toast('Preciso da descrição e do valor.');
      return;
    }
    const despesa = {
      id: novoId('gasto'),
      categoria,
      descricao,
      valor,
      pago: Number($('#g-pago').value) || 0,
      parcelas: Number($('#g-parcelas').value) || 1,
      vencimento: $('#g-vencimento').value || '',
      observacoes: $('#g-obs').value.trim(),
      data: new Date().toISOString(),
    };
    Store.estado.despesas.unshift(despesa);
    Store.registrarHistorico('Gasto registrado', `${descricao}: ${formatarMoeda(valor)}`);
    Store.salvar();
    fecharGaveta();
    toast('Gasto registrado e orçamento recalculado.');
    App.atualizar();
  },

  removerDespesa(id) {
    const d = Store.estado.despesas.find((x) => x.id === id);
    if (!d) return;
    if (!confirm(`Remover "${d.descricao}"?`)) return;
    Store.estado.despesas = Store.estado.despesas.filter((x) => x.id !== id);
    Store.registrarHistorico('Gasto removido', d.descricao);
    Store.salvar();
    App.atualizar();
  },

  /* ------------------------------------------------------ fornecedores */

  salvarFornecedor() {
    const nome = $('#f-nome').value.trim();
    const preco = Number($('#f-preco').value) || 0;
    if (!nome) {
      toast('Preciso pelo menos do nome.');
      return;
    }
    const f = {
      id: novoId('forn'),
      categoria: $('#f-categoria').value,
      nome,
      preco,
      extras: Number($('#f-extras').value) || 0,
      localizacao: $('#f-localizacao').value.trim(),
      contato: $('#f-contato').value.trim(),
      incluso: $('#f-incluso').value.trim(),
      naoIncluso: $('#f-naoIncluso').value.trim(),
      pagamento: $('#f-pagamento').value.trim(),
      parcelas: Number($('#f-parcelas').value) || 1,
      avaliacao: Number($('#f-avaliacao').value) || 0,
      obs: $('#f-obs').value.trim(),
      contratado: $('#f-contratado').checked,
      data: new Date().toISOString(),
    };
    Store.estado.fornecedores.unshift(f);

    if (f.contratado && preco > 0) {
      Store.estado.despesas.unshift({
        id: novoId('gasto'),
        categoria: f.categoria,
        descricao: f.nome,
        valor: preco + f.extras,
        pago: 0,
        parcelas: f.parcelas,
        vencimento: '',
        observacoes: f.pagamento,
        fornecedorId: f.id,
        data: new Date().toISOString(),
      });
    }

    Store.registrarHistorico('Fornecedor cadastrado', `${nome} — ${formatarMoeda(preco)}`);
    Store.salvar();
    fecharGaveta();
    toast(f.contratado ? 'Fornecedor salvo e lançado no orçamento.' : 'Fornecedor salvo.');
    App.atualizar();
  },

  removerFornecedor(id) {
    const f = Store.estado.fornecedores.find((x) => x.id === id);
    if (!f) return;
    if (!confirm(`Remover "${f.nome}"?`)) return;
    Store.estado.fornecedores = Store.estado.fornecedores.filter((x) => x.id !== id);
    Store.estado.despesas = Store.estado.despesas.filter((x) => x.fornecedorId !== id);
    Store.salvar();
    fecharGaveta();
    App.atualizar();
  },

  /* ----------------------------------------------------------- missões */

  concluirMissao(id) {
    const m = MISSOES.find((x) => x.id === id);
    const economia = Number(($('#missao-economia') || {}).value) || 0;
    Store.estado.missoes[id] = { status: 'concluida', economiaConfirmada: economia, data: new Date().toISOString() };
    if (economia > 0) {
      Motor.registrarEconomia('economizado', economia, m.titulo, 'missão');
    } else {
      Store.registrarHistorico('Missão concluída', m.titulo);
      Store.salvar();
    }
    fecharGaveta();
    toast(economia > 0 ? `${formatarMoeda(economia)} de economia registrada.` : 'Missão concluída.');
    App.atualizar();
  },

  reabrirMissao(id) {
    delete Store.estado.missoes[id];
    Store.salvar();
    fecharGaveta();
    App.atualizar();
  },

  /* ---------------------------------------------------------- tarefas */

  alternarTarefa(id, feita) {
    Store.estado.tarefas[id] = Object.assign(Store.estado.tarefas[id] || {}, { feita });
    Store.salvar();
  },

  /* --------------------------------------------------------- cenários */

  setCenario(letra, campo, valor) {
    const chave = 'cenario' + letra;
    const p = Motor.perfil();
    const padraoA = { convidados: p.convidados, periodo: p.periodo, diaSemana: p.diaSemana, formatoComida: 'jantar', musica: 'dj', vestido: 'comprado', convite: 'impresso', bebidas: 'completo', lembrancinhas: 'sim', localTipo: 'espaco' };
    const padraoB = { convidados: Math.round(p.convidados * 0.7), periodo: 'tarde', diaSemana: 'domingo', formatoComida: 'brunch', musica: 'playlist', vestido: 'alugado', convite: 'digital', bebidas: 'selfService', lembrancinhas: 'nao', localTipo: 'alternativo' };
    Store.estado[chave] = Object.assign({}, letra === 'A' ? padraoA : padraoB, Store.estado[chave] || {});
    Store.estado[chave][campo] = valor;
    Store.salvar();
    App.atualizar();
  },

  /* ------------------------------------------------------ estratégias */

  filtrarEstrategias(filtro) {
    Store.estado._filtroEstrategia = filtro;
    Telas.renderizar('estrategias', { filtro });
  },

  /* --------------------------------------------------------- modo 7k */

  alternarModo7mil() {
    if (Store.estado.config.modo7mil) {
      Motor.desativarModo7mil();
      toast('Modo R$7 mil desativado.');
    } else {
      Motor.ativarModo7mil();
      toast('Modo R$7 mil ativado. Orçamento em R$7.000.');
    }
    App.atualizar();
  },

  /* ------------------------------------------------------ documentos */

  salvarDocumento() {
    const titulo = $('#d-titulo').value.trim();
    if (!titulo) {
      toast('Preciso de um título.');
      return;
    }
    Store.estado.documentos.unshift({
      id: novoId('doc'),
      tipo: $('#d-tipo').value,
      titulo,
      valor: Number($('#d-valor').value) || 0,
      vencimento: $('#d-vencimento').value || '',
      pontos: $('#d-pontos').value.split('\n').map((s) => s.trim()).filter(Boolean),
      data: new Date().toISOString(),
    });
    Store.registrarHistorico('Documento registrado', titulo);
    Store.salvar();
    fecharGaveta();
    App.atualizar();
  },

  removerDocumento(id) {
    if (!confirm('Remover este documento?')) return;
    Store.estado.documentos = Store.estado.documentos.filter((x) => x.id !== id);
    Store.salvar();
    App.atualizar();
  },

  /* ------------------------------------------------------- assistente */

  perguntar(textoDireto) {
    const input = $('#chat-input');
    const texto = (textoDireto || (input ? input.value : '')).trim();
    if (!texto) return;
    if (input) input.value = '';

    Store.estado._chat = Store.estado._chat || [];
    Store.estado._chat.push({ quem: 'eu', texto });

    const resposta = Assistente.responder(texto);
    Store.estado._chat.push({ quem: 'ia', texto: resposta.texto, acoes: resposta.acoes });

    Store.registrarHistorico('Pergunta ao assistente', texto.slice(0, 80));
    Telas.pos_assistente();
  },

  /* ---------------------------------------------------------- dados */

  exportar() {
    const blob = new Blob([Store.exportar()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `noiva-inteligente-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Backup gerado.');
  },

  importar(input) {
    const arquivo = input.files[0];
    if (!arquivo) return;
    const leitor = new FileReader();
    leitor.onload = () => {
      try {
        Store.importar(leitor.result);
        toast('Dados importados.');
        App.ir('dashboard');
      } catch (e) {
        toast('Não consegui ler esse arquivo.');
      }
    };
    leitor.readAsText(arquivo);
  },

  resetar() {
    if (!confirm('Isso apaga todo o seu planejamento. Tem certeza?')) return;
    Store.resetar();
    location.reload();
  },
};
