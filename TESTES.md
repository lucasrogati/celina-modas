# Testes desta versão

## Executados

Chromium headless, servidor HTTP local e respostas de API simuladas. Todas as requisições externas reais foram interceptadas; nenhum teste inseriu dados no projeto Supabase.

- Sintaxe dos nove arquivos JavaScript validada com node --check.
- Catálogo remoto simulado carregado antes do carrinho.
- Exibição das peças públicas sem usar sessão administrativa.
- Combinações Azul P / Azul M / Bege M com disponibilidades diferentes.
- Adição de duas variantes, carrinho e geração do link de WhatsApp após revisão.
- Rejeição de conta autenticada sem autorização administrativa.
- Entrada da conta autorizada e carregamento do painel.
- Edição de nome e preço e retorno à listagem.
- Cadastro de peça com arquivo de imagem real, decodificação e redução em canvas, upload simulado e publicação.
- Resposta de conflito para edição desatualizada do registro principal.
- Falha intermediária de gravação mantém rascunho; nova tentativa conclui.
- Marcação de esgotado e bloqueio de compra na vitrine.
- Banco sem peças publicadas: nenhuma reintrodução dos produtos de exemplo.
- Erro de conexão: estado de erro em vez de falso catálogo antigo.
- Verificação de ausência de rolagem horizontal em 390, 768 e 1440 px nas telas principais e no editor.
- Nenhum erro de execução JavaScript observado nos fluxos finais.

## Não executados

- Login com a senha real, renovação de sessão no Supabase real ou envio de mensagens reais.
- Upload/gravação/remoção reais no projeto.
- Auditoria de RLS contra tentativas reais de escrita anônima ou de outra conta. A configuração existente foi conferida em estrutura, mas os testes de autorização desta entrega usaram simulação.
- Disponibilidade das imagens externas e Google Fonts.
- Testes em aparelhos físicos, Safari e Firefox.
- Auditoria completa de acessibilidade, performance, concorrência ou segurança.

Antes de liberar para a cliente, execute o checklist em LEIA-PRIMEIRO.md com uma peça de teste e confirme o site em aba anônima.
