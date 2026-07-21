-- ============================================
-- OfferPilot V1 数据库 Schema
-- 在 Supabase SQL Editor 中运行此文件
-- ============================================

-- 1. 用户目标表
CREATE TABLE IF NOT EXISTS user_goals (
  id          BIGSERIAL PRIMARY KEY,
  user_id     TEXT        NOT NULL DEFAULT 'test-user-001',
  target_role TEXT        NOT NULL DEFAULT '',
  target_city TEXT        NOT NULL DEFAULT '',
  target_company TEXT     NOT NULL DEFAULT '',
  deadline    TEXT        NOT NULL DEFAULT '',
  salary_range TEXT       NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. 成长路线表
CREATE TABLE IF NOT EXISTS roadmap (
  id          BIGSERIAL PRIMARY KEY,
  goal_id     BIGINT      NOT NULL REFERENCES user_goals(id) ON DELETE CASCADE,
  stage       INT         NOT NULL,
  title       TEXT        NOT NULL,
  description TEXT        NOT NULL DEFAULT '',
  status      TEXT        NOT NULL DEFAULT '未开始',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. 学习记录表
CREATE TABLE IF NOT EXISTS learning_records (
  id            BIGSERIAL PRIMARY KEY,
  user_id       TEXT        NOT NULL DEFAULT 'test-user-001',
  resource_name TEXT        NOT NULL,
  resource_type TEXT        NOT NULL DEFAULT '文档',
  completed     BOOLEAN     NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. 成长证据表
CREATE TABLE IF NOT EXISTS evidence (
  id          BIGSERIAL PRIMARY KEY,
  user_id     TEXT        NOT NULL DEFAULT 'test-user-001',
  type        TEXT        NOT NULL DEFAULT '笔记',
  content     TEXT        NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_user_goals_user_id ON user_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_goal_id ON roadmap(goal_id);
CREATE INDEX IF NOT EXISTS idx_learning_records_user_id ON learning_records(user_id);
CREATE INDEX IF NOT EXISTS idx_evidence_user_id ON evidence(user_id);
