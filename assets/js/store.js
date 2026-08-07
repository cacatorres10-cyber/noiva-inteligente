/* NOIVA INTELIGENTE — Estado da aplicação (localStorage) */

const STORAGE_KEY = 'noiva-inteligente:v1';

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

  carregar() {
    try {
      const bruto = localStorage.getItem(STORAGE_KEY);
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.estado));
    } catch (e) {
      console.warn('Não foi possível salvar.', e);
    }
    document.dispatchEvent(new CustomEvent('estado:alterado'));
  },

  registrarHistorico(evento, detalhe) {
    this.estado.historico.unshift({ data: new Date().toISOString(), evento, detalhe: detalhe || '' });
    this.estado.historico = this.estado.historico.slice(0, 120);
  },

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
