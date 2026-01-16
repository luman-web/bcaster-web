-- Add friend_request_status column to user_edges table
-- This separates the relationship status from friend request state
ALTER TABLE user_edges 
ADD COLUMN IF NOT EXISTS friend_request_status VARCHAR(50);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_user_edges_status_request_status 
ON user_edges(receiver_id, status, friend_request_status);
