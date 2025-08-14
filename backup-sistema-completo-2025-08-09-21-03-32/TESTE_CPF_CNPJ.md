# Teste da Funcionalidade de Validação CPF/CNPJ

## Como Testar

### 1. Acesse o Formulário de Registro
- Vá para `http://localhost:3000/register`
- Certifique-se de que o console do navegador está aberto (F12)

### 2. Teste com CPFs de Demonstração (Funcionam 100%)
Para verificar se a funcionalidade está funcionando, teste primeiro com estes CPFs:

**CPFs de Teste:**
- `111.444.777-35` → João Silva Santos
- `123.456.789-09` → Maria Oliveira Costa  
- `987.654.321-00` → Pedro Almeida Lima
- `456.789.123-00` → Ana Paula Ferreira
- `789.123.456-00` → Carlos Eduardo Silva

**CNPJs de Teste:**
- `11.222.333/0001-81` → Empresa Teste Ltda
- `12.345.678/0001-95` → Comércio Silva Ltda
- `98.765.432/0001-00` → Serviços Oliveira Ltda
- `45.678.912/0001-00` → Indústria Ferreira Ltda
- `78.912.345/0001-00` → Comércio Eduardo Ltda

### 3. Teste com Seu CPF Real
Após confirmar que os CPFs de teste funcionam:

1. Digite seu CPF real no campo "Documento de Identificação"
2. Observe os logs no console do navegador
3. Verifique se o nome aparece na tela

### 4. O que Observar nos Logs

Os logs mostrarão:
- `=== INICIANDO VERIFICAÇÃO DE CPF ===`
- `CPF recebido: [seu CPF]`
- `CPF limpo: [CPF sem formatação]`
- `Fazendo validação matemática...`
- `CPF válido matematicamente, consultando APIs...`
- `Consultando CPF na Receita Federal...`
- `Status da resposta Receita Federal: [código]`
- `Resposta completa da Receita Federal: [dados]`

### 5. Possíveis Cenários

**Cenário 1: CPF de Teste**
```
CPF de teste encontrado: João Silva Santos
Nome encontrado e definindo: João Silva Santos
```

**Cenário 2: CPF Real com Sucesso**
```
Nome encontrado na Receita Federal: [Seu Nome Real]
Nome encontrado e definindo: [Seu Nome Real]
```

**Cenário 3: CPF Real sem Nome**
```
Nome não encontrado no HTML da Receita Federal
CPF válido mas sem nome encontrado nas APIs
CPF válido mas sem nome encontrado, limpando nome
```

**Cenário 4: Erro na API**
```
Receita Federal retornou erro: 404 Not Found
Tentando API alternativa (cpfcnpj.com.br)...
```

### 6. Se Seu CPF Não Aparecer

Se seu CPF real não mostrar o nome, pode ser devido a:

1. **API temporariamente indisponível** - Tente novamente em alguns minutos
2. **CPF não encontrado na base** - Alguns CPFs podem não estar disponíveis nas APIs públicas
3. **Problema de CORS** - As APIs podem estar bloqueando requisições do navegador

### 7. Como Reportar Problemas

Se encontrar problemas, forneça:
1. Os logs completos do console
2. O CPF que você testou (pode mascarar alguns dígitos)
3. Se funcionou com CPFs de teste mas não com CPF real

### 8. Funcionalidades Implementadas

✅ **Validação Matemática** - Verifica se o CPF/CNPJ é matematicamente válido
✅ **Verificação de Existência** - Consulta APIs públicas para verificar se existe
✅ **Exibição do Nome** - Mostra o nome/empresa quando encontrado
✅ **CPFs/CNPJs de Teste** - Para demonstração e verificação da funcionalidade
✅ **Logs Detalhados** - Para depuração e diagnóstico
✅ **Fallback** - Se uma API falhar, tenta outra
✅ **Tratamento de Erros** - Gerencia erros de rede e APIs indisponíveis

### 9. APIs Utilizadas

1. **Receita Federal** (primária): Via proxy `api.allorigins.win`
   - CPF: `https://servicos.receita.fazenda.gov.br/servicos/cpf/consultasituacao/ConsultaPublica.asp?CPF={cpf}`
   - CNPJ: `https://servicos.receita.fazenda.gov.br/servicos/cnpj/consultasituacao/ConsultaPublica.asp?CNPJ={cnpj}`
2. **CPFCNPJ.com.br** (alternativa): `https://api.cpfcnpj.com.br/...`

A API primária consulta diretamente a Receita Federal através de um proxy para contornar restrições de CORS. 