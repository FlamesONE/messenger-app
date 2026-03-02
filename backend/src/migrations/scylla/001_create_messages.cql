CREATE TABLE IF NOT EXISTS messages (
  chat_id    text,
  id         text,
  sender_id  text,
  content    text,
  media      text,
  created_at timestamp,
  updated_at timestamp,
  deleted_at timestamp,
  PRIMARY KEY (chat_id, created_at, id)
) WITH CLUSTERING ORDER BY (created_at DESC, id ASC);
