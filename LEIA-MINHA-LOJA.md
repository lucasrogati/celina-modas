# Atualização: Minha loja

## Escopo desta atualização

Este é um PACOTE DE ATUALIZAÇÃO, não uma cópia completa do site. Ele adiciona uma página separada de configurações e conecta o cabeçalho, rodapé, banner e WhatsApp aos dados salvos no Supabase.

Não substitui admin/admin.js nem admin/delete-products.js. As funções de produtos, categorias e exclusão que você enviou ficam preservadas. O admin/index.html incluído é a sua versão atual com um link Minha loja no cabeçalho.

## 1. Banco: aguarde a migração

A tabela store_settings ainda não existia quando preparei este pacote. A aplicação da migração pelo conector requer sua confirmação. Não considere a tabela criada antes de receber a confirmação de execução com sucesso.

O arquivo supabase/20261026_store_settings.sql é uma referência da migração preparada. Se ela já foi aplicada pelo assistente, NÃO execute de novo no SQL Editor. Não há necessidade de recriar tabelas de produtos, usuários, categorias ou fotos.

A migração cria um único registro de configurações, inicialmente configured=false. Assim, a criação da tabela não sobrescreve seus contatos ou banner com valores vazios. Até o primeiro salvamento bem-sucedido, o site usa os valores atuais do js/config.js.

Leitura pública; atualização apenas pela conta que já está autorizada em catalog_admins. Os campos são dados públicos da loja. Não há senhas, chaves secretas ou permissões administrativas nessa tabela. O SQL não muda nenhuma conta nem concede novo acesso ao Supabase.

## 2. Instale os arquivos

1. Faça uma cópia de segurança da pasta atual do seu site.
2. Extraia o ZIP.
3. Copie o CONTEÚDO da pasta celina deste pacote para a raiz do seu projeto, onde já existem as pastas admin e js.
4. Confirme a substituição de admin/index.html, js/bootstrap.js e js/main.js.
5. Mantenha seus outros arquivos, fotos, configurações e scripts. Não apague a pasta inteira antes de copiar: este ZIP é apenas a atualização.
6. Inicie o Live Server e recarregue com Ctrl+F5.
7. Entre no painel de produtos normalmente e toque em Minha loja. O endereço é admin/settings.html.

Não é necessário npm, compilação ou mudança de chave. A configuração pública existente do Supabase é reutilizada.

## 3. Primeiro uso

Preencha:
- WhatsApp: país + DDD + número. O painel remove espaços, parênteses e sinal +. Você precisa incluir o código do país; ele NÃO é acrescentado automaticamente.
- Instagram: @perfil ou link HTTPS do perfil. Não use endereço de publicação.
- E-mail público de contato: opcional. Não altera o e-mail de login.
- Horários: texto livre curto.
- Faixa superior: mostrar/esconder e texto.
- Banner: foto, destaque, título, descrição, texto do botão e destino.

Os destinos permitidos do botão são todas as peças, uma categoria ativa ou WhatsApp. Não há campo para executar código ou colar um link arbitrário.

A primeira gravação exige um WhatsApp válido e um título de banner. Revise o número com Testar WhatsApp ANTES de salvar. Esse botão só abre o contato: você ainda escolhe se vai enviar uma mensagem no aplicativo.

A prévia de computador e celular é aproximada. Ela mostra as alterações locais ainda não publicadas; confirme também o site real após salvar. Não alteramos cores, fontes ou layout geral.

## 4. Salvar, cancelar e conflitos

- Salvar alterações publica todos os campos juntos na linha de configuração.
- Se você escolher uma nova foto, ela é enviada primeiro; os dados só são publicados quando a atualização da linha é confirmada.
- Cancelar alterações recupera a última versão carregada, sem apagar nada no banco.
- Recarregar dados do banco consulta a versão mais recente e pede confirmação se você tiver mudanças locais.
- Há aviso ao sair com mudanças não salvas.
- A revisão do registro impede sobrescrever silenciosamente o salvamento de outra aba/dispositivo. Em caso de conflito, seus campos são preservados, mas você precisará conferir a versão do banco.
- Se a conexão falhar ou houver timeout, não presuma que nada foi salvo. Recarregue os dados para conferir antes de repetir.

Fotos já publicadas não são apagadas automaticamente ao trocar o banner. Isso evita quebrar páginas que ainda estejam abertas usando a URL antiga. Fotos enviadas em gravações canceladas ou com conflito podem ficar sem uso no Storage; a limpeza eventual deve ser cuidadosa. As fotos usam o bucket público existente celina-products, dentro do prefixo settings/. Nunca envie documentos ou imagens privadas.

## 5. Reflexo no catálogo

A cada abertura/recarga, o site tenta ler as configurações sem usar a sessão administrativa. As mudanças afetam:
- Número usado no atendimento e envio da sacola.
- Instagram, e-mail e horário do rodapé.
- Faixa de aviso em todas as páginas da loja.
- Imagem/textos/botão do banner principal.

Páginas já abertas não recebem atualização em tempo real. A revisão da sacola busca novamente as configurações antes de preparar o WhatsApp quando as configurações remotas já estavam ativas.

Se uma categoria usada no banner for excluída/desativada, o botão público passa a abrir todas as peças. Na tela de configuração, será necessário selecionar um destino válido antes do próximo salvamento.

Se a tabela ainda não existir ou a consulta falhar, a abertura do site usa config.js como fallback, para não derrubar o catálogo inteiro. Portanto, mantenha contatos de contingência coerentes nesse arquivo. Se o contato remoto já foi carregado e a consulta falhar na revisão da sacola, a ação é interrompida em vez de assumir um novo número.

## 6. Publicação

Depois do teste, publique os arquivos novos e alterados na mesma estrutura. Se estiver usando Git, confira git status antes de adicionar/commitar. Não é necessário force push só para esta atualização.

Não incluí _headers neste patch: preserve o seu arquivo atual. A integração usa o mesmo domínio Supabase e os mesmos recursos externos da versão anterior. A prévia usa estilos locais, imagens e elementos HTML; não exige iframe ou script externo adicional.

## 7. Checklist no serviço real

[ ] Login da administradora abre Minha loja.
[ ] Outra conta não consegue atualizar store_settings nem enviar fotos.
[ ] Testar WhatsApp abre o contato correto.
[ ] Cancelar restaura os valores sem publicar as alterações.
[ ] Faixa pode ser ocultada e reaparece ao ativar.
[ ] Foto enviada aparece no banner do site real.
[ ] Categoria do botão abre a seleção correta.
[ ] Instagram e e-mail abrem os destinos corretos.
[ ] Página em aba anônima mostra o novo conteúdo após recarregar.
[ ] Recursos existentes de criar/apagar categorias e excluir produtos continuam presentes.

Consulte TESTES-MINHA-LOJA.md para distinguir os testes simulados dos testes ainda pendentes no seu Supabase.
