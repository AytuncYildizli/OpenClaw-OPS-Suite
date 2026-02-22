-- ============================================================
-- Dashboard P1 Migration Script
-- Run once on Neon DB to create all required tables
-- ============================================================

-- P0 tables (if not exist)
CREATE TABLE IF NOT EXISTS agent_productivity (
  id SERIAL PRIMARY KEY,
  agent_id VARCHAR(50) NOT NULL,
  agent_name VARCHAR(100) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  tasks_completed INTEGER DEFAULT 0,
  tasks_failed INTEGER DEFAULT 0,
  total_runtime_seconds INTEGER DEFAULT 0,
  tokens_used_in BIGINT DEFAULT 0,
  tokens_used_out BIGINT DEFAULT 0,
  model VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(agent_id, date)
);

CREATE TABLE IF NOT EXISTS task_savings (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  task_description VARCHAR(500),
  agent_id VARCHAR(50),
  estimated_manual_hours DECIMAL(5,2) NOT NULL,
  actual_agent_minutes DECIMAL(7,2) NOT NULL,
  token_cost_usd DECIMAL(10,4) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- P1 tables
CREATE TABLE IF NOT EXISTS model_costs (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  agent_id VARCHAR(50) NOT NULL,
  model VARCHAR(100) NOT NULL,
  tokens_in BIGINT DEFAULT 0,
  tokens_out BIGINT DEFAULT 0,
  cost_usd DECIMAL(10,4) DEFAULT 0,
  is_free BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(agent_id, model, date)
);

CREATE TABLE IF NOT EXISTS task_queue (
  id SERIAL PRIMARY KEY,
  task_id VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(500) NOT NULL,
  agent_id VARCHAR(50),
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  priority VARCHAR(10) DEFAULT 'medium',
  created_at TIMESTAMP DEFAULT NOW(),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_model_costs_date ON model_costs(date);
CREATE INDEX IF NOT EXISTS idx_model_costs_agent ON model_costs(agent_id);
CREATE INDEX IF NOT EXISTS idx_task_queue_status ON task_queue(status);
CREATE INDEX IF NOT EXISTS idx_task_queue_priority ON task_queue(priority);
CREATE INDEX IF NOT EXISTS idx_agent_productivity_date ON agent_productivity(date);
