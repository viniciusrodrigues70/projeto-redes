import json

IP_SERVIDOR = "127.0.0.1"
PORTA = 5555

CASA_FINAL = 20
MAX_JOGADORES = 4


def criar_mensagem(tipo, texto="", **dados_extras):
    dados = {
        "tipo": tipo,
        "texto": texto
    }
    dados.update(dados_extras)

    return (json.dumps(dados, ensure_ascii=False) + "\n").encode("utf-8")


def ler_mensagem(bytes_recebidos):
    return json.loads(bytes_recebidos.decode("utf-8"))