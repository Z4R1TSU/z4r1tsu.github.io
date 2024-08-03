---
title: "Redis 整合"
description: "这是一篇关于 Redis 整合的文章，cpp转java实录。在Spring Boot中集成Redis和适用"
pubDatetime: 2024-08-03
author: Zari Tsu
featured: false
draft: false
tags:
  - Java
---

# Redis 整合

还是再提一下常考的RDB和AOF，二者都是为了保证数据的持久化，比较Redis是存在内存当中的，还是不可避免的要保存到硬盘中。

RDB: 以快照的方式，以一定的时间间隔存到硬盘当中，这个间隔会因为存储频率的变化而变化。

AOF: 以日志的方式，记录对数据库执行的所有操作，只要操作成功，就会被追加到文件末尾。

### 引入依赖

在Spring Boot中集成Redis，需要在pom.xml中添加Redis的依赖：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```

### 配置application.yml

然后在`application.yml`中配置Redis的连接信息：

```yaml
spring:
  redis:
    host: 127.0.0.1  # Redis服务器地址
    port: 6379  # Redis服务器端口
    password: <PASSWORD>
    lettuce:   # 一般新的springboot用的都是lettuce
      pool:
        max-active: 8  # 连接池最大连接数（使用负值表示没有限制）
        max-idle: 8  # 连接池最大空闲连接数
        min-idle: 0  # 连接池最小空闲连接数
        time-between-eviction-runs: 10m  # 连接空闲超时时间
```

### 注入

然后就可以在Spring Boot的Bean中注入RedisTemplate，进行Redis的操作：

```java
@Autowired
private RedisTemplate<String, Object> redisTemplate;
```

或者注入StringRedisTemplate，进行字符串操作：

```java
@Autowired
private StringRedisTemplate stringRedisTemplate;
```

这样就可以在Spring Boot中使用Redis了。

### 基本用法

1. String：
   1. set
        ```java
        stringRedisTemplate.opsForValue().set(key, value);
        ```
   2. get
        ```java
        stringRedisTemplate.opsForValue().get(key);
        ```
   3. delete
        ```java
        stringRedisTemplate.delete(key);
        ```
   4. expire
        ```java
        stringRedisTemplate.expire(key, timeout, timeUnit);
        ```
   5. exists
        ```java
        stringRedisTemplate.hasKey(key);
        ```

2. Hash
    1. put
         ```java
         stringRedisTemplate.opsForHash().put(key, hashKey, value);
         ```
    2. putAll  
        一次性把所有field-value对存入hashmap中
         ```java
         Map<String, String> map = new HashMap<>();
         map.put("key1", "value1");
         map.put("key2", "value2");
         stringRedisTemplate.opsForHash().putAll(key, map);
         ```
    3. get
         ```java
         stringRedisTemplate.opsForHash().get(key, hashKey);
         ```
    4. expire
         ```java
         stringRedisTemplate.expire(key, timeout, timeUnit);
         ```
    5. delete
         ```java
         stringRedisTemplate.opsForHash().delete(key, hashKey);
         ```
         也可以一次把key对应的所有field-value对删除
         ```java
         stringRedisTemplate.delete(key);
         ```

3. List
    1. leftPush
         ```java
         stringRedisTemplate.opsForList().leftPush(key, value);
         ```
    2. rightPush
         ```java
         stringRedisTemplate.opsForList().rightPush(key, value);
         ```
    3. leftPop
         ```java
         stringRedisTemplate.opsForList().leftPop(key);
         ```
    4. rightPop
         ```java
         stringRedisTemplate.opsForList().rightPop(key);
         ```
    5. size
         ```java
         stringRedisTemplate.opsForList().size(key);
         ```
    6. range
         ```java
         stringRedisTemplate.opsForList().range(key, start, end);
         ```
    7. expire
         ```java
         stringRedisTemplate.expire(key, timeout, timeUnit);
         ```
    8. delete
         ```java
         stringRedisTemplate.opsForList().delete(key, index);
         ```

4. Set
   1. add
        ```java
        stringRedisTemplate.opsForSet().add(key, value);
        ```
   2. size
        ```java
        stringRedisTemplate.opsForSet().size(key);
        ```
   3. members
        ```java
        stringRedisTemplate.opsForSet().members(key);
        ```
   4. expire
        ```java
        stringRedisTemplate.expire(key, timeout, timeUnit);
        ```
   5. delete
        ```java
        stringRedisTemplate.opsForSet().delete(key, value);
        ```

其他的暂且不提，因为用的确实比较少
