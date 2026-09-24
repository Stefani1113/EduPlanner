CREATE DATABASE  IF NOT EXISTS `institutional_configuration` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `institutional_configuration`;
-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: institutional_configuration
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `institution_carousel_images`
--

DROP TABLE IF EXISTS `institution_carousel_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `institution_carousel_images` (
  `id_image` int NOT NULL AUTO_INCREMENT,
  `id_configuration` int NOT NULL DEFAULT '1',
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cloudinary_public_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `image_order` tinyint NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_image`),
  UNIQUE KEY `uk_configuration_image_order` (`id_configuration`,`image_order`),
  KEY `idx_carousel_configuration_order` (`id_configuration`,`image_order`),
  CONSTRAINT `fk_carousel_configuration` FOREIGN KEY (`id_configuration`) REFERENCES `institution_configuration` (`id_configuration`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_image_order` CHECK ((`image_order` between 1 and 5))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `institution_carousel_images`
--

LOCK TABLES `institution_carousel_images` WRITE;
/*!40000 ALTER TABLE `institution_carousel_images` DISABLE KEYS */;
/*!40000 ALTER TABLE `institution_carousel_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `institution_configuration`
--

DROP TABLE IF EXISTS `institution_configuration`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `institution_configuration` (
  `id_configuration` int NOT NULL DEFAULT '1',
  `short_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `long_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `logo_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logo_public_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `primary_color` varchar(7) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '#0FA000',
  `secondary_color` varchar(7) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '#45E000',
  `accent_color` varchar(7) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '#C8E8CF',
  `card_background` varchar(7) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '#171717',
  `secondary_background` varchar(7) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '#202020',
  `general_background` varchar(7) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '#111111',
  `institutional_white` varchar(7) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '#FFFFFF',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_configuration`),
  CONSTRAINT `chk_single_configuration` CHECK ((`id_configuration` = 1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `institution_configuration`
--

LOCK TABLES `institution_configuration` WRITE;
/*!40000 ALTER TABLE `institution_configuration` DISABLE KEYS */;
/*!40000 ALTER TABLE `institution_configuration` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-23 19:34:10
