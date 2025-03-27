-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 17, 2025 at 08:12 PM
-- Server version: 8.0.40
-- PHP Version: 8.1.27

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `bookauradb`
--

-- --------------------------------------------------------

--
-- Table structure for table `audio_requests`
--

CREATE TABLE `audio_requests` (
  `request_id` int NOT NULL,
  `user_id` int NOT NULL,
  `book_id` int NOT NULL,
  `language` enum('English','Hindi','Marathi') NOT NULL,
  `requested_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `authors`
--

CREATE TABLE `authors` (
  `author_id` int NOT NULL,
  `user_id` int NOT NULL,
  `bio` text,
  `is_verified` tinyint(1) DEFAULT '0',
  `is_flagged` tinyint(1) DEFAULT '0',
  `is_approved` tinyint(1) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `bookmarks`
--

CREATE TABLE `bookmarks` (
  `bookmark_id` int NOT NULL,
  `user_id` int NOT NULL,
  `book_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `bookmarks`
--

INSERT INTO `bookmarks` (`bookmark_id`, `user_id`, `book_id`, `created_at`) VALUES
(17, 5, 53, '2025-03-10 04:59:47'),
(22, 5, 65, '2025-03-13 04:27:38');

-- --------------------------------------------------------

--
-- Table structure for table `books`
--

CREATE TABLE `books` (
  `book_id` int NOT NULL,
  `user_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `coverUrl` text NOT NULL,
  `fileUrl` text NOT NULL,
  `is_public` tinyint(1) DEFAULT '0',
  `is_approved` tinyint(1) DEFAULT '0',
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `uploaded_by_role` enum('Author','Publisher') NOT NULL,
  `audioUrl` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `books`
--

INSERT INTO `books` (`book_id`, `user_id`, `title`, `description`, `coverUrl`, `fileUrl`, `is_public`, `is_approved`, `uploaded_at`, `uploaded_by_role`, `audioUrl`) VALUES
(52, 2, 'The Importance of Being Earnest A Trivial Comedy for Serious People by Oscar Wilde', 'The Importance of Being Earnest A Trivial Comedy for Serious People by Oscar Wilde', '', 'uploads/The_Importance_of_Being_Earnest_A_Trivial_Comedy_f_1741507990_en.pdf', 0, 0, '2025-03-09 08:13:10', 'Publisher', ''),
(53, 2, 'Depression author Stan Kutcher', 'Depression author Stan Kutcher', '', 'uploads/Depression_author_Stan_Kutcher_1741508308_en.pdf', 0, 0, '2025-03-09 08:18:28', 'Publisher', ''),
(54, 2, 'Anxiety Management, Hampshire CAMHS', 'Anxiety Management, Hampshire CAMHS', '', 'uploads/Anxiety_Management_Hampshire_CAMHS_1741508324_en.pdf', 0, 0, '2025-03-09 08:18:44', 'Publisher', ''),
(56, 2, 'Romeo and Juliet by William Shakespeare', 'Romeo and Juliet by William Shakespeare', '', 'uploads/Romeo_and_Juliet_by_William_Shakespeare_1741508403_en.pdf', 0, 0, '2025-03-09 08:20:03', 'Publisher', ''),
(58, 2, 'Alice\'s Adventures in Wonderland by Lewis Carroll', 'Alice\'s Adventures in Wonderland by Lewis Carroll', '', 'uploads/Alices_Adventures_in_Wonderland_by_Lewis_Carroll_1741508791_en.pdf', 0, 0, '2025-03-09 08:26:31', 'Publisher', ''),
(60, 2, 'Success for Teens, The SUCCESS Foundation', 'Success for Teens, The SUCCESS Foundation', '', 'uploads/Success_for_Teens_The_SUCCESS_Foundation_1741508976_en.pdf', 0, 0, '2025-03-09 08:29:36', 'Publisher', ''),
(65, 2, 'Robinson-Crusoe	', 'Robinson-Crusoe	', '', 'uploads/Robinson-Crusoe_1741549519_en.pdf', 0, 0, '2025-03-09 19:45:19', 'Publisher', 'audio_uploads/Robinson-Crusoe_1741549519_audio.mp3');

-- --------------------------------------------------------

--
-- Table structure for table `book_category`
--

CREATE TABLE `book_category` (
  `book_category_id` int NOT NULL,
  `category_id` int DEFAULT NULL,
  `book_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `book_category`
--

INSERT INTO `book_category` (`book_category_id`, `category_id`, `book_id`) VALUES
(46, 6, 52),
(47, 6, 53),
(48, 6, 54),
(50, 2, 56),
(51, 5, 56),
(53, 2, 58),
(55, 6, 60),
(64, 1, 65),
(65, 2, 65);

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `category_id` int NOT NULL,
  `category_name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`category_id`, `category_name`) VALUES
(1, 'Action'),
(2, 'Adenture'),
(3, 'Comedy'),
(4, 'Sci-Fi'),
(5, 'Romance'),
(6, 'Knowledge'),
(7, 'Politics');

-- --------------------------------------------------------

--
-- Table structure for table `moderators`
--

CREATE TABLE `moderators` (
  `moderator_id` int NOT NULL,
  `user_id` int NOT NULL,
  `is_flagged` tinyint(1) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `moderators`
--

INSERT INTO `moderators` (`moderator_id`, `user_id`, `is_flagged`) VALUES
(1, 3, 0);

-- --------------------------------------------------------

--
-- Table structure for table `normal_users`
--

CREATE TABLE `normal_users` (
  `normal_user_id` int NOT NULL,
  `user_id` int NOT NULL,
  `additional_info` text,
  `is_flagged` tinyint(1) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `normal_users`
--

INSERT INTO `normal_users` (`normal_user_id`, `user_id`, `additional_info`, `is_flagged`) VALUES
(1, 5, '', 0);

-- --------------------------------------------------------

--
-- Table structure for table `platform_administrators`
--

CREATE TABLE `platform_administrators` (
  `admin_id` int NOT NULL,
  `user_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `platform_administrators`
--

INSERT INTO `platform_administrators` (`admin_id`, `user_id`) VALUES
(1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `publishers`
--

CREATE TABLE `publishers` (
  `publisher_id` int NOT NULL,
  `user_id` int NOT NULL,
  `is_flagged` tinyint(1) DEFAULT '0',
  `is_approved` tinyint(1) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `publishers`
--

INSERT INTO `publishers` (`publisher_id`, `user_id`, `is_flagged`, `is_approved`) VALUES
(1, 2, 0, 1);

-- --------------------------------------------------------

--
-- Table structure for table `reading_history`
--

CREATE TABLE `reading_history` (
  `history_id` int NOT NULL,
  `user_id` int NOT NULL,
  `book_id` int NOT NULL,
  `last_read_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `reading_history`
--

INSERT INTO `reading_history` (`history_id`, `user_id`, `book_id`, `last_read_at`) VALUES
(2, 5, 65, '2025-03-13 04:49:14');

-- --------------------------------------------------------

--
-- Table structure for table `reports`
--

CREATE TABLE `reports` (
  `report_id` int NOT NULL,
  `user_id` int NOT NULL,
  `book_id` int NOT NULL,
  `reason` text NOT NULL,
  `reported_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `role_id` int NOT NULL,
  `role_name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`role_id`, `role_name`) VALUES
(3, 'Author'),
(5, 'Moderator'),
(4, 'Normal User'),
(1, 'Platform Administrator'),
(2, 'Publisher');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `username`, `email`, `password_hash`, `role_id`, `created_at`, `updated_at`) VALUES
(1, 'ashish', 'alvfcoc@gmail.com', 'scrypt:32768:8:1$wGpWvINYF9fG3nJa$6e0dc523b09c7a9888ce5e851cc38a75e8c015b0d9202d2cf05c423240277ec35d288e3a3e53c2ce3a7d97344725bdd4b1231820d043e995669af8476732d9da', 1, '2025-02-05 13:16:10', '2025-02-05 13:16:10'),
(2, 'PrajaktaPublications', 'prajaktapare19@gmail.com', 'scrypt:32768:8:1$0p548IjkBeflc7q9$641e2db2679e17c5a035d1be08a84b1c905a1061e854615c89b798cac7afe276d368ef68bf6e0843295fd50fc8b71b43ac66f53267d24942d93df2ebd94864ea', 2, '2025-02-05 13:23:49', '2025-02-05 13:23:49'),
(3, 'atharvadighe', 'arindhimar111@gmail.com', 'scrypt:32768:8:1$tB5olhLgFdEjkVUD$b232ca134b7617735c8cddc6a1cbe346bb4efde183dfa8ce034fce710a57473f4fbfb8069513d0b4f7d2fb4a3e1b3b157bc026adaf47d2a2d511929fab9f271e', 5, '2025-02-05 13:25:44', '2025-02-05 13:25:44'),
(5, 'Sneha', 'arindhimar116@gmail.com', 'scrypt:32768:8:1$MdMAOUcF5JncHrjH$8970fb8ebf58002bf6fe4ee29937ffab211366a6e81e79dc6671a6bed24f35fbaa99fae5a279dd07bb857808b6309df1aa1ff1041588685658ee9fc7dd77c448', 4, '2025-02-10 04:35:59', '2025-02-10 04:35:59');

-- --------------------------------------------------------

--
-- Table structure for table `views`
--

CREATE TABLE `views` (
  `book_view_id` int NOT NULL,
  `book_id` int NOT NULL,
  `book_view` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `views`
--

INSERT INTO `views` (`book_view_id`, `book_id`, `book_view`) VALUES
(30, 52, 0),
(31, 53, 0),
(32, 54, 0),
(34, 56, 0),
(36, 58, 0),
(38, 60, 0),
(43, 65, 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `audio_requests`
--
ALTER TABLE `audio_requests`
  ADD PRIMARY KEY (`request_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `book_id` (`book_id`);

--
-- Indexes for table `authors`
--
ALTER TABLE `authors`
  ADD PRIMARY KEY (`author_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `bookmarks`
--
ALTER TABLE `bookmarks`
  ADD PRIMARY KEY (`bookmark_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `book_id` (`book_id`);

--
-- Indexes for table `books`
--
ALTER TABLE `books`
  ADD PRIMARY KEY (`book_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `book_category`
--
ALTER TABLE `book_category`
  ADD PRIMARY KEY (`book_category_id`),
  ADD KEY `category_id` (`category_id`),
  ADD KEY `book_id` (`book_id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`category_id`);

--
-- Indexes for table `moderators`
--
ALTER TABLE `moderators`
  ADD PRIMARY KEY (`moderator_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `normal_users`
--
ALTER TABLE `normal_users`
  ADD PRIMARY KEY (`normal_user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `platform_administrators`
--
ALTER TABLE `platform_administrators`
  ADD PRIMARY KEY (`admin_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `publishers`
--
ALTER TABLE `publishers`
  ADD PRIMARY KEY (`publisher_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `reading_history`
--
ALTER TABLE `reading_history`
  ADD PRIMARY KEY (`history_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `book_id` (`book_id`);

--
-- Indexes for table `reports`
--
ALTER TABLE `reports`
  ADD PRIMARY KEY (`report_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `book_id` (`book_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`role_id`),
  ADD UNIQUE KEY `role_name` (`role_name`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `role_id` (`role_id`);

--
-- Indexes for table `views`
--
ALTER TABLE `views`
  ADD PRIMARY KEY (`book_view_id`),
  ADD KEY `book_id` (`book_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `audio_requests`
--
ALTER TABLE `audio_requests`
  MODIFY `request_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `authors`
--
ALTER TABLE `authors`
  MODIFY `author_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `bookmarks`
--
ALTER TABLE `bookmarks`
  MODIFY `bookmark_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `books`
--
ALTER TABLE `books`
  MODIFY `book_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=66;

--
-- AUTO_INCREMENT for table `book_category`
--
ALTER TABLE `book_category`
  MODIFY `book_category_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=66;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `category_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `moderators`
--
ALTER TABLE `moderators`
  MODIFY `moderator_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `normal_users`
--
ALTER TABLE `normal_users`
  MODIFY `normal_user_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `platform_administrators`
--
ALTER TABLE `platform_administrators`
  MODIFY `admin_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `publishers`
--
ALTER TABLE `publishers`
  MODIFY `publisher_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `reading_history`
--
ALTER TABLE `reading_history`
  MODIFY `history_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `reports`
--
ALTER TABLE `reports`
  MODIFY `report_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `role_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `views`
--
ALTER TABLE `views`
  MODIFY `book_view_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `audio_requests`
--
ALTER TABLE `audio_requests`
  ADD CONSTRAINT `audio_requests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `audio_requests_ibfk_2` FOREIGN KEY (`book_id`) REFERENCES `books` (`book_id`);

--
-- Constraints for table `authors`
--
ALTER TABLE `authors`
  ADD CONSTRAINT `authors_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `bookmarks`
--
ALTER TABLE `bookmarks`
  ADD CONSTRAINT `bookmarks_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `bookmarks_ibfk_2` FOREIGN KEY (`book_id`) REFERENCES `books` (`book_id`);

--
-- Constraints for table `books`
--
ALTER TABLE `books`
  ADD CONSTRAINT `books_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `book_category`
--
ALTER TABLE `book_category`
  ADD CONSTRAINT `book_category_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`),
  ADD CONSTRAINT `book_category_ibfk_2` FOREIGN KEY (`book_id`) REFERENCES `books` (`book_id`);

--
-- Constraints for table `moderators`
--
ALTER TABLE `moderators`
  ADD CONSTRAINT `moderators_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `normal_users`
--
ALTER TABLE `normal_users`
  ADD CONSTRAINT `normal_users_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `platform_administrators`
--
ALTER TABLE `platform_administrators`
  ADD CONSTRAINT `platform_administrators_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `publishers`
--
ALTER TABLE `publishers`
  ADD CONSTRAINT `publishers_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `reading_history`
--
ALTER TABLE `reading_history`
  ADD CONSTRAINT `reading_history_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `reading_history_ibfk_2` FOREIGN KEY (`book_id`) REFERENCES `books` (`book_id`);

--
-- Constraints for table `reports`
--
ALTER TABLE `reports`
  ADD CONSTRAINT `reports_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `reports_ibfk_2` FOREIGN KEY (`book_id`) REFERENCES `books` (`book_id`);

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`);

--
-- Constraints for table `views`
--
ALTER TABLE `views`
  ADD CONSTRAINT `views_ibfk_1` FOREIGN KEY (`book_id`) REFERENCES `books` (`book_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
