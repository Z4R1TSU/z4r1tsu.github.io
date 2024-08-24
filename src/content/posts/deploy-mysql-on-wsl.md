---
title: "在WSL上部署MySQL并连接到Navicat"
description: "这是一篇关于 在WSL上部署MySQL并连接到Navicat 的教程。"
pubDatetime: 2024-08-23
author: Zari Tsu
featured: false
draft: false
tags:
  - Database
---

# 在WSL上部署MySQL并连接到Navicat

## 安装WSL

这个比较简单，直接在微软应用商店里搜索并安装即可。

我们还需要稍微了解一下WSL的一些基本操作。

1. 关闭WSL：`wsl --shutdown`
2. 查看所有WSL：`wsl --list --all`
3. 打开WSL：`wsl -d <指定WSL>`
4. 导出WSL为tar文件（用于转移WSL到其他盘）：`wsl --export <指定WSL> <导出文件名>`
5. 导入WSL：`wsl --import <新WSL名称> <新盘路径> <tar文件路径>`
6. 卸载WSL：`wsl --unregister <指定WSL>`

## 在WSL上安装MySQL

我们先进行安装，这个基本没什么问题。

```bash
sudo apt update
sudo apt install mysql-server
```

打开的时候需要注意一下，使用`mysql -uroot -p -h 127.0.0.1`命令来连接。不然会出一些报错。

## 配置MySQL

打开MySQL配置文件：`nano /etc/mysql/mysql.conf.d/mysqld.cnf`

对这段代码进行修改

1. `bind-address = 127.0.0.1`：注释掉这一行，这样MySQL只能在本地访问。
2. `mysqlx-bind-address = 127.0.0.1`：注释掉这一行，这样MySQL X DevAPI只能在本地访问。

连接到数据库后，继续添加可远程访问的用户

```sql
-- 这样我们创建了一个名为root的用户，密码为123456，并允许他从任何地方连接到数据库。
mysql> CREATE USER 'root'@'%' IDENTIFIED BY '123456';
-- 这一步是为了让刚才创建的用户拥有所有权限。
mysql> GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;
-- 刷新权限，使得刚刚的操作生效
mysql> FLUSH PRIVILEGES;

-- 如果你想要把生成的用户给删掉
mysql> DROP USER 'root'@'%';
```

重启MySQL服务：`sudo service mysql restart`或者`sudo systemctl restart mysql`

## 在Navicat上连接MySQL

首先，我们需要先找到WSL的IP地址，记得不是那个127.0.0.1哦

```bash
# 安装Linux网络工具
sudo apt install net-tools
# 查看WSL的IP地址
ifconfig
```

然后，使用Navicat连接到MySQL，连接方式如下：

- 连接类型：MySQL
- 主机名/IP地址：WSL的IP地址
- 端口：3306
- 用户名：root
- 密码：123456（这个你刚刚设置了啥就用啥）
- 数据库：（空白）

连接成功后，我们就可以开始愉快地使用MySQL了。
