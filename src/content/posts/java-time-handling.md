---
title: "Java 中的时间处理"
description: "这是一篇关于 Java 中的时间处理的文章。"
pubDatetime: 2024-10-31
author: Zari Tsu
featured: false
draft: false
tags:
  - Java
---

# Java 中的时间处理

我们之前聊过，在 Java 项目中对于时间类字段的处理，须用 `Instant`，`LocalDateTime`，`DateTimeFormatter` 来替代传统的 `Date`，`Calendar`，`SimpleDateFormat`。

> 以上特指JDK 8 及以上版本。

再提一下数据库中，时间字段的类型建议使用 `Datetime` 类型。

## 原因

* **线程安全**: Date 和 Calendar 类不是线程安全的，在多线程环境下使用可能会导致数据不一致的问题。 而 Instant 和 LocalDateTime 是不可变的，线程安全。
* **可读性**: Instant 和 LocalDateTime 的 API 设计更加简洁直观，易于理解和使用。
* **易于格式化**: DateTimeFormatter 类提供了一种更安全、更易于维护的日期格式化方式。因为 SimpleDateFormat 会受到线程安全、区域设置问题、可选择时间范围的影响。

## 示例

传统方式

```java
Date now = new Date();
SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
String formattedDate = formatter.format(now);
```

推荐方式（采用 `Instant` 和 `DateTimeFormatter`）

```java
Instant now = Instant.now(); 
DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
String formattedDate = now.atZone(ZoneId.systemDefault()).format(formatter);
```

## Instant

Instant 是一个不可变的类，表示时间点，是更偏向于计算机技术编程上的时间工具类。Instant 类提供了一些方法来获取当前时间点、日期、时间戳等。它是 UTC 时间，并以纳秒为单位来表示。

```java
// 获取当前时间点
Instant now = Instant.now();
```

## LocalDateTime

LocalDateTime 表示了日期时间，但不包含时区信息。

何谓不包含时区信息，比如我在中国和美国同时进行一次 LocalDateTime 的调用，得到的值和含义是不同的。

```java
// 获取当前时间
LocalDateTime localDateTime1 = LocalDateTime.now();
// 获取指定时间
LocalDateTime localDateTime2 = LocalDateTime.of(2024, 11, 1, 12, 59, 59);
// 时间计算：localDateTime2 加一天，减去两小时的时间
LocalDateTime localDateTime3 = localDateTime2.plusDays(1).minusHours(2);
```

## DateTimeFormatter

DateTimeFormatter 是 SimpleDateFormat 的新品，是一个新的格式化器，用于打印和解析日期时间。它提供了更易于理解和使用的 API，并提供了更安全、更可靠的格式化和解析方式。

### 格式化

格式化我们用到的是 `ofPattern()` 方法，它接受一个格式化字符串作为参数，并返回一个 DateTimeFormatter 对象。

这个方法第一个参数一般传入时间的格式（如`“yyyy-MM-dd HH:mm:ss”`），而第二个一般用来指定时区（如`Locale.US`）。

```java
// 生成格式
DateTimeFormatter formatter1 = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
DateTimeFormatter formatter2 = DateTimeFormatter.ofPattern("yyyy/MM/dd'T'HH:mm:ss", Locale.CHINA);
// 将 LocalDateTime 格式化为指定格式的字符串
String formattedDate1 = formatter1.format(localDateTime);
```

### 解析

在解析中，我们使用的是 `parse()` 方法，它接受一个字符串作为时间输入和一个格式化器作为格式，并返回一个 LocalDateTime 对象。

```java
// 解析字符串
LocalDateTime localDateTime = LocalDateTime.parse("2021-08-01T12:00:00", formatter1);
```

## Duration

Duration 表示两个时间点之间的间隔。

```java
// 这里的 start 和 end 是 Instant 类型
Duration duration = Duration.between(start, end);
```
