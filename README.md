# 💍 Noiva Inteligente

**Transforma o orçamento disponível da noiva em um plano de casamento executável.**

Não é um checklist. Não é uma planilha bonita. É uma assessora financeira + planejadora +
estrategista de casamento dentro do celular.

---

## Como rodar

Não tem build, não tem dependência, não tem servidor.

```bash
# abra direto no navegador
open index.html

# ou, se preferir servir localmente
npx http-server -p 8080 .
```

Todos os dados ficam no `localStorage` do navegador. Nada é enviado para nenhum servidor.
Há exportação e importação de backup em JSON dentro de **Configurações**.

---

## Onde os dados ficam

Não há cadastro e não há servidor. Tudo é gravado no `localStorage`, com **múltiplos
perfis no mesmo aparelho**:

```
noiva-inteligente:perfis        índice  [{ id, nome, criadoEm, visto }]
noiva-inteligente:perfil-ativo  id do perfil em uso
noiva-inteligente:v1:<id>       estado completo daquele perfil
```

Trocar de perfil em **Mais ferramentas → Trocar de perfil**. Cada um tem o próprio
orçamento, fornecedores, missões e cronograma, sem nada compartilhado.

O que isso cobre, e o que não cobre:

| Situação | Resultado |
|---|---|
| Pessoas diferentes, cada uma no seu aparelho | Isolado, sempre foi |
| Pessoas diferentes no **mesmo** aparelho | Isolado, via perfis |
| A mesma pessoa comparando dois cenários | Isolado, via perfis |
| A mesma pessoa voltando depois | Continua de onde parou |
| Limpar os dados do navegador | Perde — por isso existe o backup |
| Trocar de aparelho | Não acompanha sozinho |

A última linha é a única que continua em aberto, e é assim por escolha: sincronizar entre
aparelhos exige identificar a pessoa em algum servidor, que é justamente o que este produto
não tem. A ponte é **Ajustes → Exportar backup**, que gera um JSON reimportável em qualquer
aparelho — e mostra o conteúdo para copiar quando o navegador bloqueia o download.

Quem já usava o app antes dos perfis não perde nada: os dados antigos viram automaticamente
o primeiro perfil, sem pedir nada.

---

## Empacotar em arquivo único

```bash
node build.js
```

Gera `dist/noiva-inteligente.html` com CSS e JS embutidos — um arquivo só, que abre offline
e pode ser publicado em qualquer lugar. A pasta `dist/` não é versionada: é derivada.

---

## Marca

A silhueta de noiva em `assets/js/logo.js` é vetor, não arquivo de imagem. Ela aparece de
26px (barra superior) a 96px (abertura), assume a cor do contexto — dourada sobre o vinho,
vinho sobre a areia — e também é o favicon, tudo a partir da mesma função.

O desenho é montado com uma **máscara SVG**, não com um traçado único. O motivo é prático:
o buquê, os braços e os vincos do tecido precisam ser espaço *vazado*. Vazado, o fundo
aparece através deles e a silhueta continua legível sobre qualquer cor; pintado de branco,
ela só funcionaria sobre fundo claro.

O que degrada primeiro degrada de propósito: abaixo de ~40px os vincos e as fitas somem, e
sobra a silhueta do vestido — que é o que ainda se reconhece nesse tamanho.

---

## Ícones

Não há emoji na interface e não há imagem externa. Os ícones ficam em
`assets/js/icones.js`: cerca de 50 desenhos SVG em traço, viewBox 24×24, herdando
`currentColor`. A escolha é deliberada — vetor escala sem perder nitidez, assume a cor do
contexto, mantém o app funcionando offline e dá identidade própria em vez do desenho que
cada sistema operacional resolve mostrar.

A fonte web é tratada como ganho, não como dependência: onde a rede está bloqueada, a pilha
tipográfica cai em serifas reais (Iowan, Palatino, Georgia) que sustentam o tom sozinhas.

### Fotografias

São **23 slots**: dois de acolhimento (abertura do onboarding e topo de "Meu Plano
Inteligente") e um por categoria, usado na miniatura da lista de orçamento e na capa da
gaveta da categoria. Coloque as imagens em `assets/fotos/` e `assets/fotos/categorias/`
com os nomes indicados em [`assets/fotos/LEIA-ME.md`](assets/fotos/LEIA-ME.md) — elas
entram sozinhas, sem tocar em código, e `build.js` as embute como data URI no arquivo único.

Sem as fotos o app fica completo: cada slot cai na ilustração vetorial correspondente, sem
placeholder quebrado. Isso é deliberado — a ferramenta não pode depender de um arquivo que
talvez nunca seja baixado.

A foto entra só onde ela ajuda: acolhimento e identificação de categoria. As telas de
números (cenários, comparador de fornecedores, calculadoras) continuam sem imagem, porque
ali a foto competiria com a informação que a pessoa foi ler.

---

## Deploy

O site é estático, então o workflow `.github/workflows/deploy.yml` publica a raiz do
repositório no GitHub Pages a cada push — sem etapa de build.

**Ativação, uma única vez:** `Settings` → `Pages` → em **Source**, escolher **GitHub Actions**.
Depois disso, é só empurrar commits. O `GITHUB_TOKEN` do workflow consegue publicar, mas não
consegue criar o site do Pages, por isso esse primeiro clique é manual.

---

## O que o produto faz

| Módulo | O que resolve |
|---|---|
| **Onboarding conversacional** | 14 perguntas + a pergunta obrigatória das 3 coisas inegociáveis |
| **Meu Plano Inteligente** | Orçamento recomendado, distribuição, formato sugerido, 5 primeiras ações, meta mensal, projeção |
| **Orçamento inteligente** | 21 categorias com planejado / contratado / pago / restante / vencimento / parcelas |
| **Detector de prejuízo** | Analisa cada gasto contra orçamento, prioridade, itens não inclusos e alternativas |
| **Simulador de cenários** | Compara dois formatos lado a lado com as categorias afetadas e o impacto na experiência |
| **Modo R$7 mil** | Meta de planejamento enxuto com substituições sugeridas — nunca uma garantia de preço |
| **Missões de economia** | 14 ações curtas com objetivo, motivo, dificuldade, tempo e economia potencial |
| **Biblioteca de estratégias** | 47 estratégias acionáveis com problema, solução, quando usar, riscos e passo a passo |
| **Fornecedores** | Cadastro e comparador de preço + inclusos + extras + condições |
| **Cronograma adaptativo** | Tarefas por fase, calculadas a partir dos meses restantes |
| **Calculadoras** | Quantidades, parcelas e poupança — com todas as fórmulas à mostra |
| **Assistente contextual** | Responde a partir do estado real da usuária, roda 100% no dispositivo |
| **Contratos e documentos** | Registro de valores, prazos, multas e pontos de atenção |

---

## O princípio central

```
ORÇAMENTO → PRIORIDADES → DECISÕES → IMPACTOS → ALTERNATIVAS → EXECUÇÃO → ACOMPANHAMENTO
```

Nenhuma categoria é tratada isoladamente. Mudar o número de convidados recalcula alimentação,
bebidas, bolo, doces, local, decoração, convites e lembrancinhas — e o app mostra
exatamente quais categorias foram afetadas.

### Princípio de substituição

Quando a usuária quer economizar, a primeira pergunta nunca é *"o que cortar?"*, e sim
**"como entregar a mesma função por menos?"**. Ela quer um bolo sofisticado: a resposta não é
"não faça bolo", é *bolo cenográfico para a foto + bolo simples para servir*.

---

## Compromissos de confiabilidade

Estas regras estão implementadas no código, não são só intenção:

- **Não inventa preços.** Os valores de referência em `data-categorias.js` são sementes de
  estimativa editáveis, sempre rotuladas como estimativa, nunca como preço de mercado.
- **Não assume que cidades custam igual.** A usuária declara o nível de custo da própria região;
  o app não embute tabela de preço de nenhuma cidade.
- **Não inventa economia.** *Economizado* (confirmado pela usuária), *economia potencial*
  (estimativa das missões abertas) e *gasto evitado* são três números separados.
- **Não diz que um preço é "caro".** Diz quanto do orçamento aquele gasto consome.
- **Não incentiva endividamento.** Quando a meta não cabe na capacidade de poupança, sugere
  ajustar data ou formato antes de qualquer menção a crédito.
- **Não substitui avaliação jurídica.** O módulo de documentos avisa isso explicitamente.
- **Quando não sabe, diz que não sabe** e faz uma pergunta objetiva.

---

## Fórmulas

Todas documentadas em `assets/js/engine.js` e visíveis na tela **Configurações → Como eu calculo**.

```
distribuível        = orçamento × (1 − margem de segurança)
peso da categoria   = peso típico × (0,55 + 0,09 × prioridade)      prioridade de 1 a 10
sugerido            = distribuível × peso ÷ Σ pesos

estimativa          = semente do padrão × quantidade × fator região
                      × fator estilo × fator período × fator dia

meta mensal         = (orçamento total − disponível hoje) ÷ meses restantes
economia potencial  = Σ (base da missão × ponto médio do intervalo %)
```

Categorias já contratadas saem do rateio pelo valor real e o restante é redistribuído
entre as categorias ainda abertas.

---

## Estrutura

```
index.html
assets/
  css/style.css              sistema visual
  js/
    data-categorias.js       21 categorias, 5 regras de dependência, estilos, períodos, fatores
    data-estrategias.js      47 estratégias completas + níveis de economia
    data-missoes.js          14 missões + 31 tarefas de cronograma
    store.js                 estado e persistência
    engine.js                motor de cálculo (todas as fórmulas)
    assistente.js            assistente contextual, roda no dispositivo
    ui.js                    helpers, navegação, componentes
    telas.js                 todas as telas e gavetas
    onboarding.js            onboarding conversacional
    acoes.js                 mutações de estado
    app.js                   inicialização
```

---

## Níveis de economia

- 🟢 **Leve** — pouco impacto na experiência
- 🟡 **Moderada** — exige adaptação
- 🔴 **Agressiva** — muda significativamente o formato do casamento

Estratégia agressiva nunca é sugerida sem explicar o impacto, e o algoritmo evita recomendar
cortes em categorias de alta prioridade enquanto existir alternativa em categoria de prioridade
mais baixa.

---

## Aviso

Os custos variam conforme cidade, número de convidados, data, fornecedores e escolhas.
O **Modo R$7 mil** é uma meta de planejamento, **não uma garantia de preço**.
