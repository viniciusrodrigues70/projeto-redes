import json

from protocol.message_types import (
    CREATE_ROOM,
    ERROR,
    JOIN_ROOM,
    MOVE_PIECE,
    ROLL_DICE,
)


class MessageHandler:
    REQUIRED_FIELDS = {
        CREATE_ROOM: set(),
        JOIN_ROOM: {"room_code"},
        ROLL_DICE: set(),
        MOVE_PIECE: {"piece_id"},
    }

    def decode(self, raw_message):
        try:
            message = json.loads(raw_message)
        except (json.JSONDecodeError, TypeError):
            return None, self._error("Mensagem JSON inválida.")

        if not isinstance(message, dict):
            return None, self._error("A mensagem deve ser um objeto JSON.")

        message_type = message.get("type")
        if not isinstance(message_type, str):
            return None, self._error("O campo 'type' é obrigatório.")

        required_fields = self.REQUIRED_FIELDS.get(message_type)
        if required_fields is None:
            return None, self._error("Tipo de mensagem desconhecido.")

        missing_fields = required_fields.difference(message)
        if missing_fields:
            fields = ", ".join(sorted(missing_fields))
            return None, self._error(f"Campos obrigatórios ausentes: {fields}.")

        if message_type == JOIN_ROOM and not isinstance(message["room_code"], str):
            return None, self._error("O campo 'room_code' deve ser um texto.")

        if message_type == MOVE_PIECE and not isinstance(
            message["piece_id"], (str, int)
        ):
            return None, self._error("O campo 'piece_id' deve ser texto ou número.")

        return message, None

    @staticmethod
    def _error(message):
        return {"type": ERROR, "message": message}
