
/*==================================== DATABASE AND TABLES ==================================*/

CREATE DATABASE carry_it_final;
Query OK, 1 row affected (0.00 sec)

Database changed
USE carry_it_final;
Database changed

CREATE TABLE users( user_id INT(255) AUTO_INCREMENT PRIMARY KEY, u_fname VARCHAR(40) NOT NULL, u_lname VARCHAR(40), u_email VARCHAR(50) UNIQUE NOT NULL, u_mobile VARCHAR(10) NOT NULL, password VARCHAR(40) NOT NULL)ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;
Query OK, 0 rows affected, 2 warnings (0.02 sec)

mysql> DESC users;
+----------+-------------+------+-----+---------+----------------+
| Field    | Type        | Null | Key | Default | Extra          |
+----------+-------------+------+-----+---------+----------------+
| user_id  | int(255)    | NO   | PRI | NULL    | auto_increment |
| u_fname  | varchar(40) | NO   |     | NULL    |                |
| u_lname  | varchar(40) | YES  |     | NULL    |                |
| u_email  | varchar(50) | NO   | UNI | NULL    |                |
| u_mobile | varchar(10) | NO   |     | NULL    |                |
| password | varchar(40) | NO   |     | NULL    |                |
+----------+-------------+------+-----+---------+----------------+
6 rows in set (0.00 sec)


CREATE TABLE items(
 item_id INT(255) AUTO_INCREMENT PRIMARY KEY,
 i_name VARCHAR(40) NOT NULL, 
 i_desc VARCHAR(100) NOT NULL, 
 i_to VARCHAR(50) NOT NULL, 
 i_from VARCHAR(50) NOT NULL, 
 i_type VARCHAR(40) NOT NULL, 
 i_date DATETIME DEFAULT CURRENT_TIMESTAMP, 
 i_status VARCHAR(10) NOT NULL DEFAULT "CREATED",
 customer_id INT(255),
 FOREIGN KEY(customer_id) REFERENCES users(user_id) ON DELETE CASCADE
 )ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8;
 Query OK, 0 rows affected, 3 warnings (0.02 sec)

mysql> DESC items;
+-------------+--------------+------+-----+-------------------+-------------------+
| Field       | Type         | Null | Key | Default           | Extra             |
+-------------+--------------+------+-----+-------------------+-------------------+
| item_id     | int(255)     | NO   | PRI | NULL              | auto_increment    |
| i_name      | varchar(40)  | NO   |     | NULL              |                   |
| i_desc      | varchar(100) | NO   |     | NULL              |                   |
| i_to        | varchar(50)  | NO   |     | NULL              |                   |
| i_from      | varchar(50)  | NO   |     | NULL              |                   |
| i_type      | varchar(40)  | NO   |     | NULL              |                   |
| i_date      | datetime     | YES  |     | CURRENT_TIMESTAMP | DEFAULT_GENERATED |
| i_status    | varchar(10)  | NO   |     | NULL              |                   |
| customer_id | int(255)     | YES  | MUL | NULL              |                   |
+-------------+--------------+------+-----+-------------------+-------------------+
9 rows in set (0.00 sec)


CREATE TABLE orders(
    order_id INT(255) AUTO_INCREMENT PRIMARY KEY,
    item_id INT(255),
    deliverer_id INT(255),
    estimated_date DATE NOT NULL,
    message VARCHAR(100) NOT NULL,
    FOREIGN KEY(item_id) REFERENCES items(item_id) ON DELETE CASCADE,
    FOREIGN KEY(deliverer_id) REFERENCES users(user_id) ON DELETE CASCADE
    )ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8;
Query OK, 0 rows affected, 4 warnings (0.03 sec)

mysql> DESC orders;
+-----------------+----------+------+-----+---------+----------------+
| Field           | Type     | Null | Key | Default | Extra          |
+-----------------+----------+------+-----+---------+----------------+
| order_id        | int(255) | NO   | PRI | NULL    | auto_increment |
| item_id         | int(255) | YES  | MUL | NULL    |                |
| deliverer_id    | int(255) | YES  | MUL | NULL    |                |
| estimated_date  | date     | NO   |     | NULL    |                |
+-----------------+----------+------+-----+---------+----------------+
4 rows in set (0.00 sec)


mysql> ALTER TABLE items ALTER i_status SET DEFAULT "CREATED";
Query OK, 0 rows affected (0.02 sec)
Records: 0  Duplicates: 0  Warnings: 0

mysql> DESC items;
+-------------+--------------+------+-----+-------------------+-------------------+
| Field       | Type         | Null | Key | Default           | Extra             |
+-------------+--------------+------+-----+-------------------+-------------------+
| item_id     | int(255)     | NO   | PRI | NULL              | auto_increment    |
| i_name      | varchar(40)  | NO   |     | NULL              |                   |
| i_desc      | varchar(100) | NO   |     | NULL              |                   |
| i_to        | varchar(50)  | NO   |     | NULL              |                   |
| i_from      | varchar(50)  | NO   |     | NULL              |                   |
| i_type      | varchar(40)  | NO   |     | NULL              |                   |
| i_date      | datetime     | YES  |     | CURRENT_TIMESTAMP | DEFAULT_GENERATED |
| i_status    | varchar(10)  | NO   |     | CREATED           |                   |
| customer_id | int(255)     | YES  | MUL | NULL              |                   |
+-------------+--------------+------+-----+-------------------+-------------------+
9 rows in set (0.01 sec)


/*==================================== TRIGGERS ===========================================*/
(IN MYSQL WORKBENCH)

delimiter //
create trigger update_after
       after update on items
       for each row
       begin
       insert into trigger_items values(new.item_id, new.i_status);
       end; //
delimiter ;

0 row(s) affected   0.0086 sec

mysql> CREATE TABLE trigger_items (
    item_id INT(255),
    order_status VARCHAR(10),
    FOREIGN KEY(item_id) REFERENCES items(item_id) ON DELETE CASCADE);

mysql> UPDATE items SET i_status = "DELIVERED" WHERE item_id=13;
Query OK, 1 row affected (0.01 sec)
Rows matched: 1  Changed: 1  Warnings: 0

mysql> SELECT * FROM trigger_items;
+---------+--------------+
| item_id | order_status |
+---------+--------------+
|      13 | DELIVERED    |
+---------+--------------+
1 row in set (0.00 sec)

/*====================================== VIEWS ============================================*/

mysql> CREATE VIEW userdetails AS
     SELECT u_email, password
     FROM users;
Query OK, 0 rows affected (0.05 sec)

mysql> SELECT * FROM userdetails;
+---------------------------+----------+
| u_email                   | password |
+---------------------------+----------+
| rajeshhegde180@gmail.com  | 123      |
| dp@gmail.com              | 123      |
| kalpanmukherjee@gmail.com | 123      |
| rashmitha@gmail.com       | 123      |
+---------------------------+----------+
4 rows in set (0.01 sec)

mysql> CREATE VIEW orderdetails AS
    SELECT order_id, estimated_date
    FROM orders;
Query OK, 0 rows affected (0.00 sec)

mysql> SELECT * FROM orderdetails;
+----------+----------------+
| order_id | estimated_date |
+----------+----------------+
|       32 | 2019-11-09     |
|       33 | 2019-11-23     |
|       34 | 2019-11-23     |
+----------+----------------+
3 rows in set (0.01 sec)

mysql> CREATE VIEW itemdetails AS SELECT item_id, i_name, i_status FROM items;
Query OK, 0 rows affected (0.00 sec)

mysql> SELECT * FROM itemdetails;
+---------+--------+----------+
| item_id | i_name | i_status |
+---------+--------+----------+
|      11 | Bomb   | CREATED  |
|      13 | Laptop | CREATED  |
+---------+--------+----------+
2 rows in set (0.00 sec)


/*==================================== REPORT GENERATION ==================================*/

My SQL workbench > Server > Performance reports 

/*=========================================================================================*/

mysql> SHOW tables;
+--------------------------+
| Tables_in_carry_it_final |
+--------------------------+
| itemdetails              |
| items                    |
| orderdetails             |
| orders                   |
| trigger_items            |
| userdetails              |
| users                    |
+--------------------------+
7 rows in set (0.00 sec)
