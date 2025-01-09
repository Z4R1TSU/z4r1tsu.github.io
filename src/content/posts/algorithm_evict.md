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

一般可以在操作系统中、虚拟内存管理中、数据库的 Buffer Pool 中、Redis 中看到页面置换算法的身影。

而常见的页面置换算法又有这几种：FIFO、LRU、LFU、Clock、OPT 等等。

这里会以面试手撕设计题的视角来讲讲这几个常见的页面置换算法，以及它们的实现方式和优化。

## FIFO

FIFO 是最简单的一个，基于 First In First Out 的原则，完全符合队列的特性，因此使用 Queue 来实现。

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

LRU 是 Least Recently Used 的缩写，也就是最近最少使用算法，是一种常用的页面置换算法。

这里利用双向链表和哈希表来实现 LRU 算法，链表的头部是最近最久未使用，尾部是最近最常使用。双向循环链表是为了快速地插入或删除节点，哈希表是为了快速地查找获取节点。

```python
class Node:
    def __init__(self, key=0, val=0, pre=None, nxt=None):
        self.key = key
        self.val = val
        self.pre = pre
        self.nxt = nxt

class LRUCache:

    def __init__(self, capacity: int):
        self.capacity = capacity
        self.sentinel = Node() # linked list
        self.sentinel.pre, self.sentinel.nxt = self.sentinel, self.sentinel
        self.hm = {} # hash map: {key : node}

    def get(self, key: int) -> int:
        if key not in self.hm:
            return -1
        cur_node = self.hm[key]
        res = cur_node.val
        self.remove(cur_node)
        self.insert(key, res)
        return res

    def put(self, key: int, value: int) -> None:
        if key not in self.hm:
            while len(self.hm) >= self.capacity:
                self.remove(self.sentinel.nxt)
        else:
            self.remove(self.hm[key])
        self.insert(key, value)

    def insert(self, key: int, val: int):
        new_node = Node(key, val, self.sentinel.pre, self.sentinel)
        self.sentinel.pre.nxt, self.sentinel.pre = new_node, new_node
        self.hm[key] = new_node

    def remove(self, node: Node):
        del self.hm[node.key]
        node.pre.nxt, node.nxt.pre = node.nxt, node.pre
```

## LFU

LFU 是 Least Frequently Used 的缩写，也就是最不经常使用算法，是一种比较复杂的页面置换算，主要考虑的是使用或访问的频率。

这里 O(n)时间复杂度的方法暂且不多赘述，最容易想到的办法应该是利用优先队列(PriorityQueue)或者说堆(Heap)来实现。由于它们二者是基于完全二叉树结构的，那么 get 和 put 方法的时间复杂度都应该是 O(logn)的。

python3 中的 `heapq` 模块提供了堆的实现，默认是小根堆，也就是说优先 pop 最小的元素。在这个场景下，如果将(频率, 时间戳, 键)作为元素，那么会优先参考频率，如果频率相同，则参考时间戳。将频率最小的元素 pop 出，如果频率相同，则 pop 出时间戳最小的元素。

```python
class LFU:

    def __init__(self, capacity: int):
        self.capacity = capacity
        self.buf = {} # {key : value}
        self.freq = {} # {key : frequency}
        self.time = 0
        self.heap = [] # (frequency, timestamp, key)

    def get(self, key: int) -> int:
        if key not in self.buf:
            return -1
        self.freq[key] += 1
        self.time += 1
        heapq.heappush(self.heap, (self.freq[key], self.time, key))
        return self.buf[key]

    def put(self, key: int, value: int) -> None:
        if key in self.buf:
            self.buf[key] = value
            self.freq[key] += 1
            self.time += 1
            heapq.heappush(self.heap, (self.freq[key], self.time, key))
        else:
            while len(self.buf) >= self.capacity and self.heap:
                f, t, k = heapq.heappop(self.heap)
                if f == self.freq[k] and k in self.buf:
                    del self.buf[k]
                    del self.freq[k]
                    break
            self.freq[key] = 1
            self.time += 1
            self.buf[key] = value
            heapq.heappush(self.heap, (self.freq[key], self.time, key))
```

接下来 O(1)时间复杂度的方法，类似于上面讲过的 LRU 算法，利用的也是双向链表和哈希表的组合。它会将同样使用频率的节点组成一个类似 LRU 中的双向连表结构，然后优先逐出频率最低的链表节点，再选择出其中最久未使用的节点，也就是 `sentinel.next` 节点。

```python
class Node:
    def __init__(self, key=0, val=0, pre=0, nxt=0, freq=0):
        self.key = key
        self.val = val
        self.pre = pre
        self.nxt = nxt
        self.freq = freq

class LFUCache:

    def __init__(self, capacity: int):
        self.capacity = capacity
        self.llm = {} # hashmap: {frequency : linked list}
        self.hm = {} # hashmap: {key : node}

    def get(self, key: int) -> int:
        if key not in self.hm:
            return -1
        cur_node = self.hm[key]
        cur_val, cur_freq = cur_node.val, cur_node.freq
        self.remove(cur_node)
        self.insert(key, cur_val, cur_freq + 1)
        return cur_val

    def put(self, key: int, value: int) -> None:
        if key not in self.hm:
            while len(self.hm) >= self.capacity:
                # 寻找频率最低的链表节点，当然这里也可以在类中维护一个最小使用频率的变量，以便于直接找到要删除节点所在的链表
                for i in range(100000):
                    if i in self.llm and not self.llm[i].pre == self.llm[i].nxt == self.llm[i]:
                        self.remove(self.llm[i].nxt)
                        break
            self.insert(key, value, 1)
        else:
            cur_node = self.hm[key]
            cur_freq = cur_node.freq
            self.remove(cur_node)
            self.insert(key, value, cur_freq + 1)

    def insert(self, key: int, val: int, freq: int):
        if freq not in self.llm:
            self.llm[freq] = sentinel = Node(freq = freq)
            sentinel.pre, sentinel.nxt = sentinel, sentinel
        new_node = Node(key, val, self.llm[freq].pre, self.llm[freq], freq)
        self.llm[freq].pre.nxt, self.llm[freq].pre = new_node, new_node
        self.hm[key] = new_node
    
    def remove(self, node: Node):
        del self.hm[node.key]
        node.pre.nxt, node.nxt.pre = node.nxt, node.pre
```
