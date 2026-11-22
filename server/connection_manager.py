import json
import socket
import threading


class ConnectionManager:
    def __init__(self):
        self.connections = {}
        self.lock = threading.Lock()

    def add_connection(self, player_id, connection):
        with self.lock:
            self.connections[player_id] = connection

    def remove_connection(self, player_id):
        with self.lock:
            connection = self.connections.pop(player_id, None)

        if connection is not None:
            try:
                connection.shutdown(socket.SHUT_RDWR)
            except OSError:
                pass
            connection.close()

    def send_message(self, player_id, message):
        with self.lock:
            connection = self.connections.get(player_id)

        if connection is None:
            return False

        try:
            data = json.dumps(message, ensure_ascii=False) + "\n"
            connection.sendall(data.encode("utf-8"))
            return True
        except (OSError, TypeError, ValueError):
            self.remove_connection(player_id)
            return False

    def broadcast(self, player_ids, message):
        for player_id in list(player_ids):
            self.send_message(player_id, message)

    def get_player_ids(self):
        with self.lock:
            return list(self.connections)