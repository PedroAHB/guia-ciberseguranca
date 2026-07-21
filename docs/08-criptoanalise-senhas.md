# 8. Criptoanálise e Quebra de Senhas

Ao longo das fases anteriores, diversos artefatos criptográficos são coletados (hashes NTLM extraídos via Mimikatz, arquivos de captura de handshakes Wi-Fi, hashes de banco de dados extraídos via SQLmap). Esta seção concentra-se na conversão desses artefatos ilegíveis em credenciais em texto claro, através de ataques computacionais offline (sem interação com o serviço original) e online (contra um serviço ativo), bem como na geração e mutação inteligente de listas de palavras candidatas.

## 8.1 Hashcat

* **Descrição Acadêmica/Técnica:** O Hashcat é o motor de quebra de senhas mais performático da indústria, desenvolvido em C e OpenCL/CUDA, arquitetado para explorar o paralelismo massivo de Unidades de Processamento Gráfico (GPUs) em vez de depender exclusivamente do processamento sequencial de CPUs. Em baixo nível, a ferramenta compila *kernels* de computação específicos para cada algoritmo de *hash* suportado (mais de 350 modos, identificados numericamente), distribuindo o cálculo de milhões a bilhões de tentativas de *hash* por segundo entre os múltiplos núcleos de processamento paralelo de uma GPU. O motor suporta múltiplos vetores de ataque simultâneos e mutuamente combináveis — força bruta pura (*Brute-Force*), dicionário direto (*Straight*), *combinator* (concatenação de duas listas) e, mais notavelmente, ataques baseados em regras (*Rule-Based*), onde uma sintaxe compacta de transformação (ex: capitalização, substituição de caracteres, adição de sufixos numéricos) é aplicada dinamicamente sobre cada palavra de uma *wordlist* de entrada, multiplicando exponencialmente o espaço de busca sem a necessidade de armazenar fisicamente essas variações.  
* **Principais Funcionalidades:**  
  * Aceleração massiva via GPU (OpenCL/CUDA), atingindo taxas de processamento ordens de magnitude superiores a implementações baseadas em CPU.  
  * Suporte a mais de 350 algoritmos de *hash* distintos (NTLM, MD5, SHA-family, bcrypt, Kerberos 5 TGS-REP, WPA/WPA2, entre outros).  
  * Múltiplos modos de ataque combináveis: *Straight* (dicionário), *Combinator*, *Brute-Force* (máscara) e *Rule-Based* (mutação dinâmica).  
  * Motor de regras (*rules engine*) para mutação programática de *wordlists* (ex: capitalização, leet speak, inserção de sufixos), sem necessidade de gerar arquivos intermediários.  
  * Suporte a retomada de sessões interrompidas (*session/restore*) e *benchmarking* nativo de desempenho por algoritmo.

**Sintaxe e Comandos Principais:**  

```bash
# Ataque de dicionário simples especificando o modo do algoritmo de hash (ex: 1000 = NTLM)

hashcat -m [modo_hash] -a 0 [arquivo_hashes.txt] [wordlist.txt]

# Ataque de dicionário combinado com um arquivo de regras de mutação (ex: best64.rule)

hashcat -m [modo_hash] -a 0 [arquivo_hashes.txt] [wordlist.txt] -r [regras.rule]

# Ataque de força bruta baseado em máscara (ex: 8 caracteres, iniciando com letra maiúscula e terminando em 2 dígitos)

hashcat -m [modo_hash] -a 3 [arquivo_hashes.txt] ?u?l?l?l?l?l?d?d

# Exibição das senhas já quebradas em execuções anteriores, referenciando o arquivo de hashes original

hashcat -m [modo_hash] [arquivo_hashes.txt] --show
```

* **Exemplo Prático de Aplicação:**  
  * **Cenário:** Após extrair o hash NTLM de um usuário de domínio (via Mimikatz) que não pôde ser explorado diretamente por *Pass-the-Hash* devido a restrições de *Protected Users*, o analista precisa recuperar a senha em texto claro. A política de senhas da organização exige complexidade mínima, mas os colaboradores tendem a seguir padrões previsíveis (palavra capitalizada \+ ano).  
  * **Comando Executado:**  

```bash
hashcat -m 1000 hash_ntlm_extraido.txt /usr/share/wordlists/rockyou.txt -r /usr/share/hashcat/rules/best64.rule
```

* **Resultado Esperado:** O Hashcat carregará a GPU disponível, aplicando cada uma das 64 regras de mutação do arquivo best64.rule sobre cada palavra da *wordlist* rockyou.txt, testando variações como "Empresa2024\!" ou "empresa2024". Ao encontrar a correspondência exata com o hash NTLM fornecido, a senha em texto claro será exibida diretamente no terminal e persistida no arquivo de *potfile* padrão da ferramenta para consulta futura via \--show.

## 8.2 John the Ripper

* **Descrição Acadêmica/Técnica:** O John the Ripper (JtR) é um dos motores de quebra de senhas mais tradicionais e versáteis da indústria, desenvolvido em C, historicamente otimizado para processamento em CPU (embora sua variante *jumbo* também ofereça suporte experimental a OpenCL). Sua distinção arquitetural central reside no utilitário auxiliar *format-agnostic*, capaz de identificar automaticamente o algoritmo de um *hash* através de análise estrutural (comprimento, *salt*, delimitadores), e no script auxiliar *\*2john*, uma família de conversores que extrai hashes de formatos de arquivo proprietários e complexos (ex: documentos protegidos do Office, arquivos ZIP/RAR criptografados, chaves privadas SSH) para o formato de texto simples que o motor de quebra consegue processar. O modo de ataque "Single Crack" é particularmente notável por sua inteligência contextual, utilizando os próprios metadados da conta (nome de usuário, campos GECOS) como base para gerar candidatos de senha altamente direcionados antes de recorrer a *wordlists* genéricas.  
* **Principais Funcionalidades:**  
  * Identificação automática do formato/algoritmo de *hash* sem necessidade de especificação manual prévia na maioria dos casos.  
  * Suporte extensivo a conversores *\*2john* para extração de hashes de arquivos protegidos (Office, PDF, ZIP, RAR, chaves SSH privadas).  
  * Modo *Single Crack*, que gera candidatos de senha personalizados a partir dos metadados da própria conta do usuário.  
  * Modo incremental (*Incremental Mode*), realizando força bruta estatisticamente ordenada por frequência de caracteres do idioma.  
  * Suporte nativo a arquivos de senha no formato Unix *shadow* combinado com *passwd* (unshadow).

**Sintaxe e Comandos Principais:**  

```bash
# Conversão de um arquivo protegido (ex: chave privada SSH) para um formato de hash reconhecido pelo John

ssh2john [chave_privada_id_rsa] > [hash_extraido.txt]

# Combinação dos arquivos passwd e shadow do Linux em um único arquivo processável

unshadow [arquivo_passwd] [arquivo_shadow] > [hashes_combinados.txt]

# Ataque de quebra utilizando o modo Single Crack (baseado nos metadados da própria conta)

john --single [arquivo_de_hashes.txt]

# Ataque de dicionário padrão especificando a wordlist a ser utilizada

john --wordlist=[wordlist.txt] [arquivo_de_hashes.txt]

# Exibição das senhas já recuperadas em execuções anteriores

john --show [arquivo_de_hashes.txt]
```

* **Exemplo Prático de Aplicação:**  
  * **Cenário:** Durante a fase de pós-exploração em um servidor Linux, o analista obtém acesso de leitura aos arquivos /etc/passwd e /etc/shadow (via uma falha de permissão local). O objetivo é recuperar a senha em texto claro do usuário root ou de outra conta privilegiada armazenada nesses arquivos, para uso posterior em outros serviços da rede (dado o comum reaproveitamento de senhas).  
  * **Comandos Executados:**  

```bash
unshadow passwd.txt shadow.txt > hashes_servidor.txt

john --wordlist=/usr/share/wordlists/rockyou.txt hashes_servidor.txt
```

* **Resultado Esperado:** O John identificará automaticamente o algoritmo de *hash* (ex: SHA-512 *crypt*, indicado pelo prefixo $6$ no arquivo *shadow*) e testará cada entrada da *wordlist* rockyou.txt contra os hashes combinados. Ao concluir, o comando john \--show hashes\_servidor.txt exibirá diretamente no terminal a lista de contas cujas senhas foram recuperadas com sucesso, no formato usuario:senha\_em\_texto\_claro.

## 8.3 Crunch

* **Descrição Acadêmica/Técnica:** O Crunch é um gerador de *wordlists* customizadas escrito em C, projetado para produzir combinações sistemáticas e exaustivas de caracteres de acordo com parâmetros rígidos definidos pelo operador (comprimento mínimo/máximo, conjunto de caracteres, padrões estruturais fixos). Diferente de *wordlists* estáticas pré-compiladas (como a rockyou.txt), que representam senhas reais previamente vazadas, o Crunch opera de forma puramente combinatória e determinística, iterando metodicamente por todo o espaço amostral definido pelos parâmetros de entrada. Sua funcionalidade de padrões (-t) é particularmente relevante para engenharia social direcionada, permitindo fixar segmentos conhecidos ou inferidos da senha (ex: o nome da empresa) e permutar apenas as posições variáveis remanescentes (ex: dígitos de ano ou caracteres especiais), reduzindo drasticamente o espaço de busca em relação a uma força bruta genérica e irrestrita.  
* **Principais Funcionalidades:**  
  * Geração combinatória e exaustiva de *wordlists* com controle granular de comprimento mínimo e máximo.  
  * Definição de conjuntos de caracteres customizados (numérico, alfabético, especial ou combinações arbitrárias).  
  * Suporte a padrões estruturais fixos (-t) para geração direcionada, mantendo segmentos conhecidos constantes.  
  * Estimativa precisa do tamanho final do arquivo de saída e do número total de combinações antes da geração efetiva.  
  * Capacidade de saída direta para arquivo ou encadeamento via *pipe* (saída padrão) diretamente para outra ferramenta (ex: Hashcat/Aircrack-ng).

**Sintaxe e Comandos Principais:**  

```bash
# Geração de uma wordlist numérica pura (ex: todos os PINs de 4 dígitos), redirecionada para um arquivo

crunch 4 4 0123456789 -o [pins_4digitos.txt]

# Geração baseada em um padrão fixo, combinando um prefixo conhecido com sufixo numérico variável (@ = minúscula, % = número)

crunch 8 8 -t Empresa%%%% -o [wordlist_direcionada.txt]

# Geração com conjunto de caracteres customizado (letras minúsculas e dígitos), com saída direta via pipe para o Hashcat

crunch 6 8 abcdefghijklmnopqrstuvwxyz0123456789 | hashcat -m [modo_hash] [arquivo_hashes.txt]

# Estimativa do tamanho e quantidade de linhas resultantes sem gerar o arquivo completo

crunch 8 8 -t Empresa%%%% --stats
```

* **Exemplo Prático de Aplicação:**  
  * **Cenário:** Através de engenharia social e OSINT prévio, o analista descobriu que a política de senha da rede Wi-Fi corporativa da empresa "TechCorp" segue rigorosamente o padrão nome\_da\_empresa seguido de 4 dígitos numéricos (ex: TechCorp2024). O objetivo é gerar uma *wordlist* extremamente direcionada e compacta (em vez de uma genérica massiva) para uso subsequente em um ataque de quebra do *handshake* WPA2 capturado via Aircrack-ng.  
  * **Comando Executado:**  

```bash
crunch 10 10 -t TechCorp%%%% -o wordlist_techcorp_wifi.txt
```

* **Resultado Esperado:** O Crunch gerará instantaneamente um arquivo compacto contendo exatas 10.000 combinações (de TechCorp0000 a TechCorp9999), fixando o prefixo "TechCorp" e permutando exclusivamente os 4 últimos dígitos numéricos. Esse arquivo, drasticamente menor e mais direcionado que uma *wordlist* genérica de milhões de entradas, será utilizado como entrada direta para o Aircrack-ng, aumentando exponencialmente a velocidade e a probabilidade de sucesso da quebra da senha Wi-Fi.
