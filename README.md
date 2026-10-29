# cantorluizfelipe.com.br

Página de apresentação e contratação do cantor de pagode **Luiz Felipe**.
Site estático (HTML + CSS + JS), hospedado no GitHub Pages, sem servidor.

## Páginas

| Caminho        | Conteúdo                                         |
| -------------- | ------------------------------------------------ |
| `/`            | Página principal de venda do show                |
| `/sobre/`      | História e trajetória                            |
| `/videos/`     | Vídeos ao vivo (A Fazenda 17, Camisa 12, casas)    |
| `/galeria/`    | Fotos de palco e ensaio                          |
| `/contratar/`  | Pedido de orçamento em 4 passos → WhatsApp       |

## Trocar contatos

Tudo fica em `static/js/config.js` (WhatsApp, Instagram). Mudou ali, muda no site inteiro.

## Estrutura

```
index.html            página inicial
sobre/ videos/ galeria/ contratar/   subpáginas (index.html em cada pasta)
static/css/style.css  estilos e animações
static/js/main.js     menu, animações, lightbox, vídeos
static/js/contratar.js formulário de orçamento
static/img/           logos, fotos, capas dos vídeos
static/video/         vídeos já convertidos para web (H.264)
CNAME                 domínio próprio
```

## Publicar

Settings → Pages → *Deploy from a branch* → `main` / `(root)`.
Domínio: `cantorluizfelipe.com.br` (arquivo `CNAME`).
