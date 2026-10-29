# Celina Modas — catálogo e painel

Comece pelo arquivo LEIA-PRIMEIRO.md. Ele contém a configuração, os passos de publicação e o checklist de testes.

## Estrutura

- admin/index.html: painel e login.
- admin/admin.js: formulários, fotos, produtos e categorias.
- admin/admin.css: visual do painel, adaptado ao celular.
- js/supabase-config.js: URL e chave PÚBLICA do Supabase.
- js/supabase-api.js: cliente HTTP de Auth, REST e Storage.
- js/catalog.js: leitura anônima do catálogo e adaptação dos dados.
- js/bootstrap.js: carrega o catálogo antes de iniciar a vitrine e o carrinho.
- js/main.js: interface da vitrine, seleção e revisão antes do WhatsApp.
- js/cart.js: carrinho/favoritos locais com validação de variantes.
- js/config.js: contatos e conteúdo editorial.
- js/products.js: exemplos preservados, usados SOMENTE se demoMode for ativado manualmente. Nunca são inseridos no banco automaticamente.
- css/style.css: visual público.
- assets: imagens e ícones locais.
- _headers: segurança e cache para Cloudflare Pages e serviços compatíveis.

Não é necessário executar npm install. O site continua estático e os dados ficam no Supabase.

O banco já foi criado. Não há SQL de recriação para executar nesta entrega.
