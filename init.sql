-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') DEFAULT 'user',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleteAt TIMESTAMP NULL
);

-- Insert default admin user (password: admin123)
-- Hash for 'admin123': 240be518fabd2724ddb6f04eeb9d55a837dc90e98a7e3c00d9b7a84e78ed4b43
INSERT INTO users (name, email, password, role) VALUES 
('Admin', 'admin@example.com', '240be518fabd2724ddb6f04eeb9d55a837dc90e98a7e3c00d9b7a84e78ed4b43', 'admin')
ON DUPLICATE KEY UPDATE id=id;
