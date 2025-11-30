-- Flat Rating Database Schema
-- Version: 001_init

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Buildings table
CREATE TABLE buildings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    address VARCHAR(500) NOT NULL,
    address_search TSVECTOR GENERATED ALWAYS AS (to_tsvector('english', address || ' ' || name)) STORED,
    price_range VARCHAR(100),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_buildings_address_search ON buildings USING GIN(address_search);

-- Comments table
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
    rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comments_building_id ON comments(building_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

-- Summaries table (one per building, updated async)
CREATE TABLE summaries (
    building_id UUID PRIMARY KEY REFERENCES buildings(id) ON DELETE CASCADE,
    content TEXT NOT NULL DEFAULT '',
    average_rating DECIMAL(2,1) DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    last_updated TIMESTAMPTZ DEFAULT NOW()
);
