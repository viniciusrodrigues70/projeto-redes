import socket
import threading
import uuid

from protocol.message_handler import MessageHandler
from server.connection_manager import ConnectionManager
from server.game_manager import GameManager

class LudoServer:
    def __init__(self, host="0.0.0.0", port=5000):
        self.host = host
        self.port = port
        self.socket = None
        self.running = False
        self.connection_manager = ConnectionManager()
        self.game_manager = GameManager(self.connection_manager)
        self.message_handler = MessageHandler()

    def start(self):
        self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.socket.bind((self.host, self.port))
        self.socket.listen()
        self.running = True

        print(f"Servidor iniciado em {self.host}:{self.port}")

        try:
            while self.running:
                connection, address = self.socket.accept()
                player_id = str(uuid.uuid4())
                self.connection_manager.add_connection(player_id, connection)
                thread = threading.Thread(
                    target=self._handle_client,
                    args=(player_id, connection, address),
                    daemon=True,
                )
                thread.start()
        except OSError:
            if self.running:
                raise
        finally:
            self.stop()

    def stop(self):
        self.running = False
        if self.socket is not None:
            try:
                self.socket.close()
            except OSError:
                pass

        for player_id in self.connection_manager.get_player_ids():
            self.connection_manager.remove_connection(player_id)

    def _handle_client(self, player_id, connection, address):
        print(f"Jogador conectado: {address}")
        buffer = ""

        try:
            while self.running:
                data = connection.recv(4096)
                if not data:
                    break

                buffer += data.decode("utf-8")
                while "\n" in buffer:
                    line, buffer = buffer.split("\n", 1)
                    if not line.strip():
                        continue
                    self._process_message(player_id, line)
        except (OSError, UnicodeDecodeError):
            pass
        finally:
            self.game_manager.remove_player(player_id)
            self.connection_manager.remove_connection(player_id)
            print(f"Jogador desconectado: {address}")

    def _process_message(self, player_id, raw_message):
        message, error = self.message_handler.decode(raw_message)
        if error is not None:
            self.connection_manager.send_message(player_id, error)
            return

        response = self.game_manager.handle_message(player_id, message)
        if response is not None:
            self.connection_manager.send_message(player_id, response)

if __name__ == "__main__":
    LudoServer().start()