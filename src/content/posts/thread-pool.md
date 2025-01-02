---
title: "线程池"
description: "这是一篇关于 多线程和线程池面试题 的文章。"
pubDatetime: 2025-01-02
author: Zari Tsu
featured: false
draft: false
tags:
  - Interview
  - Java
---

# 线程池

我们知道线程的创建和销毁是比较耗时的操作，因此，如果我们需要创建大量的线程，那么势必会影响程序的运行效率。因此，我们可以利用线程池这个池化的思想来解决这个问题。

线程池在初始化的时候，就会创建一组线程，任务被提交会以队列的形式加入到线程池中，线程池中的线程会去执行任务队列中的任务。当一个线程执行完任务后，它会再从任务队列中取出下一个任务来执行。

有两种比较常见的线程池形式，一种是固定线程池(FixedThreadPool)，另一种是动态线程池(CachedThreadPool)。前者线程池的大小是固定的，后者会在空闲时销毁线程，线程池的大小会根据需要自动调整。

但根据开发规范和经验，我们应该禁止使用这两种线程池，而应该手动 `new ThreadPoolExecutor` 创建线程池。这是因为当任务很多并且处理不来的时候 FixedPool 会因为任务被积压到任务队列中，撑爆内存，引起 OOM(Out Of Memory)。而 CachedPool 会不断的创建线程来执行任务，这同样会导致撑爆内存，引起 OOM，同时过多的线程切换也会引起严重的性能损失。

大多数情况下，我们需要的是闲时保留一定的线程（核心线程），忙时创建线程。直到达到设定的最大线程数时停止创建。来不及处理的任务放到定长的任务队列中，当任务队列满的时候触发拒绝策略。在线程池闲下来的时候销毁线程，将线程池中的线程数量回收到核心线程数。

## 工作原理

线程池在初始化的时候，就会创建 corePoolSize 个线程，来池化以备进来的任务使用。当有任务提交到线程池时，线程池就会调用池中空闲的线程进行处理。当线程池中的线程都在处理任务时（也就是线程池中线程数达到 corePoolSize 个），如果再提交任务，线程池就会将这个任务存放在 workQueue 阻塞队列中，等待线程池中的线程完成任务释放出来，再按照顺序从 workQueue 中取出任务来执行。而这个 workQueue 也是有大小的，当 workQueue 已满时，线程池就会开始**创建**（注意不是调用已有线程）新的线程来执行任务。而如果任务继续多起来，达到 maximumPoolSize 限制时，线程池就会采用 handler 这个拒绝策略来处理这个任务。

而创建出来的线程，也就是在 maxiumPoolSize 范围内的线程，在 keepAliveTime 时间内都空闲且为被调用，则创建出来的这个线程会被回收。

因此我们可以从此窥见线程池的核心想法，我们希望 corePoolSize 数量的线程大部分处于工作，实现资源的高利用率。为了避免线程的创建与销毁，引入阻塞队列。为了高可用性，设置了最大线程数和拒绝策略。既可以实现削峰填谷的效果，又可以避免线程的过多创建与销毁，提高系统的稳定性。

但是其最大的问题就在于没有消息的持久化机制，相较于MQ来说，线程池的消息持久化机制较弱，一旦线程池中的线程异常退出或者重启、死机，则消息也就丢失了。还有就是线程池只能作用于一个节点，对于分布式系统来说，一般还是MQ较多。

## 线程池参数

```java
public ThreadPoolExecutor(int corePoolSize,
                          int maximumPoolSize,
                          long keepAliveTime,
                          TimeUnit unit,
                          BlockingQueue<Runnable> workQueue,
                          RejectedExecutionHandler handler)
```

**corePoolSize**：核心线程数，线程池创建时就创建的线程数量。

**maximumPoolSize**：最大线程数，线程池中允许的最大线程数量。

**keepAliveTime**：线程存活时间，当线程池中数量 $n$ 符合 $corePoolSize <= n <= maximumPoolSize$ 的线程的空闲时间超过该值时，线程会被回收。

**unit**：时间单位，keepAliveTime 的时间单位。

**workQueue**：任务队列，阻塞队列，用于存放等待执行的任务，注意它们都是**线程安全**的。

  1. ArrayBlockingQueue：一个**有界**的**数组阻塞**队列，按FIFO（先进先出）的原则对元素进行排序。
  2. LinkedBlockingQueue: 基于**链表**的**无界**FIFO**阻塞**队列，吞吐量高于 ArrayBlockingQueue（出于链表插入和删除的常数时间复杂度）。
  3. SynchronousQueue: 一个不存储元素的**阻塞**队列，每个插入操作必须等待一个移除操作，否则会一直阻塞，吞吐量高于 LinkedBlockingQueue（无锁算法）。
  4. priorityBlockingQueue: 一个支持**优先级**排序的**阻塞**队列。

**handler**：拒绝策略，当线程池中的线程数达到最大值时，如何处理新提交的任务。

  1. AbortPolicy: 直接抛出异常，默认策略。
  2. CallerRunsPolicy: 用调用者所在的线程来执行任务。
  3. DiscardOldestPolicy: 丢弃阻塞队列中靠最前的任务，并执行当前任务。
  4. DiscardPolicy: 直接丢弃任务；

## 类型

### 单一线程池

```java
public static ExecutorService newSingleThreadExecutor() {
    return new FinalizableDelegatedExecutorService(
      new ThreadPoolExecutor(1, 1, /* 核心线程数和最大线程数均为1 */
                             0L, TimeUnit.MILLISECONDS, /* 多余空闲线程存活时间 */ 
                             new LinkedBlockingQueue<Runnable>() /* 无界队列 */));
}
```

这种线程池只有一个线程，也就是说，当有任务提交到线程池时，线程池就会顺序执行。

### 固定线程池

```java
public static ExecutorService newFixedThreadPool(int nThreads) {
    return new ThreadPoolExecutor(nThreads, nThreads, /* 核心线程数和最大线程数相同 */
                                  0L, TimeUnit.MILLISECONDS, /* 多余空闲线程存活时间 */ 
                                  new LinkedBlockingQueue<Runnable>() /* 无界队列 */);
}
```

线程池的线程数量达corePoolSize后，即使线程池没有可执行任务时，也不会释放线程。

### 可变线程池

```java
public static ExecutorService newCachedThreadPool() {
    return new ThreadPoolExecutor(0, Integer.MAX_VALUE, /* 核心线程数为0，最大线程数为无穷 */
                                  60L, TimeUnit.SECONDS, /* 多余空闲线程可以存活一分钟 */ 
                                  new SynchronousQueue<Runnable>() /* 任务队列为同步队列 */ );
}
```

线程池的线程数量不固定，可以根据需要自动调整，线程池中的线程空闲超过一定时间就会被回收。而且出于同步队列的特性，任务的执行顺序是按照任务的提交顺序执行的。

## 核心方法

### submit()

提交一个任务到线程池中，并等待线程池进行execute()方法的调用。通过submit方法提交的Callable任务会被封装成了一个FutureTask对象。通过Executor.execute方法提交FutureTask到线程池中等待被执行，最终执行的是FutureTask的run方法

### execute()

线程池执行任务的过程是这样的 `execute -> addWorker -> runWorker`。

这里的 execute 方法是 Executor 接口中唯一的执行任务的方法，它会将 Runnable 或者 Callable 对象提交到线程池中，等待线程池的调度。

### shutdown()

关闭线程池，不再接受新的任务。

## 细节问题

### IO/CPU密集型

最常见的就是设置合理的 corePoolSize 和 maximumPoolSize。这个要分为 IO 密集型 和 CPU 密集型 两种情况。设置太小，无法完全利用CPU资源，还容易出现线程饥饿或是创建销毁的重操作；设置太大，线程切换开销大，资源浪费，频繁的调度会影响吞吐量。

如果是 IO 密集型的项目，可以适当调大 corePoolSize 和 maximumPoolSize，这样可以提高吞吐量。如果是 CPU 密集型的项目，则可以适当调小 corePoolSize 和 maximumPoolSize，减少线程切换的开销。

总的来说 CPU密集型 需要尽可能少的线程，而 IO密集型 需要尽可能多的线程。

### 为什么阿里巴巴规范禁止线程池使用Executors创建

阿里巴巴开发规范当中明确说明，创建线程池要用 ThreadPoolExecutor，而不是 Executors。因为前者需要我们显式地指出各种线程池的参数，以此明确线程池的运行规则，避免出现一些隐性的错误。Executors 类提供了一些静态方法来创建线程池，但是这些方法并没有提供足够的控制，比如线程池的大小、队列的大小、线程的名称、线程的优先级等。因此，我们应该使用 ThreadPoolExecutor 来创建线程池。

## 使用示例

```java
public static void main(String[] args) {
  ThreadPoolExecutor executor = new ThreadPoolExecutor(5, 5, 10L, TimeUnit.SECONDS, new LinkedBlockingQueue<Runnable>());
  // ExecutorService executor = Executors.newFixedThreadPool(5); // 这个跟上面的效果是一样的

  for (int i = 0; i < 10; i++) {
    executor.execute(() -> {
      System.out.println(i + " is running");
    })
  }
}
```
