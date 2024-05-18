---
title: "CMake"
description: "这是一篇关于CMake的文章。"
pubDatetime: 2023-09-07
author: Zari Tsu
featured: false
draft: false
tags:
  - cpp
---

# CMake

我的[视频讲解](https://www.bilibili.com/video/BV1mJ4m1n7Z6/?spm_id_from=333.999.0.0&vd_source=f53099189814dd887f4ab25638e07406)

最近在做C++的项目，而vscode我这里因为一些环境的问题，不太能搞，所以用了cmake这个工具来实现项目的编译运行


## CMake的原理

这个图片很直观，我觉得很好。来自于[大丙](https://subingwen.cn/cmake/CMake-primer/index.html)老哥的博客。
![CMake Formula](https://subingwen.cn/cmake/CMake-primer/image-20230309130644912.png)

CMake的build需要我们先做一个CMakeLists.txt文件。我们结合我的实例来讲解。


## 所有文件在同一目录下

### 文件结构

这是我的项目情况  

```shell
╰─❯ tree
(base)
.
├── CMakeLists.txt
├── test.cpp        // 包含头文件的测试文件
├── threadpool.cpp  // 源文件
└── threadpool.h    // 头文件
```

大家可以看到，这是一个典型的所有文件都在同一目录下的情况，从最简单的讲起。

### CMakeLists.txt编写

下面是我的CmakeLists.txt的内容

```txt
# 设定CMake的最低版本要求
cmake_minimum_required(VERSION 3.0)

# 设置项目名称
project(MyThreadPool)

# 设置C++标准
set(CMAKE_CXX_STANDARD 11)

# 添加所有源文件到变量SOURCE
set(SOURCES
    test.cpp
    threadpool.cpp
)

# 创建一个名为test的可执行文件
add_executable(test ${SOURCES})

# 如果ThreadPool类有相关的头文件路径或者要链接的库，用下面的命令指定
# target_include_directories(test PRIVATE path/to/headers)
# target_link_libraries(test PRIVATE library_name)
```

* 这里注意几点:  
  1. set的时候并不需要显式的添加头文件，比如这里的**threadpool.h**，cmake会自动查找源文件当中包含的头文件。但若有第三方库的头文件，则需要用`target_include_directories`命令手动添加
  2. 若源文件很多，比如还有1.c, 2.c...等着被包含，则可
        ```txt
        # 查找当前目录下的所有源文件，用这行替换set那行
        # 并将名称保存到 DIR_SRCS 变量
        aux_source_directory(. DIR_SRCS)

        # 指定生成目标
        add_executable(test ${DIR_SRCS})
        ```

### 构建和运行

在编写完文件后，我们来运行这个文件。(默认cmake已添加进环境变量)

```shell
# 在项目根目录下创建build文件夹
mkdir build && cd build
# 在根目录运行cmake
cmake ..
# build来编译项目
cmake --build .
# 若build目录已有可执行文件，则直接运行，完成运行
./test.exe
# 若没有，则查看是否有Makefile，有则运行后再运行上一步
make
```

> 注意每次修改文件后，都需要重新`make`一遍更新


## 文件分属不同文件夹下

### 文件结构 

这是项目情况:   

head文件夹当中存储了头文件

src文件夹是源文件

test文件夹当中是测试文件

我们的目标是运行test.cpp，使之成为一个可执行文件

```shell
╰─❯ tree .
.
├── CMakeLists.txt
├── head
│   └── print_hello.h
├── src
│   └── print_hello.cpp
└── test
    └── test.cpp

4 directories, 4 files
```

### CMakeLists.txt编写

我们现在项目根目录下创建`CMakeLists.txt`文件

```txt
# 设置CMake的最低版本要求
cmake_minimum_required(VERSION 3.10)

# 设置项目名称
project(MyProject)

# 将头文件目录添加到编译器的头文件搜索路径
include_directories(head)

# 添加src目录作为子目录，src目录下应有CMakeLists.txt为源文件提供构建规则
add_subdirectory(src)

# 指定生成可执行文件的名字和相关的源文件
add_executable(test_executable test/test.cpp)

# 将可执行文件与源文件目录下生成的库进行链接
target_link_libraries(test_executable source_lib)
```

然后在src目录下也创建一个`CMakeLists.txt`文件

```txt
# 添加库名称和源文件
add_library(source_lib print_hello.cpp)

# 为了确保库可以找到头文件，将头文件目录包含进来
target_include_directories(source_lib PUBLIC ../head)
```

然后就跟可以进行cmake编译啦！