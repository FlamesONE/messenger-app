CREATE TABLE IF NOT EXISTS message_reads (
  chat_id    text,
  message_id text,
  user_id    text,
  read_at    timestamp,
  PRIMARY KEY (chat_id, message_id, user_id)
);
