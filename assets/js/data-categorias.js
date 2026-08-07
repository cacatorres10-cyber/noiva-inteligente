/*
 * NOIVA INTELIGENTE — Catálogo de categorias
 *
 * IMPORTANTE SOBRE OS VALORES DE REFERÊNCIA:
 * Os números abaixo são SEMENTES DE ESTIMATIVA editáveis, não preços de mercado.
 * Eles existem para dar um ponto de partida ao planejamento e devem ser
 * substituídos por orçamentos reais assim que a usuária tiver os primeiros.
 * Em nenhum lugar do produto eles podem ser apresentados como "preço garantido".
 *
 * est.tipo:
 *   'convidado' -> custo estimado = valor * nº de convidados
 *   'fixo'      -> custo estimado = valor
 *   'convite'   -> custo estimado = valor * ceil(convidados / 2)  (1 convite ~ 2 pessoas)
 *
 * est.baixo / medio / alto correspondem ao padrão de execução escolhido pela
 * usuária (econômico / intermediário / elevado), e não a uma cidade específica.
 */

const CATEGORIAS = [
  {
    id: 'local',
    nome: 'Local / Espaço',
    icone: '🏛️',
    grupo: 'Estrutura',
    pesoBase: 15,
    dependeConvidados: true,
    est: { tipo: 'fixo', baixo: 900, medio: 3800, alto: 12000 },
    naoIncluiCostuma: [
      'Taxa de limpeza pós-evento',
      'Horas extras além do pacote contratado',
      'Segurança / brigadista quando exigido',
      'Mesas, cadeiras, louça e toalhas',
      'Gerador ou reforço de energia',
      'Taxa de rolha se levar bebida própria',
    ],
    dica: 'Cerimônia e recepção no mesmo local costuma eliminar transporte, decoração dupla e tempo ocioso.',
  },
  {
    id: 'cerimonia',
    nome: 'Cerimônia',
    icone: '💍',
    grupo: 'Estrutura',
    pesoBase: 4,
    dependeConvidados: false,
    est: { tipo: 'fixo', baixo: 300, medio: 1200, alto: 4000 },
    naoIncluiCostuma: [
      'Celebrante e deslocamento do celebrante',
      'Som da cerimônia (microfone, caixa)',
      'Cadeiras para a cerimônia',
      'Decoração do altar / entrada',
    ],
    dica: 'Cerimônia e recepção juntas reduzem estrutura duplicada.',
  },
  {
    id: 'alimentacao',
    nome: 'Alimentação',
    icone: '🍽️',
    grupo: 'Recepção',
    pesoBase: 20,
    dependeConvidados: true,
    est: { tipo: 'convidado', baixo: 38, medio: 78, alto: 150 },
    naoIncluiCostuma: [
      'Taxa de serviço / garçons',
      'Refeição da equipe (fotógrafo, DJ, cerimonialista)',
      'Louça, talheres e rechauds',
      'Deslocamento da equipe de cozinha',
      'Prato especial (vegetariano, restrição alimentar)',
      'Taxa de montagem e desmontagem',
    ],
    dica: 'Formato (jantar, brunch, finger food) pesa mais no custo do que a quantidade de opções.',
  },
  {
    id: 'bebidas',
    nome: 'Bebidas',
    icone: '🥂',
    grupo: 'Recepção',
    pesoBase: 7,
    dependeConvidados: true,
    est: { tipo: 'convidado', baixo: 14, medio: 32, alto: 70 },
    naoIncluiCostuma: [
      'Gelo e recipientes de resfriamento',
      'Copos / taças',
      'Bartender ou equipe de bar',
      'Taxa de rolha do espaço',
    ],
    dica: 'Horário do evento muda muito o consumo: eventos diurnos costumam consumir menos álcool.',
  },
  {
    id: 'bolo',
    nome: 'Bolo',
    icone: '🎂',
    grupo: 'Recepção',
    pesoBase: 2.5,
    dependeConvidados: true,
    est: { tipo: 'fixo', baixo: 180, medio: 500, alto: 1600 },
    naoIncluiCostuma: [
      'Entrega e montagem no local',
      'Suporte / bandeja do bolo',
      'Taxa de corte cobrada por alguns espaços',
    ],
    dica: 'Bolo cenográfico + bolo simples para servir preserva a foto e reduz o custo por fatia.',
  },
  {
    id: 'doces',
    nome: 'Doces e sobremesas',
    icone: '🍬',
    grupo: 'Recepção',
    pesoBase: 2,
    dependeConvidados: true,
    est: { tipo: 'convidado', baixo: 5, medio: 11, alto: 24 },
    naoIncluiCostuma: ['Bandejas e suportes', 'Forminhas e embalagens', 'Entrega'],
    dica: 'Poucas variedades bem apresentadas superam muitas variedades em quantidade pequena.',
  },
  {
    id: 'decoracao',
    nome: 'Decoração',
    icone: '✨',
    grupo: 'Estética',
    pesoBase: 7,
    dependeConvidados: true,
    est: { tipo: 'fixo', baixo: 500, medio: 2500, alto: 9000 },
    naoIncluiCostuma: [
      'Montagem e desmontagem',
      'Frete dos itens',
      'Iluminação',
      'Itens quebrados ou perdidos (caução)',
    ],
    dica: 'Concentre a decoração onde as pessoas param: entrada, altar, mesa do bolo e área de foto.',
  },
  {
    id: 'flores',
    nome: 'Flores',
    icone: '💐',
    grupo: 'Estética',
    pesoBase: 3,
    dependeConvidados: true,
    est: { tipo: 'fixo', baixo: 250, medio: 1100, alto: 4000 },
    naoIncluiCostuma: ['Buquê de lançamento', 'Flores para lapela e mães', 'Manutenção e reposição'],
    dica: 'Flores da estação e da sua região costumam ter preço e durabilidade melhores.',
  },
  {
    id: 'vestido',
    nome: 'Vestido da noiva',
    icone: '👰',
    grupo: 'Noivos',
    pesoBase: 8,
    dependeConvidados: false,
    est: { tipo: 'fixo', baixo: 600, medio: 2500, alto: 9000 },
    naoIncluiCostuma: [
      'Ajustes e provas',
      'Véu, sapato, joias e lingerie',
      'Limpeza e conservação',
      'Caução (no aluguel)',
    ],
    dica: 'Aluguel, coleção anterior e vestido usado com ajuste sob medida entregam resultado semelhante.',
  },
  {
    id: 'traje',
    nome: 'Traje do noivo',
    icone: '🤵',
    grupo: 'Noivos',
    pesoBase: 3,
    dependeConvidados: false,
    est: { tipo: 'fixo', baixo: 300, medio: 900, alto: 3500 },
    naoIncluiCostuma: ['Sapato', 'Camisa e acessórios', 'Ajustes'],
    dica: 'Aluguel de terno costuma ser a opção com melhor custo/benefício para uso único.',
  },
  {
    id: 'beleza',
    nome: 'Beleza e noiva',
    icone: '💄',
    grupo: 'Noivos',
    pesoBase: 3,
    dependeConvidados: false,
    est: { tipo: 'fixo', baixo: 250, medio: 900, alto: 3000 },
    naoIncluiCostuma: [
      'Teste de maquiagem e cabelo',
      'Deslocamento do profissional',
      'Retoque durante o evento',
      'Maquiagem de mães e madrinhas',
    ],
    dica: 'Pergunte sempre se o teste está incluído — é um custo extra frequente.',
  },
  {
    id: 'fotografia',
    nome: 'Fotografia',
    icone: '📸',
    grupo: 'Registro',
    pesoBase: 8,
    dependeConvidados: false,
    est: { tipo: 'fixo', baixo: 700, medio: 2800, alto: 9000 },
    naoIncluiCostuma: [
      'Horas extras de cobertura',
      'Segundo fotógrafo',
      'Álbum impresso',
      'Ensaio pré-wedding',
      'Deslocamento e hospedagem',
      'Prazo de entrega e quantidade de fotos tratadas',
    ],
    dica: 'É a categoria que sobra depois da festa. Reduzir horas costuma custar menos que reduzir qualidade.',
  },
  {
    id: 'filmagem',
    nome: 'Filmagem',
    icone: '🎥',
    grupo: 'Registro',
    pesoBase: 4,
    dependeConvidados: false,
    est: { tipo: 'fixo', baixo: 500, medio: 2000, alto: 7000 },
    naoIncluiCostuma: ['Drone', 'Same day edit', 'Versão longa do filme', 'Horas extras'],
    dica: 'Um filme curto dos momentos-chave costuma ser mais assistido que a versão longa.',
  },
  {
    id: 'musica',
    nome: 'Música / som',
    icone: '🎶',
    grupo: 'Recepção',
    pesoBase: 4,
    dependeConvidados: false,
    est: { tipo: 'fixo', baixo: 250, medio: 1500, alto: 6000 },
    naoIncluiCostuma: [
      'Som e microfone da cerimônia',
      'Iluminação de pista',
      'Horas extras',
      'Estrutura elétrica',
    ],
    dica: 'Playlist bem montada + caixa de som alugada resolve casamentos menores.',
  },
  {
    id: 'convites',
    nome: 'Convites',
    icone: '💌',
    grupo: 'Comunicação',
    pesoBase: 1.5,
    dependeConvidados: true,
    est: { tipo: 'convite', baixo: 3, medio: 9, alto: 22 },
    naoIncluiCostuma: ['Envelope e lacre', 'Postagem ou entrega', 'Arte / diagramação', 'Reimpressão'],
    dica: 'Convite digital com confirmação online também organiza a lista de presença.',
  },
  {
    id: 'lembrancinhas',
    nome: 'Lembrancinhas',
    icone: '🎁',
    grupo: 'Comunicação',
    pesoBase: 1.5,
    dependeConvidados: true,
    est: { tipo: 'convidado', baixo: 4, medio: 10, alto: 25 },
    naoIncluiCostuma: ['Embalagem', 'Tag personalizada', 'Montagem'],
    dica: 'Uma lembrancinha útil e simples é mais lembrada do que uma cara e genérica.',
  },
  {
    id: 'transporte',
    nome: 'Transporte',
    icone: '🚗',
    grupo: 'Logística',
    pesoBase: 1.5,
    dependeConvidados: false,
    est: { tipo: 'fixo', baixo: 150, medio: 600, alto: 2500 },
    naoIncluiCostuma: ['Hora extra do motorista', 'Combustível e pedágio', 'Decoração do carro'],
    dica: 'Aluguel por hora (só a chegada e a saída) costuma bastar.',
  },
  {
    id: 'aliancas',
    nome: 'Alianças',
    icone: '💛',
    grupo: 'Noivos',
    pesoBase: 3,
    dependeConvidados: false,
    est: { tipo: 'fixo', baixo: 400, medio: 1800, alto: 6000 },
    naoIncluiCostuma: ['Gravação', 'Ajuste de tamanho', 'Estojo'],
    dica: 'Peso do metal e largura mudam o preço mais do que o design.',
  },
  {
    id: 'documentacao',
    nome: 'Documentação',
    icone: '📄',
    grupo: 'Logística',
    pesoBase: 1,
    dependeConvidados: false,
    est: { tipo: 'fixo', baixo: 100, medio: 350, alto: 900 },
    naoIncluiCostuma: ['Custas cartorárias', 'Certidões', 'Habilitação de casamento'],
    dica: 'Confirme prazos no cartório da sua cidade — eles variam bastante.',
  },
  {
    id: 'taxas',
    nome: 'Taxas e serviços',
    icone: '🧾',
    grupo: 'Logística',
    pesoBase: 1,
    dependeConvidados: false,
    est: { tipo: 'fixo', baixo: 100, medio: 500, alto: 2000 },
    naoIncluiCostuma: ['Taxa de serviço do buffet', 'Seguro do evento', 'Alvarás quando exigidos'],
    dica: 'Taxas costumam aparecer só no contrato. Pergunte antes de assinar.',
  },
  {
    id: 'outros',
    nome: 'Outros',
    icone: '➕',
    grupo: 'Logística',
    pesoBase: 0.5,
    dependeConvidados: false,
    est: { tipo: 'fixo', baixo: 100, medio: 400, alto: 1500 },
    naoIncluiCostuma: [],
    dica: 'Use para o que não se encaixa nas outras categorias.',
  },
];

/* Mapa de dependências entre variáveis do casamento e categorias afetadas.
   Usado para recálculo e para avisar "o que muda quando você muda isso". */
const DEPENDENCIAS = {
  convidados: {
    rotulo: 'Número de convidados',
    afeta: ['alimentacao', 'bebidas', 'bolo', 'doces', 'local', 'decoracao', 'convites', 'lembrancinhas', 'taxas'],
    explicacao: 'Convidados multiplicam quase tudo que é servido, sentado ou entregue.',
  },
  periodo: {
    rotulo: 'Período do evento',
    afeta: ['alimentacao', 'bebidas', 'decoracao', 'fotografia', 'musica', 'local'],
    explicacao: 'Horário muda cardápio, consumo de bebida, necessidade de iluminação e duração da festa.',
  },
  estilo: {
    rotulo: 'Estilo do casamento',
    afeta: ['decoracao', 'flores', 'local', 'vestido', 'traje', 'alimentacao'],
    explicacao: 'O estilo define o padrão estético esperado e, com ele, o custo da estética.',
  },
  data: {
    rotulo: 'Data / dia da semana',
    afeta: ['local', 'alimentacao', 'flores', 'fotografia', 'musica', 'decoracao'],
    explicacao: 'Sábado à noite e alta temporada costumam ter menos margem de negociação.',
  },
  local: {
    rotulo: 'Escolha do local',
    afeta: ['decoracao', 'transporte', 'alimentacao', 'taxas', 'cerimonia', 'musica'],
    explicacao: 'O local determina o que já vem pronto e o que você precisa levar.',
  },
};

const ESTILOS = [
  { id: 'classico', nome: 'Clássico', fator: { decoracao: 1.1, flores: 1.15, vestido: 1.1 } },
  { id: 'rustico', nome: 'Rústico / campo', fator: { decoracao: 0.9, flores: 1.0, local: 0.95 } },
  { id: 'minimalista', nome: 'Minimalista', fator: { decoracao: 0.75, flores: 0.8, vestido: 0.95 } },
  { id: 'boho', nome: 'Boho', fator: { decoracao: 0.9, flores: 1.1, vestido: 0.9 } },
  { id: 'intimista', nome: 'Intimista / mini wedding', fator: { local: 0.7, decoracao: 0.8, musica: 0.7 } },
  { id: 'praia', nome: 'Praia / ao ar livre', fator: { decoracao: 0.8, local: 0.85, flores: 0.9 } },
  { id: 'moderno', nome: 'Moderno / urbano', fator: { decoracao: 1.0, musica: 1.15, local: 1.05 } },
];

const PERIODOS = [
  { id: 'manha', nome: 'Manhã', fator: { alimentacao: 0.7, bebidas: 0.5, decoracao: 0.85, musica: 0.8 } },
  { id: 'tarde', nome: 'Tarde', fator: { alimentacao: 0.85, bebidas: 0.75, decoracao: 0.9, musica: 0.9 } },
  { id: 'noite', nome: 'Noite', fator: { alimentacao: 1.0, bebidas: 1.0, decoracao: 1.0, musica: 1.0 } },
];

const DIAS_SEMANA = [
  { id: 'sabado', nome: 'Sábado', fator: 1.0 },
  { id: 'sexta', nome: 'Sexta', fator: 0.93 },
  { id: 'domingo', nome: 'Domingo', fator: 0.88 },
  { id: 'semana', nome: 'Dia de semana', fator: 0.82 },
];

const NIVEL_REGIAO = [
  { id: 'baixo', nome: 'Custo de vida mais baixo', fator: 0.8 },
  { id: 'medio', nome: 'Custo de vida intermediário', fator: 1.0 },
  { id: 'alto', nome: 'Custo de vida mais alto', fator: 1.25 },
];

const PADRAO_EXECUCAO = [
  { id: 'baixo', nome: 'Econômico', desc: 'Foco em criatividade, DIY e negociação.' },
  { id: 'medio', nome: 'Intermediário', desc: 'Equilíbrio entre custo e conveniência.' },
  { id: 'alto', nome: 'Elevado', desc: 'Mais serviços contratados e menos esforço próprio.' },
];
