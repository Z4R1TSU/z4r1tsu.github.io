---
title: "Redis 缓存"
description: "这是一篇关于 Redis 缓存的文章，cpp转java实录。在Spring Boot中集成Redis缓存，并使用注解来缓存方法的返回值。"
pubDatetime: 2024-08-04
author: Zari Tsu
featured: false
draft: false
tags:
  - Java
---

# Redis 缓存

## 缓存基础和主动更新

### 基础模板

一般基础使用都是这个模板

```java
@Autowired
private RedisTemplate<String, Object> redisTemplate;

public Object queryWithRedisCache(String key) {
    // 获取key，一般都会加个前缀来注明作缓存用
    String key = "cache:" + key;
    // 查询Redis中是否存在该key对应的缓存
    Object cache = redisTemplate.opsForValue().get(key);
    if (cache != null) {
        // 如果存在缓存，直接返回缓存
        return cache;
    }
    // 如果不存在缓存，则查询数据库，并将结果缓存到Redis中
    Object result = queryFromDB();
    if (result == null) {
        // 如果查询结果为空，则直接返回null
        return null;
    }
    redisTemplate.opsForValue().set(key, result);
    // 设置缓存过期时间为60秒，毕竟Redis空间有限很宝贵
    redisTemplate.expire(key, 60, TimeUnit.MINUTES);
    return result;
}
```

### 主动更新策略

然而基础模板效率来说其实是不高的，因为在于它的逐出策略，是到了时间才将其删除，那假设一种情况，每一个缓存进来之后，都没再被用过了，都是等到expire时间到了才消失，这样的话这个缓存设置就没意义了。

解决方案就是用主动更新策略，主动地去删除无用缓存，同时为了保证缓存一致性和缓存与数据库的资源一致，我们先操作数据库，然后再删除缓存。

* 对于低一致性要求确实可以用超时自动删除，但是对于高一致性要求，我们还是需要主动更新。

* 对于读操作还是不变的，先读缓存，读到就返回，没有的话再读数据库，然后更新缓存。

* 对于写操作，先更新数据库，然后删除缓存。

```java
@Autowired
private RedisTemplate<String, Object> redisTemplate;

public Object updateWithRedisCache(String key, Object value) {
    updateToDB(key, value);
    // 删除缓存
    String key = "cache:" + key;
    redisTemplate.delete(key);
    return value;
}
```

## 缓存进阶和实际问题

### 常见的几个问题

1. 缓存穿透问题：缓存和数据库都没有，每次查询都要去数据库，这样会导致数据库压力过大，造成系统崩溃。
   
    1. 在第一次到缓存未命中到达数据库后，发现符合缓存穿透条件，设置一个空值缓存(有过期时间)，当查询不到数据时，直接返回空值。
    2. 布隆过滤器: 这样的话结构本来是发出查询->redis缓存->数据库，要在查询和缓存间加一层BloomFilter。如果检测到查询的key不存在于数据库中，则直接报错；如果在数据库中，则更布隆过滤器。

2. 缓存雪崩问题：缓存服务器宕机或同一时段大量缓存失效，导致大量请求直接落到数据库，数据库压力过大，造成系统崩溃。

    1. 随机设置缓存过期时间，避免缓存雪崩。
    2. Redis集群: 避免缓存雪崩，可以将缓存分布到多个Redis节点上，避免单点故障。
    3. 降级限流: 直接限制对服务器的查询请求，返回错误，不对数据库产生进一步的压力。
    4. 添加多级缓存

3. 缓存击穿问题：缓存击穿是指对于某个被高并发且缓存构建业务比较复杂的key，缓存中没有，但是数据库中有，每次查询都要去数据库，造成数据库压力过大，造成系统崩溃。

    1. 互斥锁: 对于查询某个key的请求，当缓存没有命中时，加互斥锁，查询数据库返回请求，并在缓存中设置这个key，再释放锁，避免其他线程在查询重建时期的多次访问。
    2. 逻辑过期: 对于那些已经判断为热点高并发的资源，直接把它定死在redis当中，保证热点资源每时每刻都在缓存中，虽然可能会有旧的没更新的。对于过期时间，直接以值的形式存到redis的value一栏当中，这样即使到了过期时间它也不会被redis删除。如果过期了，则开另外一个线程去查询数据库，更新缓存。

### Redis如何上锁

我们可以使用Redis的setnx命令来实现分布式锁，setnx命令的作用是设置一个key，当key不存在时，才会设置成功，如果key已经存在，则不设置成功。

这样可以发现，`setnx`的性质很好刚好就契合了锁的功能。因为如果key不存在，则说明没有人持有锁，可以加锁，如果key已经存在，说明有人持有锁，再怎么申请都不能加锁。

但是还是要注意，如果一个持有锁的程序崩溃了，锁就会一直存在，造成死锁。所以我们还需要类似RAII思想，设置一个过期时间，避免锁一直存在。

```java
public boolean lock(String key) {
    String lockKey = "lock:" + key;
    String requestId = UUID.randomUUID().toString();
    // 尝试加锁，成功返回true，失败返回false
    boolean result = redisTemplate.opsForValue().setIfAbsent(lockKey, requestId, 30, TimeUnit.SECONDS);
    if (result) {
        // 加锁成功，设置过期时间
        redisTemplate.expire(lockKey, 30, TimeUnit.SECONDS);
        return true;
    } else {
        // 加锁失败，说明有人持有锁
        return false;
    }
}

public void unlock(String key) {
    String lockKey = "lock:" + key;
    String requestId = redisTemplate.opsForValue().get(lockKey);
    if (requestId!= null && requestId.equals(UUID.randomUUID().toString())) {
        // 只有持有锁的线程才可以释放锁
        redisTemplate.delete(lockKey);
    }
}
```

### 逻辑过期

```java
// 先封装data对象，将原数据和逻辑过期时间合并成一个对象
@Data
@AllArgsConstructor
public class CacheData(Object data, LocalDateTime expireTime) {
    Object rawData;
    LocalDateTime expireTime;
}

private static final ExecutorService executor = Executors.newFixedThreadPool(10);

public Object queryWithRedisCache(String key) {
    // 获取key，一般都会加个前缀来注明作缓存用
    String key = "cache:" + key;
    // 查询Redis中是否存在该key对应的缓存
    CacheData cacheData = redisTemplate.opsForValue().get(key);
    if (cacheData == null) {
        // 如果不存在缓存，直接返回空
        return null;
    }
    // 如果缓存中的逻辑时间过期，直接返回旧的这个过期的缓存
    Object data = cacheData.getData();
    LocalDateTime expireTime = cacheData.getExpireTime();
    if (expireTime.isAfter(LocalDateTime.now())) {
        // 缓存没有过期，直接返回这个可用的缓存
        return data;
    }
    // 如果缓存过期，则查询数据库，并将结果缓存到Redis中
    // 涉及到对数据库的操作，需要加锁
    Boolean lock = requireLock(key);
    if (!lock) {
        // 申请失败，说明已经有线程在修改缓存，我们直接返回旧的缓存
        return data;
    }
    // 申请锁成功，我们另开一个新线程去查询数据库，并更新缓存，本线程直接返回旧的缓存
    executor.execute(() -> {
        try {
            Object result = queryFromDB();
            if (result == null) {
                // 如果查询结果为空，则直接返回null
                return null;
            }
            // 缓存新数据
            CacheData newCacheData = new CacheData(result, LocalDateTime.now().plusSeconds(60));
            redisTemplate.opsForValue().set(key, newCacheData);
        } catch (Exception e) {
            // 出现异常，说明查询数据库失败，我们直接返回旧的缓存
            return data;
        } finally {
            // 不管有没有遇到问题，都要释放锁
            releaseLock(key);
        }
    });
    // 因为我们在新线程进行了更新，所以本线程仍旧返回旧的缓存
    return data;
}
```

## 高阶改进

上面的实现看起来还是非常朴素的，还有非常多的优化空间

### 封装整个Redis的工具类

这里就是把上面的代码都复制粘贴到一个独立的类当中，但是注意泛型的使用，要保证泛用性。

### 使用官方锁

我们自己写的锁，肯定不如它官方锁来的安全，并发度高，支持并发。

比如说，可以使用Redisson来实现分布式锁，它可以自动续期，避免死锁，还可以实现公平锁，避免锁的饥饿。

```java
 // Redisson 客户端的配置 
 Config config = new Config();
 config.useSingleServer().setAddress("redis://your-redis-host:6379");
 RedissonClient redisson = Redisson.create(config);

 // requireLock 方法
 public boolean requireLock(String key) {
     RLock lock = redisson.getLock(key);
     // 超时时间设置为 50 毫秒
     return lock.tryLock(50, TimeUnit.MILLISECONDS);
 }

 // releaseLock 方法
 public void releaseLock(String key) {
     RLock lock = redisson.getLock(key);
     lock.unlock();
 }
```

### 使用Redis集群

Redis集群可以提高Redis的读写性能，避免单点故障。

```java
RedisClusterClient redisClusterClient = RedisClusterClient.create("redis://localhost:7000,redis://localhost:7001,redis://localhost:7002");
// 连接集群，获取RedisAdvancedClusterCommands对象，用来操作集群
RedisAdvancedClusterCommands<String, String> commands = redisClusterClient.getAdvancedClusterCommands();
```
