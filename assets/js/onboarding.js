/*
 * NOIVA INTELIGENTE — Onboarding conversacional
 * Ao final, gera MEU PLANO INTELIGENTE: orçamento recomendado, distribuição,
 * prioridades, formato sugerido, cronograma, primeiras 5 ações, alertas,
 * meta mensal e projeção.
 */

const CATEGORIAS_PRIORIZAVEIS = [
  'local', 'alimentacao', 'bebidas', 'decoracao', 'flores', 'vestido',
  'fotografia', 'filmagem', 'musica', 'bolo', 'doces', 'beleza',
  'lembrancinhas', 'convites', 'transporte', 'traje',
];

const Onboarding = {
  indice: 0,
  rascunho: null,

  iniciar() {
    this.rascunho = JSON.parse(JSON.stringify(Store.estado.perfil));
    this.rascunho.prioridadesTop = [];
    this.rascunho.simplificaveis = this.rascunho.simplificaveis || [];
    this.indice = 0;
    this.render();
  },

  passos() {
    return [
      /* 0 */ {
        id: 'intro',
        render: () => `
          <div style="text-align:center;padding:24px 6px 10px">
            ${ilustracaoCapa()}
            <h1 style="margin-bottom:10px">Vamos transformar o seu orçamento em um plano de casamento.</h1>
            <p style="color:var(--grafite);font-size:14.5px">
              Em poucos minutos eu monto a distribuição da sua verba, o cronograma, as primeiras ações
              e as estratégias que fazem sentido para o <em>seu</em> casamento — não para um casamento genérico.
            </p>
            <div class="card card-destaque" style="text-align:left;margin-top:18px">
              <div class="card-titulo">O que eu preciso saber</div>
              <p class="card-sub" style="margin:0">
                Quanto você tem, quando pretende casar, quantas pessoas você quer receber
                e — o mais importante — o que é <strong>inegociável</strong> para você.
              </p>
            </div>
          </div>`,
        valido: () => true,
        salvar: () => {},
      },

      /* 1 */ this.passoMoeda('orcamentoTotal', 'Qual é o seu orçamento máximo?', 'O valor total que você pretende gastar com o casamento inteiro. Pode ser uma estimativa — dá para ajustar depois.'),

      /* 2 */ this.passoMoeda('disponivelHoje', 'Quanto você já tem disponível hoje?', 'Dinheiro já guardado e reservado para o casamento.'),

      /* 3 */ this.passoMoeda('poupancaMensal', 'Quanto vocês conseguem guardar por mês?', 'Seja realista. É esse número que eu uso para dizer se o plano fecha ou não.'),

      /* 4 */ {
        id: 'dataDefinida',
        pergunta: 'A data já está definida?',
        contexto: 'Se ainda estiver em aberto, a data vira uma ferramenta de negociação muito forte.',
        render: () => `
          <button class="opcao ${this.rascunho.dataDefinida ? 'ativo' : ''}" data-v="1" onclick="Onboarding.escolher(this)">
            <span class="opcao-ic">${icone("calendario", 20)}</span><span><strong>Sim, já temos data</strong><span class="desc">Vou montar o cronograma a partir dela</span></span>
          </button>
          <button class="opcao ${!this.rascunho.dataDefinida ? 'ativo' : ''}" data-v="0" onclick="Onboarding.escolher(this)">
            <span class="opcao-ic">${icone("folha", 20)}</span><span><strong>Ainda não</strong><span class="desc">Tenho uma janela aproximada em mente</span></span>
          </button>`,
        valido: () => true,
        salvar: () => {
          const sel = $('.opcao.ativo');
          this.rascunho.dataDefinida = sel ? sel.dataset.v === '1' : false;
        },
      },

      /* 5 */ {
        id: 'quando',
        pergunta: 'Quando vocês pretendem casar?',
        contexto: 'A data define o cronograma inteiro e o quanto você ainda consegue poupar até lá.',
        render: () => {
          if (this.rascunho.dataDefinida) {
            return `
              <div class="campo">
                <label>Data do casamento</label>
                <input type="date" id="ob-data" value="${escapar(this.rascunho.dataCasamento || '')}">
              </div>
              <div class="campo">
                <label>Dia da semana pretendido</label>
                <select id="ob-dia">${selectOpcoes(DIAS_SEMANA, this.rascunho.diaSemana)}</select>
              </div>`;
          }
          return `
            <div class="campo">
              <label>Em quantos meses, aproximadamente?</label>
              <input type="number" id="ob-meses" min="1" max="60" value="${this.rascunho.mesesEstimados || 12}">
              <p class="ajuda">Uso esse número para calcular sua meta mensal de poupança.</p>
            </div>
            <div class="campo">
              <label>Dia da semana que vocês preferem</label>
              <select id="ob-dia">${selectOpcoes(DIAS_SEMANA, this.rascunho.diaSemana)}</select>
              <p class="ajuda">Sábado costuma ter menos margem de negociação que domingo ou sexta.</p>
            </div>`;
        },
        valido: () => {
          if (this.rascunho.dataDefinida) return !!$('#ob-data').value;
          return Number($('#ob-meses').value) > 0;
        },
        salvar: () => {
          if (this.rascunho.dataDefinida) {
            this.rascunho.dataCasamento = $('#ob-data').value;
            const d = new Date(this.rascunho.dataCasamento + 'T12:00:00');
            const hoje = new Date();
            this.rascunho.mesesEstimados = Math.max(0, (d.getFullYear() - hoje.getFullYear()) * 12 + (d.getMonth() - hoje.getMonth()));
          } else {
            this.rascunho.mesesEstimados = Number($('#ob-meses').value);
            this.rascunho.dataCasamento = '';
          }
          this.rascunho.diaSemana = $('#ob-dia').value;
        },
      },

      /* 6 */ {
        id: 'local',
        pergunta: 'Em qual cidade ou região será o casamento?',
        contexto: 'Preços variam muito entre regiões. Eu não assumo que a sua cidade custa igual a nenhuma outra — quem calibra isso é você.',
        render: () => `
          <div class="campo">
            <label>Cidade / região</label>
            <input type="text" id="ob-cidade" placeholder="Ex.: interior de Minas" value="${escapar(this.rascunho.cidade || '')}">
          </div>
          <div class="campo">
            <label>Como você avalia o custo de vida da sua região?</label>
            <p class="ajuda">Isso calibra as minhas estimativas. Não é um dado de mercado — é a sua leitura.</p>
            ${NIVEL_REGIAO.map(
              (n) => `<button class="opcao ${this.rascunho.nivelRegiao === n.id ? 'ativo' : ''}" data-v="${n.id}" onclick="Onboarding.escolher(this)">
                <span class="opcao-ic">${icone(n.id === 'baixo' ? 'folha' : n.id === 'medio' ? 'local' : 'diamante', 20)}</span>
                <span><strong>${n.nome}</strong></span></button>`
            ).join('')}
          </div>`,
        valido: () => true,
        salvar: () => {
          this.rascunho.cidade = $('#ob-cidade').value.trim();
          const sel = $('.opcao.ativo');
          if (sel) this.rascunho.nivelRegiao = sel.dataset.v;
        },
      },

      /* 7 */ {
        id: 'convidados',
        pergunta: 'Quantos convidados, aproximadamente?',
        contexto: 'Esse é o número que mais mexe no seu orçamento. Ele multiplica comida, bebida, bolo, convites, lembrancinhas e até o tamanho do espaço.',
        render: () => `
          <div style="text-align:center;margin:10px 0 4px">
            <div class="numero-grande" id="ob-conv-label">${this.rascunho.convidados || 80}</div>
            <div class="rotulo">convidados</div>
          </div>
          <input type="range" id="ob-conv" min="10" max="400" step="5" value="${this.rascunho.convidados || 80}"
                 oninput="document.getElementById('ob-conv-label').textContent=this.value">
          <div style="display:flex;justify-content:space-between;font-size:11.5px;color:var(--neblina);margin-top:2px">
            <span>10</span><span>400</span>
          </div>
          <div class="alerta info" style="margin-top:16px">
            <span class="ic">${icone("info", 16)}</span>
            <span>Casamentos intimistas concentram o orçamento em menos pessoas e costumam elevar a qualidade percebida de tudo.</span>
          </div>`,
        valido: () => true,
        salvar: () => {
          this.rascunho.convidados = Number($('#ob-conv').value);
        },
      },

      /* 8 */ {
        id: 'periodo',
        pergunta: 'O casamento será de manhã, tarde ou noite?',
        contexto: 'O horário muda cardápio, consumo de bebida, iluminação e até a duração da festa.',
        render: () =>
          PERIODOS.map(
            (p) => `<button class="opcao ${this.rascunho.periodo === p.id ? 'ativo' : ''}" data-v="${p.id}" onclick="Onboarding.escolher(this)">
              <span class="opcao-ic">${icone(p.id === 'manha' ? 'amanhecer' : p.id === 'tarde' ? 'sol' : 'lua', 20)}</span>
              <span><strong>${p.nome}</strong><span class="desc">${
                p.id === 'manha' ? 'Brunch, luz natural, consumo de bebida menor' : p.id === 'tarde' ? 'Almoço ou chá, clima leve' : 'Jantar completo e pista de dança'
              }</span></span></button>`
          ).join(''),
        valido: () => true,
        salvar: () => {
          const sel = $('.opcao.ativo');
          if (sel) this.rascunho.periodo = sel.dataset.v;
        },
      },

      /* 9 */ {
        id: 'estilo',
        pergunta: 'Qual estilo você deseja?',
        contexto: 'O estilo define o padrão estético esperado — e, com ele, boa parte do custo da decoração e do local.',
        render: () => `<div class="chips" style="margin-bottom:14px">
            ${ESTILOS.map((e) => `<button class="chip ${this.rascunho.estilo === e.id ? 'ativo' : ''}" data-v="${e.id}" onclick="Onboarding.escolherChip(this)">${e.nome}</button>`).join('')}
          </div>
          <div class="campo">
            <label>Que padrão de execução combina com vocês?</label>
            ${PADRAO_EXECUCAO.map(
              (p) => `<button class="opcao ${this.rascunho.padrao === p.id ? 'ativo' : ''}" data-p="${p.id}" onclick="Onboarding.escolherPadrao(this)">
                <span class="opcao-ic">${icone(p.id === 'baixo' ? 'folha' : p.id === 'medio' ? 'balanca' : 'diamante', 20)}</span>
                <span><strong>${p.nome}</strong><span class="desc">${p.desc}</span></span></button>`
            ).join('')}
          </div>`,
        valido: () => true,
        salvar: () => {
          const chip = $('.chip.ativo');
          if (chip) this.rascunho.estilo = chip.dataset.v;
          const op = $('.opcao.ativo');
          if (op) this.rascunho.padrao = op.dataset.p;
        },
      },

      /* 10 */ {
        id: 'prioridades',
        pergunta: 'Quais são as suas 3 maiores prioridades?',
        contexto: 'Escolha até 3. Enquanto existir alternativa em categoria de baixa prioridade, eu nunca vou sugerir cortar aqui.',
        render: () => `<div class="chips">
            ${CATEGORIAS_PRIORIZAVEIS.map((id) => {
              const c = Motor.categoria(id);
              const ativo = this.rascunho.prioridadesTop.includes(id);
              return `<button class="chip ${ativo ? 'ativo' : ''}" data-v="${id}" onclick="Onboarding.alternarPrioridade(this)">${c.icone} ${c.nome}</button>`;
            }).join('')}
          </div>
          <p class="ajuda" id="ob-prio-msg" style="margin-top:12px">${this.rascunho.prioridadesTop.length}/3 selecionadas</p>`,
        valido: () => this.rascunho.prioridadesTop.length > 0,
        salvar: () => {},
      },

      /* 11 */ {
        id: 'simplificaveis',
        pergunta: 'O que pode ser simplificado sem dor?',
        contexto: 'É aqui que eu vou procurar folga antes de encostar em qualquer coisa que você marcou como prioridade.',
        render: () => `<div class="chips">
            ${CATEGORIAS_PRIORIZAVEIS.filter((id) => !this.rascunho.prioridadesTop.includes(id))
              .map((id) => {
                const c = Motor.categoria(id);
                const ativo = this.rascunho.simplificaveis.includes(id);
                return `<button class="chip ${ativo ? 'ativo' : ''}" data-v="${id}" onclick="Onboarding.alternarSimplificavel(this)">${c.icone} ${c.nome}</button>`;
              })
              .join('')}
          </div>
          <p class="ajuda" style="margin-top:12px">Pode marcar quantas quiser — ou nenhuma.</p>`,
        valido: () => true,
        salvar: () => {},
      },

      /* 12 */ {
        id: 'preferencias',
        pergunta: 'O que vocês aceitam colocar na mesa?',
        contexto: 'Eu só recomendo estratégias que respeitem essas respostas. Se você marcar não, eu não insisto.',
        render: () => `
          <div class="card">
            ${this.toggle('aceitaDiy', 'Aceito fazer coisas por conta (DIY)', 'Decoração, lembrancinhas, convites')}
            ${this.toggle('aceitaAluguel', 'Aceito alugar em vez de comprar', 'Vestido, terno, decoração, mobiliário')}
            ${this.toggle('aceitaUsado', 'Aceito itens usados ou seminovos', 'Vestido, decoração, acessórios')}
            ${this.toggle('aceitaLocalAlternativo', 'Aceito local alternativo', 'Casa, sítio, restaurante, espaço não convencional')}
          </div>`,
        valido: () => true,
        salvar: () => {
          ['aceitaDiy', 'aceitaAluguel', 'aceitaUsado', 'aceitaLocalAlternativo'].forEach((k) => {
            const el = $('#ob-' + k);
            if (el) this.rascunho[k] = el.checked;
          });
        },
      },

      /* 13 */ {
        id: 'apoio',
        pergunta: 'Vocês já têm fornecedores ou ajuda garantida?',
        contexto: 'Fornecedor já fechado sai do rateio pelo valor real. Ajuda de família só conta quando tem nome, prazo e escopo.',
        render: () => `
          <div class="campo">
            <label>Fornecedores já contratados</label>
            <p class="ajuda">Só os nomes, para eu lembrar. Você cadastra os valores depois em Fornecedores.</p>
            <textarea id="ob-fornecedores" placeholder="Ex.: fotógrafo (amigo), buffet da tia Márcia">${escapar(this.rascunho.fornecedoresTexto || '')}</textarea>
          </div>
          <div class="card">
            ${this.toggle('recebeAjuda', 'Vamos receber ajuda de família ou amigos', 'Financeira ou em serviços')}
          </div>
          <div class="campo" style="margin-top:12px">
            <label>Se sim, o que exatamente?</label>
            <textarea id="ob-ajuda" placeholder="Ex.: minha mãe faz os doces; meu tio empresta o sítio">${escapar(this.rascunho.ajudaDescricao || '')}</textarea>
          </div>`,
        valido: () => true,
        salvar: () => {
          this.rascunho.fornecedoresTexto = $('#ob-fornecedores').value.trim();
          this.rascunho.recebeAjuda = $('#ob-recebeAjuda').checked;
          this.rascunho.ajudaDescricao = $('#ob-ajuda').value.trim();
        },
      },

      /* 14 */ {
        id: 'restricoes',
        pergunta: 'Existe alguma restrição importante?',
        contexto: 'Restrições alimentares, mobilidade, religião, clima, distância, prazos — qualquer coisa que eu precise respeitar.',
        render: () => `
          <div class="campo">
            <textarea id="ob-restricoes" placeholder="Ex.: cerimônia religiosa obrigatória; avó com dificuldade de locomoção; convidados vindo de outro estado" style="min-height:110px">${escapar(this.rascunho.restricoes || '')}</textarea>
          </div>
          <p class="ajuda">Pode deixar em branco se não houver.</p>`,
        valido: () => true,
        salvar: () => {
          this.rascunho.restricoes = $('#ob-restricoes').value.trim();
        },
      },

      /* 15 — pergunta obrigatória */ {
        id: 'sonhos',
        pergunta: 'Se você pudesse escolher apenas 3 coisas para ficarem exatamente como sonhou, quais seriam?',
        contexto: 'Essa é a pergunta que mais importa aqui dentro. Tudo que eu recomendar vai ser construído para proteger essas três coisas.',
        render: () => `
          ${[0, 1, 2]
            .map(
              (i) => `<div class="campo">
                <label>${i + 1}ª</label>
                <input type="text" id="ob-sonho-${i}" placeholder="${['Ex.: as fotos', 'Ex.: o vestido', 'Ex.: a comida'][i]}" value="${escapar((this.rascunho.tresSonhos || [])[i] || '')}">
              </div>`
            )
            .join('')}
          <div class="alerta info"><span class="ic">${icone("coracao", 16)}</span><span>Não precisa ser uma categoria. Pode ser "minha avó presente" ou "chegar sem dívida".</span></div>`,
        valido: () => {
          const v = [0, 1, 2].map((i) => $('#ob-sonho-' + i).value.trim()).filter(Boolean);
          return v.length >= 1;
        },
        salvar: () => {
          this.rascunho.tresSonhos = [0, 1, 2].map((i) => $('#ob-sonho-' + i).value.trim());
        },
      },
    ];
  },

  /* ---------------------------------------------------------- passos genéricos */

  passoMoeda(campo, pergunta, contexto) {
    return {
      id: campo,
      pergunta,
      contexto,
      render: () => `
        <div class="campo">
          <label>Valor em reais</label>
          <input type="number" id="ob-${campo}" inputmode="numeric" min="0" step="100"
                 placeholder="0" value="${this.rascunho[campo] || ''}">
        </div>
        ${campo === 'orcamentoTotal' ? '<p class="ajuda">Se ainda não faz ideia, coloque um número aproximado. Eu recalculo tudo quando você mudar.</p>' : ''}`,
      valido: () => (campo === 'orcamentoTotal' ? Number($('#ob-' + campo).value) > 0 : true),
      salvar: () => {
        this.rascunho[campo] = Number($('#ob-' + campo).value) || 0;
      },
    };
  },

  toggle(chave, titulo, sub) {
    return `<label class="toggle">
      <span class="txt">${titulo}<small>${sub}</small></span>
      <span class="switch"><input type="checkbox" id="ob-${chave}" ${this.rascunho[chave] ? 'checked' : ''}><span class="trilho"></span></span>
    </label>`;
  },

  /* ---------------------------------------------------------- interações */

  escolher(btn) {
    $$('.opcao').forEach((b) => b.classList.remove('ativo'));
    btn.classList.add('ativo');
  },

  escolherPadrao(btn) {
    $$('.opcao[data-p]').forEach((b) => b.classList.remove('ativo'));
    btn.classList.add('ativo');
  },

  escolherChip(btn) {
    $$('.chip').forEach((b) => b.classList.remove('ativo'));
    btn.classList.add('ativo');
  },

  alternarPrioridade(btn) {
    const id = btn.dataset.v;
    const lista = this.rascunho.prioridadesTop;
    const i = lista.indexOf(id);
    if (i >= 0) lista.splice(i, 1);
    else {
      if (lista.length >= 3) {
        toast('Escolha no máximo 3. Se tudo é prioridade, nada é.');
        return;
      }
      lista.push(id);
    }
    btn.classList.toggle('ativo');
    const msg = $('#ob-prio-msg');
    if (msg) msg.textContent = `${lista.length}/3 selecionadas`;
  },

  alternarSimplificavel(btn) {
    const id = btn.dataset.v;
    const lista = this.rascunho.simplificaveis;
    const i = lista.indexOf(id);
    if (i >= 0) lista.splice(i, 1);
    else lista.push(id);
    btn.classList.toggle('ativo');
  },

  /* ------------------------------------------------------------ render */

  render() {
    const passos = this.passos();
    const passo = passos[this.indice];
    const progresso = (this.indice / (passos.length - 1)) * 100;

    $('#tela-onboarding').innerHTML = `
      <div class="topo">
        <div class="topo-linha">
          <div class="marca">
            <div class="marca-simbolo">${icone("anel", 18)}</div>
            <div class="marca-nome">Noiva Inteligente</div>
          </div>
          <div class="sub">${this.indice}/${passos.length - 1}</div>
        </div>
        <div class="ob-progresso"><span style="width:${progresso}%"></span></div>
      </div>
      <div class="ob-passo">
        ${passo.pergunta ? `<div class="ob-pergunta">${passo.pergunta}</div>` : ''}
        ${passo.contexto ? `<div class="ob-contexto">${passo.contexto}</div>` : ''}
        ${passo.render()}
      </div>
      <div class="ob-rodape">
        ${this.indice > 0 ? '<button class="btn btn-contorno" onclick="Onboarding.voltar()">Voltar</button>' : ''}
        <button class="btn btn-primario" style="flex:1" onclick="Onboarding.avancar()">
          ${this.indice === 0 ? 'Começar' : this.indice === passos.length - 1 ? 'Gerar meu plano' : 'Continuar'}
        </button>
      </div>`;
    window.scrollTo(0, 0);
  },

  avancar() {
    const passos = this.passos();
    const passo = passos[this.indice];
    if (!passo.valido()) {
      toast('Preciso dessa resposta para seguir.');
      return;
    }
    passo.salvar();
    if (this.indice === passos.length - 1) {
      this.concluir();
      return;
    }
    this.indice++;
    this.render();
  },

  voltar() {
    const passos = this.passos();
    // salva o que já foi preenchido, sem validar
    try { passos[this.indice].salvar(); } catch (e) {}
    this.indice = Math.max(0, this.indice - 1);
    this.render();
  },

  /* -------------------------------------------------------- conclusão */

  concluir() {
    const e = Store.estado;
    e.perfil = Object.assign(e.perfil, this.rascunho);

    // Traduz as escolhas em prioridades numéricas de 1 a 10
    CATEGORIAS.forEach((c) => {
      e.prioridades[c.id] = 5;
    });
    const top = this.rascunho.prioridadesTop || [];
    top.forEach((id, i) => {
      e.prioridades[id] = i === 0 ? 10 : 9;
    });
    (this.rascunho.simplificaveis || []).forEach((id) => {
      e.prioridades[id] = 3;
    });
    // categorias estruturais nunca ficam abaixo de 5
    ['local', 'alimentacao', 'documentacao'].forEach((id) => {
      if (!top.includes(id) && !(this.rascunho.simplificaveis || []).includes(id)) e.prioridades[id] = Math.max(e.prioridades[id], 6);
    });

    e.onboardingConcluido = true;
    Store.registrarHistorico('Onboarding concluído', `Orçamento ${formatarMoeda(e.perfil.orcamentoTotal)}, ${e.perfil.convidados} convidados`);
    Store.salvar();

    $('#tela-onboarding').classList.remove('ativa');
    $('#nav').style.display = 'flex';
    App.ir('plano');
  },
};
