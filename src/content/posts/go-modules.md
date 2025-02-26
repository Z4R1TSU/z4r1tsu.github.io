---
title: "Go Modules"
description: "这是一篇关于 Go Modules 的文章，主要来聊聊 Go 的项目管理和模块管理。"
pubDatetime: 2025-02-27
author: Zari Tsu
featured: false
draft: false
tags:
  - Go
---

# Go Modules

## 导入

正常导入和括号批量导入没什么好讲的，就注意一下导入的是路径而不是包名，且我们可以对导入的路径进行取别名的操作 `import alias "github.com/zari/go-modules"`

## GOPATH

最开始的模块管理方案是通过 `GOPATH` 来管理，`GOPATH` 是一个环境变量，它的作用是告诉 Go 语言在哪个目录下寻找第三方包。对于整个 OS 下的所有 Go 项目的依赖都会放在这个目录下，所有项目都共享一个 GOROOT 和 GOPATH。这样的问题就是耦合度太高，灵活度低；并且最致命的，两个项目的依赖包版本可能不一致，而共享的 GOPATH 中只能存一个版本的三方库。

## Go vendor

每个项目下都创建一个 vendor 目录，每个项目所需的依赖都只会下载到自己vendor目录下，项目之间的依赖包互不影响。这样的坏处也很明显，那就是依赖间的复用性太差，导致磁盘空间的浪费。

## Go mod

它会统一在 `GOPATH/pkg` 目录下统一管理所有项目的依赖，同时修复了同一依赖的多版本冲突和vendor带来的资源浪费问题

使用 `go mod` 后项目目录下会多出 `go.mod` 和 `go.sum` 两个文件，`go.mod` 文件是项目的依赖管理文件，`go.sum` 文件是项目的依赖校验文件。

`go.mod` 文件包含了模块的引用路径，项目 go 版本，以及各个依赖及其版本信息。

`go.sum` 文件的每一行都是由 模块路径，模块版本，哈希检验值 组成，其中哈希检验值是用来保证当前缓存的模块不会被篡改。

## 命令

### `go mod init`

初始化go mod， 生成go.mod文件。后面可加 module 名作为参数

### `go mod tidy`

添加缺少的包，且删除无用的包。可在后加 `-v` 参数以输出详细日志。最重要的命令！！！

### `go mod vendor`

导出项目所有依赖到vendor下

### `go mod download`

手动触发下载依赖包到本地cache（默认为$GOPATH/pkg/mod目录）

### `go mod graph`

打印项目的模块依赖结构


