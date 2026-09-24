CREATE DATABASE  IF NOT EXISTS `auth_administration` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `auth_administration`;
-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: auth_administration
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
-- Table structure for table `guardian`
--

DROP TABLE IF EXISTS `guardian`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `guardian` (
  `id_guardian` int NOT NULL AUTO_INCREMENT,
  `guardian_name` varchar(100) NOT NULL,
  `guardian_phone` varchar(20) DEFAULT NULL,
  `id_user` int NOT NULL,
  PRIMARY KEY (`id_guardian`),
  KEY `fk_guardian_user` (`id_user`),
  CONSTRAINT `fk_guardian_user` FOREIGN KEY (`id_user`) REFERENCES `user` (`id_user`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `guardian`
--

LOCK TABLES `guardian` WRITE;
/*!40000 ALTER TABLE `guardian` DISABLE KEYS */;
/*!40000 ALTER TABLE `guardian` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `import`
--

DROP TABLE IF EXISTS `import`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `import` (
  `id_import` int NOT NULL AUTO_INCREMENT,
  `file_name` varchar(255) NOT NULL,
  `import_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `total_rows` int NOT NULL,
  `success_rows` int NOT NULL,
  `failed_rows` int NOT NULL,
  PRIMARY KEY (`id_import`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `import`
--

LOCK TABLES `import` WRITE;
/*!40000 ALTER TABLE `import` DISABLE KEYS */;
/*!40000 ALTER TABLE `import` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `import_error`
--

DROP TABLE IF EXISTS `import_error`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `import_error` (
  `id_error` int NOT NULL AUTO_INCREMENT,
  `id_import` int NOT NULL,
  `row_numbe` int NOT NULL,
  `row_data` text,
  `error` text NOT NULL,
  PRIMARY KEY (`id_error`),
  KEY `fk_import_error_import` (`id_import`),
  CONSTRAINT `fk_import_error_import` FOREIGN KEY (`id_import`) REFERENCES `import` (`id_import`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `import_error`
--

LOCK TABLES `import_error` WRITE;
/*!40000 ALTER TABLE `import_error` DISABLE KEYS */;
/*!40000 ALTER TABLE `import_error` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role`
--

DROP TABLE IF EXISTS `role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role` (
  `id_role` int NOT NULL AUTO_INCREMENT,
  `name` varchar(20) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_role`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role`
--

LOCK TABLES `role` WRITE;
/*!40000 ALTER TABLE `role` DISABLE KEYS */;
INSERT INTO `role` VALUES (1,'ADMINISTRADOR','Administrador del sistema'),(2,'DOCENTE','Docente de la institución'),(3,'ESTUDIANTE','Estudiante de la institución'),(4,'DIRECTIVO','Directivo de la institución');
/*!40000 ALTER TABLE `role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `support_request`
--

DROP TABLE IF EXISTS `support_request`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `support_request` (
  `id_support_request` int NOT NULL AUTO_INCREMENT,
  `sender_name` varchar(150) NOT NULL,
  `sender_email` varchar(100) NOT NULL,
  `subject` varchar(100) NOT NULL,
  `message` text NOT NULL,
  `status` enum('PENDIENTE','EN_PROCESO','RESUELTO') NOT NULL DEFAULT 'PENDIENTE',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_support_request`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `support_request`
--

LOCK TABLES `support_request` WRITE;
/*!40000 ALTER TABLE `support_request` DISABLE KEYS */;
/*!40000 ALTER TABLE `support_request` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id_user` int NOT NULL AUTO_INCREMENT,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(100) NOT NULL,
  `surnames` varchar(150) NOT NULL,
  `document_type` varchar(20) NOT NULL,
  `document` varchar(50) NOT NULL,
  `document_issue_place` varchar(100) DEFAULT NULL,
  `birthdate` date NOT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `photo_url` varchar(255) DEFAULT NULL,
  `professional_degrees` text,
  `qualifications_desc` text,
  `gender` varchar(20) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `blood_type` varchar(5) NOT NULL,
  `disabilities` text,
  `stratum` tinyint DEFAULT NULL,
  `population_type` varchar(100) DEFAULT NULL,
  `health_regime` varchar(50) DEFAULT NULL,
  `eps` varchar(100) DEFAULT NULL,
  `position` varchar(100) DEFAULT NULL,
  `creation_date` datetime NOT NULL,
  `update_date` datetime NOT NULL,
  `last_access` datetime DEFAULT NULL,
  `id_role` int NOT NULL,
  `id_import` int DEFAULT NULL,
  `id_institution` int NOT NULL,
  `id_course` int DEFAULT NULL,
  PRIMARY KEY (`id_user`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `document` (`document`),
  KEY `fk_user_role` (`id_role`),
  KEY `fk_user_import` (`id_import`),
  CONSTRAINT `fk_user_import` FOREIGN KEY (`id_import`) REFERENCES `import` (`id_import`),
  CONSTRAINT `fk_user_role` FOREIGN KEY (`id_role`) REFERENCES `role` (`id_role`)
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'stefaniapuerta604@gmail.com','$2b$10$OBCD4alCO0zpmTPHDNZ4NuU3L/ZLyM62Tjj3QloRKp1roVx/Qh9n.','Administrador','EduPlanner','CC','1000000001','Armenia','1990-01-01','3000000000',1,NULL,'Ingeniería de Sistemas','Administración de sistemas de información','MASCULINO','Armenia','O+','Ninguna',3,'Ninguno','Contributivo','Sura','Administrador','2026-09-23 20:03:05','2026-09-23 20:03:05',NULL,1,NULL,1,NULL),(2,'jeidy33@gmail.com','$2a$10$Pgc6H97J/55vCMGTrSeh2eDc9RS4VZZFf3YbGm0QvaFN/0AB12RH2','Carlos','Mendoza Pérez','CC','1000001001','Armenia','1988-02-14','3000001001',1,NULL,'Licenciatura en Matemáticas','Docente de Matemáticas','MASCULINO','Armenia','O+','Ninguna',3,'Ninguno','Contributivo','Sura','Docente','2026-09-23 20:03:05','2026-09-23 20:03:05',NULL,2,NULL,1,NULL),(3,'laura.torres@eduplanner.test','$2a$10$Y.obxES4q01XGIvT6ygZFOhQOkuy4QW0Glq3ZEZlEHLY6Aq5r7e7.','Laura','Torres Gómez','CC','1000001002','Armenia','1990-05-21','3000001002',1,NULL,'Licenciatura en Matemáticas','Docente de Matemáticas','FEMENINO','Armenia','A+','Ninguna',3,'Ninguno','Contributivo','Sura','Docente','2026-09-23 20:03:05','2026-09-23 20:03:05',NULL,2,NULL,1,NULL),(4,'miguel.castillo@eduplanner.test','$2a$10$Y.obxES4q01XGIvT6ygZFOhQOkuy4QW0Glq3ZEZlEHLY6Aq5r7e7.','Miguel','Castillo Ruiz','CC','1000001003','Armenia','1987-09-10','3000001003',1,NULL,'Licenciatura en Matemáticas','Docente de Matemáticas','MASCULINO','Armenia','B+','Ninguna',3,'Ninguno','Contributivo','Sura','Docente','2026-09-23 20:03:05','2026-09-23 20:03:05',NULL,2,NULL,1,NULL),(5,'diana.herrera@eduplanner.test','$2b$10$OBCD4alCO0zpmTPHDNZ4NuU3L/ZLyM62Tjj3QloRKp1roVx/Qh9n.','Diana','Herrera López','CC','1000001004','Armenia','1992-11-03','3000001004',1,NULL,'Licenciatura en Matemáticas','Docente de Matemáticas','FEMENINO','Armenia','O+','Ninguna',3,'Ninguno','Contributivo','Sura','Docente','2026-09-23 20:03:05','2026-09-23 20:03:05',NULL,2,NULL,1,NULL),(6,'julian.pena@eduplanner.test','$2b$10$OBCD4alCO0zpmTPHDNZ4NuU3L/ZLyM62Tjj3QloRKp1roVx/Qh9n.','Julián','Peña Vargas','CC','1000001005','Armenia','1989-07-12','3000001005',1,NULL,'Licenciatura en Matemáticas','Docente de Matemáticas','MASCULINO','Armenia','A+','Ninguna',3,'Ninguno','Contributivo','Sura','Docente','2026-09-23 20:03:05','2026-09-23 20:03:05',NULL,2,NULL,1,NULL),(7,'andrea.morales@eduplanner.test','$2a$10$Y.obxES4q01XGIvT6ygZFOhQOkuy4QW0Glq3ZEZlEHLY6Aq5r7e7.','Andrea','Morales Castro','CC','1000001006','Armenia','1989-04-18','3000001006',1,NULL,'Licenciatura en Lengua Castellana','Docente de Lengua Castellana','FEMENINO','Armenia','A+','Ninguna',3,'Ninguno','Contributivo','Sura','Docente','2026-09-23 20:03:05','2026-09-23 20:03:05',NULL,2,NULL,1,NULL),(8,'felipe.ramirez@eduplanner.test','$2b$10$OBCD4alCO0zpmTPHDNZ4NuU3L/ZLyM62Tjj3QloRKp1roVx/Qh9n.','Felipe','Ramírez Vargas','CC','1000001007','Armenia','1991-08-27','3000001007',1,NULL,'Licenciatura en Lengua Castellana','Docente de Lengua Castellana','MASCULINO','Armenia','O+','Ninguna',3,'Ninguno','Contributivo','Sura','Docente','2026-09-23 20:03:05','2026-09-23 20:03:05',NULL,2,NULL,1,NULL),(9,'paola.cardenas@eduplanner.test','$2a$10$Y.obxES4q01XGIvT6ygZFOhQOkuy4QW0Glq3ZEZlEHLY6Aq5r7e7.','Paola','Cárdenas Silva','CC','1000001008','Armenia','1993-01-12','3000001008',1,NULL,'Licenciatura en Lengua Castellana','Docente de Lengua Castellana','FEMENINO','Armenia','B+','Ninguna',3,'Ninguno','Contributivo','Sura','Docente','2026-09-23 20:03:05','2026-09-23 20:03:05',NULL,2,NULL,1,NULL),(10,'jorge.navarro@eduplanner.test','$2b$10$OBCD4alCO0zpmTPHDNZ4NuU3L/ZLyM62Tjj3QloRKp1roVx/Qh9n.','Jorge','Navarro Díaz','CC','1000001009','Armenia','1986-06-30','3000001009',1,NULL,'Licenciatura en Lengua Castellana','Docente de Lengua Castellana','MASCULINO','Armenia','O+','Ninguna',3,'Ninguno','Contributivo','Sura','Docente','2026-09-23 20:03:05','2026-09-23 20:03:05',NULL,2,NULL,1,NULL),(11,'valentina.ruiz@eduplanner.test','$2a$10$Y.obxES4q01XGIvT6ygZFOhQOkuy4QW0Glq3ZEZlEHLY6Aq5r7e7.','Valentina','Ruiz Martínez','CC','1000001010','Armenia','1992-03-25','3000001010',1,NULL,'Licenciatura en Lengua Castellana','Docente de Lengua Castellana','FEMENINO','Armenia','A+','Ninguna',3,'Ninguno','Contributivo','Sura','Docente','2026-09-23 20:03:05','2026-09-23 20:03:05',NULL,2,NULL,1,NULL),(12,'natalia.ruiz@eduplanner.test','$2b$10$OBCD4alCO0zpmTPHDNZ4NuU3L/ZLyM62Tjj3QloRKp1roVx/Qh9n.','Natalia','Ruiz Martínez','CC','1000001011','Armenia','1990-03-25','3000001011',1,NULL,'Licenciatura en Inglés','Docente de Inglés','FEMENINO','Armenia','A+','Ninguna',3,'Ninguno','Contributivo','Sura','Docente','2026-09-23 20:03:05','2026-09-23 20:03:05',NULL,2,NULL,1,NULL),(13,'daniel.ortiz@eduplanner.test','$2a$10$Y.obxES4q01XGIvT6ygZFOhQOkuy4QW0Glq3ZEZlEHLY6Aq5r7e7.','Daniel','Ortiz Moreno','CC','1000001012','Armenia','1988-12-08','3000001012',1,NULL,'Licenciatura en Inglés','Docente de Inglés','MASCULINO','Armenia','O+','Ninguna',3,'Ninguno','Contributivo','Sura','Docente','2026-09-23 20:03:05','2026-09-23 20:03:05',NULL,2,NULL,1,NULL),(14,'camila.vega@eduplanner.test','$2b$10$OBCD4alCO0zpmTPHDNZ4NuU3L/ZLyM62Tjj3QloRKp1roVx/Qh9n.','Camila','Vega Sánchez','CC','1000001013','Armenia','1994-07-19','3000001013',1,NULL,'Licenciatura en Inglés','Docente de Inglés','FEMENINO','Armenia','B+','Ninguna',3,'Ninguno','Contributivo','Sura','Docente','2026-09-23 20:03:05','2026-09-23 20:03:05',NULL,2,NULL,1,NULL),(15,'ricardo.suarez@eduplanner.test','$2b$10$OBCD4alCO0zpmTPHDNZ4NuU3L/ZLyM62Tjj3QloRKp1roVx/Qh9n.','Ricardo','Suárez Gómez','CC','1000001014','Armenia','1985-10-11','3000001014',1,NULL,'Licenciatura en Inglés','Docente de Inglés','MASCULINO','Armenia','O+','Ninguna',3,'Ninguno','Contributivo','Sura','Docente','2026-09-23 20:03:05','2026-09-23 20:03:05',NULL,2,NULL,1,NULL),(16,'isabela.mora@eduplanner.test','$2a$10$Y.obxES4q01XGIvT6ygZFOhQOkuy4QW0Glq3ZEZlEHLY6Aq5r7e7.','Isabela','Mora López','CC','1000001015','Armenia','1993-06-14','3000001015',1,NULL,'Licenciatura en Inglés','Docente de Inglés','FEMENINO','Armenia','A+','Ninguna',3,'Ninguno','Contributivo','Sura','Docente','2026-09-23 20:03:05','2026-09-23 20:03:05',NULL,2,NULL,1,NULL),(17,'lusia.soto@eduplanner.test','$2b$10$OBCD4alCO0zpmTPHDNZ4NuU3L/ZLyM62Tjj3QloRKp1roVx/Qh9n.','Lusia','Soto Vargaz','CC','1000001016','Armenia','1995-07-22','3000001016',1,NULL,'Licenciatura en Ciencias Naturales','Docente de Ciencias Naturales','FEMENINO','Armenia','O+','Ninguna',3,'Ninguno','Contributivo','Sura','Docente','2026-09-23 20:03:05','2026-09-23 20:03:05',NULL,2,NULL,1,NULL),(18,'alejandra.mejia@eduplanner.test','$2b$10$OBCD4alCO0zpmTPHDNZ4NuU3L/ZLyM62Tjj3QloRKp1roVx/Qh9n.','Alejandra','Mejía Torres','CC','1000001017','Armenia','1990-01-28','3000001017',1,NULL,'Licenciatura en Ciencias Naturales','Docente de Ciencias Naturales','FEMENINO','Armenia','A+','Ninguna',3,'Ninguno','Contributivo','Sura','Docente','2026-09-23 20:03:05','2026-09-23 20:03:05',NULL,2,NULL,1,NULL),(19,'esteban.cortes@eduplanner.test','$2a$10$Y.obxES4q01XGIvT6ygZFOhQOkuy4QW0Glq3ZEZlEHLY6Aq5r7e7.','Esteban','Cortés Vargas','CC','1000001018','Armenia','1986-04-13','3000001018',1,NULL,'Licenciatura en Ciencias Naturales','Docente de Ciencias Naturales','MASCULINO','Armenia','O+','Ninguna',3,'Ninguno','Contributivo','Sura','Docente','2026-09-23 20:03:05','2026-09-23 20:03:05',NULL,2,NULL,1,NULL),(20,'patricia.leon@eduplanner.test','$2b$10$OBCD4alCO0zpmTPHDNZ4NuU3L/ZLyM62Tjj3QloRKp1roVx/Qh9n.','Patricia','León Castro','CC','1000001019','Armenia','1992-08-09','3000001019',1,NULL,'Licenciatura en Ciencias Naturales','Docente de Ciencias Naturales','FEMENINO','Armenia','B+','Ninguna',3,'Ninguno','Contributivo','Sura','Docente','2026-09-23 20:03:05','2026-09-23 20:03:05',NULL,2,NULL,1,NULL),(21,'mauricio.reyes@eduplanner.test','$2b$10$OBCD4alCO0zpmTPHDNZ4NuU3L/ZLyM62Tjj3QloRKp1roVx/Qh9n.','Mauricio','Reyes Moreno','CC','1000001020','Armenia','1988-10-24','3000001020',1,NULL,'Licenciatura en Ciencias Naturales','Docente de Ciencias Naturales','MASCULINO','Armenia','O+','Ninguna',3,'Ninguno','Contributivo','Sura','Docente','2026-09-23 20:03:05','2026-09-23 20:03:05',NULL,2,NULL,1,NULL),(22,'juliana.marin@eduplanner.test','$2b$10$OBCD4alCO0zpmTPHDNZ4NuU3L/ZLyM62Tjj3QloRKp1roVx/Qh9n.','Juliana','Marín Rojas','CC','1000001021','Armenia','1991-02-17','3000001021',1,NULL,'Licenciatura en Ciencias Sociales','Docente de Ciencias Sociales','FEMENINO','Armenia','A+','Ninguna',3,'Ninguno','Contributivo','Sura','Docente','2026-09-23 20:03:05','2026-09-23 20:03:05',NULL,2,NULL,1,NULL),(23,'sebastian.pardo@eduplanner.test','$2a$10$Y.obxES4q01XGIvT6ygZFOhQOkuy4QW0Glq3ZEZlEHLY6Aq5r7e7.','Sebastián','Pardo López','CC','1000001022','Armenia','1987-05-29','3000001022',1,NULL,'Licenciatura en Ciencias Sociales','Docente de Ciencias Sociales','MASCULINO','Armenia','O+','Ninguna',3,'Ninguno','Contributivo','Sura','Docente','2026-09-23 20:03:05','2026-09-23 20:03:05',NULL,2,NULL,1,NULL),(24,'monica.santos@eduplanner.test','$2b$10$OBCD4alCO0zpmTPHDNZ4NuU3L/ZLyM62Tjj3QloRKp1roVx/Qh9n.','Mónica','Santos Pérez','CC','1000001023','Armenia','1993-09-06','3000001023',1,NULL,'Licenciatura en Ciencias Sociales','Docente de Ciencias Sociales','FEMENINO','Armenia','B+','Ninguna',3,'Ninguno','Contributivo','Sura','Docente','2026-09-23 20:03:05','2026-09-23 20:03:05',NULL,2,NULL,1,NULL),(25,'oscar.gutierrez@eduplanner.test','$2b$10$OBCD4alCO0zpmTPHDNZ4NuU3L/ZLyM62Tjj3QloRKp1roVx/Qh9n.','Óscar','Gutiérrez Díaz','CC','1000001024','Armenia','1989-11-22','3000001024',1,NULL,'Licenciatura en Ciencias Sociales','Docente de Ciencias Sociales','MASCULINO','Armenia','O+','Ninguna',3,'Ninguno','Contributivo','Sura','Docente','2026-09-23 20:03:05','2026-09-23 20:03:05',NULL,2,NULL,1,NULL),(26,'carolina.munoz@eduplanner.test','$2b$10$OBCD4alCO0zpmTPHDNZ4NuU3L/ZLyM62Tjj3QloRKp1roVx/Qh9n.','Carolina','Muñoz Ríos','CC','1000001025','Armenia','1994-02-18','3000001025',1,NULL,'Licenciatura en Ciencias Sociales','Docente de Ciencias Sociales','FEMENINO','Armenia','A+','Ninguna',3,'Ninguno','Contributivo','Sura','Docente','2026-09-23 20:03:05','2026-09-23 20:03:05',NULL,2,NULL,1,NULL),(27,'veronica.mora@eduplanner.test','$2a$10$Y.obxES4q01XGIvT6ygZFOhQOkuy4QW0Glq3ZEZlEHLY6Aq5r7e7.','Verónica','Mora Ramírez','CC','1000001026','Armenia','1991-06-15','3000001026',1,NULL,'Licenciatura en Educación Física','Docente de Educación Física','FEMENINO','Armenia','A+','Ninguna',3,'Ninguno','Contributivo','Sura','Docente','2026-09-23 20:03:05','2026-09-23 20:03:05',NULL,2,NULL,1,NULL),(28,'alejandro.rincon@eduplanner.test','$2b$10$OBCD4alCO0zpmTPHDNZ4NuU3L/ZLyM62Tjj3QloRKp1roVx/Qh9n.','Alejandro','Rincón Silva','CC','1000001027','Armenia','1987-03-04','3000001027',1,NULL,'Licenciatura en Educación Física','Docente de Educación Física','MASCULINO','Armenia','O+','Ninguna',3,'Ninguno','Contributivo','Sura','Docente','2026-09-23 20:03:05','2026-09-23 20:03:05',NULL,2,NULL,1,NULL),(29,'carolina.duque@eduplanner.test','$2b$10$OBCD4alCO0zpmTPHDNZ4NuU3L/ZLyM62Tjj3QloRKp1roVx/Qh9n.','Carolina','Duque Herrera','CC','1000001028','Armenia','1994-12-02','3000001028',1,NULL,'Licenciatura en Educación Física','Docente de Educación Física','FEMENINO','Armenia','B+','Ninguna',3,'Ninguno','Contributivo','Sura','Docente','2026-09-23 20:03:05','2026-09-23 20:03:05',NULL,2,NULL,1,NULL),(30,'juan.espinosa@eduplanner.test','$2a$10$Y.obxES4q01XGIvT6ygZFOhQOkuy4QW0Glq3ZEZlEHLY6Aq5r7e7.','Juan','Espinosa López','CC','1000001029','Armenia','1989-07-07','3000001029',1,NULL,'Licenciatura en Educación Física','Docente de Educación Física','MASCULINO','Armenia','O+','Ninguna',3,'Ninguno','Contributivo','Sura','Docente','2026-09-23 20:03:05','2026-09-23 20:03:05',NULL,2,NULL,1,NULL),(31,'mariana.vargas@eduplanner.test','$2b$10$OBCD4alCO0zpmTPHDNZ4NuU3L/ZLyM62Tjj3QloRKp1roVx/Qh9n.','Mariana','Vargas León','CC','1000001030','Armenia','1993-11-10','3000001030',1,NULL,'Licenciatura en Educación Física','Docente de Educación Física','FEMENINO','Armenia','A+','Ninguna',3,'Ninguno','Contributivo','Sura','Docente','2026-09-23 20:03:05','2026-09-23 20:03:05',NULL,2,NULL,1,NULL),(32,'sofia.quintero@eduplanner.test','$2a$10$Y.obxES4q01XGIvT6ygZFOhQOkuy4QW0Glq3ZEZlEHLY6Aq5r7e7.','Sofía','Quintero Gómez','CC','1000001031','Armenia','1993-05-16','3000001031',1,NULL,'Licenciatura en Informática','Docente de Tecnología e Informática','FEMENINO','Armenia','A+','Ninguna',3,'Ninguno','Contributivo','Sura','Docente','2026-09-23 20:03:05','2026-09-23 20:03:05',NULL,2,NULL,1,NULL),(33,'mateo.salas@eduplanner.test','$2b$10$OBCD4alCO0zpmTPHDNZ4NuU3L/ZLyM62Tjj3QloRKp1roVx/Qh9n.','Mateo','Salas Rojas','CC','1000001032','Armenia','1988-09-19','3000001032',1,NULL,'Ingeniería de Sistemas','Docente de Tecnología e Informática','MASCULINO','Armenia','O+','Ninguna',3,'Ninguno','Contributivo','Sura','Docente','2026-09-23 20:03:05','2026-09-23 20:03:05',NULL,2,NULL,1,NULL),(34,'valeria.camacho@eduplanner.test','$2b$10$OBCD4alCO0zpmTPHDNZ4NuU3L/ZLyM62Tjj3QloRKp1roVx/Qh9n.','Valeria','Camacho Díaz','CC','1000001033','Armenia','1995-02-11','3000001033',1,NULL,'Ingeniería de Sistemas','Docente de Tecnología e Informática','FEMENINO','Armenia','B+','Ninguna',3,'Ninguno','Contributivo','Sura','Docente','2026-09-23 20:03:05','2026-09-23 20:03:05',NULL,2,NULL,1,NULL),(35,'nicolas.beltran@eduplanner.test','$2a$10$Y.obxES4q01XGIvT6ygZFOhQOkuy4QW0Glq3ZEZlEHLY6Aq5r7e7.','Nicolás','Beltrán Pérez','CC','1000001034','Armenia','1990-10-05','3000001034',1,NULL,'Ingeniería de Sistemas','Docente de Tecnología e Informática','MASCULINO','Armenia','O+','Ninguna',3,'Ninguno','Contributivo','Sura','Docente','2026-09-23 20:03:05','2026-09-23 20:03:05',NULL,2,NULL,1,NULL),(36,'gabriel.suarez@eduplanner.test','$2b$10$OBCD4alCO0zpmTPHDNZ4NuU3L/ZLyM62Tjj3QloRKp1roVx/Qh9n.','Gabriel','Suárez Moreno','CC','1000001035','Armenia','1987-04-22','3000001035',1,NULL,'Ingeniería de Sistemas','Docente de Tecnología e Informática','MASCULINO','Armenia','A+','Ninguna',3,'Ninguno','Contributivo','Sura','Docente','2026-09-23 20:03:05','2026-09-23 20:03:05',NULL,2,NULL,1,NULL),(37,'mariana.rojas@eduplanner.test','$2b$10$OBCD4alCO0zpmTPHDNZ4NuU3L/ZLyM62Tjj3QloRKp1roVx/Qh9n.','Mariana','Rojas Torres','CC','1000001036','Armenia','1992-04-23','3000001036',1,NULL,'Licenciatura en Ciencias Humanas','Docente de Ética y Valores','FEMENINO','Armenia','A+','Ninguna',3,'Ninguno','Contributivo','Sura','Docente','2026-09-23 20:03:05','2026-09-23 20:03:05',NULL,2,NULL,1,NULL),(38,'gabriel.montoya@eduplanner.test','$2a$10$Y.obxES4q01XGIvT6ygZFOhQOkuy4QW0Glq3ZEZlEHLY6Aq5r7e7.','Gabriel','Montoya Sánchez','CC','1000001037','Armenia','1986-01-09','3000001037',1,NULL,'Licenciatura en Filosofía','Docente de Ética y Valores','MASCULINO','Armenia','O+','Ninguna',3,'Ninguno','Contributivo','Sura','Docente','2026-09-23 20:03:05','2026-09-23 20:03:05',NULL,2,NULL,1,NULL),(39,'lorena.vargas@eduplanner.test','$2b$10$OBCD4alCO0zpmTPHDNZ4NuU3L/ZLyM62Tjj3QloRKp1roVx/Qh9n.','Lorena','Vargas Castro','CC','1000001038','Armenia','1994-08-14','3000001038',1,NULL,'Licenciatura en Ciencias Humanas','Docente de Ética y Valores','FEMENINO','Armenia','B+','Ninguna',3,'Ninguno','Contributivo','Sura','Docente','2026-09-23 20:03:05','2026-09-23 20:03:05',NULL,2,NULL,1,NULL),(40,'roberto.fuentes@eduplanner.test','$2a$10$Y.obxES4q01XGIvT6ygZFOhQOkuy4QW0Glq3ZEZlEHLY6Aq5r7e7.','Roberto','Fuentes Moreno','CC','1000001039','Armenia','1989-11-17','3000001039',1,NULL,'Licenciatura en Filosofía','Docente de Ética y Valores','MASCULINO','Armenia','O+','Ninguna',3,'Ninguno','Contributivo','Sura','Docente','2026-09-23 20:03:05','2026-09-23 20:03:05',NULL,2,NULL,1,NULL),(41,'claudia.arias@eduplanner.test','$2b$10$OBCD4alCO0zpmTPHDNZ4NuU3L/ZLyM62Tjj3QloRKp1roVx/Qh9n.','Claudia','Arias López','CC','1000001040','Armenia','1990-06-21','3000001040',1,NULL,'Licenciatura en Educación Religiosa','Docente de Ética y Valores','FEMENINO','Armenia','A+','Ninguna',3,'Ninguno','Contributivo','Sura','Docente','2026-09-23 20:03:05','2026-09-23 20:03:05',NULL,2,NULL,1,NULL),(42,'fernando.molina@eduplanner.test','$2b$10$OBCD4alCO0zpmTPHDNZ4NuU3L/ZLyM62Tjj3QloRKp1roVx/Qh9n.','Fernando','Molina Pérez','CC','1000001041','Armenia','1985-03-13','3000001041',1,NULL,'Licenciatura en Educación Religiosa','Docente de Religión','MASCULINO','Armenia','O+','Ninguna',3,'Ninguno','Contributivo','Sura','Docente','2026-09-23 20:03:05','2026-09-23 20:03:05',NULL,2,NULL,1,NULL),(43,'adriana.soto@eduplanner.test','$2a$10$Y.obxES4q01XGIvT6ygZFOhQOkuy4QW0Glq3ZEZlEHLY6Aq5r7e7.','Adriana','Soto Méndez','CC','1000001042','Armenia','1993-10-28','3000001042',1,NULL,'Licenciatura en Educación Religiosa','Docente de Religión','FEMENINO','Armenia','B+','Ninguna',3,'Ninguno','Contributivo','Sura','Docente','2026-09-23 20:03:05','2026-09-23 20:03:05',NULL,2,NULL,1,NULL),(44,'hector.rios@eduplanner.test','$2b$10$OBCD4alCO0zpmTPHDNZ4NuU3L/ZLyM62Tjj3QloRKp1roVx/Qh9n.','Héctor','Ríos Gómez','CC','1000001043','Armenia','1987-07-26','3000001043',1,NULL,'Licenciatura en Educación Religiosa','Docente de Religión','MASCULINO','Armenia','O+','Ninguna',3,'Ninguno','Contributivo','Sura','Docente','2026-09-23 20:03:05','2026-09-23 20:03:05',NULL,2,NULL,1,NULL),(45,'silvia.martinez@eduplanner.test','$2b$10$OBCD4alCO0zpmTPHDNZ4NuU3L/ZLyM62Tjj3QloRKp1roVx/Qh9n.','Silvia','Martínez Rojas','CC','1000001044','Armenia','1991-12-14','3000001044',1,NULL,'Licenciatura en Educación Religiosa','Docente de Religión','FEMENINO','Armenia','A+','Ninguna',3,'Ninguno','Contributivo','Sura','Docente','2026-09-23 20:03:05','2026-09-23 20:03:05',NULL,2,NULL,1,NULL),(46,'eduardo.martinez@eduplanner.test','$2a$10$Y.obxES4q01XGIvT6ygZFOhQOkuy4QW0Glq3ZEZlEHLY6Aq5r7e7.','Eduardo','Martínez Silva','CC','1000001045','Armenia','1988-05-18','3000001045',1,NULL,'Licenciatura en Ciencias Sociales','Docente de Educación Religiosa','MASCULINO','Armenia','O+','Ninguna',3,'Ninguno','Contributivo','Sura','Docente','2026-09-23 20:03:05','2026-09-23 20:03:05',NULL,2,NULL,1,NULL),(47,'kariangel.silva@eduplanner.test','$2b$10$OBCD4alCO0zpmTPHDNZ4NuU3L/ZLyM62Tjj3QloRKp1roVx/Qh9n.','Kariangel','Silva','CC','1000001046','Armenia','1998-03-15','3000001046',1,NULL,'Licenciatura en Educación Artística','Docente de Educación Artística','FEMENINO','Armenia','O+','Ninguna',3,'Ninguno','Contributivo','Sura','Docente','2026-09-23 20:03:05','2026-09-23 20:03:05',NULL,2,NULL,1,NULL),(48,'tatiana.mendoza@eduplanner.test','$2b$10$OBCD4alCO0zpmTPHDNZ4NuU3L/ZLyM62Tjj3QloRKp1roVx/Qh9n.','Tatiana','Mendoza Silva','CC','1000001047','Armenia','1992-03-16','3000001047',1,NULL,'Licenciatura en Educación Artística','Docente de Educación Artística','FEMENINO','Armenia','A+','Ninguna',3,'Ninguno','Contributivo','Sura','Docente','2026-09-23 20:03:05','2026-09-23 20:03:05',NULL,2,NULL,1,NULL),(49,'sergio.villamil@eduplanner.test','$2a$10$Y.obxES4q01XGIvT6ygZFOhQOkuy4QW0Glq3ZEZlEHLY6Aq5r7e7.','Sergio','Villamil Torres','CC','1000001048','Armenia','1988-01-25','3000001048',1,NULL,'Licenciatura en Educación Artística','Docente de Educación Artística','MASCULINO','Armenia','O+','Ninguna',3,'Ninguno','Contributivo','Sura','Docente','2026-09-23 20:03:05','2026-09-23 20:03:05',NULL,2,NULL,1,NULL),(50,'lucia.benitez@eduplanner.test','$2b$10$OBCD4alCO0zpmTPHDNZ4NuU3L/ZLyM62Tjj3QloRKp1roVx/Qh9n.','Lucía','Benítez Rojas','CC','1000001049','Armenia','1994-09-13','3000001049',1,NULL,'Licenciatura en Educación Artística','Docente de Educación Artística','FEMENINO','Armenia','B+','Ninguna',3,'Ninguno','Contributivo','Sura','Docente','2026-09-23 20:03:05','2026-09-23 20:03:05',NULL,2,NULL,1,NULL),(51,'diego.valencia@eduplanner.test','$2b$10$OBCD4alCO0zpmTPHDNZ4NuU3L/ZLyM62Tjj3QloRKp1roVx/Qh9n.','Diego','Valencia Gómez','CC','1000001050','Armenia','1987-12-19','3000001050',1,NULL,'Licenciatura en Educación Artística','Docente de Educación Artística','MASCULINO','Armenia','O+','Ninguna',3,'Ninguno','Contributivo','Sura','Docente','2026-09-23 20:03:05','2026-09-23 20:03:05',NULL,2,NULL,1,NULL);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-23 20:03:41
