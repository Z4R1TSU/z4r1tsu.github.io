---
title: "Redis基本操作"
description: "这是一篇关于 Redis 基本操作的文章，cpp转java实录。包括了Redis的基本知识和用法，以及在Spring Boot中集成Redis的配置。"
pubDatetime: 2024-07-31
author: Zari Tsu
featured: false
draft: false
tags:
  - Java
---

# Redis 基本操作

之前学了数据库，比如MySQL, PostgreSQL，这种全都是关系型数据库，它们都存在显著的问题，那就是按照木桶效应，速度最慢的硬盘成为了提升性能的瓶颈。而Redis等非关系型数据库(NoSQL)则是一种解决方案，它可以将数据存储在内存中，这样就可以提升性能。

## 基本特点

Redis是一个开源的高性能键值存储数据库（也就是采用Key: Value的键值对形式存储），它支持多种数据结构，包括字符串、哈希、列表、集合、有序集合、位图和 HyperLogLog。Redis支持数据的持久化，可以将内存中的数据保存在磁盘中，重启的时候可以再次加载进行使用。Redis支持主从复制，可以实现读写分离，提高系统的可用性。Redis支持事务，可以一次执行多个命令，减少客户端与服务器之间的通信次数，提高性能。

> 有一个非常重要的，就是Redis是Case-Sensitive的，也就是说，Redis对大小写敏感，所以你不能把一个Key设置成"foo"，然后再设置成"Foo"，否则会导致查询不到数据。

### 持久化

由于Redis是存储在内存当中的，为了数据的持久化，我们还是需要一种方式存回到硬盘这种持久化存储器当中。Redis提供了两种持久化方式，第一种是**RDB持久化**，它会将内存中的数据以快照的方式，按照固定的时间间隔(如果修改操作越频繁，则该时间间隔越短)写入磁盘，恢复时会恢复到最近一次快照的状态。第二种是**AOF持久**化，它会将内存中的数据以日志的形式写入磁盘，恢复时会根据日志中的指令来恢复数据。

还可以通过`save`命令，手动触发RDB持久化，也可以通过`bgsave`命令，后台异步执行RDB持久化。

### 主从复制

Redis支持主从复制，一个主节点(Master)可以对应多个从节点(Slave)，主节点会将自己的数据异步地更新到从节点，从节点可以实现读写分离，提高系统的可用性。

### 哨兵模式

Redis的哨兵模式是一种高可用性的模式，它可以实现Redis的主从复制，并提供监控、通知和自动故障转移等功能。

安装配置就不讲了，提一点Redis只能安装在Linux环境下，Windows环境下只能作为客户端使用。

## 基本操作

### 启动

1. 启动Redis服务

   ```shell
   redis-server
   ```

2. 启动Redis命令行客户端

   ```shell
   redis-cli // 连接到Redis服务
   redis-cli -h 127.0.0.1 -p 6379 // 连接到指定IP和端口的Redis服务
   redis-cli -raw // 显示原始的命令输出，比如你输入一个中文作为值，Redis会显示十六进制，使用-raw参数可以显示中文
   ```

### 基本增删查改

1. 增

   ```
   SET key value // 设置键值对，其中key会被当成string类型的键，value会被当中值
   SETEX key seconds value // 设置键值对，并设置过期时间，单位为秒，过了这个时间后，Redis会自动删除这个键值对
   SETNX key value // 设置键值对，如果键不存在，则设置成功，否则do nothing
   ```

2. 删

   ```
   DEL key // 删除键值对
   ```

3. 查

   ```
   GET key // 获取键值对key对应的值
   ```

4. 批量操作(在操作之前加个M前缀)

   ```
   MSET key1 value1 key2 value2 // 批量设置键值对
   MGET key1 key2 // 批量获取键值对
   ```

### 列表操作(List)

1. 增

   ```
   LPUSH key value // 在列表key的左侧添加一个值value
   RPUSH key value // 在列表key的右侧添加一个值value
   ```

2. 删

   ```
   LPOP key // 从列表key的左侧删除一个值并返回
   RPOP key // 从列表key的右侧删除一个值并返回
   LPOP key n // 从列表key的左侧删除n个值并返回
   RPOP key n // 从列表key的右侧删除n个值并返回
   LTRIM key start end // 截取列表key的部分元素，从start开始到end结束
   ```

3. 查

   ```
   LRANGE key start end // 获取列表key的start到end之间的元素，总的来说用法类似Python的Slicing
   LLEN key // 获取列表key的长度
   ```

### 哈希操作(Hash)

Redis的哈希表是String类型的field和value的映射表，它是一种非常灵活的数据结构。你可以理解为一个string对应一个map，field是key，value是value。

1. 增

   ```
   HSET key field value // 设置哈希表key中field对应的值为value
   HMSET key field1 value1 field2 value2 // 批量设置哈希表key中多个field的值
   ```

2. 删

   ```
   HDEL key field // 删除哈希表key中field对应的值
   ```

3. 查

   ```
   HGET key field // 获取哈希表key中field对应的值
   HEXISTS key field // 判断哈希表key中是否存在field对应的值
   HGETALL key // 获取哈希表key中所有键值对
   HKEYS key // 获取哈希表key中所有键
   HVALS key // 获取哈希表key中所有值
   ```

### 集合操作(Set)

1. 增/删

   ```
   SADD key value // 在集合key中添加一个值value
   SREM key value // 从集合key中删除一个值value
   ```

2. 查

   ```
   SMEMBERS key // 获取集合key中的所有元素
   SCARD key // 获取集合key的元素个数
   SISMEMBER key value // 判断值value是否在集合key中
   ```

### 有序集合操作(Sorted Set)(按照score升序排序)

1. 增

   ```
   ZADD key score value // 在有序集合key中添加一个值value，并给这个值设置一个分数score
   ```

2. 删

   ```
   ZREM key value // 从有序集合key中删除一个值value
   ZREMRANGEBYSCORE key min max // 从有序集合key中删除分数在min和max之间的元素
   ```

3. 查

   ```
   ZRANGE key start end // 获取有序集合key的start到end之间的元素
   ZRANGEBYSCORE key min max // 获取有序集合key中分数在min和max之间的元素
   ZCARD key // 获取有序集合key的元素个数
   ```

### 位图操作(Bitmap)

value全为0或1的bitmap，可以用来做一些高效的位运算操作。

1. 增

   ```
   SETBIT key offset value // 设置位图key的offset偏移量的值为value
   SET key value // 比如value为"/xF0"其实就直接设置了八位，其中前四位为1，后四位为0

   BITFIELD key:fieldname INCRBY u8 field value // 给哈希表key的field对应的值做增量操作，可以对一个字节进行操作
   ```

2. 删

   ```
   BITOP operation destkey key [key ...] // 对位图key1和key2执行位运算操作，并将结果保存到destkey中
   ```

3. 查

   ```
   GETBIT key offset // 获取位图key的offset偏移量的值
   BITCOUNT key [start end] // 获取位图key的非零元素个数
   ```

### 事务(Transaction)

Redis事务提供了一种将多个命令操作在一个事务中执行的机制。在关系型数据库种，事务中的命令要么全部执行成功，要么全部执行失败。但是Redis不一样，事务中某条命令失败，不会影响其他命令的执行。

1. 开启事务

   ```
   MULTI // 开启事务
   ```

2. 命令入队

   ```
   SET key value // 将值value设置到键key
   APPEND key value // 将值value追加到键key的末尾
   ```

3. 执行事务

   ```
   EXEC // 执行事务
   ```

4. 取消事务

   ```
   DISCARD // 取消事务
   ```

### 订阅发布(Pub/Sub)

1. 订阅

   ```
   SUBSCRIBE channel1 [channel2 ...] // 订阅一个或多个频道
   ```

2. 发布

   ```
   PUBLISH channel message // 发布消息到一个频道
   ```

3. 取消订阅

   ```
   UNSUBSCRIBE [channel ...] // 取消订阅一个或多个频道
   ```

### Stream操作(Stream)

1. 创建

   ```
   XADD stream-key * field value [field value ...] // 创建一个新的Stream
   ```

2. 读

   ```
   XRANGE stream-key start end // 获取Stream中start到end之间的消息
   XREVRANGE stream-key end start // 获取Stream中start到end之间的消息，相当于反向查询
   XRANGE stream-key - + // 获取Stream中所有的消息
   XLEN stream-key // 获取Stream的消息个数
   XREAD BLOCK milliseconds STREAMS stream-key [stream-key ...] ID [ID ...] // 读取Stream中的消息，并设置超时时间
   XGROUP CREATE stream-key group-name id $ // 创建一个新的消费组
   XREADGROUP GROUP group-name consumer-name BLOCK milliseconds STREAMS stream-key [stream-key ...] ID [ID ...] // 读取Stream中的消息，并设置超时时间
   ```

3. 删

   ```
   XDEL stream-key ID [ID ...] // 删除Stream中的消息

### HyperLogLog操作(HyperLogLog)

有点像布隆过滤器，有效率和内存的优势，但是需要牺牲一定的准确性。

1. 增

   ```
   PFADD key element [element ...] // 添加元素到HyperLogLog中
   ```

2. 删

   ```
   PFCOUNT key [key ...] // 获取HyperLogLog中元素的个数
   ```

3. 查

   ```
   PFMERGE destkey sourcekey [sourcekey ...] // 将多个HyperLogLog合并到一个HyperLogLog中
   ```

## Spring Boot集成Redis

在Spring Boot中集成Redis，需要在pom.xml中添加Redis的依赖：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```

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

然后就可以在Spring Boot的Bean中注入RedisTemplate，进行Redis的操作：

```java
@Autowired
private RedisTemplate<String, Object> redisTemplate;

public void set(String key, Object value) {
    redisTemplate.opsForValue().set(key, value);
}

public Object get(String key) {
    return redisTemplate.opsForValue().get(key);
}
```

这样就可以在Spring Boot中使用Redis了。
