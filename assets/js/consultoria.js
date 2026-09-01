/*
 * NOIVA INTELIGENTE — Camada de consultoria
 *
 * O assistente já sabia responder sobre dinheiro: quanto guardar, se cabe,
 * onde economizar. Tudo a partir dos números dela. O que faltava era a outra
 * metade do trabalho de uma assessoria — a parte que não é planilha.
 *
 * Levantamento do que uma assessoria de casamento entrega, e onde o
 * assistente estava mudo:
 *
 *   entrega da assessoria            o app tinha            aqui
 *   ------------------------------   --------------------   ----
 *   briefing / entrevista inicial    onboarding             —
 *   planejamento do orçamento        motor + distribuição   —
 *   curadoria de fornecedores        comparador de preço    como avaliar
 *   acompanhamento de contratos      registro de valores    quais cláusulas
 *   criação do cronograma            31 tarefas por fase    —
 *   coordenação no dia               nada                   roteiro do dia
 *   gestão de imprevistos            nada                   plano B
 *   fluxo de comunicação             nada                   —
 *
 * E o que as noivas de fato perguntam, que é mais emocional que financeiro:
 * cortar a lista dói e sempre sobra alguém; dinheiro é a fonte número um de
 * atrito com a família; metade gasta mais do que planejou; e o maior
 * arrependimento relatado depois da festa não é ter gastado demais — é não
 * ter aproveitado o próprio casamento.
 *
 * Cada tópico segue as mesmas regras do resto do produto: não inventa preço,
 * não inventa fornecedor, não inventa lei, não julga, não culpa. Onde entra
 * número, o número é o dela.
 */

/* Sem acento e em minúscula: a pessoa digita "orcamento" e "orçamento", e
   escrever as duas formas em cada gatilho seria erro esperando acontecer. */
function semAcento(t) {
  return (t || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

const CONSULTORIA = [
  /* ---------------------------------------------------- lista e família */
  {
    id: 'lista-convidados',
    titulo: 'Cortar a lista de convidados',
    gatilhos: ['lista de convidado', 'cortar a lista', 'diminuir a lista', 'quem convidar',
      'quem eu convido', 'nao sei quem chamar', 'tirar gente', 'cortar gente', 'reduzir a lista',
      'lista', 'quantas pessoas chamar'],
    resposta: (c) => {
      const porPessoa = c.custoConvidado
        ? `No seu plano, cada convidado custa cerca de **${formatarMoeda(c.custoConvidado)}** entre comida, bebida, bolo, doces, convite, lembrancinha e a parte do local e da decoração que escala com gente.\n\nOu seja: cada dez nomes que saem da lista devolvem por volta de ${formatarMoeda(c.custoConvidado * 10)} para o resto do casamento. Não é para você cortar dez — é para você saber o que está comprando quando decide manter.`
        : 'Assim que você preencher orçamento e número de convidados eu te digo quanto custa cada nome da sua lista.';

      return `Essa é a parte mais difícil do planejamento inteiro, e não é você que está sendo dura — é a etapa que costuma doer em todo mundo.

${porPessoa}

**O método que funciona é cortar por critério, não por pessoa.** Escolher nome a nome é onde a culpa mora. Escolher uma regra e aplicar igual para todos tira o peso de cima de você:

_Círculo 1_ — quem você não consegue imaginar a cerimônia sem.
_Círculo 2_ — convivência real nos últimos dois anos.
_Círculo 3_ — quem você chamaria por obrigação social.

A lista de convidados do app tem esse campo em cada nome, e mostra quanto vale cada círculo em dinheiro. Comece pelo três. E o teste que resolve os casos difíceis: **se essa pessoa não puder vir, isso muda alguma coisa no seu dia?** Se a resposta demorar, ela é círculo três.

Duas armadilhas que eu vejo sempre: acompanhante automático para solteiro (isso dobra convidado silenciosamente) e criança sem regra definida. Decida os dois **antes** de mandar convite, porque depois de mandado não tem volta.`;
    },
    acoes: [
      { texto: 'Montar a lista por círculo', tela: 'convidados' },
      { texto: 'Simular com menos convidados', tela: 'cenarios' },
      { texto: 'E se a família não aceitar?', pergunta: 'Como lidar com a família sobre a lista de convidados?' },
    ],
  },

  {
    id: 'familia-conflito',
    titulo: 'Atrito com a família',
    gatilhos: ['minha mae quer', 'minha sogra', 'sogra', 'familia quer', 'briga com a familia',
      'atrito', 'conflito', 'meus pais querem', 'pressao da familia', 'familia', 'discussao',
      'nao concordam', 'querem convidar'],
    resposta: (c) => {
      const quemPaga = c.p.orcamentoTotal
        ? `Você tem **${formatarMoeda(c.p.orcamentoTotal)}** de orçamento. Esse número é o seu argumento — não a sua opinião contra a dela.`
        : '';

      return `Dinheiro e lista de convidados são as duas maiores fontes de atrito no planejamento, e quase nunca a briga é sobre o que parece ser. Ela é sobre quem decide.

${quemPaga}

**Separe as duas conversas.** "Quem escolhe" e "quem paga" são perguntas diferentes, e misturar as duas é o que transforma conversa em briga. Se alguém quer adicionar quinze nomes, a pergunta não é "por quê?" — é: _"cabem quinze pessoas a mais se a gente tirar de outro lugar. Você me ajuda a escolher de onde?"_

Isso muda a conversa de disputa para problema compartilhado, e costuma resolver sozinho.

**Se a família contribui financeiramente**, combine antes o que a contribuição compra: um número de convidados, uma categoria específica, ou nada em particular. Contribuição sem combinado vira cobrança depois, e a cobrança sempre chega na semana do casamento.

**E o limite.** Você não é obrigada a convidar todo mundo que conhece. Quem ficar chateado vai ficar chateado por algumas semanas. Uma dívida dura anos. Não é falta de educação escolher — é o único jeito de o casamento ser seu.`;
    },
    acoes: [
      { texto: 'Quanto custa cada convidado', pergunta: 'Quanto custa cada convidado no meu plano?' },
      { texto: 'Ver meu orçamento', tela: 'orcamento' },
    ],
  },

  /* ------------------------------------------------------- fornecedores */
  {
    id: 'escolher-fornecedor',
    titulo: 'Escolher um fornecedor',
    gatilhos: ['como escolher fornecedor', 'como avaliar', 'o que perguntar', 'devo perguntar',
      'perguntar a um fornecedor', 'perguntar para o fornecedor', 'perguntas para o fornecedor',
      'como saber se e bom', 'reuniao com fornecedor', 'visita', 'que perguntas fazer',
      'como contratar', 'escolher buffet', 'escolher fotografo', 'confiavel'],
    resposta: () => `Preço é a última coisa a olhar, não a primeira. Uma proposta barata que não inclui o que a cara inclui não é barata — é incompleta.

**O que perguntar em toda reunião, seja de qual categoria for:**

_"O que exatamente está incluso nesse valor?"_ — peça por escrito. É a pergunta que mais evita surpresa.
_"O que costuma virar custo extra?"_ — hora adicional, deslocamento, taxa de montagem, alimentação da equipe, gelo, louça, energia.
_"Quantos eventos você atende no mesmo fim de semana?"_ — quem atende três casamentos no mesmo sábado não vai dedicar a mesma atenção ao seu.
_"Quem estará lá no dia — você ou uma equipe?"_ — muito comum fechar com uma pessoa e ser atendida por outra.
_"Já aconteceu algum imprevisto? O que você fez?"_ — a resposta mostra mais do que qualquer portfólio. Quem nunca teve problema, ou tem pouca estrada, ou não está sendo sincero.
_"Como e com que frequência a gente se fala até o casamento?"_ — combinar o fluxo de comunicação agora evita ansiedade depois.

**Sobre portfólio:** todo mundo mostra o melhor trabalho. Peça para ver **um evento inteiro**, do começo ao fim, parecido com o seu em tamanho e orçamento. É aí que dá para ver a consistência real.

**A regra dos três.** Três propostas por categoria, sempre. Não para achar a mais barata — para você aprender o que é normal naquela categoria na sua cidade. Com uma proposta só você não tem parâmetro nenhum.`,
    acoes: [
      { texto: 'Comparar propostas', tela: 'fornecedores' },
      { texto: 'O que olhar no contrato', pergunta: 'O que eu devo olhar no contrato?' },
    ],
  },

  {
    id: 'contrato',
    titulo: 'Ler o contrato',
    gatilhos: ['contrato', 'clausula', 'assinar', 'multa', 'rescisao', 'cancelamento',
      'o que olhar no contrato', 'distrato', 'juridico', 'advogado'],
    resposta: () => `Eu não faço leitura jurídica e o que vem aqui **não substitui a avaliação de um advogado**. O que eu posso fazer é te apontar onde os problemas costumam estar escondidos.

**Sete pontos que valem uma leitura devagar:**

_1. O que está incluso, item por item._ Se não está escrito, não está contratado. Combinado por WhatsApp não vale na hora do aperto.
_2. Multa por cancelamento._ Dos dois lados. Muito contrato prevê multa se você desistir e nada se ele desistir.
_3. Prazo e horário exatos._ Que horas começa a montagem, que horas termina o serviço, quanto custa a hora extra e quem autoriza.
_4. Reajuste._ Contrato assinado com muita antecedência às vezes prevê correção de valor. Descubra o índice e a data.
_5. Substituição de equipe ou de produto._ O que acontece se o profissional que você escolheu não puder ir? E se o item combinado não estiver disponível?
_6. Forma de pagamento e o que cada parcela libera._ Sinal costuma não ser devolvido — confirme.
_7. Prazo de entrega do que vem depois._ Foto e vídeo principalmente: quantos dias, em que formato, quantos arquivos.

**Antes de assinar, uma pergunta prática:** peça para ele te mandar o contrato com antecedência, não na hora da reunião. Quem tem pressa para você assinar na mesa é exatamente de quem você deve desconfiar.

Registre valores, prazos e multas em **Documentos** — assim eu consigo te avisar de vencimento.`,
    acoes: [{ texto: 'Registrar um contrato', tela: 'documentos' }],
  },

  /* --------------------------------------------------------- o dia dele */
  {
    id: 'dia-do-casamento',
    titulo: 'O roteiro do dia',
    gatilhos: ['dia do casamento', 'roteiro do dia', 'cronograma do dia', 'como vai ser o dia',
      'timeline', 'ordem do dia', 'quem organiza no dia', 'horarios do dia'],
    resposta: () => `Essa é a parte que assessoria cobra caro para fazer, e é 100% fazível por você — desde que esteja no papel antes.

**Um roteiro do dia é uma folha só, com horário e responsável em cada linha.** Sem responsável nomeado, a linha não existe: alguém vai perguntar "e agora?" e vão todos olhar para você, vestida, no dia do seu casamento.

O esqueleto que funciona, de trás para frente a partir da hora da cerimônia:

_Manhã_ — entrega de decoração e flores, montagem do espaço, chegada do buffet.
_Meio-dia_ — cabelo e maquiagem começam. Reserve mais tempo do que o profissional disser.
_Duas horas antes_ — som testado, iluminação testada, tudo montado e conferido.
_Uma hora antes_ — fotos de making of, últimos ajustes, convidados começam a chegar.
_Cerimônia_ — entradas na ordem definida, com quem acompanha quem já combinado.
_Depois_ — cumprimentos, fotos oficiais, jantar, bolo, festa.

**Três nomes que precisam existir antes do dia:**
Quem **recebe os fornecedores** e confere se veio o que foi contratado. Quem carrega o **kit de emergência** e os documentos. Quem **paga** o que for pago no dia e guarda os recibos.

Nenhum dos três pode ser você nem o noivo. Podem ser padrinhos, irmãos ou amigos — só não podem ser vocês dois.

**E a única regra que importa:** quando o dia começar, ele já não é mais seu para resolver. Ele é seu para viver. O maior arrependimento que noiva relata depois não é ter gastado demais — é não ter aproveitado o próprio casamento por estar apagando incêndio.`,
    acoes: [
      { texto: 'Ver o cronograma', tela: 'cronograma' },
      { texto: 'E se der algo errado?', pergunta: 'E se acontecer um imprevisto no dia?' },
    ],
  },

  {
    id: 'imprevistos',
    titulo: 'Imprevistos e plano B',
    gatilhos: ['imprevisto', 'plano b', 'der errado', 'chuva', 'chover', 'furar', 'sumir',
      'atrasar', 'fornecedor nao aparecer', 'e se der problema', 'emergencia', 'kit de emergencia'],
    resposta: () => `Imprevisto vai acontecer. Gerenciar isso é literalmente o motivo pelo qual assessoria existe. A diferença entre um susto e um desastre é ter decidido antes.

**As quatro que mais acontecem, e o que resolve cada uma:**

_Chuva._ Se qualquer parte é ao ar livre, o plano B tem que estar contratado, não imaginado. Pergunte ao local: cabe todo mundo coberto? Quantas horas antes eu preciso avisar? Tem custo?
_Atraso em cadeia._ Cabelo atrasa, foto atrasa, cerimônia atrasa, buffet cobra hora extra. Coloque **trinta minutos de folga** entre os blocos do roteiro. É o item mais barato do casamento inteiro.
_Fornecedor que some._ Raro, mas acontece. Guarde o contato de dois nomes alternativos nas categorias críticas — som, foto e bolo. Não precisa contratar, só ter o telefone.
_Item errado ou faltando._ Por isso existe alguém conferindo a entrega contra o contrato, de manhã, enquanto ainda dá tempo de resolver.

**O kit de emergência** vive com alguém que não é você: linha e agulha na cor do vestido, alfinete de segurança, fita dupla face, lenço umedecido, analgésico, band-aid, esmalte incolor, carregador, um par de sapato confortável e uma garrafa de água.

E uma coisa que vale saber de antemão: **quase nada do que der errado vai ser notado pelos convidados.** Eles não viram o cronograma. Eles não sabem qual flor era para ter chegado. O que der errado só é grande dentro da sua cabeça.`,
    acoes: [{ texto: 'Ver o cronograma', tela: 'cronograma' }],
  },

  /* ------------------------------------------------------------- tempo */
  {
    id: 'quanto-tempo',
    titulo: 'Quanto tempo antes',
    gatilhos: ['quanto tempo antes', 'com quanto tempo', 'quando comecar', 'da tempo',
      'quanto tempo preciso', 'antecedencia', 'e tarde', 'comecei tarde', 'pouco tempo'],
    resposta: (c) => {
      const m = c.meses;
      let situacao;
      if (m === null || m === undefined) {
        situacao = 'Você ainda não me disse a data. Assim que disser, eu ajusto tudo isso para o seu tempo real.';
      } else if (m >= 10) {
        situacao = `Você tem **${m} meses**. É tempo confortável — dá para cotar com calma e negociar de verdade, que é onde o dinheiro é economizado.`;
      } else if (m >= 6) {
        situacao = `Você tem **${m} meses**. Dá, e dá bem. O que muda é que as decisões grandes — local, data e alimentação — precisam sair primeiro, porque são elas que travam todo o resto.`;
      } else if (m >= 3) {
        situacao = `Você tem **${m} meses**. É apertado, não é impossível. A partir daqui, vale mais fechar rápido o essencial do que procurar o preço perfeito: fornecedor livre em cima da hora costuma valer mais que desconto.`;
      } else {
        situacao = `Você tem **${m} ${m === 1 ? 'mês' : 'meses'}**. É corrida, e por isso a ordem importa mais do que nunca: data, local, alimentação e registro. O resto se ajusta ao que sobrar.`;
      }

      return `A referência que circula é de mais ou menos um ano. Mas isso é média, não regra — e nenhum casamento é a média.

${situacao}

**A ordem importa mais que o prazo.** Independentemente de quanto tempo você tem, é sempre a mesma sequência, porque cada item trava o seguinte:

_Primeiro:_ orçamento, número aproximado de convidados e data. Sem os três, nada mais pode ser decidido de verdade.
_Depois:_ local — é ele que define capacidade, o que já vem pronto e o que você vai ter que levar.
_Depois:_ alimentação e bebida, que são a maior fatia e dependem do local.
_Depois:_ o que tem agenda concorrida e não se repete — fotografia e filmagem.
_Por último:_ tudo que pode ser resolvido perto, que é a maior parte da lista.

**E o que não é verdade:** que começar tarde significa gastar mais. Significa ter menos opções para escolher. São coisas diferentes.`;
    },
    acoes: [{ texto: 'Ver o que fazer agora', tela: 'cronograma' }],
  },

  /* ----------------------------------------------------------- emoções */
  {
    id: 'ansiedade',
    titulo: 'Ansiedade e cansaço',
    gatilhos: ['ansiedade', 'ansiosa', 'estressada', 'estresse', 'cansada', 'nao aguento',
      'surtando', 'surto', 'chorando', 'perdida', 'travada', 'nao sei por onde', 'me ajuda',
      'to mal', 'desanimada', 'medo', 'inseguranca', 'vontade de desistir'],
    resposta: (c) => {
      const ancora = c.p.prioridadesTop && c.p.prioridadesTop.length
        ? `\n\nQuando bater de novo, volte nas três coisas que você me disse que são inegociáveis. Elas continuam de pé. Todo o resto é negociável, e negociável quer dizer que não precisa ser resolvido hoje.`
        : '';

      return `Isso é normal e é mais comum do que parece. Praticamente toda noiva passa por um momento de ansiedade, insegurança ou até tristeza no meio do planejamento — inclusive as que estão com tudo indo bem.

Só que ninguém posta essa parte.

**Três coisas que costumam ajudar de verdade:**

_Reduza o número de decisões abertas ao mesmo tempo._ A sensação de afogamento quase nunca vem do tamanho da tarefa, vem da quantidade de coisas em aberto. Feche uma e não reabra.
_Combine dias sem casamento._ Um ou dois dias por semana em que o assunto não entra na conversa. Isso protege a relação, que é o motivo de tudo isso existir.
_Divida de verdade._ Não "me ajuda quando eu pedir", mas categorias inteiras com dono. Quem decide, decide — inclusive diferente de você.${ancora}

E a coisa que vale ouvir agora: **o maior arrependimento que noiva relata depois do casamento não é financeiro.** É não ter aproveitado o próprio dia. Não é falta de perfeição que estraga a festa — é chegar nela exausta demais para estar presente.

Se a ansiedade estiver constante, tirando o sono ou atrapalhando o seu dia a dia, isso já não é assunto de casamento e vale falar com um profissional de saúde. Não é exagero seu.`;
    },
    acoes: [
      { texto: 'O que fazer primeiro', pergunta: 'O que eu faço agora?' },
      { texto: 'Minhas prioridades', tela: 'prioridades' },
    ],
  },

  /* ------------------------------------------------------ gasto demais */
  {
    id: 'estourar-orcamento',
    titulo: 'Gastar mais que o planejado',
    gatilhos: ['estourar', 'gastar mais', 'passar do orcamento', 'me descontrolei',
      'gastei demais', 'saiu do controle', 'nao consigo controlar', 'dividas', 'divida',
      'cartao', 'emprestimo', 'financiar', 'parcelar tudo'],
    resposta: (c) => {
      const situacao = c.r && c.r.total
        ? `No seu caso: orçamento de **${formatarMoeda(c.r.total)}**, contratado de **${formatarMoeda(c.r.contratado)}**.`
        : '';

      return `Metade dos casais gasta mais do que planejou. Não porque são descuidados — porque o custo de casamento é quase todo composto de coisas pequenas que ninguém somou.

${situacao}

**Os três lugares onde o dinheiro vaza, e nenhum deles aparece na proposta:**

_O que não está incluso._ Taxa de limpeza, hora extra, alimentação da equipe, gelo, energia, montagem. É a maior fonte de estouro, e é exatamente por isso que eu listo isso em cada categoria.
_Convidado que entra depois._ Cada nome adicionado depois do orçamento fechado multiplica em comida, bebida, bolo, doce, convite, lembrancinha e taxa. Um nome parece nada; vinte nomes são uma categoria inteira.
_O upgrade de última hora._ Sempre existe uma versão um pouco melhor por só mais um pouquinho. Cada "só mais um pouquinho" é pequeno sozinho e enorme somado.

**O que segura de verdade:** margem de segurança separada e intocável, e revisar o contratado contra o orçamento toda vez que fechar um fornecedor — não uma vez por mês.

**E sobre crédito, eu vou ser direta:** parcelar casamento é começar o casamento devendo. Se a conta não fecha, as saídas na ordem certa são adiar a data, reduzir o formato ou reduzir o orçamento e replanejar. Crédito não é uma quarta opção — é a mesma conta, mais cara e com juros.`;
    },
    acoes: [
      { texto: 'Onde eu posso economizar', pergunta: 'Onde eu posso economizar?' },
      { texto: 'Meu casamento cabe?', pergunta: 'Meu casamento cabe no orçamento?' },
    ],
  },

  /* ------------------------------------------------------- assessoria */
  {
    id: 'contratar-assessoria',
    titulo: 'Contratar assessoria',
    gatilhos: ['assessoria', 'assessora', 'cerimonialista', 'cerimonial', 'wedding planner',
      'vale a pena contratar assessoria', 'preciso de assessora', 'day of'],
    resposta: () => `Vou te dar a resposta honesta, mesmo sendo eu quem faz boa parte desse trabalho aqui dentro.

**Existem três formatos, e eles custam coisas muito diferentes:**

_Assessoria completa._ Acompanha do início ao fim: orçamento, curadoria de fornecedores, contratos, cronograma e o dia. É o mais caro e é o que mais faz sentido para quem tem pouco tempo disponível ou casamento grande e complexo.
_Assessoria parcial ou consultoria._ Ela orienta, você executa. Reuniões pontuais, revisão do que você montou, indicação de fornecedor. Custa uma fração da completa.
_Coordenação do dia._ Só o dia: recebe fornecedor, conduz o roteiro, resolve o que aparecer. É o mais barato dos três.

**A minha leitura:** se o orçamento é apertado, o formato que mais devolve o que custa é a **coordenação do dia**. O planejamento você consegue fazer — está tudo aqui, com as suas contas. O que não dá para fazer sozinha é coordenar o próprio casamento vestida de noiva.

Se você decidir não contratar nenhuma das três, o mínimo que precisa existir é o roteiro do dia escrito e três pessoas com função nomeada. Sem isso, quem vira a assessora é você, no seu próprio casamento.

**Antes de fechar com qualquer uma**, faça as mesmas perguntas de qualquer fornecedor — quantos eventos no mesmo fim de semana, quem estará lá no dia, como será a comunicação — e peça para conversar com um casal que ela atendeu.`,
    acoes: [
      { texto: 'Montar o roteiro do dia', pergunta: 'Como fazer o roteiro do dia?' },
      { texto: 'O que perguntar a um fornecedor', pergunta: 'O que eu devo perguntar a um fornecedor?' },
    ],
  },

  /* -------------------------------------------------------- cerimônia */
  {
    id: 'cerimonia',
    titulo: 'A cerimônia',
    gatilhos: ['cerimonia', 'celebrante', 'padrinho', 'madrinha', 'votos', 'juiz de paz',
      'religioso', 'civil', 'entrada', 'ordem de entrada', 'quantos padrinhos', 'cortejo'],
    resposta: () => `**Celebrante.** Pode ser religioso, juiz de paz ou uma pessoa próxima escolhida por vocês. Se for alguém próximo, combine o roteiro com antecedência e faça pelo menos um ensaio — improviso emociona menos do que parece.

Atenção a uma confusão comum: **cerimônia e casamento civil são coisas separadas.** Uma cerimônia bonita não registra nada em cartório. Cheque prazos e documentos no cartório da sua cidade com antecedência, porque isso varia de lugar para lugar e eu não invento regra de cartório.

**Padrinhos.** A referência mais usada é de até três casais de cada lado, mas isso é costume, não regra. O que importa de verdade: quanto mais padrinhos, mais tempo de entrada, mais gente para coordenar e mais custo se você presenteia ou paga traje.

**Ordem de entrada.** Defina no papel quem entra com quem, e ensaie. É onde mais dá confusão no dia, e é confusão de graça — resolve com dez minutos de conversa antes.

**Duração.** Cerimônia costuma render melhor entre vinte e quarenta minutos. Mais que isso, convidado cansa, criança chora e a foto fica pior.

**Votos.** Se forem escrever, escrevam com antecedência e cada um por si. E levem impresso: ninguém decora nada com aquela emoção.`,
    acoes: [{ texto: 'Ver o cronograma', tela: 'cronograma' }],
  },

  /* ---------------------------------------------------------- vestido */
  {
    id: 'vestido-prazos',
    titulo: 'Vestido: prazos e provas',
    gatilhos: ['prova do vestido', 'ajuste do vestido', 'quando comprar o vestido',
      'prazo do vestido', 'sapato', 'acessorio', 'veu', 'quando escolher o vestido'],
    resposta: () => `**Prazo.** Vestido sob medida costuma pedir bastante antecedência por causa das provas e dos ajustes; aluguel e pronta-entrega resolvem em muito menos tempo. Pergunte o prazo real na primeira visita e trabalhe com uma folga em cima do que ela disser.

**Provas.** São várias, não uma. E a última precisa ser bem perto do casamento, porque corpo muda — especialmente em período de estresse. Não marque a prova final com semanas de folga achando que está sendo organizada; isso costuma sair caro em ajuste refeito.

**O sapato é subestimado.** Você vai passar horas nele, boa parte em pé e andando. Compre antes das provas de ajuste, porque a barra depende da altura do salto. E amacie em casa — usar por alguns dias no chão de casa evita o final de festa descalça.

**Acessórios por último.** Brinco, colar, pulseira, cabelo: escolha depois que o vestido estiver definido, e escolha um protagonista só. Vestido trabalhado pede acessório discreto.

**E o que costuma ficar de fora da conta:** ajuste, lavagem, sapato, lingerie adequada, véu, joia e a prova de cabelo e maquiagem. Some tudo antes de decidir que o vestido cabe no orçamento — porque o vestido raramente é só o vestido.`,
    acoes: [{ texto: 'Ver a categoria vestido', tela: 'orcamento' }],
  },

  /* ------------------------------------------------------ convites RSVP */
  {
    id: 'convites-rsvp',
    titulo: 'Convites e confirmação',
    gatilhos: ['convite', 'rsvp', 'confirmacao de presenca', 'quando enviar convite',
      'save the date', 'confirmar presenca', 'ninguem confirma', 'cobrar confirmacao'],
    resposta: () => `**Prazo.** Save the date bem cedo se tem gente que viaja. O convite em si com antecedência confortável, e a data limite de confirmação **antes** do dia em que você precisa fechar o número com o buffet — não no mesmo dia, porque você vai precisar de tempo para correr atrás dos que não responderam.

**Convite digital economiza muito**, e não é deselegante. Economiza impressão, envelope e entrega, e ainda organiza a confirmação sozinho. Se quiser o impresso pelo afeto, uma saída boa: impresso só para o círculo mais próximo, digital para o resto.

**Nomeie sempre.** "Fulano e Beltrana" e não "Família Silva", e não em grupo de WhatsApp. Convite genérico é como se convidam pessoas a mais sem perceber — e cada pessoa a mais é comida, bebida, bolo, doce e lembrancinha.

**Ninguém confirma, e isso é normal.** Espere confirmar bem menos que o total no prazo. O que funciona é cobrar individualmente, por mensagem direta, com uma frase que dê saída fácil: _"preciso fechar o número com o buffet até dia tal — consegue me confirmar?"_

**Deixe explícito no convite** se crianças são bem-vindas e se o convite inclui acompanhante. Não escrever isso é a origem de metade dos convidados extras.`,
    acoes: [
      { texto: 'Controlar confirmações', tela: 'convidados' },
      { texto: 'Simular com menos convidados', tela: 'cenarios' },
    ],
  },

  /* -------------------------------------------------- quantidades */
  {
    id: 'quantidades',
    titulo: 'Quantidades por convidado',
    gatilhos: ['quanto de bebida', 'quantos doces', 'quantas garrafas', 'quanto de bolo',
      'quantidade por pessoa', 'quanto comprar', 'quantos bem casados', 'calcular quantidade'],
    resposta: (c) => {
      const n = c.p.convidados;
      const base = n
        ? `Você tem **${n} convidados** no plano — use esse número, não o número de convites enviados.`
        : 'Assim que você me disser o número de convidados eu faço essas contas para você.';

      return `${base}

Não existe quantidade universal, e desconfie de quem te der uma tabela fechada. O consumo muda muito com **horário, duração, clima, perfil dos convidados e se tem bar aberto ou serviço fechado**. Casamento de tarde consome bem menos bebida que de noite; casamento no calor consome muito mais água e menos destilado.

**O jeito certo de descobrir:** peça a estimativa a quem vai servir. Buffet e bar trabalham com isso todo fim de semana na sua cidade, e eles vão acertar mais que qualquer tabela da internet — inclusive a minha.

**Uma pergunta que economiza dinheiro de verdade:** _"o que acontece com o que sobrar?"_ Em alguns contratos a sobra fica com o fornecedor, em outros volta para você. Isso muda completamente se vale a pena comprar por fora.

**E a conta que sempre esquecem:** a equipe também come e bebe. Buffet, garçom, DJ, fotógrafo, filmagem — pergunte se a alimentação deles está inclusa ou se é cobrada à parte. Costuma ser à parte.

Nas **Calculadoras** você faz essas contas com a sua quantidade e vê a fórmula inteira.`;
    },
    acoes: [{ texto: 'Abrir calculadoras', tela: 'calculadoras' }],
  },

  /* ------------------------------------------------------- pos festa */
  {
    id: 'aproveitar',
    titulo: 'Aproveitar o próprio casamento',
    gatilhos: ['aproveitar', 'nao vou conseguir aproveitar', 'passou rapido', 'arrependimento',
      'do que as noivas se arrependem', 'aproveitar o dia', 'curtir'],
    resposta: () => `O arrependimento mais relatado por noivas depois do casamento não é ter gastado demais, nem ter cortado alguém da lista. É **não ter aproveitado o próprio casamento**.

O dia passa rápido de verdade, e quem passa ele resolvendo pendência não vê nada.

**O que separa quem aproveita de quem não aproveita não é sorte — é ter delegado antes:**

_Ninguém liga para você no dia._ Coloque o telefone de outra pessoa no roteiro e mande para todos os fornecedores. Se o seu celular tocar no dia, alguma coisa foi mal combinada.
_Coma._ Sério. Muita noiva não come, e às onze da noite isso cobra o preço.
_Reserve quinze minutos só vocês dois_, logo depois da cerimônia. Todo mundo que faz isso diz que foi o melhor pedaço do dia.
_Decida agora que nada será corrigido no dia._ Se a flor veio da cor errada, ela vai ficar da cor errada. Ninguém além de você sabe qual era a cor certa.

E a última: **o casamento não é uma prova**. Não vai ter nota. Os seus convidados não vieram avaliar a decoração — vieram ver vocês dois. Nenhum deles vai lembrar do que você mais se preocupou; todos vão lembrar de como foi estar ali.`,
    acoes: [{ texto: 'Montar o roteiro do dia', pergunta: 'Como fazer o roteiro do dia?' }],
  },
];

/*
 * Pontua os tópicos contra a pergunta e devolve o melhor, ou null.
 *
 * A pontuação favorece gatilho longo: quem escreve "cortar a lista de
 * convidados" casa com um gatilho de 24 caracteres, e isso vale mais que
 * casar com "lista" solto. Sem esse peso, o tópico de gatilho mais genérico
 * ganharia de todos os outros.
 */
function palavras(t) {
  return semAcento(t).split(/[^a-z0-9]+/).filter(Boolean);
}

function consultoriaMatch(pergunta) {
  const q = semAcento(pergunta);
  const qp = palavras(pergunta);
  if (q.length < 3) return null;

  let melhor = null;
  for (const t of CONSULTORIA) {
    let ponto = 0;
    for (const g of t.gatilhos) {
      const gn = semAcento(g);

      /* 1. a frase inteira, contígua */
      if (q.includes(gn)) ponto = Math.max(ponto, gn.length);

      /*
       * 2. todas as palavras do gatilho presentes, ainda que separadas.
       *
       * Sem isto, "o que EU DEVO perguntar a um fornecedor" não casava com
       * "o que perguntar", porque duas palavras no meio quebram a substring.
       * Ninguém escreve pergunta na forma canônica, então exigir contiguidade
       * era exigir que ela adivinhasse o gatilho.
       *
       * O peso conta só palavras de 4 letras ou mais: "o", "que", "de" e "um"
       * aparecem em qualquer frase e inflariam a pontuação de todo mundo.
       */
      const gp = palavras(g);
      if (gp.length && gp.every((w) => qp.includes(w))) {
        const peso = gp.filter((w) => w.length >= 4).reduce((a, w) => a + w.length, 0);
        ponto = Math.max(ponto, peso);
      }
    }
    if (ponto && (!melhor || ponto > melhor.ponto)) melhor = { topico: t, ponto };
  }
  /* gatilho de 4 letras ou menos casa por acidente dentro de outra palavra */
  return melhor && melhor.ponto >= 5 ? melhor : null;
}

function consultoriaPara(pergunta) {
  const m = consultoriaMatch(pergunta);
  return m ? m.topico : null;
}

/*
 * A partir de 12 caracteres o gatilho deixou de ser uma palavra solta e
 * virou uma frase — "cortar a lista", "o que perguntar", "roteiro do dia".
 * Nesse ponto ele descreve a intenção melhor que os intents financeiros,
 * que casam com palavra única e engoliriam a pergunta ("convidado" cairia
 * na conta de impacto de convidados em vez de falar sobre cortar a lista).
 */
const CONSULTORIA_FRASE = 12;
