---
title: "I/O"
description: "这是一篇关于 Java 中 I/O 的文章。"
pubDatetime: 2024-09-08
author: Zari Tsu
featured: false
draft: false
tags:
  - Java
---

# I/O

IO是我们常遇到的概念，其中I代表了Input输入，O代表了Output输出。这个在什么搭建服务器这种问的比较多，比如问你怎么样搭建一个Netty服务器。

IO分为三种：BIO, NIO, AIO。

* BIO: 同步阻塞IO，是同步的，即我们通常使用的最普通的IO模型，数据从输入流读取到输出流，必须等待读取操作完成后才能进行写入操作。

    这个是最原始，最朴素的想法，就是传进来任何东西，读和写都顺序执行。

* NIO: 非阻塞IO，可以理解为异步了一半，在Java 1.4中引入的新特性，提供了一种新的IO模型，可以实现异步非阻塞的IO操作。

    即东西通过socket进来之后，它会先存在一个地方，然后开出另外一个线程用于处理。

    具体来说，程序会在用户空间开辟出一个线程，专门用来向内核当中轮询socket状态。但是不停的轮询，且每次都要切换用户态和内核态的开销，最夸张的是大多数时间socket状态都没变化，这耗费大量无意义的资源。对此的解法就类似于程序给出要轮询的socket的fd（文件描述符），然后由内核来轮询，当有数据到来时，内核才会通知应用程序，将多次切换变成一次，从而提高效率。而 **select** 和 **poll** 的区别就在于前者只能传有限制的fd，而后者可以传无限制数量的fd。而 **epooll** 更厉害，它不需要轮询，是最接近真正异步的一种IO模型。它的做法是利用中断，当网络状态发生变化的时候，网卡认为socket发生变化时，会产生一个中断，用来检测socket变化的红黑树和双向链表会同步变化，添加可连接的fd，从而通知到应用程序。

    而它其实又被分为三种：select, poll, epoll。它们都是半个异步，实际上全是轮询实现的。前面两个基本已经被弃用，大多都是epoll了。

    * **select**: 监视多个输入通道，等待IO事件的发生。具体是使用FD(文件描述符)来实现，这个是操作系统当中提到的概念，然后通过FD去找到被操作的文件，从而进行IO操作。

    * **poll**: 监视多个输入通道，等待IO事件的发生，但是比select更加高效。它将FD这个较为底层的概念，使用了一个结构体进行替代。

    * **epoll**: 监视多个输入通道，等待IO事件的发生，支持水平触发和边缘触发。不论是select还是poll，它们都无法避免对内容的拷贝，所以epoll采用了内核统一管理的方式，避免了拷贝操作。我们每次只需要向内核提出请求，然后内核就会返回可以处理的文件。

    ```python
    createServerSocket() // 创建一个ServerSocket
    bind()               // 绑定地址和端口
    listen()             // 监听连接
    epoll_create()       // 创建epoll句柄
    epoll_ctl()          // 注册监听事件
    epoll_wait()         // 等待IO事件发生
    ```

* AIO: 异步非阻塞IO，完全异步但是需要系统支持，在Java 7中引入的新特性，提供了一种新的IO模型，可以实现真正的异步非阻塞IO操作。

    它与NIO的区别在于，它是真正的异步非阻塞，不需要线程切换，而是由操作系统直接返回结果，不需要用户自己去处理。

    它主要有两种实现方式：

    * 基于回调函数的AIO: 这种方式是最常用的，它通过回调函数的方式，将IO操作的结果通知到用户。

    * 基于Future模式的AIO: 这种方式是基于Java 8引入的 CompletableFuture 类，它提供了一种更加高级的异步编程模型。

## Netty

Netty是一个易于使用的利用 Java 和 NIO 的 客户端-服务器 框架，大大简化了 TCP 和 UDP 套接字服务器的开发等网络编程。

由于Netty使用的是NIO，所以实际上是不支持异步io的，真正的异步io需要底层操作系统的支持，异步是说数据准备好之后由系统通知应用程序你可以来操作数据了，而netty所谓的异步是另起一个用户线程等待数据就绪并通过回调处理，并不是真正意义上的异步io。
