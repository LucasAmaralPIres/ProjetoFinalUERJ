create database if not exists Access_Control;
use Access_Control;
CREATE TABLE IF NOT EXISTS T_Student
(
NUM_MATRICULATION varchar(15) NOT NULL primary key,
NUM_CARD varchar(15),
TXT_NAME varchar(100) NOT NULL
);
CREATE TABLE IF NOT EXISTS T_TEACHER
(
NUM_MATRICULATION varchar(15) NOT NULL primary key,
NUM_CARD varchar(15),
TXT_NAME varchar(100) NOT NULL
);
CREATE TABLE IF NOT EXISTS T_SUBJECT
(
NUM_CODE varchar(15) NOT NULL primary key,
NUM_CREDITS NUMERIC(5) NOT NULL,
TXT_NAME varchar(100) NOT NULL
);
CREATE TABLE IF NOT EXISTS T_CLASSROOM
(
TXT_ROOM VARCHAR(20) NOT NULL primary key,
FL_RESTRICT tinyint(1) DEFAULT '0' NOT NULL
);
CREATE TABLE IF NOT EXISTS T_SCHEDULE
(
NUM_ID NUMERIC(10) NOT NULL PRIMARY KEY,
DAT_SCHEDULE_BEGINNING datetime NOT NULL,
DAT_SCHEDULE_END datetime NOT NULL,
TXT_DESCRIPTION varchar(200) NOT NULL
);
CREATE TABLE IF NOT EXISTS T_CLASS_ID
(
NUM_ID VARCHAR(15) NOT NULL primary KEY,
SUBJECT_CODE VARCHAR(15) NOT NULL,
TXT_NAME varchar(100) NOT NULL,
FOREIGN KEY (SUBJECT_CODE) REFERENCES T_SUBJECT(NUM_CODE)
);
CREATE TABLE IF NOT EXISTS T_CLASS
(
NUM_ID NUMERIC(10) NOT NULL PRIMARY KEY,
DAT_SCHEDULE_BEGINNING datetime NOT NULL,
DAT_SCHEDULE_END datetime NOT NULL,
NUM_CLASS_ID VARCHAR(15) NOT NULL,
TXT_CLASSROOM VARCHAR(20) NOT NULL,
FOREIGN KEY (NUM_CLASS_ID) REFERENCES T_CLASS_ID(NUM_ID),
FOREIGN KEY (TXT_CLASSROOM) REFERENCES T_CLASSROOM(TXT_ROOM)
);
CREATE TABLE IF NOT EXISTS T_STUDENT_CLASS_ID
(
NUM_MATRICULATION_STUDENT VARCHAR(15) NOT NULL,
NUM_CLASS_ID VARCHAR(15) NOT NULL,
DAT_ENROLLMENT DATETIME NOT NULL,
FOREIGN KEY (NUM_MATRICULATION_STUDENT) REFERENCES T_STUDENT(NUM_MATRICULATION),
FOREIGN KEY (NUM_CLASS_ID) REFERENCES T_CLASS_ID(NUM_ID)
);
CREATE TABLE IF NOT EXISTS T_TEACHER_CLASS_ID
(
NUM_MATRICULATION_TEACHER VARCHAR(15) NOT NULL,
NUM_CLASS_ID VARCHAR(15) NOT NULL,
FOREIGN KEY (NUM_MATRICULATION_TEACHER) REFERENCES T_TEACHER(NUM_MATRICULATION),
FOREIGN KEY (NUM_CLASS_ID) REFERENCES T_CLASS_ID(NUM_ID)
);
CREATE TABLE IF NOT EXISTS T_CLASSROOM_CLASS_ID
(
TXT_CLASSROOM VARCHAR(20) NOT NULL,
NUM_CLASS_ID VARCHAR(15) NOT NULL,
FOREIGN KEY (TXT_CLASSROOM) REFERENCES T_CLASSROOM(TXT_ROOM),
FOREIGN KEY (NUM_CLASS_ID) REFERENCES T_CLASS_ID(NUM_ID)
);
CREATE TABLE IF NOT EXISTS T_SCHEDULE_CLASS_ID
(
ENUM_SCHEDULE NUMERIC(10) NOT NULL,
NUM_CLASS_ID VARCHAR(15) NOT NULL,
FOREIGN KEY (ENUM_SCHEDULE) REFERENCES T_SCHEDULE(NUM_ID),
FOREIGN KEY (NUM_CLASS_ID) REFERENCES T_CLASS_ID(NUM_ID)
);
CREATE TABLE IF NOT EXISTS T_SCHEDULE_CLASS
(
NUM_MATRICULATION_STUDENT VARCHAR(15) NOT NULL,
NUM_CLASS NUMERIC(10) NOT NULL,
FOREIGN KEY (NUM_MATRICULATION_STUDENT) REFERENCES T_STUDENT(NUM_MATRICULATION),
FOREIGN KEY (NUM_CLASS) REFERENCES T_CLASS(NUM_ID)
);