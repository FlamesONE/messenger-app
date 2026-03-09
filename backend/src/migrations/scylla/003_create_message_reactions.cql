CREATE TABLE IF NOT EXISTS message_reactions (
  chat_id    text,
  message_id text,
  user_id    text,
  emoji      text,
  created_at timestamp,
  PRIMARY KEY ((chat_id, message_id), user_id, emoji)
);
