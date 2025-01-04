---
title: "置换/逐出策略"
description: "这是一篇关于 置换/逐出策略 算法的文章。"
pubDatetime: 2025-01-04
author: Zari Tsu
featured: false
draft: false
tags:
  - Alogorithm
---

# 页面置换算法

页面置换算法、逐出策略、淘汰算法，其实都是比较类似的概念，都是用来处理内存中不再需要的页面，从而提高内存的利用率。

一般可以在操作系统中、虚拟内存管理中、数据库的Buffer Pool中、Redis中看到页面置换算法的身影。

而常见的页面置换算法又有这几种：FIFO、LRU、LFU、Clock、OPT等等。

这里会以面试手撕设计题的视角来讲讲这几个常见的页面置换算法，以及它们的实现方式和优化。

## FIFO

FIFO是最简单的一个，基于First In First Out的原则，完全符合队列的特性，因此使用Queue来实现。

```python
# 经分析，get和put方法的时间复杂度均为O(1)
class FIFO:
    def __init__(self, capacity: int):
        self.queue = []
        self.capacity = capacity

    def get(self) -> int:
        if not self.queue:
            return -1
        return self.queue.pop(0)

    def put(self, value: int) -> None:
        if len(self.queue) >= self.capacity:
            self.queue.pop()
        self.queue.append(value)
```

## LRU

LRU是Least Recently Used的缩写，也就是最近最少使用算法，是一种常用的页面置换算法。

这里利用双向链表和哈希表来实现LRU算法，链表的头部是最近最久未使用，尾部是最近最常使用。双向循环链表是为了快速地插入或删除节点，哈希表是为了快速地查找获取节点。

```python
class Node:
    def __init__(self, key=0, val=0, pre=None, nxt=None):
        self.key = key
        self.val = val
        self.pre = pre
        self.nxt = nxt

class LRU:
    def __init__(self, capacity: int):
        self.sentinel = Node(-1, -1)
        self.sentinel.pre, self.sentinel.nxt = self.sentinel, self.sentinel
        self.buf = {}
        self.capacity = capacity

    def get(self, key: int) -> int:
        if key not in self.buf:
            return -1
        value = self.buf[key].val
        self.put(key, value)
        return value

    def put(self, key: int, value: int) -> None:
        if key in self.buf:
            self.remove(key)
        elif len(self.buf) >= self.capacity:
            self.remove(self.sentinel.nxt.key)
        new_node = Node(key, value, self.sentinel.pre, self.sentinel)
        self.sentinel.pre.nxt, self.sentinel.pre = new_node, new_node
        self.buf[key] = new_node

    def remove(self, key: int) -> None:
        cur = self.buf[key]
        del self.buf[key]
        cur.pre.nxt, cur.nxt.pre = cur.nxt, cur.pre
```

## LFU

LFU是Least Frequently Used的缩写，也就是最不经常使用算法，是一种比较复杂的页面置换算，主要考虑的是使用或访问的频率。

这里O(n)时间复杂度的方法暂且不多赘述，最容易想到的办法应该是利用优先队列(PriorityQueue)或者说堆(Heap)来实现。由于它们二者是基于完全二叉树结构的，那么get和put方法的时间复杂度都应该是O(logn)的。

python3中的heapq模块提供了堆的实现，默认是小根堆，也就是说优先pop最小的元素。在这个场景下，如果将(频率, 时间戳, 键)作为元素，那么会优先参考频率，如果频率相同，则参考时间戳。将频率最小的元素pop出，如果频率相同，则pop出时间戳最小的元素。

```python
class LFU:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.buf = {}  # 存储键值对
        self.freq = defaultdict(int)  # 存储每个键的频率
        self.heap = []  # 优先队列，存储 (频率, 时间戳, 键)
        self.time = 0  # 时间戳，用于处理频率相同的情况

    def get(self, key: int) -> int:
        if key not in self.buf:
            return -1
        # 更新频率和时间戳
        self.freq[key] += 1
        self.time += 1
        heapq.heappush(self.heap, (self.freq[key], self.time, key))
        return self.buf[key]

    def put(self, key: int, value: int) -> None:
        if self.capacity == 0:
            return
        if key in self.buf:
            self.buf[key] = value
            self.freq[key] += 1
            self.time += 1
            heapq.heappush(self.heap, (self.freq[key], self.time, key))
        else:
            if len(self.buf) >= self.capacity:
                # 移除最小频率的键
                while self.heap:
                    f, t, k = heapq.heappop(self.heap)
                    if k in self.buf and self.freq[k] == f:
                        del self.buf[k]
                        del self.freq[k]
                        break
            self.buf[key] = value
            self.freq[key] = 1
            self.time += 1
            heapq.heappush(self.heap, (self.freq[key], self.time, key))
```

接下来O(1)时间复杂度的方法，类似于上面讲过的LRU算法，利用的也是双向链表和哈希表的组合。

```python
class Node:
    def __init__(self, key=0, val=0, pre=None, nxt=None):
        self.key = key
        self.val = val
        self.pre = pre
        self.nxt = nxt

class LFUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.buf = {}  # 存储键值对
        self.freq = {}  # 存储每个键的使用频率
        self.freq_to_keys = {}  # 存储每个频率对应的键的链表
        self.min_freq = 0  # 当前最小频率

    def get(self, key: int) -> int:
        if key not in self.buf:
            return -1
        # 更新频率
        self.update_freq(key)
        return self.buf[key].val

    def put(self, key: int, value: int) -> None:
        if self.capacity == 0:
            return
        if key in self.buf:
            self.buf[key].val = value
            self.update_freq(key)
        else:
            if len(self.buf) >= self.capacity:
                self.remove_min_freq_key()
            self.buf[key] = Node(key, value)
            self.freq[key] = 1
            if 1 not in self.freq_to_keys:
                self.freq_to_keys[1] = Node(-1, -1)
                self.freq_to_keys[1].pre = self.freq_to_keys[1].nxt = self.freq_to_keys[1]
            self.insert_node(self.freq_to_keys[1], self.buf[key])
            self.min_freq = 1

    def update_freq(self, key: int) -> None:
        freq = self.freq[key]
        self.freq[key] += 1
        # 从原频率链表中移除
        self.remove_node(self.buf[key])
        # 如果原频率链表为空，且原频率是最小频率，则更新最小频率
        if self.freq_to_keys[freq].nxt == self.freq_to_keys[freq]:
            del self.freq_to_keys[freq]
            if freq == self.min_freq:
                self.min_freq += 1
        # 插入到新频率链表中
        if freq + 1 not in self.freq_to_keys:
            self.freq_to_keys[freq + 1] = Node(-1, -1)
            self.freq_to_keys[freq + 1].pre = self.freq_to_keys[freq + 1].nxt = self.freq_to_keys[freq + 1]
        self.insert_node(self.freq_to_keys[freq + 1], self.buf[key])

    def remove_min_freq_key(self) -> None:
        min_freq_list = self.freq_to_keys[self.min_freq]
        node_to_remove = min_freq_list.nxt
        self.remove_node(node_to_remove)
        del self.buf[node_to_remove.key]
        del self.freq[node_to_remove.key]
        if min_freq_list.nxt == min_freq_list:
            del self.freq_to_keys[self.min_freq]

    def remove_node(self, node: Node) -> None:
        node.pre.nxt, node.nxt.pre = node.nxt, node.pre

    def insert_node(self, head: Node, node: Node) -> None:
        node.pre, node.nxt = head.pre, head
        head.pre.nxt, head.pre = node, node
```
