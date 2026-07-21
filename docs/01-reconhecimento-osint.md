# 1. Reconhecimento Passivo e OSINT

Resumo: Coleta de informações em fontes abertas e inteligência de ameaças sem interação direta com a infraestrutura do alvo.

## 1.1 TheHarvester

* **Descrição Acadêmica/Técnica:** O theHarvester é um *script* desenvolvido em Python projetado para a automação da coleta de dados de inteligência em fontes abertas. Operando em nível de aplicação (Camada 7 do modelo OSI), ele realiza requisições iterativas a motores de busca públicos, servidores de chaves PGP e APIs de terceiros (como Shodan, Hunter.io, e DNSdumpster) para compilar metadados associados a um domínio alvo. A arquitetura da ferramenta minimiza o tráfego de rede direto contra a infraestrutura do alvo, caracterizando-se primariamente como uma técnica de reconhecimento passivo, mitigando a probabilidade de detecção por sistemas de prevenção de intrusão (IPS).  
    
* **Principais Funcionalidades:**  
  * Extração passiva de subdomínios, endereços IPv4/IPv6 e URLs associadas ao domínio.  
  * Identificação e coleta de endereços de e-mail corporativo expostos na web.  
  * Integração modular com APIs de *Threat Intelligence* para expansão do vetor de dados.  
  * Geração de relatórios estruturados (XML, HTML) para integração com outras ferramentas na esteira de testes.

**Sintaxe e Comandos Principais:**  

```bash
# Sintaxe básica para pesquisa passiva
theHarvester -d [dominio.com] -b [fonte_ou_all] -l [limite_de_resultados]

# Sintaxe para execução abrangente com exportação de dados
theHarvester -d [dominio.com] -b all -l 500 -f [nome_do_arquivo_de_saida]
```

* **Exemplo Prático de Aplicação:**  
  * **Cenário:** Em um engajamento de *Penetration Testing* modalidade *Black Box* contra a organização "alvo.com", o analista necessita mapear a superfície de ataque externa e identificar um padrão de nomenclatura de e-mails corporativos (ex: *nome.sobrenome@alvo.com*). O objetivo é alimentar uma futura campanha de *password spraying* ou engenharia social, sem disparar alertas nos *firewalls* da organização.

**Comando Executado:**  

```bash
theHarvester -d alvo.com -b all -l 500 -f recon_alvo_inicial
```

* **Resultado Esperado:** O comando consultará todas as fontes públicas disponíveis (all), limitando a busca a 500 resultados por fonte de pesquisa, e salvará a saída estruturada nos formatos HTML e XML no arquivo recon\_alvo\_inicial, contendo os e-mails e subdomínios vinculados a "alvo.com".

## 1.2 Recon-ng

* **Descrição Acadêmica/Técnica:** O recon-ng é um framework de reconhecimento web completo, desenvolvido em Python, que adota uma arquitetura modular análoga ao Metasploit. Diferente de scripts isolados, ele utiliza uma base de dados SQLite estruturada para armazenar hosts, contatos, localizações e vulnerabilidades, permitindo a correlação de dados entre diferentes módulos. O sistema opera através de uma interface de linha de comando (CLI) que gerencia workspaces, garantindo a segregação de dados entre diferentes projetos de auditoria. Sua extensibilidade via APIs de terceiros permite a automação de consultas complexas e o processamento de grandes volumes de dados de inteligência sem interação direta com o alvo.  
* **Principais Funcionalidades:**  
  * Arquitetura modular dividida em: *Discovery*, *Exploitation*, *Import*, *Recon* e *Reporting*.  
  * Gestão de inventário técnico através de tabelas em banco de dados interno.  
  * Sistema de *Marketplace* para instalação e atualização dinâmica de módulos.  
  * Normalização de dados provenientes de múltiplas fontes OSINT.

**Sintaxe e Comandos Principais:**  

```bash
# Inicialização do framework

recon-ng

# Gerenciamento de espaços de trabalho (workspaces)

workspaces create [nome_do_projeto]

workspaces list

# Instalação e carregamento de módulos via Marketplace

marketplace install [modulo]

modules load [modulo]

# Configuração de chaves de API (ex: Shodan, Virustotal)

keys add [nome_da_api] [valor_da_chave]

# Execução de fluxo de trabalho (exemplo: busca de hosts)

info              # Exibe opções do módulo carregado

options set SOURCE [alvo.com]

run
```

* **Exemplo Prático de Aplicação:**  
  * **Cenário:** Durante a fase de reconhecimento de uma infraestrutura baseada em nuvem, é necessário identificar todos os subdomínios de uma organização e verificar se algum está associado a serviços de armazenamento expostos. O analista utiliza o recon-ng para centralizar as descobertas em um único banco de dados, facilitando a exportação posterior para ferramentas de análise de vulnerabilidades.

**Comandos Executados:**  

```bash
recon-ng

workspaces create auditoria_nuvem

marketplace install recon/domains-hosts/brute_hosts

modules load recon/domains-hosts/brute_hosts

options set SOURCE alvo.com

run

show hosts
```

* **Resultado Esperado:** O framework realizará ataques de força bruta no DNS (via dicionário) para identificar hosts ativos. Os resultados (nomes de host e endereços IP) serão automaticamente inseridos na tabela `hosts` do banco de dados do workspace `auditoria_nuvem`, prontos para serem utilizados por outros módulos de geolocalização ou busca de e-mails.

## 1.3 OWASP Amass

* **Descrição Acadêmica/Técnica:** O OWASP Amass é uma ferramenta desenvolvida em linguagem Go, arquitetada para o mapeamento profundo da superfície de ataque e descoberta de ativos em redes externas. Diferente de *scripts* de enumeração simples, o Amass estrutura os dados coletados utilizando um banco de dados de grafos, o que permite a análise relacional entre domínios, endereços IP e provedores de hospedagem. Em baixo nível, a ferramenta implementa técnicas heurísticas, incluindo consultas a dezenas de APIs de *Threat Intelligence*, *scraping* de mecanismos de busca, análise de *Certificate Transparency* (CT Logs), resolução recursiva de DNS, detecção de *wildcards* e permutações de nomes para inferir a existência de infraestruturas não documentadas.  
* **Principais Funcionalidades:**  
  * Mapeamento de organizações através de *Autonomous System Numbers* (ASN) e blocos CIDR.  
  * Execução de enumeração ativa (resolução e força bruta DNS) e passiva (coleta de terceiros sem tocar no alvo).  
  * Identificação de *subdomain takeover* e validação estrutural de apontamentos de DNS.  
  * *Tracking* contínuo da infraestrutura, permitindo identificar diferenças (*diffing*) e novos ativos entre ciclos de execução.  
  * Integração para exportação de malhas visuais e topologia para ferramentas como Maltego.

**Sintaxe e Comandos Principais:**  

```bash
# Enumeração estritamente passiva (sem envio de pacotes ao alvo direto)
amass enum -passive -d [dominio.com]

# Enumeração ativa com força bruta de DNS, resolução de IPs e exibição da fonte de origem
amass enum -active -d [dominio.com] -brute -ip -src

# Coleta de inteligência corporativa buscando domínios associados a um ASN específico
amass intel -asn [NUMERO_ASN]

# Identificação de novos ativos em relação a varreduras anteriores (tracking histórico)
amass track -d [dominio.com]
```

* **Exemplo Prático de Aplicação:**  
  * **Cenário:** Em um ciclo de auditoria contínua integrada a uma esteira DevSecOps, o objetivo é mapear exaustivamente a infraestrutura da organização "alvo.com". O escopo (*White Box*) permite interação direta, e o analista necessita descobrir subdomínios subjacentes, resolver seus IPs correspondentes e armazenar a saída em um diretório específico para alimentar *pipelines* subsequentes de varredura de portas (ex: Nmap).

**Comando Executado:**  

```bash
amass enum -active -d alvo.com -brute -ip -dir ./recon_amass_alvo
```

* **Resultado Esperado:** O Amass acionará resoluções de DNS com listas de permutações e força bruta, consultará *logs* de transparência de certificados e APIs, armazenando a topologia resultante estruturada (incluindo o banco em formato JSON e *logs* de texto) dentro do diretório ./recon\_amass\_alvo.

## 1.4 Maltego

* **Descrição Acadêmica/Técnica:** O Maltego é uma plataforma de mineração de dados e análise de vínculos (*link analysis*), desenvolvida em Java, com arquitetura primariamente orientada a uma interface gráfica de grafos relacionais. Sua operação ocorre por meio de entidades (nós) que são submetidas a "transformações" (*transforms*). Em baixo nível, um *transform* é um código (frequentemente em Python) executado localmente ou em servidores de terceiros (TAS \- *Transform Application Server*), encarregado de realizar consultas estruturadas via APIs a bases de dados públicas e privadas (ex: registros WHOIS, Shodan, redes sociais e inteligência de ameaças). O retorno de dados em formato XML é instantaneamente renderizado em um grafo direcionado, permitindo ao analista correlacionar dezenas de milhares de artefatos de infraestrutura de TI, e identificar interdependências ocultas durante a modelagem de ameaças.

* **Principais Funcionalidades:**  
  * Mapeamento visual e interativo de topologias de rede, domínios, *Autonomous Systems* (ASNs) e relações de confiança.  
  * Execução paralela de coletas OSINT a partir de um único ponto de dados (semente).  
  * Extensibilidade massiva via *Maltego Transform Hub* (integração com VirusTotal, AlienVault OTX, MITRE ATT\&CK, entre outros).  
  * Agrupamento hierárquico e análise estatística de grandes volumes de entidades para identificação de padrões.

**Sintaxe e Comandos Principais:** Apesar de sua natureza inerentemente gráfica, o fluxo de inicialização e o desenvolvimento de módulos customizados (*transforms*) em sistemas *Unix-like* podem ser manipulados via terminal:  

```bash
# Inicialização do processo principal da interface gráfica

maltego

# Criação de um projeto base para desenvolvimento de transforms customizados em Python

maltego-trx start [nome_do_projeto]

# Execução local de um transform customizado para validação de saída

python3 project.py local [nome_do_transform] [valor_da_entidade]
```

* **Exemplo Prático de Aplicação:**  
  * **Cenário:** Durante o reconhecimento de um domínio corporativo de uma organização, a equipe de cibersegurança necessita correlacionar a infraestrutura pública com possíveis credenciais vazadas e identificar relações societárias expostas que possam servir como vetores para campanhas de *phishing* ou comprometimento de contas (*Account Takeover*).  
  * **Execução Prática:** O analista insere a entidade Domain com o valor "alvo.com" no centro do grafo. Em seguida, seleciona o nó e executa simultaneamente as transformações To Email address \[theHarvester\] e To DNS Name \[Find sub-domains\]. Selecionando as entidades de e-mail resultantes, executa o *transform* To Breach \[Have I Been Pwned\].

    

  * **Resultado Esperado:** O sistema renderizará uma árvore visual ramificando o domínio primário em diversos subdomínios e endereços de e-mail funcionais. Adicionalmente, conectará os e-mails a nós que representam incidentes de vazamento de dados documentados (com datas e tipos de dados expostos), fornecendo insumos empíricos e imediatos para a continuidade da auditoria de segurança.

## 1.5 SpiderFoot

* **Descrição Acadêmica/Técnica:** O SpiderFoot é uma ferramenta de automação de inteligência de fontes abertas (OSINT) desenvolvida em Python, projetada para integrar e correlacionar dados de mais de 200 fontes distintas. Sua arquitetura é orientada a eventos e baseada em módulos: cada dado coletado (ex: um endereço IP) é tratado como um evento que pode disparar automaticamente outros módulos (ex: geolocalização ou verificação de *reputation*). Em baixo nível, a ferramenta gerencia requisições assíncronas para APIs de terceiros e realiza *web scraping* para compilar um grafo de informações sobre domínios, sub-redes, e-mails e nomes de usuário, minimizando o esforço manual de correlação de dados brutos.  
* **Principais Funcionalidades:**  
  * Execução de varreduras recursivas que automatizam o fluxo de descoberta de ativos.  
  * Integração nativa com APIs de *Threat Intelligence* (Shodan, Censys, VirusTotal, etc.).  
  * Interface web (GUI) integrada para visualização de gráficos de relacionamentos e tabelas de dados.  
  * Capacidade de monitoramento contínuo para detecção de alterações na superfície de ataque.

**Sintaxe e Comandos Principais:**  

```bash
# Inicialização do servidor para acesso via interface gráfica (padrão: 127.0.0.1:5001)

spiderfoot -l 127.0.0.1:5001

# Execução via CLI: listar todos os módulos de coleta disponíveis

spiderfoot -m

# Iniciar um scan via CLI em um alvo específico com módulos selecionados e saída em CSV

spiderfoot -s alvo.com -m s3_bucket,whois,google_maps -o csv > resultados_recon.csv
```

* **Exemplo Prático de Aplicação:**  
  * **Cenário:** Um analista de infraestrutura precisa identificar buckets S3 da Amazon Web Services (AWS) que possam estar associados ao domínio "alvo.com" e verificar se há exposição de dados sensíveis ou arquivos de configuração críticos.  
  * **Execução Prática:** O analista inicia o SpiderFoot, seleciona o alvo e ativa especificamente o módulo s3\_bucket.  
  * **Resultado Esperado:** O SpiderFoot realizará buscas exaustivas por nomes de buckets que sigam o padrão do domínio alvo. Caso identificados, o analista poderá verificar se o acesso público está habilitado, prevenindo um potencial vazamento de dados antes que seja explorado por agentes maliciosos.
