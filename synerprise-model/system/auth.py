from sqlalchemy import text
from system.database import SessionLocal

def get_user_id_from_token(token: str) -> str | None:
    db = SessionLocal()
    try:
        result = db.execute(
            text("SELECT user_id FROM authtoken_token WHERE key = :token"),
            {"token": token}
        ).fetchone()
        if result:
            return str(result[0])
    finally:
        db.close()
    return None
