---
title: "Stanford CS144 lab 1"
description: "这是一篇关于 Stanford CS144 lab 1 的文章。主要讲了reassembler字节流重排器的实现。"
pubDatetime: 2024-06-05
author: Zari Tsu
featured: false
draft: false
tags:
  - Network
---

# Stanford CS144 lab 1

[视频讲解](https://www.bilibili.com/video/BV1dn4y1X7Pf/?vd_source=f53099189814dd887f4ab25638e07406)

这道题目，我觉得是比较困难的，如果你没有进行一些系统的刷题经验，那么这道题目可能会让你有点吃力。我两个月前第一次做是做了整整7天（包括debug），虽然并不是一直耗在这道题目上，但还是好了很久的，甚至最后过了其其他测试，speedtest还是过不了。这两天重新pickup了，只花了一整天，两三个小时写，三四个小时debug就顺利过了。

首先，你需要了解字节流重排器的概念。字节流重排器的作用是将一个字节流按照一定的规则重新排列，使得字节流中的数据按照一定的顺序排列。它要求把失序乱序、重叠重复、冗余数据的数据给变成合法的数据流。

如果你刷过一些关于Intervals的题目，这道题目你花个最多一天应该就能搞定。如果没有比较系统性的解决方案，而是去分类讨论硬做，其实是事倍功半的。

## 前置刷题推荐

这些经典的Interval问题，可以做做，对这个lab有帮助。

[56. 合并区间](https://leetcode.cn/problems/merge-intervals/description/)

[57. 插入区间](https://leetcode.cn/problems/insert-interval/description/)

[435. 无重叠区间](https://leetcode.cn/problems/non-overlapping-intervals/description/)

这类题基本套路就是排序，然后遍历合并。

## 我的解法

[仓库链接](https://github.com/Z4R1TSU/CS144-Winter24)

* reassembler.hh

```cpp
#pragma once

#include "byte_stream.hh"
#include <iostream>
#include <set>
#include <string>
#include <algorithm>
#include <cmath>

struct Interval {
    uint64_t start;
    uint64_t end;
    std::string data;

    bool operator<(const Interval& other) const {
        if (start == other.start) {
            return end < other.end;
        }
        return start < other.start;
    }
};

class Reassembler
{
public:
    // Construct Reassembler to write into given ByteStream.
    explicit Reassembler( ByteStream&& output ) : output_( std::move( output ) ) {}

    void insert( uint64_t first_index, std::string data, bool is_last_substring );

    // How many bytes are stored in the Reassembler itself?
    uint64_t bytes_pending() const;

    // Access output stream reader
    Reader& reader() { return output_.reader(); }
    const Reader& reader() const { return output_.reader(); }

    // Access output stream writer, but const-only (can't write from outside)
    const Writer& writer() const { return output_.writer(); }

private:
    ByteStream output_; // the Reassembler writes to this ByteStream
    std::set<Interval> buf_ {};
    uint64_t nxt_expected_idx_ = 0;
    uint64_t eof_idx_ = UINT64_MAX;
};
```

* reassembler.cc

```cpp
#include "reassembler.hh"

using namespace std;

void Reassembler::insert( uint64_t first_index, string data, bool is_last_substring )
{
    uint64_t wd_start = nxt_expected_idx_;
    uint64_t wd_end = wd_start + output_.writer().available_capacity();
    uint64_t cur_start = first_index;
    uint64_t cur_end = cur_start + data.size();

    // set the eof index of this reassembling
    if (is_last_substring) {
        eof_idx_ = cur_end;
    }

    if (cur_start >= wd_end) {
        return;
    }

    uint64_t start_idx = max(wd_start, cur_start);
    uint64_t end_idx = min(wd_end, cur_end);
    if (start_idx >= end_idx) {
        if (nxt_expected_idx_ == eof_idx_) {
            output_.writer().close();
        }
        return;
    }
    uint64_t len = end_idx - start_idx;
    
    // insert the current data
    buf_.insert({start_idx, end_idx, data.substr(start_idx - first_index, len)});
   
    // handle the overlapping of intervals
    std::vector<Interval> merged;
    auto it = buf_.begin();
    Interval last = *it;
    it ++;

    while (it != buf_.end()) {
        if (it->start <= last.end) {
            if (last.end < it->end) {
                last.end = it->end;
                last.data = last.data.substr(0, it->start - last.start) + it->data;
            }
        } else {
            merged.push_back(last);
            last = *it;
        }
        it ++;
    }
    merged.push_back(last);

    buf_.clear();
    for (const auto& interval : merged) {
        buf_.insert(interval);
    }

    // push when it ready
    it = buf_.begin();
    while (it->start == nxt_expected_idx_) {
        output_.writer().push(it->data);
        nxt_expected_idx_ = it->end;
        it = buf_.erase(it);
    }

    // close when all bytes are pushed
    if (nxt_expected_idx_ == eof_idx_) {
        output_.writer().close();
    }
}

uint64_t Reassembler::bytes_pending() const
{
    uint64_t pendcnt = 0;
    for (const auto& interval : buf_) {
        pendcnt += interval.end - interval.start;
    }
    return pendcnt;
}
```