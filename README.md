# 🎲 Tabuleiro Virtual via Terminal

Aplicação cliente-servidor desenvolvida em Python para simular um jogo de tabuleiro por turnos, utilizando comunicação por sockets TCP/IP.

O projeto foi desenvolvido para a disciplina de **Redes de Computadores** do Curso Técnico e demonstra conceitos de protocolos de rede, programação concorrente, multithreading, exclusão mútua e sincronização de dados.

## 🎯 Objetivo

Construir um jogo de tabuleiro em que até quatro jogadores se conectam a um servidor por meio de conexões TCP independentes. Os jogadores são controlados por um único terminal cliente, mas cada participante possui seu próprio socket e sua própria thread de escuta.

O servidor é responsável por controlar os turnos, validar as jogadas, atualizar as posições e transmitir os resultados a todos os participantes.

## 🚀 Conceitos técnicos

### 1. Protocolo de rede: IPv4 e TCP

A comunicação utiliza a biblioteca nativa `socket`, com:

- `socket.AF_INET`: família de endereços IPv4.
- `socket.SOCK_STREAM`: comunicação orientada a fluxo TCP.
- `bind()`: associa o servidor a um endereço e porta.
- `listen()`: coloca o servidor em espera por conexões.
- `accept()`: aceita uma nova conexão.
- `connect()`: estabelece a conexão do cliente.
- `sendall()` e `recv()`: enviam e recebem dados pela conexão.

O TCP fornece entrega confiável e ordenada dos bytes enquanto a conexão permanece estabelecida. Como TCP é um fluxo de bytes, o projeto utiliza uma quebra de linha (`\n`) como delimitador das mensagens JSON.

### 2. Arquitetura multithread

**No servidor:** a thread principal aguarda novas conexões. Para cada conexão aceita, uma nova `threading.Thread` executa a função `tratar_cliente()`. Dessa forma, o servidor consegue atender os sockets dos jogadores sem depender de uma única thread para todas as conexões.

**No cliente:** cada jogador possui uma thread de escuta, responsável por receber atualizações do servidor. A thread principal permanece responsável pela leitura dos comandos digitados no terminal.

### 3. Concorrência e sincronização

As threads do servidor acessam estruturas compartilhadas, como o dicionário de jogadores, as posições e a lista de jogadores que ainda precisam jogar.

Esse cenário pode provocar condições de corrida (*race conditions*) caso duas threads tentem consultar ou alterar o estado da partida simultaneamente.

Para evitar isso, o servidor utiliza `threading.Lock()`:

```python
with lock_mutex:
    if not jogo.validar_turno(conexao):
        # Recusa a jogada fora de ordem
        ...
    resultado, venceu = jogo.executar_rodada(conexao)
```

O bloqueio garante que a validação do turno e a atualização do estado sejam executadas por uma thread de cada vez.

### 4. Controle de turnos e fechamento das rodadas

O servidor é a autoridade sobre a ordem das jogadas.

- Somente o jogador indicado pelo servidor pode jogar.
- Uma tentativa fora da vez é recusada.
- Cada participante ativo pode jogar uma vez por rodada.
- Quando todos os participantes ativos jogam, o servidor transmite um relatório com a posição de cada um.
- A próxima rodada começa pelo primeiro jogador ainda conectado.
- Se alguém atingir ou ultrapassar a casa final, a vitória é anunciada no fechamento da rodada.

O cliente não decide quem pode jogar: essa validação é realizada no servidor.

### 5. Protocolo de aplicação: JSON

As mensagens são organizadas em JSON, contendo um tipo e, quando necessário, um texto e outros dados.

Exemplo:

```json
{
  "tipo": "ROLAR_DADO",
  "texto": ""
}
```

Cada mensagem termina com `\n`, permitindo separar mensagens consecutivas no fluxo TCP.

## 📁 Estrutura de arquivos

```text
TabuleiroVirtual/
│
├── config.py
├── jogo.py
├── servidor.py
├── cliente.py
└── README.md
```

| Arquivo | Responsabilidade |
|---|---|
| `config.py` | Configurações de IP, porta, limite de jogadores, casa final e funções JSON. |
| `jogo.py` | Regras do tabuleiro, registro de jogadores, turnos, posições e fechamento das rodadas. |
| `servidor.py` | Socket TCP, conexões, threads, Mutex, validação de jogadas e broadcast. |
| `cliente.py` | Conexões dos jogadores, threads de escuta e interface de terminal. |

## 🛠️ Requisitos

- Python 3.x.
- Nenhuma biblioteca externa é necessária.
- Os módulos utilizados (`socket`, `threading`, `json` e `random`) fazem parte da biblioteca padrão do Python.

## ▶️ Como executar

### 1. Preparação

Coloque os quatro arquivos Python na mesma pasta.

Para testar tudo no mesmo computador, mantenha em `config.py`:

```python
IP_SERVIDOR = "127.0.0.1"
PORTA = 5555
```

Para testar em computadores diferentes da mesma rede, altere `IP_SERVIDOR` no cliente para o IPv4 local da máquina que executa o servidor. Verifique também se a porta TCP 5555 está liberada no firewall.

### 2. Inicializar o servidor

Abra um terminal na pasta do projeto e execute:

```bash
python servidor.py
```

O servidor ficará aguardando conexões.

### 3. Inicializar o cliente

Abra outro terminal e execute:

```bash
python cliente.py
```

O programa perguntará a quantidade de jogadores, permitindo escolher de 1 a 4. O padrão é quatro.

O cliente abrirá uma conexão TCP independente para cada jogador selecionado.

### 4. Comandos

Utilize o número do jogador seguido da ação:

```text
1 rolar
2 rolar
3 rolar
4 rolar
```

Para encerrar o cliente:

```text
sair
```

O servidor aceitará somente a jogada do participante cuja vez está ativa.

## 🎮 Regras do jogo

1. A partida aceita de um a quatro jogadores.
2. Todos os jogadores selecionados precisam se conectar antes do início.
3. Cada jogador começa na casa zero.
4. O dado gera um número aleatório de 1 a 6.
5. Cada jogador pode realizar somente uma jogada por rodada.
6. O servidor rejeita comandos enviados fora do turno.
7. Ao final de cada rodada, todos recebem o relatório das posições.
8. Vence quem alcançar ou ultrapassar a casa 20. A vitória é anunciada no fechamento da rodada.
9. Se houver desconexão durante uma partida, o jogador é removido da ordem e a rodada prossegue com os participantes restantes.

## 🔄 Exemplo de fluxo

```text
Jogador 1 rola o dado
        |
        v
Servidor valida o turno
        |
        v
Servidor atualiza a posição
        |
        v
Jogador 2 realiza sua jogada
        |
        v
Jogador 3 realiza sua jogada
        |
        v
Jogador 4 realiza sua jogada
        |
        v
Servidor apresenta o relatório
        |
        v
Início da próxima rodada
```

## 🧪 Testes recomendados

- Testar uma partida com quatro jogadores.
- Testar uma partida com dois jogadores.
- Tentar jogar fora da própria vez e verificar a recusa do servidor.
- Verificar se o relatório aparece somente depois que todos os jogadores ativos realizam sua jogada.
- Desconectar um jogador e verificar se os demais continuam.
- Verificar o anúncio de vitória ao alcançar ou ultrapassar a casa final.

## ⚠️ Observações

- O servidor mantém o estado da partida em memória RAM; não há persistência em banco de dados.
- O projeto foi desenvolvido para demonstração acadêmica, não para uso em ambiente de produção.
- O servidor aceita uma partida por vez.
- Para iniciar uma nova partida após o encerramento, execute novamente o cliente e conecte os participantes.

## 👥 Trabalho acadêmico

Projeto desenvolvido para a disciplina de Redes de Computadores do Curso Técnico.

**Tecnologias:** Python, Sockets, IPv4, TCP, JSON, Threads e Mutex.