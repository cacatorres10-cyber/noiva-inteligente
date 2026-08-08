# Fotografias

Coloque aqui as imagens do app. Sem elas, **o app funciona normalmente**: cada slot
cai na ilustração vetorial. Não há placeholder quebrado em lugar nenhum.

## Arquivos esperados

| Arquivo | Onde aparece | Proporção | O que a foto precisa ser |
|---|---|---|---|
| `capa.jpg` | Abertura do onboarding | 16:10 | Cerimônia ou casal em plano médio, luz natural, tons quentes e claros. **Evite closes de rosto** — a imagem fica atrás de texto. |
| `plano.jpg` | Topo de "Meu Plano Inteligente" | 16:9 | Mesa posta, taças ou arranjo em plano aberto. Deixe **área calma à esquerda**, onde entra o título. |

## Especificação técnica

- Largura de 1200 px basta. O app nunca exibe maior que isso.
- Exporte em JPEG com qualidade ~80, ou WebP. Mire em **menos de 150 KB por imagem**.
- Formatos aceitos: `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`.
- O enquadramento é ajustável sem editar a imagem: mude `foco` em
  `assets/js/fotos.js` (ex.: `center 30%` sobe o recorte).

## Onde buscar

Bancos com licença que permite uso comercial sem atribuição obrigatória:

- **Pexels** — pexels.com
- **Unsplash** — unsplash.com

Termos que costumam render bom material: *wedding ceremony*, *wedding table setting*,
*bride bouquet*, *wedding reception*, *casamento intimista*.

**Confira a licença de cada foto antes de publicar.** As duas plataformas permitem uso
comercial, mas há exceções para imagens com pessoas identificáveis e marcas visíveis.
Este arquivo não é orientação jurídica.

## Depois de adicionar

Nada precisa ser alterado no código. Para o HTML de arquivo único, rode:

```bash
node build.js
```

O empacotador converte tudo que estiver nesta pasta em data URI automaticamente.
