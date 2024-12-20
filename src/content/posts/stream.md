---
title: "Stream流"
description: "Java中Stream流的使用，包括forEach, map, peek, filter等方法。"
pubDatetime: 2024-12-20
author: Zari Tsu
featured: false
draft: false
tags:
  - Java
---

# Stream流

Stream流是Java8之后才出现的一种新的集合操作方式，它允许我们以一种声明式的方式对集合进行操作，简化了集合操作的代码。

它相较于普通的for循环，更加清晰、简洁，提供更加优雅的可读性，支持更多的操作，并且可以避免一些常见的错误。

## 适用对象

stream流可以用于集合、数组、IO流、函数式接口等，保证对象是可遍历或者流式的数据。

## 常用方法

首先我想聊聊forEach, map, peek这三者的区别。

`forEach` 是一个终端操作，用于遍历集合中的元素，并且不返回任何结果。而且它是以遍历为主，一般不会通过它进行修改操作。总的来说，foreach就是单纯用于普通的遍历操作，将会中断流操作。

```java
List<Integer> newList = {1, 2, 3, 4, 5};
int sum = 0;
newList.stream()
  .forEach(item -> {
    sum += item;
  });
```

`map` 是一个中间操作，用于对集合中的元素进行转换，返回一个新的Stream对象。一般会在遍历时进行修改，并且一般传入一个需要显式地返回遍历元素结果的方法，以组成新的Stream对象，也就是说需要有一个新的Stream对象来承接转换完的结果。总结就是，map可以对流中的元素进行转换，再形成一个新的流。

```java
List<Integer> newList = {1, 2, 3, 4, 5};
List<Integer> result = newList.stream()
  .map(item -> {
     return item * 2;
  })
  .collect(Collectors.toList());
```

`peek` 是一个中间操作，用于对集合中的元素进行访问，但是不会对元素进行修改。一般会在遍历时进行访问，并且提供的方法一般不需要返回值。而出于peek的只读性，一般用于调试或者日志输出。总结来说，peek不能修改流中的元素，只能对元素进行打印输出或者其他外部处理操作。

```java
List<Integer> newList = {1, 2, 3, 4, 5};
List<Integer> result = newList.stream()
  .peek(item -> {
    System.out.println(item);
  })
  .collect(Collectors.toList());
```

`filter` 是一个中间操作，用于对集合中的元素进行过滤，返回一个新的Stream对象。一般会在遍历时进行过滤，并且一般传入一个需要显式地过滤元素的方法，以组成新的Stream对象。

```java
List<Integer> newList = {1, 2, 3, 4, 5};
List<Integer> result = newList.stream()
  .filter(item -> {
     return item % 2 == 0;
   })
  .collect(Collectors.toList());
```
