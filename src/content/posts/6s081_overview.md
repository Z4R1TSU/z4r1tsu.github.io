---
title: "MIT 6.S081 操作系统 课程导读和源码浅析"
description: "这是一篇关于MIT 6.S081 操作系统课程的导读和源码浅析的文章。"
pubDatetime: 2023-09-07
author: Zari Tsu
featured: false
draft: false
tags:
  - OS
---

# MIT 6.S081 操作系统 课程导读和源码浅析

> 这部分均以视频形式来讲解，发布在BiliBili当中，就不出文字博客了

> 叠个甲：我做视频和博客的初衷是为了类似想开源代码一样开源我的知识。如果我有什么不对的地方，望大家多多包涵，如果能帮我指正或扩充，我将感激不尽。

我将其分为两大块: 课程导读、源码浅析。  

### 课程导读

对应的lecture共有15讲，我人为将其分为10讲

1. **overview** 总述概览 前置知识:  
    这部分内容对应官方发布的lecture1-3，涉及一些计算机科学的基础知识，是为了激发大家的兴趣而设计，故速览即可。这是我首次尝试制作视频，讲得有些紧张，请见谅。  
    这个是第一版做的[overview](https://www.bilibili.com/video/BV1ku4m1P77U/?spm_id_from=333.999.0.0&vd_source=f53099189814dd887f4ab25638e07406)，也是我第一次做视频，讲的比较紧张。这个是我的[重制版](https://www.bilibili.com/video/BV1N2421T7nM/?spm_id_from=333.999.0.0&vd_source=f53099189814dd887f4ab25638e07406)。

2. **page table** 内存虚拟化与页表的原理及实现:  
    对应lecture4。我们知道操作系统的作用在于对硬件进行抽象，而**page table**正是这种抽象的一部分，它是内存虚拟化中最重要且最强大的机制之一。
   [lec4 page table页表和内存虚拟化](https://www.bilibili.com/video/BV1N2421T7nM/?spm_id_from=333.999.0.0&vd_source=f53099189814dd887f4ab25638e07406)

3. **GDB**和**RISC-V**的基本知识和小技巧:  
   对应lecture5。详解如何使用GDB去调试XV6，包括常用的调试命令到如何对用户态的XV6文件进行调试；以及RISC-V的基本概念和32个通用寄存器，加上call convention即调用约定的介绍。
   [lec5 GDB调试和RISC-V寄存器的调用协定](https://www.bilibili.com/video/BV1Pm411D7Pt/?spm_id_from=333.999.0.0&vd_source=f53099189814dd887f4ab25638e07406)

4. **trap**和system call:  
    对应lecture6。涵盖lecture6。trap机制涉及对进程的操作，而进程是对CPU功能的一种抽象。system call即系统调用，可类比为操作系统提供给用户的API，让我们得以在内核级别进行操作。system call的过程，即用户态到内核态的切换，就是通过trap机制来完成的。
    [lec6 trap陷阱机制 走进system call的前世今生](https://www.bilibili.com/video/BV1rv421y7ta/?spm_id_from=333.999.0.0&vd_source=f53099189814dd887f4ab25638e07406)

5. **page fault**和三种机制:  
    对应lecture7。在查询页表时遇到的失败被称为page fault。但这种失败同时也为我们带来了新的转机，由此衍生出三大机制：**Lazy Allocation***, **Zero Fill on Demand**, **Copy On Write Fork**。尽管在XV6中这些机制未得到实现（只会简单报告page fault），但在现代Linux系统中，它们都得以完整实施。
    [lec7: page fault和应运而生的三种机制 懒惰分配，按需填零，写时拷贝](https://www.bilibili.com/video/BV16u4m1P7c3/?spm_id_from=333.999.0.0&vd_source=f53099189814dd887f4ab25638e07406)

6. **interrupt** 中断与外部设备的I/O的互动:   
    对应lecture9。探讨了中断机制的内涵，中断不同于同步的**trap**——源自计算机内部，**interrupt**是由外部设备发起的异步行为，用来响应硬件事件，促进CPU与外设的有效沟通。  
    [lec9: interrupt中断与外部设备的IO 换一个视角看trap](https://www.bilibili.com/video/BV1pW421N7Eh/?spm_id_from=333.999.0.0&vd_source=f53099189814dd887f4ab25638e07406)

7. **lock** 锁机制:  
    对应lecture10。锁机制是并发编程的基石，旨在管理多个进程对同一资源的并发访问。本讲介绍了包括**Dead Lock**（一种进程间因资源竞争产生的相互等待状态），**Spin Lock**，**Mutex Lock**，和**Blocking Lock**在内的多个关键概念。  
    [lec10: lock 死锁 自旋锁 互斥锁 阻塞锁](https://www.bilibili.com/video/BV1pH4y1J7rB/?spm_id_from=333.999.0.0&vd_source=f53099189814dd887f4ab25638e07406)

8. 进程的切换与调度:  
    对应lecture11-12。进程切换与调度是操作系统中不可或缺的一环，它关乎资源分配的效率及公平性。主要围绕着`sched() scheduling()`这几个函数来展开讲述。但是这部分是我学的不扎实的地方，有很多知识点需要我们去通过实际的做多线程、协程类的项目才能弄懂的，我现在对这方面很欠缺，所以视频完完全全就图一乐。  
    [lec11-12: 调度和进程切换](https://www.bilibili.com/video/BV1Em411S7Tm/?spm_id_from=333.999.0.0&vd_source=f53099189814dd887f4ab25638e07406)

9. **file system** 文件系统相关内容:  
    对应lecture13-15。围绕文件系统的整体构架进行大概的解读，尤其强调日志机制在系统崩溃恢复中的核心作用。  
    [lec13-15: file system和crash recovery](https://www.bilibili.com/video/BV1yy421q7JS/?spm_id_from=333.999.0.0&vd_source=f53099189814dd887f4ab25638e07406)

10. **summary** 课程总结和复盘:  
    是我自己个人对于MIT的操作系统，也就是6.S081这门课程学到了什么，做了一个小小的总结。也是我对大学到目前为止的一个的回顾，再小小地对之后的打算进行一下畅想与展望。  
    [summay 复盘 回顾与展望](https://www.bilibili.com/video/BV1hJ4m1e7fx/?spm_id_from=333.999.0.0&vd_source=f53099189814dd887f4ab25638e07406)


### 源码浅析

> 这里所说的源码，指的是XV6的源码

1. [xv6源码解析1 startup 关于xv6是如何开机到运行程序的](https://www.bilibili.com/video/BV1fC4114799/?spm_id_from=333.999.0.0&vd_source=f53099189814dd887f4ab25638e07406)

2. [xv6源码解析2 memory virtualization 内存虚拟化 页表 虚拟内存](https://www.bilibili.com/video/BV1fS421P7Hq/?spm_id_from=333.999.0.0&vd_source=f53099189814dd887f4ab25638e07406)

3. [xv6源码解析3 process mangement 进程结构和多进程调度](https://www.bilibili.com/video/BV1QW421A79S/?spm_id_from=333.999.0.0&vd_source=f53099189814dd887f4ab25638e07406)

4. [xv6源码解析4 syscall walkthru 从代码的视角过一遍systemc all](https://www.bilibili.com/video/BV14r421H7wA/?spm_id_from=333.999.0.0&vd_source=f53099189814dd887f4ab25638e07406)


### 我的代码实现

**注意**:

**仅供参考**!  
**仅供参考**!!   
**仅供参考**!!!

这个是我的[代码仓库地址](https://github.com/Z4R1TSU/mit-6.S081-2021)，我有很多都没做出来  
