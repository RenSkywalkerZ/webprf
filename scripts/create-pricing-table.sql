-- Create competition_pricing table
CREATE TABLE IF NOT EXISTS competition_pricing (
    id SERIAL PRIMARY KEY,
    batch_id INTEGER NOT NULL,
    competition_id VARCHAR(255) NOT NULL,
    price INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(batch_id, competition_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_competition_pricing_batch_id ON competition_pricing(batch_id);
CREATE INDEX IF NOT EXISTS idx_competition_pricing_competition_id ON competition_pricing(competition_id);

-- Insert default pricing data
INSERT INTO competition_pricing (batch_id, competition_id, price) VALUES
-- Batch 1 (Early Bird)
(1, 'physics-competition', 75000),
(1, 'chemistry-competition', 75000),
(1, 'biology-competition', 75000),
(1, 'mathematics-competition', 75000),
(1, 'computer-science', 85000),
(1, 'astronomy-competition', 80000),
(1, 'earth-science', 70000),
(1, 'engineering-competition', 90000),

-- Batch 2 (Regular)
(2, 'physics-competition', 85000),
(2, 'chemistry-competition', 85000),
(2, 'biology-competition', 85000),
(2, 'mathematics-competition', 85000),
(2, 'computer-science', 95000),
(2, 'astronomy-competition', 90000),
(2, 'earth-science', 80000),
(2, 'engineering-competition', 100000),

-- Batch 3 (Late Registration)
(3, 'physics-competition', 95000),
(3, 'chemistry-competition', 95000),
(3, 'biology-competition', 95000),
(3, 'mathematics-competition', 95000),
(3, 'computer-science', 105000),
(3, 'astronomy-competition', 100000),
(3, 'earth-science', 90000),
(3, 'engineering-competition', 110000)

ON CONFLICT (batch_id, competition_id) DO NOTHING;
