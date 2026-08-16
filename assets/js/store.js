/*
 * NOIVA INTELIGENTE — Estado da aplicação (localStorage)
 *
 * MÚLTIPLOS PERFIS, SEM SERVIDOR
 *
 * O localStorage já isola por aparelho e por navegador: duas noivas, cada
 * uma no próprio celular, nunca se veem. O caso que faltava era o de duas
 * pessoas no MESMO aparelho — uma sobrescrevia a outra.
 *
 * A solução aqui não precisa de backend nem de cadastro: cada perfil grava
 * na sua própria chave, e um índice guarda a lista e qual está ativo.
 *
 *   noiva-inteligente:perfis        índice  [{ id, nome, criadoEm, visto }]
 *   noiva-inteligente:perfil-ativo  id do perfil em uso
 *   noiva-inteligente:v1:<id>       estado completo daquele perfil
 *
 * O que isso resolve: várias pessoas no mesmo aparelho, e a mesma pessoa
 * mantendo cenários separados. O que NÃO resolve: sincronizar entre
 * aparelhos — para isso seria preciso identificar a pessoa em algum
 * servidor, e é exatamente o que decidimos não ter. A ponte continua sendo
 * o backup manual em Ajustes.
 */

const CHAVE_PERFIS = 'noiva-inteligente:perfis';
const CHAVE_ATIVO = 'noiva-inteligente:perfil-ativo';
const CHAVE_LEGADO = 'noiva-inteligente:v1';

function chaveEstado(id) {
  return `${CHAVE_LEGADO}:${id}`;
}

function estadoInicial() {
  return {
    versao: 1,
    onboardingConcluido: false,
    perfil: {
      nomeNoiva: '',
      orcamentoTotal: 0,
      disponivelHoje: 0,
      poupancaMensal: 0,
      dataCasamento: '',
      dataDefinida: false,
      mesesEstimados: 12,
      cidade: '',
      nivelRegiao: 'medio',
      convidados: 80,
      periodo: 'noite',
      diaSemana: 'sabado',
      estilo: 'classico',
      padrao: 'medio',
      aceitaDiy: true,
      aceitaAluguel: true,
      aceitaUsado: true,
      aceitaLocalAlternativo: true,
      recebeAjuda: false,
      ajudaDescricao: '',
      restricoes: '',
      tresSonhos: ['', '', ''],
      simplificaveis: [],
    },
    config: {
      margemSeguranca: 10, // percentual — configurável, nunca apresentado como regra universal
      modo7mil: false,
    },
    prioridades: {},      // { categoriaId: 1..10 }
    categoriasAtivas: {}, // { categoriaId: true|false }
    orcamento: {},        // { categoriaId: { planejado, contratado, observacoes } }
    despesas: [],         // { id, categoria, descricao, valor, tipo:'contratado'|'pago', data, vencimento, parcelas, fornecedorId, observacoes }
    fornecedores: [],     // ver criarFornecedor()
    missoes: {},          // { missaoId: { status, economiaConfirmada, nota } }
    tarefas: {},          // { tarefaId: { feita, notas } }
    cenarios: [],         // { id, nome, params }
    documentos: [],       // { id, tipo, titulo, fornecedorId, valor, vencimento, pontos[], data }
    economia: {
      registros: [],      // { id, tipo:'economizado'|'potencial'|'evitado', valor, descricao, origem, data }
    },
    historico: [],        // { data, evento, detalhe }
  };
}

const Store = {
  estado: estadoInicial(),

  perfilAtivoId: null,

  /* ------------------------------------------------------------ perfis */

  listarPerfis() {
    try {
      return JSON.parse(localStorage.getItem(CHAVE_PERFIS) || '[]');
    } catch (e) {
      return [];
    }
  },

  gravarPerfis(lista) {
    localStorage.setItem(CHAVE_PERFIS, JSON.stringify(lista));
  },

  perfilAtivo() {
    return this.listarPerfis().find((p) => p.id === this.perfilAtivoId) || null;
  },

  /*
   * Migração: quem já usava o app tem os dados na chave antiga, sem perfil.
   * Esse estado vira o primeiro perfil, sem perder nada e sem pedir nada.
   */
  migrarLegado() {
    const antigo = localStorage.getItem(CHAVE_LEGADO);
    if (!antigo || this.listarPerfis().length) return;
    const id = novoId('perfil');
    localStorage.setItem(chaveEstado(id), antigo);
    this.gravarPerfis([{ id, nome: 'Meu casamento', criadoEm: new Date().toISOString(), visto: new Date().toISOString() }]);
    localStorage.setItem(CHAVE_ATIVO, id);
    localStorage.removeItem(CHAVE_LEGADO);
  },

  criarPerfil(nome) {
    const id = novoId('perfil');
    const lista = this.listarPerfis();
    lista.push({ id, nome: (nome || '').trim() || `Casamento ${lista.length + 1}`, criadoEm: new Date().toISOString(), visto: new Date().toISOString() });
    this.gravarPerfis(lista);
    localStorage.setItem(chaveEstado(id), JSON.stringify(estadoInicial()));
    return id;
  },

  trocarPerfil(id) {
    if (!this.listarPerfis().some((p) => p.id === id)) return false;
    localStorage.setItem(CHAVE_ATIVO, id);
    this.carregar();
    return true;
  },

  renomearPerfil(id, nome) {
    const lista = this.listarPerfis();
    const p = lista.find((x) => x.id === id);
    if (!p) return;
    p.nome = (nome || '').trim() || p.nome;
    this.gravarPerfis(lista);
  },

  excluirPerfil(id) {
    const lista = this.listarPerfis().filter((p) => p.id !== id);
    this.gravarPerfis(lista);
    localStorage.removeItem(chaveEstado(id));
    if (this.perfilAtivoId === id) {
      const proximo = lista[0] ? lista[0].id : this.criarPerfil('Meu casamento');
      localStorage.setItem(CHAVE_ATIVO, proximo);
      this.carregar();
    }
  },

  /* ----------------------------------------------------------- estado */

  carregar() {
    this.migrarLegado();
    let lista = this.listarPerfis();
    if (!lista.length) {
      const id = this.criarPerfil('Meu casamento');
      localStorage.setItem(CHAVE_ATIVO, id);
      lista = this.listarPerfis();
    }
    this.perfilAtivoId = localStorage.getItem(CHAVE_ATIVO);
    if (!lista.some((p) => p.id === this.perfilAtivoId)) {
      this.perfilAtivoId = lista[0].id;
      localStorage.setItem(CHAVE_ATIVO, this.perfilAtivoId);
    }

    this.estado = estadoInicial();
    try {
      const bruto = localStorage.getItem(chaveEstado(this.perfilAtivoId));
      if (bruto) {
        const salvo = JSON.parse(bruto);
        this.estado = Object.assign(estadoInicial(), salvo);
        // mescla profunda dos objetos aninhados principais
        this.estado.perfil = Object.assign(estadoInicial().perfil, salvo.perfil || {});
        this.estado.config = Object.assign(estadoInicial().config, salvo.config || {});
        this.estado.economia = Object.assign(estadoInicial().economia, salvo.economia || {});
      }
    } catch (e) {
      console.warn('Não foi possível carregar os dados salvos.', e);
    }
    this.garantirDefaults();
    return this.estado;
  },

  garantirDefaults() {
    const e = this.estado;
    CATEGORIAS.forEach((c) => {
      if (e.prioridades[c.id] === undefined) e.prioridades[c.id] = 5;
      if (e.categoriasAtivas[c.id] === undefined) e.categoriasAtivas[c.id] = true;
      if (!e.orcamento[c.id]) e.orcamento[c.id] = { planejado: null, observacoes: '' };
    });
  },

  salvar() {
    try {
      localStorage.setItem(chaveEstado(this.perfilAtivoId), JSON.stringify(this.estado));
      /* carimba o último acesso, para a lista de perfis mostrar o mais recente */
      const lista = this.listarPerfis();
      const p = lista.find((x) => x.id === this.perfilAtivoId);
      if (p) {
        p.visto = new Date().toISOString();
        this.gravarPerfis(lista);
      }
    } catch (e) {
      console.warn('Não foi possível salvar.', e);
    }
    document.dispatchEvent(new CustomEvent('estado:alterado'));
  },

  registrarHistorico(evento, detalhe) {
    this.estado.historico.unshift({ data: new Date().toISOString(), evento, detalhe: detalhe || '' });
    this.estado.historico = this.estado.historico.slice(0, 120);
  },

  /* Apaga só o perfil ativo. Os outros continuam intactos. */
  resetar() {
    this.estado = estadoInicial();
    this.garantirDefaults();
    this.salvar();
  },

  exportar() {
    return JSON.stringify(this.estado, null, 2);
  },

  importar(texto) {
    const dados = JSON.parse(texto);
    if (!dados || typeof dados !== 'object') throw new Error('Arquivo inválido.');
    this.estado = Object.assign(estadoInicial(), dados);
    this.garantirDefaults();
    this.salvar();
  },
};

function novoId(prefixo) {
  return `${prefixo}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
