CREATE DATABASE  IF NOT EXISTS `grades` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `grades`;
-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: grades
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
-- Table structure for table `evaluation_type`
--

DROP TABLE IF EXISTS `evaluation_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `evaluation_type` (
  `id_evaluation_type` int NOT NULL AUTO_INCREMENT,
  `FK_id_scale` int NOT NULL,
  `numeric_grade` decimal(5,2) DEFAULT NULL,
  `letter_grade` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id_evaluation_type`),
  KEY `idx_evaltype_scale` (`FK_id_scale`),
  CONSTRAINT `fk_evaltype_scale` FOREIGN KEY (`FK_id_scale`) REFERENCES `grading_scale` (`id_scale`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `evaluation_type`
--

LOCK TABLES `evaluation_type` WRITE;
/*!40000 ALTER TABLE `evaluation_type` DISABLE KEYS */;
INSERT INTO `evaluation_type` VALUES (1,1,1.00,'Buena'),(2,1,2.00,'Regular'),(3,1,5.00,'Excelente'),(4,1,NULL,NULL),(5,1,NULL,NULL),(6,3,5.00,'Excelente'),(7,3,3.00,'Bueno'),(8,3,1.00,'Malo');
/*!40000 ALTER TABLE `evaluation_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `evaluative_activity`
--

DROP TABLE IF EXISTS `evaluative_activity`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `evaluative_activity` (
  `id_evaluative` int NOT NULL AUTO_INCREMENT,
  `FK_id_period` int NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `evaluation_name` varchar(150) NOT NULL,
  `weight_percentage` decimal(5,2) NOT NULL,
  PRIMARY KEY (`id_evaluative`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `evaluative_activity`
--

LOCK TABLES `evaluative_activity` WRITE;
/*!40000 ALTER TABLE `evaluative_activity` DISABLE KEYS */;
INSERT INTO `evaluative_activity` VALUES (1,1,'2026-01-15','2026-11-30',1,'Examen final',50.00),(2,1,'2026-01-15','2026-11-30',1,'Actividades',25.00),(3,1,'2026-01-15','2026-11-30',1,'Evaluación',25.00),(4,2,'2027-01-15','2027-11-30',1,'Examen final',20.00),(5,2,'2027-01-15','2027-11-30',1,'Actividades',30.00),(6,2,'2027-01-15','2027-11-30',1,'Evaluación',50.00),(7,2,'2026-08-01','2026-08-10',1,'Quiz 1',30.00),(8,2,'2026-08-11','2026-08-25',1,'Taller',30.00),(9,2,'2026-08-26','2026-09-10',1,'Examen final',40.00),(10,2,'2026-08-01','2026-08-10',1,'Quiz 1',30.00),(11,2,'2026-08-11','2026-08-25',1,'Taller',30.00),(12,2,'2026-08-26','2026-09-10',1,'Examen final',40.00),(13,2,'2026-08-01','2026-08-10',1,'Quiz 1',30.00),(14,2,'2026-08-11','2026-08-25',1,'Taller',30.00),(15,2,'2026-08-26','2026-09-10',1,'Examen final',40.00),(16,2,'2026-08-01','2026-08-10',1,'Quiz 1',30.00),(17,2,'2026-08-11','2026-08-25',1,'Taller',30.00),(18,2,'2026-08-26','2026-09-10',1,'Examen final',40.00),(19,2,'2026-08-01','2026-08-10',1,'Quiz 1',30.00),(20,2,'2026-08-11','2026-08-25',1,'Taller',30.00),(21,2,'2026-08-26','2026-09-10',1,'Examen final',40.00);
/*!40000 ALTER TABLE `evaluative_activity` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `final_grades`
--

DROP TABLE IF EXISTS `final_grades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `final_grades` (
  `id_final` int NOT NULL AUTO_INCREMENT,
  `FK_id_period` int NOT NULL,
  `FK_id_subject` int NOT NULL,
  `FK_id_student` int NOT NULL,
  `FK_id_grade` int NOT NULL,
  `final_grade` decimal(5,2) NOT NULL,
  `passed` tinyint(1) NOT NULL,
  PRIMARY KEY (`id_final`),
  KEY `idx_finalgrades_grades` (`FK_id_grade`),
  CONSTRAINT `fk_finalgrades_grades` FOREIGN KEY (`FK_id_grade`) REFERENCES `grades` (`id_grade`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `final_grades`
--

LOCK TABLES `final_grades` WRITE;
/*!40000 ALTER TABLE `final_grades` DISABLE KEYS */;
/*!40000 ALTER TABLE `final_grades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `grades`
--

DROP TABLE IF EXISTS `grades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `grades` (
  `id_grade` int NOT NULL AUTO_INCREMENT,
  `FK_id_student` int NOT NULL,
  `FK_id_course` int NOT NULL,
  `FK_id_teacher` int NOT NULL,
  `FK_id_period` int NOT NULL,
  `FK_id_subject` int NOT NULL,
  `FK_id_evaluative` int NOT NULL,
  `FK_id_evaluation_type` int NOT NULL,
  `grade_value` decimal(5,2) NOT NULL,
  `status` varchar(50) NOT NULL,
  `registration_date` date NOT NULL,
  PRIMARY KEY (`id_grade`),
  KEY `idx_grades_evaluative` (`FK_id_evaluative`),
  KEY `idx_grades_evaltype` (`FK_id_evaluation_type`),
  CONSTRAINT `fk_grades_evaluationtype` FOREIGN KEY (`FK_id_evaluation_type`) REFERENCES `evaluation_type` (`id_evaluation_type`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_grades_evaluative` FOREIGN KEY (`FK_id_evaluative`) REFERENCES `evaluative_activity` (`id_evaluative`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grades`
--

LOCK TABLES `grades` WRITE;
/*!40000 ALTER TABLE `grades` DISABLE KEYS */;
INSERT INTO `grades` VALUES (1,25,1,26,1,2,1,6,5.00,'REGISTERED','2026-09-22'),(2,25,1,26,1,2,2,6,5.00,'REGISTERED','2026-09-22'),(3,25,1,26,1,2,3,6,5.00,'REGISTERED','2026-09-22'),(4,2,1,26,1,2,1,8,1.00,'REGISTERED','2026-09-22'),(5,2,1,26,1,2,2,6,4.00,'REGISTERED','2026-09-22'),(6,2,1,26,1,2,3,6,5.00,'REGISTERED','2026-09-22'),(7,22,5,26,1,2,1,6,5.00,'REGISTERED','2026-09-22'),(8,22,5,26,1,2,2,6,5.00,'REGISTERED','2026-09-22'),(9,22,5,26,1,2,3,6,5.00,'REGISTERED','2026-09-22');
/*!40000 ALTER TABLE `grades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `grading_scale`
--

DROP TABLE IF EXISTS `grading_scale`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `grading_scale` (
  `id_scale` int NOT NULL AUTO_INCREMENT,
  `minimum_value` decimal(5,2) NOT NULL,
  `maximum_value` decimal(5,2) NOT NULL,
  `minimum_pass_grade` decimal(5,2) NOT NULL,
  PRIMARY KEY (`id_scale`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grading_scale`
--

LOCK TABLES `grading_scale` WRITE;
/*!40000 ALTER TABLE `grading_scale` DISABLE KEYS */;
INSERT INTO `grading_scale` VALUES (1,0.00,5.00,3.00),(2,0.00,5.00,3.00),(3,0.00,5.00,5.00);
/*!40000 ALTER TABLE `grading_scale` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-23 19:26:50
