-- Initial HopeDB Schema
-- Creates core product, price history, and sales detail tables

CREATE TABLE IF NOT EXISTS product (
  prodCode    VARCHAR(6)   NOT NULL PRIMARY KEY,
  description VARCHAR(30)  NOT NULL,
  unit        VARCHAR(3)   CHECK (unit IN ('pc', 'ea', 'mtr', 'pkg', 'ltr')),
  record_status VARCHAR(10) DEFAULT 'ACTIVE' CHECK (record_status IN ('ACTIVE', 'INACTIVE')),
  stamp       VARCHAR(60)
);

CREATE TABLE IF NOT EXISTS priceHist (
  effDate   DATE           NOT NULL,
  prodCode  VARCHAR(6)     NOT NULL REFERENCES product(prodCode),
  unitPrice DECIMAL(10,2)  CHECK (unitPrice > 0),
  stamp     VARCHAR(60),
  PRIMARY KEY (effDate, prodCode)
);

CREATE TABLE IF NOT EXISTS salesDetail (
  salesNo  VARCHAR(6)  NOT NULL,
  prodCode VARCHAR(6)  NOT NULL REFERENCES product(prodCode),
  qty      INT,
  unitPrice DECIMAL(10,2),
  PRIMARY KEY (salesNo, prodCode)
);

-- Rights Management Tables

CREATE TABLE IF NOT EXISTS "user" (
  userId       VARCHAR(255)  NOT NULL PRIMARY KEY,

  username     VARCHAR(50),
  lastName     VARCHAR(50),
  firstName    VARCHAR(50),
  user_type    VARCHAR(20)  CHECK (user_type IN ('SUPERADMIN', 'USER', 'ADMIN')),
  record_status VARCHAR(10) CHECK (record_status IN ('ACTIVE', 'INACTIVE')),
  stamp        VARCHAR(60)
);

CREATE TABLE IF NOT EXISTS "Module" (
  Module_ID    VARCHAR(30)  NOT NULL PRIMARY KEY,
  DESCRIPTION  VARCHAR(100),
  Record_status VARCHAR(10) NOT NULL CHECK (Record_status IN ('ACTIVE', 'INACTIVE')),
  Stamp        VARCHAR(60)
);

CREATE TABLE IF NOT EXISTS user_module (
  userid       VARCHAR(255) NOT NULL REFERENCES "user"(userId),
  Module_ID    VARCHAR(30)  NOT NULL REFERENCES "Module"(Module_ID),
  rights_value INT          NOT NULL CHECK (rights_value IN (0, 1)),
  record_status VARCHAR(10) NOT NULL CHECK (record_status IN ('ACTIVE', 'INACTIVE')),
  stamp        VARCHAR(60),
  PRIMARY KEY (userid, Module_ID)
);

CREATE TABLE IF NOT EXISTS rights (
  Right_ID     VARCHAR(15)  PRIMARY KEY,

  Description  VARCHAR(30),
  Right_value  INT          NOT NULL CHECK (Right_value IN (0, 1)),
  Module_ID    VARCHAR(30)  NOT NULL REFERENCES "Module"(Module_ID),
  Record_status VARCHAR(10) NOT NULL CHECK (Record_status IN ('ACTIVE', 'INACTIVE')),
  Stamp        VARCHAR(60)
);

CREATE TABLE IF NOT EXISTS UserModule_Rights (
  userid       VARCHAR(255) NOT NULL REFERENCES "user"(userId),
  Right_ID     VARCHAR(30)  NOT NULL REFERENCES rights(Right_ID),
  Right_value  INT          NOT NULL CHECK (Right_value IN (0, 1)),
  Record_status VARCHAR(10) NOT NULL CHECK (Record_status IN ('ACTIVE', 'INACTIVE')),
  Stamp        VARCHAR(60),
  PRIMARY KEY (userid, Right_ID)
);
