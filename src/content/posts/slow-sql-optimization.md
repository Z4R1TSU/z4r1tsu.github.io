---
title: "慢SQL的治理与优化"
description: "这是一篇关于 慢SQL治理与优化 的文章。"
pubDatetime: 2025-01-10
author: Zari Tsu
featured: false
draft: false
tags:
  - Java
  - Interview
---

# 慢 SQL 的治理与优化

推荐这两篇文章：[https://m.sohu.com/a/576855886_411876](https://m.sohu.com/a/576855886_411876)，[https://mp.weixin.qq.com/s/CaSVhAJgycjjbCxAkII2ZA](https://mp.weixin.qq.com/s/CaSVhAJgycjjbCxAkII2ZA)。

慢 SQL 是指那些运行时间较长的 SQL 语句，这些 SQL 语句对数据库的性能影响很大，严重影响数据库的运行效率。同时，它也是后端程序员开发当中，贯穿整个开发生命周期的重要环节。

当程序上线或测试的时候，公司会对程序运行的 SQL 语句进行监控，如果发现慢 SQL，比如某条运行时间较长并且较频繁的 SQL 语句（即总运行时间长），则会对其进行优化。

当然最推荐的方法还是直接拿出慢 SQL 的语句，丢给 AI 来优化，但为了面试和思维，我们还是先来看看慢 SQL 的治理与优化的一些方法。

## 思路分析

### SQL 运行逻辑

1. **连接器**：首先数据库需要跟客户端建立连接、获取权限、维持和管理连接。
2. **查询缓存（Query Cache）**：优先在缓存中进行查询，如果查到了则直接返回，如果缓存中查询不到，在去数据库中查询。
   * 但值得注意的是在 MySQL8.0 后，查询缓存被移除了，因为它只适用于数据变化少的情况，key 一旦变化一点就用不了了。
   * 注意 Query Cache 和 Buffer Pool 二者并不同，前者用于缓存之前查询的结果，后者则是用于缓存数据和索引。
3. **解释器/分析器**：对要执行的 SQL 语句进行词法解析、语法解析，最终得到抽象语法树（Abstract Syntax Tree，AST），并进行语法校验。
4. **优化器**：根据生成的 AST 与数据字典和统计信息对 SQL 语句的执行列出执行计划，涉及是否使用索引。
5. **执行器**：根据一系列的执行计划去调用存储引擎提供的 API 接口去调用操作数据，完成 SQL 的执行。

### 影响效率的主要因素

1. 数据量过大是影响 SQL 效率的主要因素之一。一张表内的数据越多，数据库需要扫描进行的 IO 操作就越多，很容易成为性能瓶颈。
2. 没有选用合适的索引，导致索引命中率不高而进行回表操作。
3. 存取数据的方式不合理，如热点数据存储在磁盘而不是高速的内存。
4. 数据加工的方式，即 SQL 语句设计不合理。

### 优化思路

1. 减少数据扫描或减少磁盘访问，多采用时间等使用 `WHERE` 的过滤语句以减少扫描量，选用命中率高的索引避免回表。

2. 减少网络传输，对于变化不大且访问频繁的数据放在应用端缓存或 Redis 中。
3. 避免大事务操作，尽量将大事务拆分为多个小事务，减少锁的竞争。

## 优化案例

### 用 IN 来替换 OR

- 低效查询

```sql
SELECT * FROM t WHERE id = 10 OR id = 20 OR id = 30;
```

- 高效查询

```sql
SELECT * FROM t WHERE id IN (10,20,30);
```

另外，MySQL 对于 IN 做了相应的优化，即将 IN 中的常量全部存储在一个数组里面，而且这个数组是排好序的。但是如果数值较多，产生的消耗也是比较大的。再例如：

```sql
select id from table_name where num in(1,2,3)
```

对于连续的数值，能用 between 就不要用 in 了；再或者使用连接来替换。

### 数据分页优化

注意这个 `LIMIT m, n` 的用法，m 用来指定偏移量，也就是从第几条开始，n 用来指定取多少条。如果 m 很大的话，就会导致遍历过多无用数据。

```sql
select * from table_demo where type = 1 limit 1000000,10;
```

上述 SQL 语句，如果 `type = 1` 的记录非常多，这个操作会非常耗时，因为它要对前几百万条数据都进行 type 是否为 1 的判断，筛选出符合条件的 1000000 条，才会正式计入。MySQL 并不是跳过 offset 行，而是取 offset+N 行，然后放弃前 offset 行，返回 N 行，那当 offset 特别大的时候，效率就非常的低下，要么控制返回的总页数，要么对超过特定阈值的页数进行 SQL 改写。

```sql
select * from table_demo where id in (select id from table_demo where type = 1) limit 1000000, 10;
select * from table_demo as a inner join (select id from table_demo where type = 1 limit 1000000, 10) as b on a.id = b.id;
```

对于 limit m, n 的分页查询，应该先取出主键 id，然后通过主键 id 跟原表进行 Join 关联查询。

### GROUP BY 优化

在分组前就应该尽可能地去把前驱结果过滤得足够小。

低效:

```sql
select job, avg(sal) from table_demo group by job having job = ‘manager';
```

高效:

```sql
 select job, avg(sal) from table_demo where job = ‘manager' group by job;
```

### ORDER BY 优化

如果排序字段没有用到索引，尽量少用排序。MySQL 使不使用索引与所查列无关，只与索引本身，where 条件，order by 字段，group by 字段有关。索引的作用一个是查找，一个是排序。

### 区分 IN 和 EXISTS

```sql
select * from a where id in (select id from b);
```

上面的语句相当于：

```sql
select * from a where exists (select * from b where b.id = a.id);
```

区分 in 和 exists 主要是造成了驱动顺序的改变（这是性能变化的关键），如果是 exists，那么以外层表为驱动表，先被访问，如果是 IN，那么先执行子查询。

所以 IN 适合于 **外表大而内表小** 的情况；EXISTS 适合于 **外表小而内表大** 的情况。

### SELECT * 优化

老生常谈的问题，我们直接在 select 后面接上字段名，还有就是少用嵌套子查询。

## 索引的设计原则

**哪些情况适合建索引**

- 数据又数值有唯一性的限制
- 频繁作为 where 条件的字段
- 经常使用 group by 和 order by 的字段，既有 group by 又有 order by 的字段时，建议建联合索引
- 经常作为 update 或 delete 条件的字段
- 经常需要 distinct 的字段
- 多表连接时的字段建议创建索引，也有 **注意事项**
  - 连接表数量最好不要超过 3 张，每增加一张表就相当于增加了一次嵌套循环，数量级增长会非常快
  - 对多表查询时的 where 条件创建索引
  - 对连接字段创建索引，并且数据类型保持一致
- 在确定数据范围的情况下尽量使用数据类型较小的，因为索引会也会占用空间
- 对字符串创建索引时建议使用字符串的前缀作为索引
- 这样做的好处是：
  - 能节省索引的空间，
  - 虽然不能精确定位，但是能够定位到相同的前缀，然后通过主键查询完整的字符串，这样既能节省空间，又减少了字符串的比较时间，还能解决排序问题。
- 区分度高（散列性高）的字段适合作为索引。
- 在多个字段需要创建索引的情况下，联合索引优先于单值索引。使用最频繁的列作为索引的最左侧 。

**哪些情况下不需要使用索引**

- 在 where 条件中用不到的字段不需要。
- 数据量小的不需要建索引，比如数据少于 1000 条。
- 由大量重复数据的列上不要建索引，比如性别字段中只有男和女时。
- 避免在经常更新的表或字段中创建过多的索引。
- 不建议主键使用无序的值作为索引，比如 uuid。
- 不要定义冗余或重复的索引
- 例如：已经创建了联合索引 key(id, name)后就不需要再单独建一个 key(id)的索引
