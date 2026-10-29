class Config:
    HOST: str = "0.0.0.0"
    PORT: int = 8080
    DB_FILE: str = "chat_history.db"
    DEFAULT_CHANNELS = ["general", "engineering", "random"]
    MAX_HISTORY_PER_CHANNEL: int = 40

config = Config()
