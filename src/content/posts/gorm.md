---
title: "Gorm"
description: "这是一篇关于 Gorm 这一用于 Go 语言的 ORM 框架的文章。"
pubDatetime: 2025-02-19
author: Zari Tsu
featured: false
draft: false
tags:
  - Go
---

# Gorm

先来聊聊所谓 ORM 到底是什么，其实 ORM 就是 Object-Relational Mapping 的缩写，它是一种编程技术，它将关系数据库中的数据映射到面向对象编程语言中的对象上。通俗点来说，就是**用程序中的类和属性映射关系数据库中的表和字段，以此通过程序的逻辑代码对数据库进行操作**。

而 Gorm 之于 Golang 就类似于 Hibernate或Mybatis 之于 Java 一样，这个比喻应该比较形象。也就是说，Gorm 并没有很好的抽象和封装化（毕竟对标的不是 Mybatis-Plus 等二次封装框架），而是直接将数据库操作的细节暴露给开发者，让开发者可以更加关注业务逻辑。

## 前置步骤

### 安装

```bash
go get gorm.io/gorm
go get gorm.io/driver/mysql  # 或者其他您使用的数据库驱动，例如 postgres、sqlite、sqlserver
```

### 连接数据库

```go
package main

// 自动导入 gorm 包和对应数据库的驱动
import (
    "gorm.io/gorm"
    "gorm.io/driver/mysql"
)

func main() {
    // 此处 DataSourceName 中的具体连接数据，也可以通过环境变量、配置文件等方式获取
    dsn := "user:password@tcp(127.0.0.1:3306)/database_name?charset=utf8mb4&parseTime=True&loc=Local" // 替换为您的数据库连接信息
    db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
    if err != nil {
        panic("failed to connect database")
    }

    // 成功连接数据库后，db 变量就可以用来进行数据库操作了
    println("Database connected successfully!")
}
```

### 定义模型

所谓模型（Model）也就是数据库的表，逻辑代码的类。

```go
type User struct {
    gorm.Model // 内嵌 gorm.Model，包含 ID、CreatedAt、UpdatedAt、DeletedAt 字段
    Name  string `gorm:"size:255"` // 字段名 Name，类型 string，gorm tag 定义字段长度
    Email string `gorm:"unique"`     // 字段名 Email，类型 string，gorm tag 定义唯一索引
}
```

注意：`gorm:"tag"`: GORM 可以这样来定义字段的数据库映射规则和约束，例如字段大小、唯一索引、是否可为空等等。这类似于 MyBatis-Plus 中的注解或 XML 配置

## 基本操作（CRUD）

### 创建表

```go
db.AutoMigrate(&User{}) // 自动迁移 User 模型对应的表
```

### 增

```go
// 1. 创建 User 实例
user := User{Name: "Alice", Email: "alice@example.com"}
// 2. 保存行记录到指定数据库
result := db.Create(&user)

// 批量操作
users := []*User{
    {Name: "Jinzhu", Age: 18, Birthday: time.Now()},
    {Name: "Jackson", Age: 19, Birthday: time.Now()},
}
result := db.CreateInBatches(users)

// 处理结果
user.ID             // 返回插入数据的主键
result.Error        // 返回 error
result.RowsAffected // 返回插入记录的条数
```

### 查

1. `First`：返回第一条匹配的记录，相当于 `ORDER BY id LIMIT 1`
2. `Take`：获取一条记录无指定排序顺序，相当于 `LIMIT 1`
3. `Last`：返回最后一条匹配的记录，相当于 `ORDER BY id DESC LIMIT 1`

```go
var u = new(User)
db.First(u)

var uu User
db.Find(&uu, "name = ?", "Alice")

var users1 []User
db.Find(&users, "age <> ?", 18)

var users2 []User
db.Find(&users, "name IN ?", []string{"Jinzhu", "Jackson"})
```

### 改

1. `Select`：指定要更新的字段，在更新某条行记录时可指定只更新部分字段
2. `Omit`：忽略某些字段不更新

```go
// 先查后更新
// UPDATE `users` SET `age` = 20 WHERE `name` = 'Alice'
var user User
db.First(&user, "name = ?", "Alice")
user.Age = 20
db.Save(&user)

// 利用 save 保存的更新（若不存在则创建，若存在则更新）
// UPDATE `users` SET `name` = 'jinzhu', `age` = 100 WHERE `id` = 1
db.Save(&User{ID: 1, Name: "jinzhu", Age: 100})

// Model + Updates 是最推荐的方式
var user User
db.Find(&user, "name = ?", "Alice")
db.Model(&user).Select("*").Updates(User{Age: 20, Name: "Jinzhu"})
```

### 删

```go
db.Where("name = ?", "jinzhu").Delete(&email)
db.Delete(&Email{}, "email LIKE ?", "%jinzhu%")
```

## 进阶操作

### Builder

这个相当于 Mybatis-Plus 中的 Wrapper，可以用来构造复杂的查询条件。

```go
// 原生 SQL 的执行
var users []User
db.Raw("UPDATE users SET name = ? WHERE age = ? RETURNING id, name", "jinzhu", 20).Scan(&users)

db.Exec("UPDATE users SET money = ? WHERE name = ?", gorm.Expr("money * ? + ?", 10000, 1), "jinzhu")

// 条件查询
var users []User

db.Where("name LIKE ?", "%Ali%").Find(&users) // 模糊查询 Name 字段包含 "Ali" 的用户
db.Where("name = ? AND email <> ?", "Alice", "alice@example.com").Find(&users) // 多条件查询

//  Order 排序
db.Order("name").Find(&users) // 按 Name 字段升序排序
db.Order("name DESC").Find(&users) // 按 Name 字段降序排序

// Limit 和 Offset 分页
db.Limit(10).Offset(20).Find(&users) // 分页查询，每页 10 条，从第 21 条开始
```

### Joins

```go
var users []User
db.Joins("Orders").Where("orders.amount > ?", 100).Find(&users)
``` 

### 事务

```go
// 嵌套事务（调用Transaction方法）
err := db.Transaction(func(tx *gorm.DB) error {
    if err := tx.Create(&User{Name: "Alice"}).Error; err != nil {
        return err
    }
    if err := tx.Create(&User{Name: "Bob"}).Error; err != nil {
        return err
    }
    return nil
})

if err != nil {
    // 事务回滚
    fmt.Println("Transaction failed:", err)
} else {
    // 事务提交
    fmt.Println("Transaction success!")
}

// 单独使用事务（调用Begin方法）
tx := db.Begin()

// 事务内操作
tx.Create(&User{Name: "Alice"})
tx.Create(&User{Name: "Bob"})

// 事务提交
tx.Commit()
// 事务回滚
tx.Rollback()
```
