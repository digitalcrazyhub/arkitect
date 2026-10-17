-- ==============================================================================
-- ARTECH DESIGN WEBSITE (Aspirations Architects Engineers)
-- CONTACT ENQUIRIES DATABASE SCHEMA (backend/database/schema.sql)
-- ==============================================================================
-- Engine: InnoDB
-- Character Set: utf8mb4 (Full Unicode support including multilingual input)
-- Collation: utf8mb4_unicode_ci
-- ==============================================================================

-- Create Database if not exists (Optional - for initial setup)
-- CREATE DATABASE IF NOT EXISTS `arkitect_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE `arkitect_db`;

-- ------------------------------------------------------------------------------
-- Table Structure: `enquiries`
-- Stores client project enquiries submitted through the contact form
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `enquiries` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    -- Client Contact Information
    `full_name` VARCHAR(120) NOT NULL COMMENT 'Full name of the enquirer',
    `email` VARCHAR(120) NOT NULL COMMENT 'Validated contact email address',
    `phone` VARCHAR(50) NOT NULL COMMENT 'Contact phone number (local/international)',
    `company` VARCHAR(150) NULL DEFAULT NULL COMMENT 'Company or organisation name',
    
    -- Project Parameters
    `service_interested` VARCHAR(80) NOT NULL COMMENT 'Architectural sector/vertical of interest',
    `project_location` VARCHAR(150) NOT NULL COMMENT 'Proposed site or building location',
    `message` TEXT NOT NULL COMMENT 'Detailed project requirements or enquiry notes',
    
    -- Compliance & Audit Metadata
    `privacy_acknowledged` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1 if privacy policy was acknowledged',
    `ip_address` VARCHAR(45) NOT NULL COMMENT 'Client IP address at submission',
    `user_agent` VARCHAR(255) NULL DEFAULT NULL COMMENT 'Truncated client user-agent string',
    
    -- External Integration Statuses
    `email_notification_status` ENUM('pending', 'sent', 'failed', 'skipped') NOT NULL DEFAULT 'pending' COMMENT 'Business notification email dispatch status',
    `customer_ack_status` ENUM('pending', 'sent', 'failed', 'skipped') NOT NULL DEFAULT 'pending' COMMENT 'Customer acknowledgement email dispatch status',
    `google_sheets_status` ENUM('pending', 'synced', 'failed', 'disabled') NOT NULL DEFAULT 'pending' COMMENT 'Google Sheets row sync status',
    
    -- Timestamps
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Submission timestamp in application timezone',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last status update timestamp',

    -- Indexes for performance and reconciliation
    INDEX `idx_enquiries_email` (`email`),
    INDEX `idx_enquiries_service` (`service_interested`),
    INDEX `idx_enquiries_created_at` (`created_at`),
    INDEX `idx_enquiries_email_status` (`email_notification_status`),
    INDEX `idx_enquiries_sheets_status` (`google_sheets_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
