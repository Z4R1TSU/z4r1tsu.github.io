---
title: "thread"
description: "这是一篇关于C++-11中的std::thread的文章。"
pubDatetime: 2023-09-07
author: Zari Tsu
featured: false
draft: false
tags:
  - cpp
  - multithreading
---


# std::thread

C++的多线程绕不开C++-11当中的thread

传送门:  
1. [**thread** in *cpp reference*](https://en.cppreference.com/w/cpp/thread/thread)
2. [**thread** in *Microsoft Tutorial*](https://learn.microsoft.com/zh-cn/cpp/standard-library/thread?view=msvc-170) 

## 创建线程

### 创建一个无参函数线程

```cpp
#include <thread>

void func() {
    // do something
}

int main() {
    // 使用多线程来运行t1
    std::thread t1(func);
    t1.join();
}
```

### 创建一个含参函数线程

```cpp
#include <thread>

void func(int a, int b) {
    (void)a;
    (void)b;
}

int main() {
    // 使用多线程来运行t1
    std::thread t1(func, （a = )1, (b = )2);
    t1.join();
}
```

### 创建一个类成员的含参函数线程

```cpp
#include <thread>

struct s {
    void func(int a, int b) {
        (void)a;
        (void)b;
    }
}

int main() {
    s s1;
    // 传参顺序：函数 类 参数
    std::thread t1(&s::func, &s1, (a = )1, (b = )2);
    t1.join();
}
```


## thread内部函数

### get_id()

线程存在着唯一标识符，而调用`get_id()`可以获取之。

`int this_thread_id = std::this_thread::get_id();`

### hardware_concurrency()

可能有同学会疑惑，比如一个线程池，我们准备几个线程到线程池中合适呢？


答：一般几核CPU开几线程。

而获取核心数的办法是`std::thread::hardware_concurrency()`

### join() (重点)

等待线程，直到它执行完毕

```cpp
#include <iostream>     // for print
#include <thread>       // for thread class

std::thread t1([]() {
    for (size_t i = 0; i < 10; i ++) {
        std::cout << i << " ";
    }
})
t1.join();
std::cout << "done" << std::endl;
```

输出为

```shell
0 1 2 3 4 5 6 7 8 9 done
```

### detach() (重点)

> 将线程分离（detach）操作的目的是使线程在后台运行，使得其执行变得独立，即允许线程在没有其他线程明确等待其完成的情况下结束。分离线程不会与创建它的线程同步，这意味着一旦分离，主线程将不再等待分离线程的结束。

分离线程，在后台运行线程

```cpp
#include <iostream>
#include <thread>
#include <chrono>       // chrono这个库是用于调用与时间相关的函数

std::thread t1([]() {
    for (size_t i = 0; i < 10; i ++) {
        std::cout << i << " ";
    }
})
t1.detach();
std::cout << "done" << std::endl;
// 确保主线程给予这个detach的t1足够的时间来完全输出
// 因为可能主线程已经完成了操作，而t1尚未运行完毕，导致t1被主线程的完成而强行中断，无法看到有效输出
std::this_thread::sleep_for(std::chrono::seconds(3));
```

输出为

```shell
done 0 1 2 3 4 5 6 7 8 9
```