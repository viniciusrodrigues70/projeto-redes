# 🎲 Tabuleiro Virtual via Terminal

Projeto acadêmico da disciplina de **Redes de Computadores**, desenvolvido em Python, com o objetivo de demonstrar comunicação entre processos por meio de **sockets IPv4/TCP**, programação concorrente com **threads** e sincronização de acesso a dados compartilhados usando **Mutex**.

> **Estado atual do desenvolvimento:** o arquivo `config.py` já foi criado. Os demais arquivos descritos neste documento ainda serão implementados pelos integrantes da equipe. Este README apresenta a proposta, o funcionamento esperado e as responsabilidades de cada parte do projeto.

## 🎯 1. Objetivo do projeto

Desenvolver um jogo de tabuleiro executado pelo terminal, no qual de **1 a 4 jogadores** participam de uma mesma partida. O sistema seguirá o modelo cliente-servidor:

- O **servidor** controla a partida, recebe as conexões, valida os turnos, sorteia os dados e atualiza as posições.
- O **cliente** oferece uma interface no terminal e permite controlar todos os jogadores selecionados a partir de uma única execução.
- Cada jogador terá uma conexão TCP independente com o servidor, mesmo que todos sejam controlados pelo mesmo terminal cliente.

O principal objetivo técnico é demonstrar como diferentes conexões podem ser atendidas concorrentemente, mantendo as regras e o estado do jogo consistentes.

## 🎮 2. Como o jogo deverá funcionar

1. O servidor é iniciado e fica aguardando conexões.
2. O cliente é iniciado e pergunta quantos jogadores participarão, de 1 a 4.
3. O cliente estabelece uma conexão TCP independente para cada jogador selecionado.
4. A partida começa quando todos os jogadores escolhidos estiverem conectados.
5. Todos começam na posição zero do tabuleiro.
6. O servidor determina a ordem dos jogadores e informa de quem é a vez.
7. Somente o jogador da vez pode solicitar uma jogada. O cliente envia o comando, mas é o servidor que valida se ele pode jogar.
8. Em cada turno, o servidor sorteia um número de 1 a 6 e avança a posição do jogador correspondente.
9. Os jogadores fazem suas jogadas **uma de cada vez**, respeitando a ordem. Um jogador não pode realizar uma nova jogada antes de os demais jogadores ativos concluírem a rodada.
10. Quando todos os jogadores que continuam na partida tiverem jogado, o servidor envia a todos um relatório com as posições atualizadas.
11. Após o relatório, uma nova rodada começa, seguindo a ordem definida pelo servidor.
12. Vence o primeiro jogador que alcançar ou ultrapassar a casa 30. O servidor anuncia o resultado e encerra a partida.

### Desconexão de um jogador

Se um jogador sair ou perder a conexão durante a partida, o servidor deverá removê-lo da ordem de jogadas. Os jogadores que permanecerem conectados poderão continuar. Se a desconexão fizer com que todos os jogadores restantes já tenham concluído suas jogadas, o servidor deverá fechar a rodada e enviar o relatório normalmente.

## 🧩 3. Organização dos arquivos

O projeto será dividido em quatro arquivos Python principais. Cada integrante poderá desenvolver uma parte, respeitando as responsabilidades e a comunicação definidas abaixo.

```text
TabuleiroVirtual/
│
├── config.py       # Configurações e formato das mensagens
├── jogo.py         # Regras e estado da partida
├── servidor.py     # Comunicação TCP e controle das conexões
├── cliente.py      # Interface do terminal dos jogadores
└── README.md       # Documentação do projeto
```

| Arquivo | Responsabilidade | Estado |
|---|---|---|
| `config.py` | Definir IP, porta, quantidade máxima de jogadores, casa final e funções auxiliares para organizar mensagens JSON. | **Criado** |
| `jogo.py` | Implementar as regras, registrar jogadores, controlar posições, validar a ordem dos turnos, concluir rodadas e identificar o vencedor. | A desenvolver |
| `servidor.py` | Criar o socket TCP, aceitar conexões, criar threads para atender os clientes, coordenar o jogo e proteger os dados compartilhados com Mutex. | A desenvolver |
| `cliente.py` | Perguntar a quantidade de jogadores, abrir uma conexão para cada um, receber atualizações e enviar comandos pelo terminal. | A desenvolver |

## ⚙️ 4. Tecnologias e conceitos que serão utilizados

### 4.1. Sockets IPv4 e TCP

A comunicação entre cliente e servidor será feita com a biblioteca `socket`, utilizando:

- `socket.AF_INET`: define o uso de endereços IPv4.
- `socket.SOCK_STREAM`: define o uso do protocolo TCP.
- `bind()`: associa o socket do servidor a um endereço e uma porta.
- `listen()`: coloca o servidor em estado de espera por conexões.
- `accept()`: aceita uma conexão de um cliente.
- `connect()`: permite que o cliente se conecte ao servidor.
- `sendall()` e `recv()`: enviam e recebem dados pela conexão.

O TCP é um fluxo de bytes. Por isso, o programa deverá definir uma forma de separar as mensagens recebidas. A proposta é finalizar cada mensagem JSON com uma quebra de linha (`\n`), permitindo identificar o fim de cada mensagem.

### 4.2. Threads

O servidor deverá criar uma thread para atender cada conexão aceita. Assim, poderá acompanhar os jogadores sem bloquear a aceitação de novas conexões.

No cliente, a proposta é manter uma thread de escuta para cada jogador. Essas threads receberão as mensagens enviadas pelo servidor, enquanto a thread principal continuará lendo os comandos digitados no terminal.

### 4.3. Mutex e sincronização

Como várias threads poderão acessar informações da mesma partida, será necessário proteger os dados compartilhados. Por exemplo: lista de jogadores, posições, ordem dos turnos e jogadores que ainda precisam jogar na rodada.

Será utilizado `threading.Lock()` para garantir que operações críticas sejam executadas por uma thread de cada vez. Isso evita condições de corrida (*race conditions*), que podem ocorrer quando duas ou mais threads tentam alterar os mesmos dados simultaneamente.

### 4.4. JSON

As mensagens entre cliente e servidor serão organizadas no formato JSON. Cada mensagem deverá indicar seu tipo e incluir os dados necessários para aquela operação.

Exemplo ilustrativo de uma solicitação de jogada:

```json
{
  "tipo": "ROLAR_DADO"
}
```

Outros tipos de mensagem deverão ser definidos durante a implementação, como entrada de jogador, confirmação de início da partida, atualização de posições, aviso de erro e encerramento do jogo.

## 🔁 5. Fluxo esperado de uma rodada

```text
Servidor informa de quem é a vez
                |
                v
       Jogador da vez solicita jogada
                |
                v
       Servidor valida o turno
                |
        +-------+-------+
        |               |
      Válido          Inválido
        |               |
        v               v
   Sorteia dado     Envia aviso
        |
        v
 Atualiza posição
        |
        v
 Marca jogador como concluído
        |
        v
 Ainda há jogadores ativos sem jogar?
        |
   +----+----+
   |         |
  Sim       Não
   |         |
   v         v
Próximo   Envia relatório
jogador   das posições
             |
             v
       Verifica vitória
             |
       +-----+-----+
       |           |
   Sem vencedor  Há vencedor
       |           |
       v           v
  Nova rodada   Encerra jogo
```

## ⌨️ 6. Interface e comandos planejados

Ao iniciar, o cliente deverá apresentar uma tela semelhante a esta:

```text
--------------------------------------------------
              TABULEIRO VIRTUAL
--------------------------------------------------
Quantidade de jogadores (1 a 4) [4]:
```

Depois que a partida começar, os jogadores serão controlados pelo mesmo terminal. Os comandos planejados são:

```text
1 rolar
2 rolar
3 rolar
4 rolar
```

O número identifica o jogador que está solicitando a jogada. O comando `sair` deverá encerrar o cliente e suas conexões.

O servidor deverá recusar qualquer tentativa de jogar fora da vez. A interface do cliente não substitui essa validação: a decisão final sempre será do servidor.

## 🛠️ 7. Requisitos para execução

- Python 3.x instalado.
- Os módulos `socket`, `threading`, `json` e `random`, disponíveis na biblioteca padrão do Python.
- Todos os arquivos Python na mesma pasta do projeto.

Não está prevista a utilização de bibliotecas externas ou banco de dados.

## ▶️ 8. Como executar (após a implementação)

Serão necessários dois terminais, mas apenas um terminal para controlar todos os jogadores:

**Terminal 1 — servidor:**

```bash
python servidor.py
```

**Terminal 2 — cliente:**

```bash
python cliente.py
```

O terminal do servidor deverá permanecer aberto durante toda a partida. O cliente será executado uma única vez e abrirá as conexões dos jogadores selecionados.

Para testar no mesmo computador, a configuração prevista é utilizar `127.0.0.1` como endereço do servidor. Para executar em computadores diferentes na mesma rede, será necessário configurar o endereço IPv4 local da máquina que hospeda o servidor e verificar a liberação da porta no firewall.

## 🧪 9. Testes previstos

Após a implementação, a equipe deverá verificar:

- Se o servidor aceita de 1 a 4 jogadores.
- Se o cliente abre uma conexão independente para cada jogador.
- Se a partida só começa depois que todos os jogadores selecionados se conectam.
- Se apenas o jogador da vez consegue realizar uma jogada.
- Se o servidor impede que um jogador jogue duas vezes na mesma rodada.
- Se o relatório de posições é enviado somente depois que todos os jogadores ativos concluem a rodada.
- Se a partida continua quando um jogador se desconecta.
- Se o vencedor é identificado ao alcançar ou ultrapassar a casa 30.
- Se as threads e o Mutex mantêm o estado da partida consistente.

## 📌 10. Observações

- O estado da partida será mantido na memória do servidor; não haverá persistência em banco de dados.
- O servidor será responsável por controlar as regras e os resultados, evitando que o cliente determine o próprio turno ou posição.
- A proposta é executar uma partida por vez.
- A implementação deverá manter as responsabilidades de cada arquivo separadas, facilitando o desenvolvimento em equipe e a integração das partes.

## 👥 11. Projeto acadêmico

**Disciplina:** Redes de Computadores  
**Linguagem:** Python  
**Conceitos principais:** Sockets IPv4/TCP, cliente-servidor, JSON, threads, concorrência, Mutex e sincronização.

**Situação do projeto:** planejamento e divisão das implementações. O arquivo `config.py` já foi desenvolvido; os demais componentes serão implementados pela equipe.