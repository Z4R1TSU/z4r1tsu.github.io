---
title: "异常处理"
description: "这是一篇关于Java异常处理的文章。"
pubDatetime: 2024-10-30
author: Zari Tsu
featured: false
draft: false
tags:
  - Java
---

# 异常处理

1. 在 Controller 中，应尽可能少地捕获异常（即使用`try-catch`），而是应该使用拦截器来处理异常。

2. 具体区分异常的类型，比如对于同一个代码块的IOException和FileNotFoundException，应该分别处理。

3. 对于IO流或锁操作等，需要在finally块中释放资源。注意在释放前先判空，避免NPE。

4. 不能在finally块中使用return、continue、break等跳转语句，否则可能会导致控制流错误。

    ```java
    public int divide(int dividend, int divisor) {
        try {
            return dividend / divisor;
        } catch (ArithmeticException e) {
            // 异常处理，正确地处理是在这里返回-1
        } finally {
            // 这样即使没有出现异常，所有情况都会覆盖返回-1
            return -1;
        }
    }
    ```

5. 不用`e.printStackTrace()`来打印异常信息，而是应该使用日志记录器`log.error(e.getMessage())`记录异常信息。因为前者打印的东西太多不利于问题定位，而且可能导致敏感信息被泄露。

6. 不要在捕获异常之后再抛出新的异常，否则可能会导致异常链，使问题定位变得困难。

7. 优先使用标准的异常类，比如IOException、IllegalArgumentException等，而不是自定义异常类。

8. 对于一些常见的异常，比如空指针异常、数组越界异常等，可以考虑使用断言`assert`来进行检查，而不是大量使用`system.out.println()`来输出异常信息。
