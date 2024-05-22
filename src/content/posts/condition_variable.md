---
title: "条件变量 condition_variable"
description: "这是一篇关于条件变量 ———— 一种同步机制，用于线程间通信的文章。"
pubDatetime: 2024-05-22
author: Zari Tsu
featured: false
draft: false
tags:
  - cpp
  - multithreading
---

# 条件变量 condition_variable

## 什么是条件变量

条件变量（condition variable）是一种同步机制，用于线程间通信。它允许一个线程等待另一个线程完成某项工作，然后再继续执行。条件变量提供了一种线程间通信的机制，使得线程可以等待某个条件的发生，然后再从等待的状态中恢复。

由此可见，条件变量在**生产者-消费者模型**当中有用武之地。

## 条件变量的基本用法

条件变量的基本用法如下：

1. create: 创建一个条件变量对象。
2. wait: 等待一个条件。
3. notify: 通知一个或多个等待线程。
4. release: 释放锁。

下面是一个简单的条件变量的用法示例：

```cpp
#include <iostream>
#include <mutex>
#include <condition_variable>

std::mutex mtx;
std::condition_variable cv;
bool ready = false;

void worker() {
    std::unique_lock<std::mutex> lock(mtx);
    cv.wait(lock, []{ return ready; });
    std::cout << "Worker thread is done." << std::endl;
}

int main() {
    std::thread t(worker);
    std::this_thread::sleep_for(std::chrono::seconds(1));
    {
        std::lock_guard<std::mutex> lock(mtx);
        ready = true;
    }
    cv.notify_one();
    t.join();
    return 0;
}
```

1. 首先，我们定义了一个互斥锁 `mtx` 和一个条件变量 `cv`。
2. 然后，我们定义了一个布尔变量 `ready`，表示工作线程是否完成。
3. 我们定义了一个工作线程 `worker`，它会等待 `ready` 变量为 `true` 才继续执行。
4. 在 `main` 函数中，我们创建了一个工作线程 `t`。
5. 我们等待一秒钟，以便让工作线程开始运行。
6. 在 `main` 函数中，我们使用 `lock_guard` 锁住互斥锁，并将 `ready` 变量设置为 `true`。
7. 我们通知 `cv` 条件变量，使得等待线程 `t` 得以继续执行。
8. 最后，我们等待工作线程 `t` 完成。


## 条件变量的原理

条件变量的原理是，当线程调用 `wait` 方法时，它会释放互斥锁，并进入等待状态。直到其他线程调用 `notify_one` 或 `notify_all` 方法，它才会重新获得互斥锁并继续执行。

当调用 `wait` 方法时，线程会阻塞，直到其他线程调用 `notify_one` 或 `notify_all` 方法，或直到超时。如果调用 `notify_one` 方法，则只唤醒一个线程；如果调用 `notify_all` 方法，则唤醒所有等待线程。

## 条件变量的接口

条件变量的API其实还算简单，只要你英语过关，基本根据方法名就可以猜出意思。~~所以说大学里面那些英语都完全不会的纯理论老师，只读ppt，一点代码能力都没有的，是真。。~~

1. `condition_variable()`：构造函数。
    
    > 但我们一般不这么用，一般都是类似`std::mutex mtx;`这样创建一个互斥量这样创建一个条件变量`std::condition_variable cv;`。

2. `notify_one()`：唤醒一个等待线程。

3. `notify_all()`：唤醒所有等待线程。这个一般用的比`notify_one()`多得多。

    > 适用场景: 生产者-消费者模型中，消费者将所有资源都消费完了，因此消费者的消费行为应该被阻塞，直到生产者生产出东西供其消费。而生产者生产完东西后，往往消费者需要一段时间才能消费，因此需要生产者通知消费者可以继续生产。

    > 由此可见，线程间的通信是必不可免的。

4. `wait(unique_lock<mutex>& lock, function<bool()> pred)`：等待一个条件，直到 `pred` 返回 `true`。

    > wait: 即一直等待，直到predict条件成立

5. `wait_for(unique_lock<mutex>& lock, chrono::duration<Rep, Period> rel_time, function<bool()> pred)`：等待一个条件，直到 `pred` 返回 `true` 或超时。

    > wait_for: 相较于wait多了时间长度参数，如果条件一直不成立到设定时间长度便停止wait

6. `wait_until(unique_lock<mutex>& lock, chrono::time_point<chrono::system_clock, chrono::duration<Rep, Period>> abs_time, function<bool()> pred)`：等待一个条件，直到 `pred` 返回 `true` 或超时。

    > wait_until: 相较于wait_for多了时间点参数，如果条件一直不成立到设定时间点便停止wait