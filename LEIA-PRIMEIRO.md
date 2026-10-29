# Celina: painel administrativo + catálogo online

## O que esta entrega contém

Este pacote é a versão COMPLETA do site em HTML/CSS/JavaScript, com a interface original adaptada para o banco real da Celina. Não exige React, Node, npm, compilação ou um servidor próprio. O servidor de dados é o projeto Supabase já configurado.

O painel fica em admin/index.html. A loja pública continua em index.html. A conta autorizada é a cadastrada no Supabase: celinamodas@gmail.com. Use a senha do painel criada pelo responsável; nenhuma senha foi incluída neste pacote.

## 1. Extraia e faça uma cópia de segurança

Extraia o ZIP. Guarde uma cópia do site antigo antes de substituí-lo. A raiz do site precisa conter index.html e as pastas admin, js, css e assets. Não coloque o conteúdo inteiro dentro de uma segunda pasta na hospedagem.

Os arquivos originais que você enviou avulsos foram reorganizados nas pastas esperadas pelo HTML. Logo, CSS e páginas foram preservados; a lógica da loja foi ampliada para os dados remotos.

## 2. A configuração do Supabase já está preenchida

Abra js/supabase-config.js para conferir:

- Projeto: pzfwficuhoaindnffbli.
- URL: https://pzfwficuhoaindnffbli.supabase.co.
- Chave publishable pública obtida do seu projeto.
- Bucket: celina-products.
- demoMode: false.

NÃO execute novamente o SQL de criação das tabelas. Não recrie o projeto. A estrutura existente foi conferida via conector antes de preparar estes arquivos.

Nunca troque a chave pública por uma sb_secret_ ou service_role. Nunca coloque a senha da administradora em JavaScript, HTML ou Git. Esconder o link admin não é a proteção: o banco aplica RLS e valida a conta autorizada.

A sessão do painel usa sessionStorage, com renovação de token quando necessário. Ela não é compartilhada pelo catálogo público: todas as consultas da vitrine são anônimas, inclusive no navegador em que a administradora está logada. Isso evita que rascunhos apareçam publicamente por acidente.

## 3. Teste local com um servidor HTTP

No VS Code, abra a pasta e use a extensão Live Server. Outra opção, se tiver Python instalado:

    python -m http.server 8000

Abra http://localhost:8000/admin/index.html.

Não teste esta versão abrindo index.html por file://. O login e as APIs devem ser testados por HTTP local ou HTTPS na hospedagem. É necessário estar conectado à internet para usar Supabase, fotos externas e fontes externas.

## 4. Entre e cadastre uma peça

1. Acesse admin/index.html pelo servidor local ou pela hospedagem.
2. Entre com celinamodas@gmail.com e a senha cadastrada no Supabase Auth.
3. Clique em Adicionar produto.
4. Escolha pelo menos uma foto JPG, PNG ou WebP.
5. Preencha nome, preço e categoria.
6. Informe o nome de cada cor e escolha o tom visual no seletor de cores.
7. Marque os tamanhos disponíveis EM CADA COR.
8. Se precisar de números ou tamanho único, edite a lista de tamanhos separados por vírgula e toque em Aplicar tamanhos.
9. Escolha Mostrar no catálogo, Guardar como rascunho ou Ocultar do catálogo.
10. Clique em Salvar produto e aguarde a mensagem de sucesso.
11. Abra o catálogo em uma aba anônima para conferir a versão que os visitantes veem.

Não há produtos reais cadastrados neste banco no momento da montagem. Por isso, a vitrine remota ficará vazia até você cadastrar uma peça publicada. Os produtos antigos de exemplo NÃO são importados automaticamente nem usados como fallback em produção.

Você pode começar com uma peça de teste como rascunho e só publicá-la quando as informações estiverem corretas. O bucket de fotos é público: mesmo fotos de rascunhos podem ser acessadas por quem souber sua URL. Nunca envie documentos ou fotos privadas.

## 5. Atualizações do dia a dia

- Editar: fotos, preço, informações e disponibilidade por combinação de cor/tamanho.
- Marcar esgotado: desativa todos os tamanhos de todas as cores daquela peça.
- Disponibilizar novamente: entre em Editar e marque os tamanhos corretos por cor.
- Ocultar: selecione Ocultar do catálogo no cadastro. O produto não é apagado e poderá voltar depois.
- Duplicar: copia os dados para uma peça nova; é necessário adicionar as fotos da nova peça. Isso evita que dois produtos compartilhem um arquivo que possa ser apagado ao editar o outro.
- Categorias: permite criar, renomear, ativar e desativar. Uma categoria desativada esconde suas peças na vitrine sem apagá-las.

Esta primeira versão não tem exclusão definitiva de produtos na interface, por segurança. Use Ocultar. Não há contagem de unidades, reserva ou baixa automática de estoque. Vendas feitas no balcão ou no WhatsApp precisam ser refletidas no painel pela administradora.

As alterações ficam no Supabase e aparecem para todos ao abrir ou recarregar a página do catálogo. Não é sincronização em tempo real de páginas já abertas.

## 6. Configure o WhatsApp antes de publicar

No arquivo js/config.js, preencha whatsapp com o número REAL da loja: código do país + DDD + número, somente dígitos e entre aspas. Ele estava vazio nos arquivos recebidos e foi preservado vazio. Não usamos um número inventado.

Também revise horários, Instagram, e-mail, banner e editorial nesse mesmo arquivo. Essas configurações e os banners ainda são editados no código, não no painel.

A cliente escolhe as peças e monta a sacola. Ao continuar, o site consulta novamente o catálogo, atualiza preços e disponibilidade e pede revisão se algo mudou. Em seguida aparece o botão Abrir WhatsApp. Só a cliente pode confirmar o envio da mensagem no aplicativo.

O site não cobra cartão ou Pix, não calcula frete e não confirma a compra. O subtotal é apenas das peças. A confirmação final é feita no atendimento.

## 7. Suba os arquivos completos

Substitua a versão do site pelo conteúdo desta pasta, preservando a estrutura:

    index.html
    categoria.html
    produto.html
    carrinho.html
    informacoes.html
    admin/
    js/
    css/
    assets/
    _headers

Na Cloudflare Pages, continue usando a mesma raiz de publicação, sem comando de build para este pacote estático. O arquivo _headers fornece cabeçalhos de segurança e evita cache da área admin/configuração em hospedagens compatíveis.

Se publicar em outro serviço, confira como configurar os mesmos cabeçalhos; não assuma que ele lê _headers. Se trocar o projeto Supabase ou usar fotos de outros domínios no código, ajuste também a política Content-Security-Policy desse arquivo.

Para atualização pelo Git, na pasta do seu repositório local, depois de copiar o pacote por cima:

    git status
    git add .
    git commit -m "Adiciona painel e catalogo integrado ao Supabase"
    git push origin main

Não é necessário force push para esta atualização. Se houver erro ou divergência de histórico, pare e confira antes de continuar. Nunca envie tokens na URL do remoto.

## 8. Teste antes de liberar para a cliente

[ ] Login com a conta correta funciona.
[ ] Conta diferente não abre o painel nem consegue alterar dados.
[ ] Produto publicado aparece em aba anônima.
[ ] Rascunho e produto oculto não aparecem nessa aba.
[ ] Foto enviada pelo celular aparece no catálogo.
[ ] Azul P pode estar disponível enquanto Azul M e Bege P ficam indisponíveis.
[ ] Produto esgotado não entra na sacola.
[ ] Produto ocultado não reaparece como exemplo antigo.
[ ] Alteração de preço aparece no catálogo e na revisão da sacola.
[ ] WhatsApp abre para o número real e com a mensagem correta.
[ ] Categoria desativada não aparece no menu e não expõe suas peças.
[ ] Revise informações comerciais e a política de privacidade com dados reais.

## 9. Se algo falhar

- Acesso negado: confira o e-mail e a senha do painel. Uma conta criada no Auth não ganha permissão administrativa automaticamente. A conta precisa corresponder à que está em catalog_admins.
- Nada aparece na vitrine: confira se há produto publicado em categoria ativa. A conexão pode estar certa e o banco simplesmente vazio.
- As fotos falham: confira o bucket celina-products, seu limite de 5 MiB, os tipos permitidos e as políticas de Storage. O painel reduz as imagens antes de enviá-las.
- Se o envio ou salvamento falhar, o produto pode ficar como rascunho para impedir publicação incompleta. Os campos são mantidos para nova tentativa. Voltar à lista sem salvar pode descartar alterações locais.
- Se houver timeout, confira a lista atualizada antes de repetir: o servidor pode ter concluído uma operação enquanto o navegador perdeu a resposta.
- Ao salvar uma peça já publicada, ela passa temporariamente por rascunho e só é republicada depois que as etapas terminam. Não há transação única entre fotos e tabelas nesta versão.
- Sessão expirada: entre novamente. Tokens não são senhas fixas; a renovação acontece automaticamente enquanto a sessão for válida.
- Se várias abas/dispositivos editarem a mesma peça, um conflito de versão no registro principal bloqueia a sobrescrita silenciosa. Atualize a lista e reabra a peça.
- Fotos enviadas em tentativas canceladas podem ficar sem referência no Storage. A limpeza eventual precisa considerar product_images para não remover fotos em uso. Não apague o bucket em massa.

## Limites desta entrega

O pacote foi testado em navegador com a API simulada, sem usar a senha da Celina ou criar produtos no seu banco. Não foi feito teste completo de login/gravação no serviço real: execute o checklist acima. Consulte TESTES.md.

Não foram alteradas as permissões existentes, feitas migrações, modificada a conta administradora ou substituído o site publicado durante esta entrega. A instalação só acontece quando você publica os arquivos. Não há garantia de custo zero contínuo: consumo de banco, armazenamento e tráfego depende do plano e do uso do Supabase.
