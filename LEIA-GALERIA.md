# Galeria de fotos da Celina

## O que muda

A página do produto passa a mostrar uma foto grande de cada vez, com:
- Miniaturas laterais no computador e abaixo da foto no celular.
- Setas para foto anterior/próxima.
- Contador de foto atual e total.
- Deslizar com o dedo no celular.
- Arrastar com o mouse no computador.
- Navegação com setas do teclado, Home e End.
- Fotos inteiras (object-fit: contain), sem cortar a roupa para preencher o quadro.
- Preservação do clique na foto para abrir a ampliação já existente na loja.

## Instalar

1. Faça uma cópia do seu produto.html atual.
2. Extraia o ZIP.
3. Copie o CONTEÚDO da pasta celina para a raiz do projeto, onde já existem produto.html, css e js.
4. Aceite substituir somente produto.html. Os outros dois arquivos são novos:
   - css/product-gallery.css
   - js/product-gallery.js
5. NÃO apague as pastas existentes. Este pacote é apenas uma atualização.
6. Salve e recarregue a página do produto com Ctrl+F5.
7. Se estiver vendo a loja hospedada, publique os três arquivos na mesma estrutura.

O produto.html incluído foi preparado a partir da versão que você enviou. Se você fez outras alterações nesse HTML depois, preserve seu arquivo e acrescente somente as duas linhas abaixo.

Depois do link de css/style.css, dentro do head:

    <link rel="stylesheet" href="css/product-gallery.css?v=1">

Depois dos scripts existentes, antes de fechar head:

    <script defer src="js/product-gallery.js?v=1"></script>

Não adicione duas vezes se usar o produto.html pronto do pacote.

## Preservação das outras funções

Não substitui main.js, bootstrap.js, style.css ou os arquivos do painel. Assim, preserva a integração Minha loja, suas categorias, o carrinho e a correção de rodapé que você aplicou.

Não precisa executar SQL, alterar o Supabase ou cadastrar fotos de novo. A galeria utiliza as imagens que a página do produto já carregou, na mesma ordem. Para mudar a capa/ordem, continue usando a edição de fotos do produto no painel.

Com apenas uma foto, miniaturas e setas ficam escondidas. Com várias, cada foto ocupa uma posição no carrossel. As setas param na primeira/última imagem: não há repetição infinita.

A imagem agora cabe inteira dentro do espaço. Fotos muito horizontais ou verticais podem deixar área livre nas laterais ou acima/abaixo; isso é esperado ao evitar cortes.

## Se algo não aparecer

Confira se os dois novos arquivos estão nas pastas corretas e se as linhas de CSS/script estão no produto.html. Recarregue com Ctrl+F5 para não usar a versão antiga em cache.

Este complemento reconhece a estrutura existente .product-detail .gallery. Ele aguarda o carregamento assíncrono do catálogo antes de montar o carrossel. Se você mudou esses nomes no HTML gerado pelo seu main.js, será necessário adaptar o seletor.

## Testes executados

Chromium headless, arquivos locais, imagens de teste e CSS da loja enviada, sem requisições externas reais:
- Galeria inserida depois do carregamento assíncrono da página.
- Setas, miniaturas, contador e limites de navegação.
- Teclado: Home e ArrowRight.
- Clique de ampliação preservado.
- Arrastar com mouse sem abrir a ampliação por acidente.
- Rolagem horizontal e gesto de toque simulado, passando da primeira à segunda foto.
- Sem transbordamento horizontal nas larguras 390, 768 e 1440 px.
- Posição ativa preservada ao redimensionar.
- Uma foto e galerias de quatro e dez fotos.
- Nenhum erro de execução JavaScript observado.
- node --check passou para o novo script.

Não foi testado em aparelhos físicos, Safari/Firefox nem contra as imagens reais do seu banco. Não fiz alterações no Supabase ou no site hospedado.
