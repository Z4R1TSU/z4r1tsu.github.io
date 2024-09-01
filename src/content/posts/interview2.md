---
title: "Java 后端面试2"
description: "记录我的面试"
pubDatetime: 2024-08-21
author: Zari Tsu
featured: false
draft: false
tags:
  - Interview
---

# Java 后端面试 2

## 笔试

### Java 语法选择题

1. Java是值传递还是引用传递？python和c++是值传递还是引用传递？

    答：Java是值传递，python是对象的引用，c++是值传递。

2. 什么是反射？

    答：反射是Java提供的一种机制，可以让运行中的Java程序在运行时获取类的信息，并能调用类的属性和方法。

3. `@Transactional`注解在什么时候会失效？

   1. Transactional必须用于非public修饰的方法
   2. @Transactional 注解属性 propagation 设置错误
   3. @Transactional 注解属性 rollbackFor 设置错误
   4. 同一个类中方法调用，导致@Transactional失效
      
       ```txt
       public void A();

       @Transational
       public/private void B();

       A() {
           B();
       }
      ```
   5. 异常被你的 catch“吃了”导致@Transactional失效
   6. 数据库引擎不支持事务

### 算法题

1. 给一个字符串，给出出现最多次数的字符个数，注意不区分大小写。

    ```txt
    "AaA11" -> 3
    "abcab" -> 2
    ```

    ```python3
        return collections.Counter(s.lower()).most_common(1)[0][1]
    ```
   
2. 有一句话比如"i am sorry"，它会在这句话前面和后面随机添加同一串或几串字符"wub"，并且空格也会被替换成几个wub。你需要将替换后的结果，还原成原来的句子。

    ```txt
    "WUBWUBIWUBWUBWUBAMWUBSORRY" -> "I AM SORRY"
    ```

    ```python3
        # 1. 将所有 "wub" 替换为空格
        # "WUBWUBIWUBWUBWUBAMWUBSORRY" -> "  I   AM SORRY"
        text = text.replace("wub", " ")

        # 2. 移除开头和结尾的空格
        # "  I   AM SORRY" -> "I   AM SORRY"
        text = text.strip()

        # 3. 将多个空格替换为单个空格
        # "I   AM SORRY" -> "I AM SORRY"
        text = " ".join(text.split())
    ```

3. 利用Java的substring实现对String类型的slice操作，并且注意边界条件。

    ```java
    // String text, int start , int end
    // text = "hello", start = 2, end = 3
    if (text == null) {
        return "";
    }
    int n = text.length();
    if (start < 0) {
        start = n + start;
        if (start < 0) {
            start = 0;
        }
    }
    if (start > n) {
        start = n;
    }
    return text.substring(start, end);
    ```

4. springboot + mybatis 实战题。Get方法但是没有输入，让我们改成Get方法可以输入三个参数，并且三个参数都可以为空。改返回值为JSON对象。

    ```java
    @ResponseBody
    @PathVariable(required = false)
    ```

    ```xml
    <!-- SELECT * FROM users -->
    <!-- SELECT * FROM users WHERE id = #{id} AND ... -->
            SELECT * FROM users
            <where>
                <if test="id != null">
                    id = #{id}
                </if>
            </where>
    ```

## 面试

1. AOP / IOC

    Aspect Oriented Programming，面向切面编程，是一种编程技术，它可以将一些通用功能抽象为一个模块，然后在需要的时候，将这个模块应用到另一个模块中，从而达到代码的重用和模块化的目的。

2. 设计模式：工厂模式
