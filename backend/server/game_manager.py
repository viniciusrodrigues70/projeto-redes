import secrets
import string
import threading

from protocol.message_types import (
    CREATE_ROOM,
    ERROR,
    JOIN_ROOM,
    ROOM_UPDATE,
)


class GameManager:
    ROOM_CAPACITY = 4

    def __init__(self, connection_manager):
        self.connection_manager = connection_manager
        self.rooms = {}
        self.player_rooms = {}
        self.lock = threading.Lock()

    def handle_message(self, player_id, message):
        message_type = message["type"]

        if message_type == CREATE_ROOM:
            return self.create_room(player_id)
        if message_type == JOIN_ROOM:
            return self.join_room(player_id, message.get("room_code"))

        return {
            "type": ERROR,
            "message": "Esta operação ainda não está disponível.",
        }

    def create_room(self, player_id):
        with self.lock:
            if player_id in self.player_rooms:
                return self._error("Você já participa de uma sala.")

            room_code = self._create_room_code()
            self.rooms[room_code] = [player_id]
            self.player_rooms[player_id] = room_code

        self._send_room_update(room_code)
        return None

    def join_room(self, player_id, room_code):
        if not isinstance(room_code, str) or not room_code.strip():
            return self._error("Informe um código de sala válido.")

        room_code = room_code.strip().upper()

        with self.lock:
            if player_id in self.player_rooms:
                return self._error("Você já participa de uma sala.")

            players = self.rooms.get(room_code)
            if players is None:
                return self._error("Sala não encontrada.")
            if len(players) >= self.ROOM_CAPACITY:
                return self._error("A sala está cheia.")

            players.append(player_id)
            self.player_rooms[player_id] = room_code

        self._send_room_update(room_code)
        return None

    def remove_player(self, player_id):
        with self.lock:
            room_code = self.player_rooms.pop(player_id, None)
            if room_code is None:
                return

            players = self.rooms.get(room_code, [])
            if player_id in players:
                players.remove(player_id)

            if not players:
                self.rooms.pop(room_code, None)
                return

        self._send_room_update(room_code)

    def get_room_players(self, room_code):
        with self.lock:
            return list(self.rooms.get(room_code, []))

    def _create_room_code(self):
        alphabet = string.ascii_uppercase + string.digits
        while True:
            room_code = "".join(secrets.choice(alphabet) for _ in range(6))
            if room_code not in self.rooms:
                return room_code

    def _send_room_update(self, room_code):
        with self.lock:
            players = list(self.rooms.get(room_code, []))

        message = {
            "type": ROOM_UPDATE,
            "room_code": room_code,
            "players": players,
            "capacity": self.ROOM_CAPACITY,
        }
        self.connection_manager.broadcast(players, message)

    @staticmethod
    def _error(message):
        return {"type": ERROR, "message": message}
