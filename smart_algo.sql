-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 12, 2026 at 07:13 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `smart_algo`
--

-- --------------------------------------------------------

--
-- Table structure for table `broker_accounts`
--

CREATE TABLE `broker_accounts` (
  `id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `broker_name` varchar(50) NOT NULL,
  `api_key` varchar(255) NOT NULL,
  `client_code` varchar(50) NOT NULL,
  `totp_secret_hash` varchar(255) NOT NULL,
  `status` varchar(20) DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `totp_secret_enc` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `broker_accounts`
--

INSERT INTO `broker_accounts` (`id`, `user_id`, `broker_name`, `api_key`, `client_code`, `totp_secret_hash`, `status`, `created_at`, `updated_at`, `totp_secret_enc`) VALUES
(5, 1, 'ANGEL', 'OhF9F8cV', 'B147649', 'EFF5L5ANBODCY5ZUBNDSAI4HLI', 'active', '2026-02-09 10:45:09', '2026-02-09 10:45:09', NULL),
(6, 2, 'ANGEL', 'Uoqq2hoY', 'N75516', 'XYRY6KJHNVEHRFCWHURILLGTFA', 'active', '2026-02-09 10:58:08', '2026-02-09 10:58:08', NULL),
(7, 4, 'ANGEL', 'SleXb1yr', 'AACC096306', 'OLDO2OX5DIQJHZOJ27VTJNSGSI', 'active', '2026-02-09 11:18:56', '2026-02-09 11:18:56', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `indicators`
--

CREATE TABLE `indicators` (
  `id` int(11) NOT NULL,
  `code` varchar(64) NOT NULL,
  `name` varchar(128) NOT NULL,
  `indicator_type` varchar(50) NOT NULL DEFAULT 'Trend',
  `enabled` tinyint(1) DEFAULT 1,
  `default_color` varchar(24) DEFAULT '#2196f3',
  `chart_type` enum('overlay','separate') DEFAULT 'overlay',
  `display_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `indicators`
--

INSERT INTO `indicators` (`id`, `code`, `name`, `indicator_type`, `enabled`, `default_color`, `chart_type`, `display_order`, `created_at`, `updated_at`) VALUES
(1, 'SMA', 'Simple Moving Average', 'Trend', 1, '#FF9800', 'overlay', 10, '2026-02-11 10:10:12', '2026-02-11 10:10:12'),
(2, 'EMA', 'Exponential Moving Average', 'Trend', 1, '#00BCD4', 'overlay', 20, '2026-02-11 10:10:12', '2026-02-11 10:10:12'),
(3, 'RSI', 'Relative Strength Index', 'Momentum', 1, '#9C27B0', 'separate', 30, '2026-02-11 10:10:12', '2026-02-12 17:43:31'),
(4, 'MACD', 'MACD', 'Momentum', 1, '#4CAF50', 'separate', 40, '2026-02-11 10:10:12', '2026-02-12 17:43:31'),
(5, 'VWAP', 'Volume Weighted Average Price', 'Volume', 1, '#f60909', 'overlay', 50, '2026-02-11 10:40:40', '2026-02-12 17:43:31'),
(6, 'bb', 'Bollinger Bands', 'Volatility', 1, '#2962FF', 'overlay', 6, '2026-02-12 13:38:02', '2026-02-12 17:43:31'),
(7, 'atr', 'Average True Range', 'Volatility', 1, '#FF6D00', 'separate', 8, '2026-02-12 13:43:50', '2026-02-12 17:43:31'),
(8, 'adx', 'Average Directional Index', 'Trend', 1, '#FFD600', 'separate', 10, '2026-02-12 17:11:47', '2026-02-12 17:11:47'),
(9, 'stochrsi', 'Stochastic RSI', 'Momentum', 1, '#00BCD4', 'separate', 11, '2026-02-12 17:14:07', '2026-02-12 17:43:31'),
(10, 'obv', 'On-Balance Volume', 'Volume', 1, '#8E24AA', 'separate', 12, '2026-02-12 17:18:50', '2026-02-12 17:43:31'),
(11, 'wma', 'Weighted Moving Average', 'Trend', 1, '#FF7043', 'overlay', 13, '2026-02-12 17:23:01', '2026-02-12 17:23:01'),
(12, 'hma', 'Hull Moving Average', 'Trend', 1, '#00E5FF', 'overlay', 14, '2026-02-12 17:25:39', '2026-02-12 17:25:39'),
(13, 'smma', 'Smoothed Moving Average', 'Trend', 1, '#8BC34A', 'overlay', 15, '2026-02-12 17:28:32', '2026-02-12 17:28:32'),
(14, 'vwma', 'Volume Weighted Moving Average', 'Trend', 1, '#FF9800', 'overlay', 16, '2026-02-12 17:31:06', '2026-02-12 17:31:06'),
(15, 'doublema', 'Double EMA Crossover', 'Trend', 1, '#2196F3', 'overlay', 17, '2026-02-12 18:02:23', '2026-02-12 18:02:23'),
(16, 'triplema', 'Triple EMA Crossover', 'Trend', 1, '#3F51B5', 'overlay', 18, '2026-02-12 18:05:31', '2026-02-12 18:05:31');

-- --------------------------------------------------------

--
-- Table structure for table `indicator_logic`
--

CREATE TABLE `indicator_logic` (
  `id` int(11) NOT NULL,
  `indicator_id` int(11) NOT NULL,
  `handler` varchar(128) NOT NULL,
  `module_path` varchar(255) DEFAULT NULL,
  `returns` enum('single','multi','object') DEFAULT 'single',
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `indicator_logic`
--

INSERT INTO `indicator_logic` (`id`, `indicator_id`, `handler`, `module_path`, `returns`, `description`) VALUES
(1, 4, 'macdCalculator', 'utils/indicators/macdCalculator.js', 'object', 'MACD returns macd, signal, histogram'),
(2, 1, 'smaCalculator', 'utils/indicators/smaCalculator.js', 'single', 'SMA returns single value'),
(3, 2, 'emaCalculator', 'utils/indicators/emaCalculator.js', 'single', 'EMA returns single value'),
(4, 3, 'rsiCalculator', 'utils/indicators/rsiCalculator.js', 'single', 'RSI returns single value'),
(5, 5, 'vwapCalculator', 'utils/indicators/vwapCalculator.js', 'single', 'VWAP calculated using cumulative volume weighted average'),
(6, 6, 'bbCalculator', 'utils/indicators/bbCalculator.js', 'multi', 'Bollinger Bands calculation'),
(7, 7, 'atrCalculator', 'utils/indicators/atrCalculator.js', 'single', 'Average True Range indicator'),
(8, 8, 'adxCalculator', 'utils/indicators/adxCalculator.js', 'multi', 'Trend strength indicator with +DI and -DI'),
(9, 9, 'stochRsiCalculator', 'utils/indicators/stochRsiCalculator.js', 'multi', 'Momentum indicator based on RSI'),
(10, 10, 'obvCalculator', 'utils/indicators/obvCalculator.js', 'single', 'Volume momentum indicator'),
(11, 11, 'wmaCalculator', 'utils/indicators/wmaCalculator.js', 'single', 'Weighted Moving Average'),
(12, 12, 'hmaCalculator', 'utils/indicators/hmaCalculator.js', 'single', 'Hull Moving Average'),
(13, 13, 'smmaCalculator', 'utils/indicators/smmaCalculator.js', 'single', 'Wilder Smoothed Moving Average'),
(14, 14, 'vwmaCalculator', 'utils/indicators/vwmaCalculator.js', 'single', 'Moving average weighted by volume'),
(15, 15, 'doubleMaCalculator', 'utils/indicators/doubleMaCalculator.js', 'multi', 'Fast and Slow EMA crossover system'),
(16, 16, 'tripleMaCalculator', 'utils/indicators/tripleMaCalculator.js', 'multi', 'Fast, Medium and Slow EMA crossover system');

-- --------------------------------------------------------

--
-- Table structure for table `indicator_params`
--

CREATE TABLE `indicator_params` (
  `id` int(11) NOT NULL,
  `indicator_id` int(11) NOT NULL,
  `param_key` varchar(64) NOT NULL,
  `param_type` enum('int','float','string','bool') DEFAULT 'int',
  `default_value` varchar(64) DEFAULT NULL,
  `min_value` varchar(64) DEFAULT NULL,
  `max_value` varchar(64) DEFAULT NULL,
  `step` varchar(64) DEFAULT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `indicator_params`
--

INSERT INTO `indicator_params` (`id`, `indicator_id`, `param_key`, `param_type`, `default_value`, `min_value`, `max_value`, `step`, `description`) VALUES
(1, 4, 'fastPeriod', 'int', '12', NULL, NULL, NULL, 'Fast EMA period'),
(2, 4, 'slowPeriod', 'int', '26', NULL, NULL, NULL, 'Slow EMA period'),
(3, 4, 'signalPeriod', 'int', '9', NULL, NULL, NULL, 'Signal EMA period'),
(4, 1, 'period', 'int', '14', NULL, NULL, NULL, 'SMA period'),
(5, 2, 'period', 'int', '14', NULL, NULL, NULL, 'EMA period'),
(6, 3, 'period', 'int', '14', NULL, NULL, NULL, 'RSI period'),
(7, 3, 'upper', 'int', '70', NULL, NULL, NULL, 'Overbought level'),
(8, 3, 'lower', 'int', '30', NULL, NULL, NULL, 'Oversold level'),
(9, 5, 'source', 'string', 'hlc3', NULL, NULL, NULL, 'Price source: close, hl2, hlc3, ohlc4'),
(10, 5, 'resetDaily', 'bool', 'true', NULL, NULL, NULL, 'Reset VWAP every trading day'),
(11, 6, 'period', 'int', '20', NULL, NULL, NULL, NULL),
(12, 6, 'stdDev', 'float', '2', NULL, NULL, NULL, NULL),
(13, 7, 'period', 'int', '14', NULL, NULL, NULL, NULL),
(14, 8, 'period', 'int', '14', NULL, NULL, NULL, NULL),
(15, 9, 'rsiPeriod', 'int', '14', NULL, NULL, NULL, NULL),
(16, 9, 'stochPeriod', 'int', '14', NULL, NULL, NULL, NULL),
(17, 9, 'kPeriod', 'int', '3', NULL, NULL, NULL, NULL),
(18, 9, 'dPeriod', 'int', '3', NULL, NULL, NULL, NULL),
(19, 11, 'period', 'int', '20', NULL, NULL, NULL, NULL),
(20, 12, 'period', 'int', '20', NULL, NULL, NULL, NULL),
(21, 13, 'period', 'int', '14', NULL, NULL, NULL, NULL),
(22, 14, 'period', 'int', '20', NULL, NULL, NULL, NULL),
(23, 15, 'fastPeriod', 'int', '9', NULL, NULL, NULL, NULL),
(24, 15, 'slowPeriod', 'int', '21', NULL, NULL, NULL, NULL),
(25, 16, 'fastPeriod', 'int', '9', NULL, NULL, NULL, NULL),
(26, 16, 'mediumPeriod', 'int', '21', NULL, NULL, NULL, NULL),
(27, 16, 'slowPeriod', 'int', '50', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `indicator_series`
--

CREATE TABLE `indicator_series` (
  `id` int(11) NOT NULL,
  `indicator_id` int(11) NOT NULL,
  `series_key` varchar(64) NOT NULL,
  `series_name` varchar(128) NOT NULL,
  `series_type` enum('line','histogram','area','scatter') DEFAULT 'line',
  `color` varchar(24) DEFAULT NULL,
  `visible` tinyint(1) DEFAULT 1,
  `y_axis` enum('left','right','none') DEFAULT 'left',
  `display_order` int(11) DEFAULT 0,
  `value_expression` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `indicator_series`
--

INSERT INTO `indicator_series` (`id`, `indicator_id`, `series_key`, `series_name`, `series_type`, `color`, `visible`, `y_axis`, `display_order`, `value_expression`) VALUES
(1, 4, 'macd', 'MACD Line', 'line', '#2196f3', 1, 'left', 1, NULL),
(2, 4, 'signal', 'Signal Line', 'line', '#f44336', 1, 'left', 2, NULL),
(3, 4, 'hist', 'Histogram', 'histogram', '#9E9E9E', 1, 'none', 3, 'macd - signal'),
(4, 1, 'sma', 'SMA', 'line', '#FF9800', 1, 'left', 1, NULL),
(5, 2, 'ema', 'EMA', 'line', '#00BCD4', 1, 'left', 1, NULL),
(6, 3, 'rsi', 'RSI', 'line', '#9C27B0', 1, 'none', 1, NULL),
(7, 5, 'value', 'VWAP', 'line', '#f60909', 1, 'left', 1, NULL),
(8, 6, 'basis', 'BB Basis', 'line', '#2962FF', 1, 'right', 1, NULL),
(9, 6, 'upper', 'BB Upper', 'line', '#00C853', 1, 'right', 2, NULL),
(10, 6, 'lower', 'BB Lower', 'line', '#D50000', 1, 'right', 3, NULL),
(14, 7, 'value', 'ATR', 'line', '#FF6D00', 1, 'right', 1, NULL),
(15, 8, 'adx', 'ADX', 'line', '#FFD600', 1, 'right', 1, NULL),
(16, 8, 'plusDI', '+DI', 'line', '#00E676', 1, 'right', 2, NULL),
(17, 8, 'minusDI', '-DI', 'line', '#D50000', 1, 'right', 3, NULL),
(18, 9, 'k', 'StochRSI %K', 'line', '#00BCD4', 1, 'right', 1, NULL),
(19, 9, 'd', 'StochRSI %D', 'line', '#FF4081', 1, 'right', 2, NULL),
(20, 10, 'value', 'OBV', 'line', '#8E24AA', 1, 'right', 1, NULL),
(21, 11, 'value', 'WMA', 'line', '#FF7043', 1, 'right', 1, NULL),
(22, 12, 'value', 'HMA', 'line', '#00E5FF', 1, 'right', 1, NULL),
(23, 13, 'value', 'SMMA', 'line', '#8BC34A', 1, 'right', 1, NULL),
(24, 14, 'value', 'VWMA', 'line', '#FF9800', 1, 'right', 1, NULL),
(25, 15, 'fast', 'Fast EMA', 'line', '#00E676', 1, 'right', 1, NULL),
(26, 15, 'slow', 'Slow EMA', 'line', '#D50000', 1, 'right', 2, NULL),
(27, 16, 'fast', 'Fast EMA', 'line', '#00E676', 1, 'right', 1, NULL),
(28, 16, 'medium', 'Medium EMA', 'line', '#FFC107', 1, 'right', 2, NULL),
(29, 16, 'slow', 'Slow EMA', 'line', '#D50000', 1, 'right', 3, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `strategy_rules`
--

CREATE TABLE `strategy_rules` (
  `id` int(11) NOT NULL,
  `strategy_id` int(11) NOT NULL,
  `indicator_a` varchar(50) NOT NULL,
  `params_a` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`params_a`)),
  `source_a` varchar(20) DEFAULT 'close',
  `comparator` varchar(20) NOT NULL,
  `indicator_b` varchar(50) DEFAULT NULL,
  `params_b` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`params_b`)),
  `source_b` varchar(20) DEFAULT 'close',
  `value_b` decimal(20,5) DEFAULT NULL,
  `action_type` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `test`
--

CREATE TABLE `test` (
  `id` int(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) NOT NULL,
  `name` varchar(150) NOT NULL,
  `email` varchar(191) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `email_verified` tinyint(1) DEFAULT 0,
  `phone_verified` tinyint(1) DEFAULT 0,
  `role` varchar(50) DEFAULT 'user',
  `status` varchar(30) DEFAULT 'active',
  `last_login_at` timestamp NULL DEFAULT NULL,
  `failed_login_attempts` int(11) DEFAULT 0,
  `locked_until` timestamp NULL DEFAULT NULL,
  `remember_token` varchar(255) DEFAULT NULL,
  `password_reset_token` varchar(255) DEFAULT NULL,
  `password_reset_expires_at` timestamp NULL DEFAULT NULL,
  `profile_image` text DEFAULT NULL,
  `timezone` varchar(50) DEFAULT 'UTC',
  `language` varchar(10) DEFAULT 'en',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `phone`, `password_hash`, `email_verified`, `phone_verified`, `role`, `status`, `last_login_at`, `failed_login_attempts`, `locked_until`, `remember_token`, `password_reset_token`, `password_reset_expires_at`, `profile_image`, `timezone`, `language`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Bhupendra Dhote', 'bhudhote998@gmail.com', '8109010648', '$2b$10$1TMtBusNRLAoyPnZnxyQ4.FmMoJ9ZWPAtI7fLQjXJZg3CHaQKjqYe', 0, 0, 'user', 'active', '2026-02-10 10:32:23', 0, NULL, NULL, NULL, NULL, NULL, 'UTC', 'en', '2026-02-08 16:28:40', '2026-02-10 10:32:23', NULL),
(2, 'bstock', 'bstock@gmail.com', '9999999999', '$2b$10$aSCr2K0rL9phgU6ZUf4DfukvQEgbfywAej7Vr5jseSidAQyk811nm', 0, 0, 'user', 'active', '2026-02-12 12:55:35', 0, NULL, NULL, NULL, NULL, NULL, 'UTC', 'en', '2026-02-09 10:57:32', '2026-02-12 12:55:35', NULL),
(4, 'B Star', 'bstar@gmail.com', '8888888888', '$2b$10$LOuO42wejOUcCZQemNOkFefa6yDvhvAOVxkLUQMc9R/MwQGPAhT8y', 0, 0, 'user', 'active', '2026-02-09 13:03:46', 0, NULL, NULL, NULL, NULL, NULL, 'UTC', 'en', '2026-02-09 11:17:46', '2026-02-09 13:03:46', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `user_indicator_settings`
--

CREATE TABLE `user_indicator_settings` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `indicator_code` varchar(50) NOT NULL,
  `params` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`params`)),
  `is_active` tinyint(1) DEFAULT 1,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_indicator_settings`
--

INSERT INTO `user_indicator_settings` (`id`, `user_id`, `indicator_code`, `params`, `is_active`, `updated_at`) VALUES
(1, 1, 'SMA', '{\"period\":21}', 1, '2026-02-11 16:21:43'),
(3, 1, 'EMA', '{\"period\":9}', 1, '2026-02-11 16:21:52'),
(5, 1, 'RSI', '{\"period\":\"14\",\"upper\":\"70\",\"lower\":\"30\"}', 1, '2026-02-12 09:04:11'),
(6, 1, 'MACD', '{\"fastPeriod\":\"12\",\"slowPeriod\":\"26\",\"signalPeriod\":\"9\"}', 1, '2026-02-12 12:51:53'),
(7, 2, 'bb', '{\"period\":\"20\",\"stdDev\":\"2\"}', 0, '2026-02-12 17:23:53'),
(8, 2, 'atr', '{\"period\":\"14\"}', 0, '2026-02-12 17:35:14'),
(10, 2, 'adx', '{\"period\":\"14\"}', 0, '2026-02-12 17:15:16'),
(12, 2, 'stochrsi', '{\"dPeriod\":\"3\",\"kPeriod\":\"3\",\"rsiPeriod\":\"14\",\"stochPeriod\":\"14\"}', 0, '2026-02-12 18:03:15'),
(14, 2, 'obv', '{}', 0, '2026-02-12 17:20:40'),
(17, 2, 'wma', '{\"period\":\"20\"}', 0, '2026-02-12 17:29:14'),
(20, 2, 'SMA', '{\"period\":\"14\"}', 0, '2026-02-12 17:23:58'),
(22, 2, 'EMA', '{\"period\":\"14\"}', 0, '2026-02-12 17:24:05'),
(24, 2, 'hma', '{\"period\":\"20\"}', 0, '2026-02-12 17:31:58'),
(27, 2, 'smma', '{\"period\":\"14\"}', 0, '2026-02-12 18:03:18'),
(29, 2, 'vwma', '{\"period\":\"20\"}', 0, '2026-02-12 18:03:20'),
(37, 2, 'MACD', '{\"fastPeriod\":\"12\",\"signalPeriod\":\"9\",\"slowPeriod\":\"26\"}', 0, '2026-02-12 17:34:42'),
(47, 2, 'RSI', '{\"lower\":\"30\",\"period\":\"14\",\"upper\":\"70\"}', 1, '2026-02-12 18:03:23'),
(48, 2, 'doublema', '{\"fastPeriod\":\"9\",\"slowPeriod\":\"21\"}', 0, '2026-02-12 18:06:17'),
(50, 2, 'triplema', '{\"fastPeriod\":\"9\",\"mediumPeriod\":\"21\",\"slowPeriod\":\"50\"}', 1, '2026-02-12 18:06:19');

-- --------------------------------------------------------

--
-- Table structure for table `user_strategies`
--

CREATE TABLE `user_strategies` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `broker_accounts`
--
ALTER TABLE `broker_accounts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_user_broker` (`user_id`,`broker_name`);

--
-- Indexes for table `indicators`
--
ALTER TABLE `indicators`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `indicator_logic`
--
ALTER TABLE `indicator_logic`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `indicator_id` (`indicator_id`);

--
-- Indexes for table `indicator_params`
--
ALTER TABLE `indicator_params`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `indicator_id` (`indicator_id`,`param_key`);

--
-- Indexes for table `indicator_series`
--
ALTER TABLE `indicator_series`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `indicator_id` (`indicator_id`,`series_key`);

--
-- Indexes for table `strategy_rules`
--
ALTER TABLE `strategy_rules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `strategy_id` (`strategy_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `phone` (`phone`);

--
-- Indexes for table `user_indicator_settings`
--
ALTER TABLE `user_indicator_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_indicator` (`user_id`,`indicator_code`);

--
-- Indexes for table `user_strategies`
--
ALTER TABLE `user_strategies`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `broker_accounts`
--
ALTER TABLE `broker_accounts`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `indicators`
--
ALTER TABLE `indicators`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `indicator_logic`
--
ALTER TABLE `indicator_logic`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `indicator_params`
--
ALTER TABLE `indicator_params`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `indicator_series`
--
ALTER TABLE `indicator_series`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `strategy_rules`
--
ALTER TABLE `strategy_rules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `user_indicator_settings`
--
ALTER TABLE `user_indicator_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT for table `user_strategies`
--
ALTER TABLE `user_strategies`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `indicator_logic`
--
ALTER TABLE `indicator_logic`
  ADD CONSTRAINT `indicator_logic_ibfk_1` FOREIGN KEY (`indicator_id`) REFERENCES `indicators` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `indicator_params`
--
ALTER TABLE `indicator_params`
  ADD CONSTRAINT `indicator_params_ibfk_1` FOREIGN KEY (`indicator_id`) REFERENCES `indicators` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `indicator_series`
--
ALTER TABLE `indicator_series`
  ADD CONSTRAINT `indicator_series_ibfk_1` FOREIGN KEY (`indicator_id`) REFERENCES `indicators` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `strategy_rules`
--
ALTER TABLE `strategy_rules`
  ADD CONSTRAINT `strategy_rules_ibfk_1` FOREIGN KEY (`strategy_id`) REFERENCES `user_strategies` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
