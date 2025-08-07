-- Create development database
CREATE DATABASE IF NOT EXISTS cmsdb_dev;

-- Grant permissions
GRANT ALL PRIVILEGES ON cmsdb.* TO 'cmsuser'@'%';
GRANT ALL PRIVILEGES ON cmsdb_dev.* TO 'cmsuser'@'%';
FLUSH PRIVILEGES;
