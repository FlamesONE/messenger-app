CREATE KEYSPACE IF NOT EXISTS messenger
WITH replication = {
  'class': 'SimpleStrategy',
  'replication_factor': 1
};

USE messenger;

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

CREATE TABLE IF NOT EXISTS message_reads (
  chat_id    text,
  message_id text,
  user_id    text,
  read_at    timestamp,
  PRIMARY KEY ((chat_id, message_id), user_id)
);
