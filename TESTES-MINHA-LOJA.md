# Testes da atualização Minha loja

Executados em Chromium headless, com servidor HTTP local e respostas de Supabase simuladas. Nenhum teste usou a senha real nem gravou dados no seu projeto.

Passaram:
- Validação de sintaxe de todos os scripts da cópia de teste.
- Ausência de sessão e conta sem autorização não expõem o formulário.
- Registro ainda não configurado preserva valores de config.js.
- Salvamento de WhatsApp normalizado, Instagram, e-mail, horários e banner.
- Preparação de uma imagem real em canvas e upload simulado com prefixo settings/.
- Publicação somente após a atualização da linha ser confirmada.
- Conteúdo salvo refletido no título, rodapé, aviso e destino de categoria do banner na vitrine.
- Leitura pública das configurações sem cabeçalho Authorization da administradora.
- Cancelamento de alterações.
- Conflito de revisão mantém os campos e não sobrescreve a versão simulada do servidor.
- Erro de gravação mantém os campos.
- Rejeição de URL javascript: no Instagram.
- Prévia de celular/computador e ausência de transbordamento horizontal em 390, 768 e 1440 px.
- Tabela ausente não quebra a abertura da vitrine; fallback para config.js.
- Nenhum erro JavaScript observado no fluxo final.
- admin/admin.js e admin/delete-products.js da cópia de teste foram preservados sem alteração; não são substituídos neste patch.

Pendente:
- Aplicação da migração SQL, que exige confirmação do usuário.
- Teste real de login, upload, gravação, revisão e RLS no projeto.
- Teste da nova função/trigger SQL em PostgreSQL real.
- Teste em aparelhos físicos e outros navegadores.
- Aparência com imagens externas/fontes carregadas, pois as conexões externas foram interceptadas nos testes.

A prévia é aproximada; não é comparação pixel a pixel com o site.
