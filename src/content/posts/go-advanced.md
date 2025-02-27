---
title: "Go Advanced"
description: "这是一篇关于 Go Advance 的文章，主要来聊聊 Go 的一些进阶内容，如 Go 的常用命令、逃逸分析、测试编写。"
pubDatetime: 2025-02-28
author: Zari Tsu
featured: false
draft: false
tags:
  - Go
---

# Go Advanced

Golang 是一门编译语言，需要像 C++ 那样先编译再运行，而无法像 Python 那样直接运行

## 常用命令

```bash
go version # 查看当前 Go 版本
go env # 查看当前 Go 环境变量 (包含 GOROOT GOPATH PROXY等等配置)
go env -w GOPROXY=https://goproxy.cn,direct # -w 以写的方式修改 Go 的环境变量
go build main.go # 编译 main.go 文件 生成可运行文件 main
go run main.go # 直接运行 main.go 文件 而不生成 main 可运行文件
go get # 下载指定依赖包
go mod tidy # 按照 go.mod 文件中的依赖关系下载依赖包
```

## 逃逸分析

堆内存：向上（高地址）增长的、非连续的、效率较低的、空间较大的内存存储空间

栈内存：向下（低地址）增长的、连续的、效率高的、空间较小的内存存储空间（符合数据结构中栈的特点）

由此可见，为了性能和效率考虑，我们应该尽可能地在栈上分配内存，也就是说除了某些特殊情况外，其余基本都是在栈上分配内存

分配在堆上（逃逸）的情况

1. 编译期无法确定变量类型
2. 变量在函数闭包外存在外部引用
3. 变量大小过大

## 单元测试

我们需要原文件、测试文件、`go test`命令

这里假设原文件为 `main.go`，则测试文件需要被命名为 `main_test.go`

```go
package main

import (
    "testing"
)

func TestMain(t *testing.T) {
    testcases := []struct {
        name string
        age int
    }{
        {"zari", 18},
        {""},
        {"tsu", -1}
    }
    for _, tc := range testcases {
        // 具体的测试逻辑
    }
}
```

执行测试用例的命令都是基于 `go test` 命令的

```bash
go test # 运行该package下的所有测试用例
go test -v # 运行该package下的所有测试用例并显示详细信息
go test -run TestMain # 运行某个特定的测试用例
```
