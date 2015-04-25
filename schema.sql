CREATE DATABASE bookindex;
USE bookindex;

CREATE TABLE isbn (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	isbn BIGINT UNSIGNED NULL,
	title VARCHAR(500) NOT NULL,
	author VARCHAR(500) NOT NULL,
	amazon_result TEXT,
	last_amazon_update DATETIME NOT NULL,
	PRIMARY KEY (id),
	UNIQUE KEY isbn (isbn)
);

ALTER TABLE isbn
	MODIFY isbn VARCHAR(50) NOT NULL;

DROP TABLE isbn;

CREATE TABLE `barcode` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `upc` CHAR(12) DEFAULT NULL,
  `isbn` CHAR(13) DEFAULT NULL,
  `ean` CHAR(13) DEFAULT NULL,
  `asin` CHAR(10) DEFAULT NULL,
  `title` VARCHAR(500) NOT NULL,
  `author` VARCHAR(500) NOT NULL,
  `amazon_result` TEXT,
  `last_amazon_update` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  KEY `isbn` (`isbn`),
  KEY `ean` (`ean`),
  KEY `upc` (`upc`),
  KEY `asin` (`asin`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8
;

ALTER TABLE barcode
  ADD UNIQUE INDEX title_author (title(250), author(250));
