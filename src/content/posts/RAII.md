---
title: "RAII和智能指针"
description: "这是一篇关于RAII和智能指针的文章。"
pubDatetime: 2023-09-07
author: Zari Tsu
featured: false
draft: false
tags:
  - cpp
  - multithreading
---

# RAII和智能指针

> 引: c++不像Java或是Python拥有自动的回收处理机制

这篇来讲讲cpp当中的智能指针，正如引子讲的那样，c或c类语言基本都没一种自动的回收机制，这也是出现什么野指针、空悬指针、重复释放、内存泄漏等等tricky bug的原因。

在c当中确确实实就只能通过很小心翼翼的设计才能避免这个问题，但是在c++当中引入的RAII可以一定程度的解决这个问题。

先推荐一篇[Microsoft的官方文档](https://learn.microsoft.com/zh-cn/cpp/cpp/object-lifetime-and-resource-management-modern-cpp?view=msvc-170)，讲的非常好

## 对象生存期

那么什么是一个对象的生存期呢？举两个例子你就懂了

1. 在这个例子当中，i在for loop结束之后仍然存在
    ```cpp
    int i;
    for (i = 0; i < 9; i ++) {
        // do something
    }
    ```
2. 在这个例子当中，i在for循环结束后便不复存在
    ```cpp
    for (int i = 0; i < 9; i ++) {
        // do something
    }
    ```

一个变量、函数、类的生存期从它被调用**构造函数**就开始了，而生存期到期的时候，应该调用**析构函数**来释放它所占用的资源。

## RAII

**资源管理 RAII**全称**Resource Acquisition Is Initialiaztion**。其目的就是为了不用new delete来手动对资源进行创建和释放，而自动在对象离开生存期或者说作用域的时候，自动调用析构函数来释放资源。

在使用裸指针时(类似C当中的使用`int *p = &i;`)，我们常常需要对其进行显式的`delete`来释放其资源。

而智能指针就是C++当中对RAII的实现方案之一，它不需要我们进行显式的资源释放，也就是`delete`。也就是说，在对于使用智能指针的对象，在其生存期完的时候，会自动调用其**析构函数**，释放其资源。

下面来介绍智能指针的三巨头
1. `unique_ptr`：独享资源所有权
2. `shared_ptr`：共享资源所有权
3. `weak_ptr`：共享资源的观察者，配合`shared_ptr`使用

## 智能指针

智能指针被定义在这个库当中`#include <memory>`。

### unique_ptr

> 标准: c++-11

在聊`unique_ptr`之前，我们先了解一下被它所上位替代的淘汰者`auto_ptr`。也就是说C++11标准是前者的“生日”，也是后者的“忌日”。

* 直接说结论：`unique_ptr`相较于`auto_ptr`  
  1. 禁用左值引用的拷贝构造
  2. 禁用赋值重载函数

* 这样的改变加强了智能指针的安全性，在对于被拷贝的原指针有一个恰当的处理，不至于出现指针空悬的情况。

* `unique_ptr`是专属所有权，所以`unique_ptr`管理的内存，**只能被一个对象持有，不支持复制和赋值**。

* 移动语义：`unique_ptr`禁止了拷贝语义，但有时我们也需要能够转移所有权，于是提供了移动语义，即可以使用`std::move()`进行控制所有权的转移。

来看一组实例

```cpp
unique_ptr<int> p1{new int};      // 正确的
unique_ptr<int> p2 = p1;          // 错误，禁用拷贝构造
unique_ptr<int> p2{std::move(p1)};// 禁用左值引用拷贝构造，关我右值move迁移何事
```

<br>

> C++-14当中添加了动态构建`make_unique()`

```cpp
auto ptr = std::make_unique<int>(200);
threads_.emplace_back(ptr);             // 报错，就理解为unique_ptr在转移的时候，必须要用右值
threads_.emplace_back(std::move(ptr));  // 正确
```

<br>

> 加锁：`std::unique_lock`

* `unique_lock`也是RAII的一部分。lock 对象本身不是锁，而是智能锁管理对象，它的构造函数和析构函数用来管理与其关联的 mutex 对象的锁定和解锁状态。当 lock 构造时，它自动获取与之关联的 mutex 的锁定权；当 lock 超出作用域并被销毁时，它自动释放这个 mutex。这就确保了即使在有异常抛出的情况下，锁也能被正确释放，避免死锁。

以下是构建`unique_lock`的过程，我们不再需要显示的`lock`和`unlock`锁。`std::unique_lock` 在析构时自动释放锁。但它还允许你在作用域内显式地释放和重新获取锁。这增加了灵活性，例如用于条件变量等。

```cpp
#include <mutex>
// 创建一个mutex互斥量类型的变量mtx
std::mutex mtx;
// 对mutex类型的mtx进行加锁，unique_lock类型的lck只是一个管理锁的东西
std::unique_lock<std::mutex> lck(mtx);
```

Q: 为什么不直接用`std::mutex`里面内置的`lock`和`unlock`来进行锁的acquire和release？  
A: 有可能死锁，不符合RAII规范。具体表现是，如果在`acquire lock`之后，但在`release lock`之前，也就是被锁的主体部分，程序出现了异常，那么这个资源就会一直被锁住而不会被释放。

### shared_ptr和weak_ptr

> 定义对象的时候，用强智能指针；引用对象的地方，用弱智能指针。  

> shared_ptr: 定义对象   weak_ptr: 引用对象

shared_ptr: 

1. `shared_ptr`通过一个引用计数共享一个对象(需要额外的开销)。
  
2. 当引用计数为0时，该对象没有被使用，可以进行析构。

3. 循环引用：引用计数会带来循环引用的问题。循环引用会导致堆里的内存无法正常回收，造成内存泄漏。

weak_ptr: 

1. weak_ptr 被设计为与 shared_ptr 共同工作，用一种观察者模式工作。
2. 作用是协助 shared_ptr 工作，可获得资源的观测权像旁观者那样观测资源的使用情况。  
观察者意味着weak_ptr只对 shared_ptr 进行引用，而不改变其引用计数，当被观察的 shared_ptr失效后，相应的 weak_ptr也相应失效。

