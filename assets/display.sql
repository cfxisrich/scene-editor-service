-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema display
-- -----------------------------------------------------
-- 3D平台
DROP SCHEMA IF EXISTS `display` ;

-- -----------------------------------------------------
-- Schema display
--
-- 3D平台
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `display` DEFAULT CHARACTER SET utf8 COLLATE utf8_bin ;
USE `display` ;

-- -----------------------------------------------------
-- Table `display`.`model`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `display`.`model` ;

CREATE TABLE IF NOT EXISTS `display`.`model` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `classify_id` INT UNSIGNED NOT NULL COMMENT '所属分类',
  `package_name` VARCHAR(128) NOT NULL COMMENT '包名',
  `model_name` VARCHAR(128) NOT NULL COMMENT '模型文件名称',
  `preview_name` VARCHAR(32) NULL COMMENT '预览图名字',
  `package_path` VARCHAR(255) NOT NULL COMMENT '包路径',
  `ext` VARCHAR(12) NOT NULL COMMENT '文件格式',
  `size` INT NOT NULL COMMENT '模型包尺寸',
  `delete` TINYINT(1) UNSIGNED NOT NULL DEFAULT 0,
  `create_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modify_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`));


-- -----------------------------------------------------
-- Table `display`.`model_classify`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `display`.`model_classify` ;

CREATE TABLE IF NOT EXISTS `display`.`model_classify` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `classify_name` VARCHAR(64) NOT NULL COMMENT '分类名称',
  `parent_id` INT UNSIGNED NULL COMMENT '父级id',
  `level` INT(2) UNSIGNED NOT NULL COMMENT '分类深度',
  `delete` TINYINT(1) UNSIGNED NOT NULL DEFAULT 0,
  `create_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modify_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`));


-- -----------------------------------------------------
-- Table `display`.`app`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `display`.`app` ;

CREATE TABLE IF NOT EXISTS `display`.`app` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `classify_id` INT UNSIGNED NOT NULL COMMENT '分类ID',
  `app_name` VARCHAR(64) NOT NULL COMMENT '应用名称',
  `preview_name` VARCHAR(32) NULL,
  `package_path` VARCHAR(255) NOT NULL COMMENT '应用路径',
  `delete` TINYINT(1) UNSIGNED NOT NULL DEFAULT 0,
  `create_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modify_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`));


-- -----------------------------------------------------
-- Table `display`.`app_classify`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `display`.`app_classify` ;

CREATE TABLE IF NOT EXISTS `display`.`app_classify` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `parent_id` INT UNSIGNED NULL,
  `classify_name` VARCHAR(64) NOT NULL,
  `level` INT(2) UNSIGNED NOT NULL DEFAULT 0,
  `delete` TINYINT(1) UNSIGNED NOT NULL DEFAULT 0,
  `create_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modify_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`));


-- -----------------------------------------------------
-- Table `display`.`component`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `display`.`component` ;

CREATE TABLE IF NOT EXISTS `display`.`component` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `classify_id` INT UNSIGNED NOT NULL COMMENT '所属分类',
  `package_desp` VARCHAR(128) NOT NULL COMMENT '包描述',
  `package_name` VARCHAR(128) NOT NULL COMMENT '包名',
  `package_version` VARCHAR(32) NOT NULL COMMENT '包版本',
  `package_path` VARCHAR(255) NOT NULL COMMENT '包路径',
  `package_entry` VARCHAR(128) NOT NULL COMMENT '包入口',
  `preview_name` VARCHAR(32) NULL COMMENT '预览图名字',
  `size` INT NOT NULL COMMENT '包尺寸',
  `delete` TINYINT(1) UNSIGNED NOT NULL DEFAULT 0,
  `create_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modify_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`));


-- -----------------------------------------------------
-- Table `display`.`component_classify`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `display`.`component_classify` ;

CREATE TABLE IF NOT EXISTS `display`.`component_classify` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `classify_name` VARCHAR(64) NOT NULL COMMENT '分类名称',
  `parent_id` INT UNSIGNED NULL COMMENT '父级id',
  `level` INT(2) UNSIGNED NOT NULL COMMENT '分类深度',
  `delete` TINYINT(1) UNSIGNED NOT NULL DEFAULT 0,
  `create_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modify_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`));


-- -----------------------------------------------------
-- Table `display`.`texture`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `display`.`texture` ;

CREATE TABLE IF NOT EXISTS `display`.`texture` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `classify_id` INT UNSIGNED NOT NULL COMMENT '所属分类',
  `package_name` VARCHAR(128) NOT NULL COMMENT '包名',
  `resource_name` VARCHAR(128) NOT NULL COMMENT '资源文件名称',
  `preview_name` VARCHAR(128) NULL COMMENT '预览图名字',
  `package_path` VARCHAR(255) NOT NULL COMMENT '包路径',
  `ext` VARCHAR(12) NOT NULL COMMENT '文件格式',
  `size` INT NOT NULL COMMENT '模型包尺寸',
  `delete` TINYINT(1) UNSIGNED NOT NULL DEFAULT 0,
  `create_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modify_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`));


-- -----------------------------------------------------
-- Table `display`.`texture_classify`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `display`.`texture_classify` ;

CREATE TABLE IF NOT EXISTS `display`.`texture_classify` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `classify_name` VARCHAR(64) NOT NULL COMMENT '分类名称',
  `parent_id` INT UNSIGNED NULL COMMENT '父级id',
  `level` INT(2) UNSIGNED NOT NULL COMMENT '分类深度',
  `delete` TINYINT(1) UNSIGNED NOT NULL DEFAULT 0,
  `create_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modify_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`));


-- -----------------------------------------------------
-- Table `display`.`template`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `display`.`template` ;

CREATE TABLE IF NOT EXISTS `display`.`template` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `classify_id` INT UNSIGNED NOT NULL COMMENT '分类ID',
  `template_name` VARCHAR(64) NOT NULL COMMENT '模板名称',
  `preview_name` VARCHAR(32) NULL,
  `package_path` VARCHAR(255) NOT NULL COMMENT '应用路径',
  `delete` TINYINT(1) UNSIGNED NOT NULL DEFAULT 0,
  `create_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modify_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`));


-- -----------------------------------------------------
-- Table `display`.`template_classify`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `display`.`template_classify` ;

CREATE TABLE IF NOT EXISTS `display`.`template_classify` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `parent_id` INT UNSIGNED NULL,
  `classify_name` VARCHAR(64) NOT NULL,
  `level` INT(2) UNSIGNED NOT NULL DEFAULT 0,
  `delete` TINYINT(1) UNSIGNED NOT NULL DEFAULT 0,
  `create_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modify_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`));


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

-- -----------------------------------------------------
-- Data for table `display`.`model_classify`
-- -----------------------------------------------------
START TRANSACTION;
USE `display`;
INSERT INTO `display`.`model_classify` (`id`, `classify_name`, `parent_id`, `level`, `delete`, `create_time`, `modify_time`, `version`) VALUES (DEFAULT, '默认分类', NULL, 0, DEFAULT, DEFAULT, DEFAULT, DEFAULT);

COMMIT;

