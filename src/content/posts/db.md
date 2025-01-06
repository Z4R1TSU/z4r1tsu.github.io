---
title: "数据库面试题"
description: "这是一篇关于 数据库面试题 的文章。"
pubDatetime: 2024-10-01
author: Zari Tsu
featured: false
draft: false
tags:
  - Database
  - Interview
---

# 数据库面试题

![alt text](../../assets/images/15445-query-execution.png)

## 执行一条 SQL 语句的过程

1. 解析器：解析器负责将 SQL 语句解析成抽象语法树（AST）。首先是语法分析，即判断语句是否符合 SQL 语法；再是语义分析，也就是判断选中的表或者列是否存在，是否有权限访问等。
2. 优化器：优化器负责优化 AST，比如
   1. 选择索引：寻找最优的索引（一般采用B+Tree）。比如对于一个年级的学生，用10个班级做索引肯定比用性别做索引更好。
   2. 表连接顺序：减少IO或者排序的次数与浪费。
   3. 查询重写：对查询进行优化，比如对于一个包含子查询的查询，可以先把子查询的结果集缓存起来，然后在主查询中使用缓存的结果集。
3. 代码生成器：代码生成器负责将优化后的 AST 转换成目标代码，比如 SQL 语句。比如把 `SELECT *` 的 `*` 转换成具体的列名。
4. 执行器：执行器负责执行 SQL 语句，并返回结果。在执行查询时，MySQL 不会一次性将所有数据都读入内存进行操作，而是采用了一种叫做 迭代器 的机制，将查询过程拆分成多个步骤，逐步处理数据。
   1. 火山模型（Volcano/Iterative Model）：它将关系代数中每一种操作抽象为一个 Operator，将整个 SQL 构建成一个 Operator 树，查询树自顶向下的调用next()接口，数据则自底向上的被拉取处理。但对于`join`，`order by`等操作，需要先init()导致阻塞。
   2. 物化模型（Materialized Model）：每个 Operator 一次性把所有输入全部处理，再将所有输出返回给上层。
   3. 向量模型（Vectorized/Batch Model）：上两种的折衷方案，将整个查询过程分解成多个批次，每个批次处理一部分数据，然后再合并结果。

## OLTP 和 OLAP 的区别

* **OLTP（Online Transaction Processing）**：事务处理型数据库，主要用于处理实时事务，如银行交易、零售订单等。适合处理事务，也就是适合用户使用。

* **OLAP（Online Analytical Processing）**：分析型数据库，主要用于处理历史数据，如财务报表、销售数据等。适合公司统计或数据分析使用。

## Database 和 DBMS 的区别

数据库（Database）：存储数据的集合。

DBMS（Database Management System）：数据库管理系统，是管理数据库的软件。它包括数据库的建立、维护、使用、保护、备份等功能。

## 数据库的 ACID 特性

ACID（Atomicity、Consistency、Isolation、Durability）：原子性、一致性、隔离性、持久性。

* 原子性（Atomicity）：一个事务是一个不可分割的工作单位，事务中包括的诸操作要么全部完成，要么全部不完成，不会只执行一部分操作。

* 一致性（Consistency）：数据库的一致性指的是事务的执行前后，数据库的完整性没有被破坏。

* 隔离性（Isolation）：隔离性是指多个事务并发执行时，一个事务的执行不能被其他事务干扰。

* 持久性（Durability）：持久性是指一个事务一旦提交，它对数据库中数据的改变就应该是永久性的。

## 索引

### 索引的目的

通过索引，数据库管理系统可以快速找到数据。

### 如何判断索引的最优解

能排除更多的数据的索引就是好索引。

### 索引的分类

   1. 聚集索引：索引和数据保存在一起，索引的顺序就是数据的排列顺序。叶子直接保存值本身。
   2. 非聚集索引：索引和数据分开存储，索引的顺序和数据无关。叶子上保存的是值所在的地址。

### 数据结构选择

1. B-Tree：B-Tree 是一种平衡的多叉树，它可以快速查找数据。时间复杂度为O(log n)。
2. Hash：Hash 表是一种以键-值对存储数据的结构。在哈希冲突时，时间复杂度不稳定。时间复杂度为O(1)，但遇到哈希冲突时，性能会下降。
3. B+Tree：B+Tree 是一种多路平衡查找树，它可以快速查找数据，并且可以进行范围查询。与B-Tree相比最大不同在于，B+Tree只在叶子节点保存数据。时间复杂度为O(log n)。

### change buffer

change buffer 是 MySQL 为了提高性能而引入的一种机制。它在位置上处于buffer pool中，主要用于缓存数据的修改操作。

当数据进行写入的时候，首先会先写入change buffer。然后等哪天磁盘里的索引正好被读入buffer pool的时候，MySQL才会将change buffer中的数据写入磁盘。



## 查询

### Mybatis Plus 分表

将一个表的记录分割到数个表中，可以减少索引的大小，加快索引的查询速度。

当查询到的记录太多时，可以将数据分成多个表，然后通过 Mybatis Plus 的分表插件来查询。具体操作如下：

1. 创建分表规则：在数据库中创建分表规则，比如按年、月、日来分表。
2. 配置 Mybatis Plus 分表插件：在 Mybatis Plus 的配置文件中配置分表插件。
3. 使用分表查询：在 Mapper 接口中使用分表查询。

### 联合查询(JOIN)

```sql
SELECT a.id, b.name FROM table_a as a JOIN table_b as b ON a.id = b.id;
```

1. **inner join**：只返回两个表中都存在的数据。
2. **left join**：返回左边表中所有数据，右边表中存在的数据用null填充。
3. **right join**：返回右边表中所有数据，左边表中存在的数据用null填充。

### 连接查询(UNION)

将两个或多个 SELECT 语句的结果组合在一起，并去除重复的行。查询同一个表的相同列。

## 主键

* 聚簇索引：也可以理解为主键索引，它也是索引的一种，一般会基于B+Tree或者Hash实现。而它的特点比较明显，一般叶子节点中直接存储了数据的引用，也可以理解为存储了数据本身，可以直接获取数据。又因为它是基于主键的，而主键又是唯一的，因此一张表中只能有一个聚簇索引。
* 非聚簇索引：又称二级索引，顾名思义它想要获取数据是非直接的。在叶子节点中，它只存储目标数据的主键ID，要获取数据，必须得回表查询，通过主键ID再次查询到数据。（回表查询指的是当数据库引擎无法直接从索引中获取所需数据，而需要回到原始数据表中进行额外的查找操作）

## 隔离级别

MySQL默认的隔离级别是可重复读（REPEATABLE READ）。

表中从上到下，隔离等级依次上升，隔离性越强，并发性越低，也就是效率越低。

| 隔离级别 | 脏读(Dirty Read) | 不可重复读(Non-Repeatable Read) | 幻读(Phantom Read) |
| -------- | ---------------- | ---------- | ------------------ |
| 未提交读(Read Uncommitted) | 可能             | 可能       | 可能               |
| 提交读(Read Committed)    | 不可能           | 可能       | 可能               |
| 可重复读(Repeatable Read) | 不可能           | 不可能     | 可能               |
| 串行化(Serializable)     | 不可能           | 不可能               | 不可能             |

* **脏读**：一个事务读到了另一个事务未提交的数据。比如事务a写，事务b读到了事务a的写，然后事务a回滚，这时候事务b读到的就是脏数据。因为要保证串行执行的外显要求，事务b应该读到原先的结果，因为事务a的修改并没有生效。

* **不可重复读**：一个事务在同一行记录上读取两次，第二次读取的结果和第一次读取的结果不同。比如事务a读，事务b写，事务a再读，事务a的两次读取结果不同。而按照串行执行的要求，一个事务独立地两次读取应该结果是一致才对。

* **幻读**：一个事务在同一范围内读取到其他事务插入的数据。事务a在范围内查询，事务b在范围内插入新的数据，事务a再次查询时，会发现多了一些新增的数据。比如事务a进行全表的操作，事务b在范围内插入新的数据，事务a再次查询时，会发现多了一些新增的数据。

## 主从复制

设立一个主服务器和一个或多个从服务器，主服务器负责数据的更新和写入，从服务器负责数据的读取。当主服务器发生数据更新时，会将更新的数据同步到从服务器。

一般采用的同步方式，从服务器将日志与主服务器同步，同时重放日志的内容实现数据同步

主从复制的优点：

1. 读写分离：读操作可以由从服务器进行分担，提高数据库的并发处理能力。
2. 高可用性：当主服务器发生故障时，可以由从服务器提供服务，保证数据的安全性。
3. 扩展性：可以根据需要增加从服务器，提高数据库的负载能力。

## 事务

事务最重要的特点就是要么做完，要么不做。当事务执行的时候，执行完所有操作之后，会进行检查，检查完毕就会提交，正式对数据库进行更新；如果有任何操作失败，事务会回滚，所有操作都不会生效。符合的就是 ACID 特性中的原子性。

### 事务失效

1. Transactional必须用于非public修饰的方法
2. @Transactional 注解属性 propagation 设置错误
3. @Transactional 注解属性 rollbackFor 设置错误
4. 同一个类中方法调用，导致@Transactional失效
   
    ```java
    public void A();

    @Transational
    public/private void B();

    A() {
        B();
    }
   ```
5. 异常被你的 catch“吃了”导致@Transactional失效
6. 数据库引擎不支持事务

## Undo Log

Undo Log 是 MySQL 为了保证事务的原子性而引入的一种机制。Undo Log 主要用于记录数据修改前的状态，当事务回滚时，可以利用 Undo Log 来将数据恢复到修改前的状态。

它也是被保存在buffer pool中的，但出于持久化和高可用的考虑，Undo Log 也会被写入磁盘。

## Rodo Log

这个是类似 crash recovery 的机制，当 MySQL 进程意外崩溃时，可以利用 Rodo Log 来恢复数据，保证数据一致性。它在数据库的地位和职能其实比较像一个日志，以连续地追加写的方式记录了数据库的操作。

比如有条命令会修改数据库中的100行数据，但是进行到一半的时候，进程意外崩溃了，如果没用 Rodo Log，那么这100行中就只有前50个执行完，剩下的都丢失了，但使用者是无感的，还傻乎乎觉得所有数据的改动都生效了。使用 Rodo Log 之后，在发生崩溃之前，就会将历史操作记录下来，这样即使进程意外崩溃，在重启之后，数据库也能找到之前的状态，重新搞数据，保证事务里的多行数据变更。

## binlog

binlog 是 MySQL 用于记录数据库操作的日志，它记录了对数据库的更新操作，可以用于数据恢复、主从复制等。它是数据库中最日志的日志，也是 MySQL 最重要的日志之一。

它记录了对MySQL数据库执行更改的所有写操作，包括增、删、改、以及对表结构的修改。binlog可以用于主从复制、数据恢复、数据分析等。

binlog的格式有statement格式，row格式，mixed格式。statement格式记录的是SQL语句，row格式记录的是行记录，mixed格式既记录SQL语句，又记录行记录。

## 并发管理

### MVCC

## 常用设计

### 字段类型设计

1. 对于字符串类型，尽量使用varchar，因为varchar可以根据实际情况调整长度，节省存储空间。而char类型则是固定长度的，不适合存储大量文本。
2. 对于日期类型，尽量使用datetime，因为datetime可以存储更加精确的时间，而date则只存储日期。
3. 对于货币或者其他金额类型，尽量使用decimal，因为decimal可以存储更大的数值，并且有小数点。

### SQL语句建议

1. select * 尽量不要使用，因为会消耗大量的IO，应该只查询必要的字段。
2. 尽量少的使用连表查询，而是在设计表的时候就先考虑好关系，尽量减少表的数量。

### enum枚举处理

我们常常会遇到一些需要用到枚举的场景，比如订单状态、用户类型等。毕竟使用数字来记忆可读性是很差的，所以我们往往会添加一个描述来组成枚举。

但是呢，我们在Spring Boot中代码可以是要创建一个enum类的，可是在数据库当中enum比较麻烦，往往我们会采用一个普通的int类型，来存储enum类中对应的code。要解决这二者间的对应关系就显得比较重要了。

```java
// entity 创建enum类并添加注解使之与数据库int类型对应
@Getter
@AllArgsConstructor
public enum OrderStatus {
   // 枚举项名(code, desc)
   CREATED(1, "已创建"),
   PAID(2, "已支付"),
   SHIPPED(3, "已发货"),
   DELIVERED(4, "已送达"),
   CANCELLED(5, "已取消");

   // 添加这个注解使得数据库int类型与枚举code对应
   @EnumValue
   private int code;
   // 添加这个注解可以让前端返回的是枚举的描述，也就是“已创建”而不是“1
   @JsonValue
   private String desc;

   OrderStatus(String desc) {
      this.desc = desc;
   }

   Integer getCode() {
      return this.code;
   }
}
```

当然我们还需要配置，使得识别生效，常用的我们通过yaml配置的方式来实现。

```yaml
# application.yml 激活枚举配置
mybatis-plus:
  configuration:
    default-enum-type-handler: xx.xx.xx.MyEnumTypeHandler
```

除了通过yaml配置，还可以直接编写一个配置类

```java
@Configuration
public class MybatisPlusAutoConfiguration {

   @Bean
   public MybatisPlusPropertiesCustomizer mybatisPlusPropertiesCustomizer() {
      return properties -> {
         GlobalConfig globalConfig = properties.getGlobalConfig();
         globalConfig.setBanner(false);
         MybatisConfiguration configuration = new MybatisConfiguration();
         configuration.setDefaultEnumTypeHandler(MyEnumTypeHandler.class);
         properties.setConfiguration(configuration);
      };
   }
}
```

### 分页

当我们查询出来的结果有比如1w条的时候，这样页面一页是肯定放不下的，这时候我们就需要分页来显示。当然实现分页的方式有很多种，但常用的就是利用MP的分页插件来实现。

首先我们需要先配置分页插件

```java
@Configuration
public class MybatisPlusConfig {

   @Bean
   public MybatisPlusInterceptor mybatisPlusInterceptor() {
      // 创建拦截器
      MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
      // 创建分页插件
      PaginationInnerInterceptor paginationInnerInterceptor = new PaginationInnerInterceptor(DbType.MYSQL);
      // 设置分页插件
      paginationInnerInterceptor.setMaxLimit(1000L);
      // 将分页插件添加到拦截器中，当然也能添加其他插件
      interceptor.addInnerInterceptor(paginationInnerInterceptor);
      return interceptor;
   }

}
```

下面就是具体分页的使用操作了，如何使用API来实现分页。由于其实每个分页的重复操作很多，所以我们封装一个通用的分页方法。

三步走：

1. 创建page对象，设置当前页页号和每页显示条数，以及排序规则。

   ```java
   @Data
   @Tag(name = "分页查询参数")
   public class PageQuery {

      @Operation(summary = "当前页页号")
      private Long current = 1;
      @Operation(summary = "每页显示条数")
      private Long size = 10;
      @Operation(summary = "排序字段")
      private String sort;
      @Operation(summary = "是否升序")
      private Boolean isAsc;

      public <T> Page<T> toPage(OrderItem orderItem) {
         // 创建page对象，设置当前页页号和每页显示条数
         Page<T> page = Page.of(current, size);
         if (StrUtil.isNotBlank(sort)) {
            page.addOrder(isAsc? OrderItem.asc(sort) : OrderItem.desc(sort));
         } else {
            // 使用传入的排序规则
            page.addOrder(orderItem);
         }
         return page;
      }

   }
   ```

2. 执行查询（解析数据）

   ```java
   Page<User> page = PageQuery.toPage();
   // 执行查询-方法1
   Page<User> result = userMapper.selectPage(page, new QueryWrapper<>());
   // 执行查询-方法2
   Page<User> result = lambdaQuery().page(page);
   // 解析总条数
      long total = result.getTotal();
   // 解析总页数
   long pages = result.getPages();
   // 解析数据
   List<User> records = result.getRecords();
   ```

3. 封装分页结果，创建一个通用的分页DTO，用泛型来接收不同类型的分页参数

   ```java
   @Data
   @Tag(name = "分页结果")
   public class PageDTO<T> {
      @Operation(summary = "总条数")
      private Long total;
      @Operation(summary = "总页数")
      private Long pages;
      @Operation(summary = "当前页数据")
      private List<T> records;

      public static <PO, VO> PageDTO<VO> of(Page<PO> page, Function<PO, VO> mapper) {
         PageDTO<VO> pageDTO = new PageDTO<>();
         pageDTO.setTotal(page.getTotal());
         pageDTO.setPages(page.getPages());
         pageDTO.setRecords(page.getRecords().stream().map(mapper).collect(Collectors.toList()));
         return pageDTO;
      }
   }
   // 这样我们在调用的时候就可以直接封装
   // return PageDTO.of(result, user -> BeanUtil.copyProperties(user, UserVO.class));
   ```
