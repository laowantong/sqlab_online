/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

DROP DATABASE IF EXISTS sqlab_test;
CREATE DATABASE sqlab_test DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

USE sqlab_test;

CREATE TABLE inhabitant (
  personid int(11) NOT NULL AUTO_INCREMENT,
  name varchar(255) DEFAULT NULL,
  villageid int(11) DEFAULT NULL,
  gender varchar(10) DEFAULT NULL,
  job varchar(255) DEFAULT NULL,
  gold int(11) DEFAULT NULL,
  state varchar(50) DEFAULT NULL,
  hash BIGINT,
  PRIMARY KEY (personid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE item (
  item varchar(255) NOT NULL,
  owner int(11) DEFAULT NULL,
  hash BIGINT,
  PRIMARY KEY (item)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE village (
  villageid int(11) NOT NULL AUTO_INCREMENT,
  name varchar(255) DEFAULT NULL,
  chief int(11) DEFAULT NULL,
  hash BIGINT,
  PRIMARY KEY (villageid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE FUNCTION string_hash(string LONGTEXT)
RETURNS BIGINT DETERMINISTIC
RETURN CONV(LEFT(SHA2(string, 256), 10), 16, 10);

DROP TRIGGER IF EXISTS before_insert_inhabitant;
CREATE TRIGGER before_insert_inhabitant
BEFORE INSERT ON inhabitant
FOR EACH ROW
SET NEW.hash = string_hash(CAST(JSON_ARRAY("inhabitant", NEW.name, NEW.villageid, NEW.gender, NEW.job, NEW.gold, NEW.state) AS CHAR));

DROP TRIGGER IF EXISTS before_update_inhabitant;
CREATE TRIGGER before_update_inhabitant
BEFORE UPDATE ON inhabitant
FOR EACH ROW
SET NEW.hash = string_hash(CAST(JSON_ARRAY("inhabitant", NEW.name, NEW.villageid, NEW.gender, NEW.job, NEW.gold, NEW.state) AS CHAR));

TRUNCATE TABLE inhabitant;

INSERT INTO inhabitant (name, villageid, gender, job, gold, state) VALUES
  ('Paul Bakerman', 1, 'm', 'baker', 850, 'friendly'),
  ('Ernest Perry', 3, 'm', 'weaponsmith', 280, 'friendly'),
  ('Rita Ox', 1, 'f', 'baker', 350, 'friendly'),
  ('Carl Ox', 1, 'm', 'merchant', 250, 'friendly'),
  ('Dirty Dieter', 3, 'm', 'smith', 650, 'evil'),
  ('Gerry Slaughterer', 2, 'm', 'butcher', 4850, 'evil'),
  ('Peter Slaughterer', 3, 'm', 'butcher', 3250, 'evil'),
  ('Arthur Tailor', 2, 'm', 'pilot', 490, 'kidnapped'),
  ('Tiffany Drummer', 1, 'f', 'baker', 550, 'evil'),
  ('Peter Drummer', 1, 'm', 'smith', 600, 'friendly'),
  ('Dirty Diane', 3, 'f', 'farmer', 10, 'evil'),
  ('Otto Alexander', 2, 'm', 'dealer', 680, 'friendly'),
  ('Fred Dix', 3, 'm', 'author', 420, 'friendly'),
  ('Enrico Carpenter', 3, 'm', 'weaponsmith', 510, 'evil'),
  ('Helen Grasshead', 2, 'f', 'dealer', 680, 'friendly'),
  ('Ivy Hatter', 1, 'f', 'dealer', 770, 'evil'),
  ('Edward Grasshead', 3, 'm', 'butcher', 990, 'friendly'),
  ('Ryan Horse', 3, 'm', 'blacksmith', 390, 'friendly'),
  ('Ann Meaty', 2, 'f', 'butcher', 2280, 'friendly')
;
DROP TRIGGER IF EXISTS before_insert_item;
CREATE TRIGGER before_insert_item
BEFORE INSERT ON item
FOR EACH ROW
SET NEW.hash = string_hash(CAST(JSON_ARRAY("item", NEW.item, NEW.owner) AS CHAR));

DROP TRIGGER IF EXISTS before_update_item;
CREATE TRIGGER before_update_item
BEFORE UPDATE ON item
FOR EACH ROW
SET NEW.hash = string_hash(CAST(JSON_ARRAY("item", NEW.item, NEW.owner) AS CHAR));

TRUNCATE TABLE item;

INSERT INTO item (item, owner) VALUES
  ('bucket', NULL),
  ('carton', NULL),
  ('咖啡杯', 3),
  ('lightbulb', NULL),
  ('ring', NULL),
  ('teapot', NULL),
  ('hammer', 2),
  ('cane', 5),
  ('rope', 17)
;
DROP TRIGGER IF EXISTS before_insert_village;
CREATE TRIGGER before_insert_village
BEFORE INSERT ON village
FOR EACH ROW
SET NEW.hash = string_hash(CAST(JSON_ARRAY("village", NEW.name, NEW.chief) AS CHAR));

DROP TRIGGER IF EXISTS before_update_village;
CREATE TRIGGER before_update_village
BEFORE UPDATE ON village
FOR EACH ROW
SET NEW.hash = string_hash(CAST(JSON_ARRAY("village", NEW.name, NEW.chief) AS CHAR));

TRUNCATE TABLE village;

INSERT INTO village (name, chief) VALUES
  ('Monkeycity', 1),
  ('Cucumbertown', 6),
  ('Onionville', 13)
;
