---
title: "cast 类型转换"
description: "这是一篇关于 cast 类型转换，主要介绍了 C++ 语言中常用的类型转换方法。"
pubDatetime: 2024-06-26
author: Zari Tsu
featured: false
draft: false
tags:
  - cpp
---

# C++ cast 类型转换

你还在用 `int a = (int)b` 这种类型转换吗？你还在用 `double c = (double)a / b` 这种类型转换吗？你还在用 `char d = (char)c` 这种类型转换吗？

不是哥们，都4202年了，都用 C++ 了，别再用 C 的了。

## C++中的类型转换（Casting）

类型转换是指将一种数据类型转换为另一种数据类型。C++提供了四种类型转换操作符，用于不同类型间的转换。它们分别是`static_cast`、`dynamic_cast`、`const_cast`和`reinterpret_cast`。

## static_cast

* 进行基本数据类型之间的转换，例如 int 转换为 float

* 在类层次结构中进行向上转换（如将子类指针转换为基类指针），以及必要的向下转换（需保证安全性）~~这个一般不怎么用~~

```cpp
    int a = 10;
    float b = static_cast<float>(a);
```

## dynamic_cast

* 主要用于在运行时进行类型安全的向下转换 (子->父) ，特别是在多态类型间的转换。dynamic_cast只能用于包含虚函数的基类，因此它通常用于有多态行为的类层级中。

* 可转换指针和引用（指针成功转换返回指向目标类型的指针，失败返回nullptr；引用转换失败会抛出std::bad_cast异常）。

```cpp
    class Base {
        virtual void foo() {}
    };
    
    class Derived : public Base {
        void foo() override {}
    };

    Base* basePtr = new Derived();
    // C++17
    if (auto derivedPtr = dynamic_cast<Derived*>(basePtr); DerivePtr) {
        // 转换成功
    } else {
        // 转换失败，失败处理
    }
```

## const_cast

* 用于移除或增加const属性。

这个就很像那种黑客黑的办法，对于一块private或者static的不可变不可访问的变量进行修改。

```cpp
    const int a = 10;
    int *b = const_cast<int*>(&a);
```

## reinterpret_cast

* 用于在不同类型间做任意的 reinterpret_cast，包括指针和整数之间的转换。一般都是低级别的位模式转换。

```cpp
    int a = 65;
    char *b = reinterpret_cast<char*>(&a);
```