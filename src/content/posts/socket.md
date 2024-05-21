---
title: "Socket 网络编程"
description: "这是一篇关于 Socket 网络编程的文章。"
pubDatetime: 2024-05-21
author: Zari Tsu
featured: false
draft: false
tags:
  - Network
---

# Socket 网络编程

## 什么是 Socket

Socket（套接字）是一种通信机制，应用程序通常通过它与另一台计算机进行通信。Socket 由两部分组成：一端称为客户端，另一端称为服务器端。客户端和服务器端通过 Socket 进行通信，客户端首先向服务器端发出连接请求，服务器端确认连接请求，然后双方建立连接。通信双方就可以通过 Socket 进行数据传输。

* 来看看四层网络模型，被分为四层：应用层、传输层、网络层、物理层。

![四层网络模型](https://zq99299.github.io/note-book2/assets/img/2b8fee82b58cc8da88c74a33f2146703.2b8fee82.png)

而Socket的位置就在传输层，它位于应用层和传输层之间。

外显的来说，Socket在应用层的视角是一个正整数，另一端伸入传输层，Socket的整数会通过表被翻译成元组。比如TCP的Socket是一个四元组，记载了源目IP地址和源目端口，UDP对于的是一个二元组。

我们可以把应用层想成一个高层的房间，我们要将房间当中的各个物品送到其他楼中去。然而这个房间的地板就像是一个筛子，每个洞都有对应的一个正整数编号。从应用层的视角来说，我们就只需要把某个应用的信息丢进某个洞里面，然后等着从某个洞里面取出信息。

然后这一层的下一层，就好像一个个分筛机器，也就是传输层，里面会根据一个映射表，将这个洞对应的正整数翻译成为一个元组，或者说是一个键值对，其值为IP地址号和端口号（这里是为了保证应用层不至于每次都处理一个元组的信息，因为每个层都要各司其职）。传输层的工作就是将应用层的信息打包成一个个数据包，并将这些数据包送到网络层。


## Socket 编程

> 注意一点：在socket当中，两个进程可以共用一个端口，但是一个进程只能绑定一个端口。

### socketaddr_in结构体

```c
struct sockaddr_in {
    short   sin_family;         // 地址族，AF_INET
    u_short sin_port;           // 端口号
    struct  sin_addr;           // IP地址
    char    sin_zero[8];        // 填充字节
};
```

### host_ent结构体

```c
struct hostent {
    char  *h_name;             // 主机域名
    char **h_aliases;          // 主机别名列表
    short h_addrtype;          // 地址类型，AF_INET
    short h_length;            // 地址长度
    char **h_addr_list;        // IP地址列表
};
```

### TCP Socket编程

~~当然以下都是伪代码~~

1. **服务器端**创建套接字
    ```c
    int server_sockfd = socket(AF_INET, SOCK_STREAM, 0);
    ```

2. **服务器端**绑定结构体和套接字: 绑定IP地址和端口(用于应用层和传输层)
    ```c
    // 创建一个套接字地址结构体
    struct sockaddr_in server_addr;
    server_addr.sin_family = AF_INET;
    server_addr.sin_port = htons(8080);
    server_addr.sin_addr.s_addr = INADDR_ANY;

    bind(server_sockfd, server_addr);
    ```

3. **服务器端**accept套接字
    ```c
    connect_socket = accept(server_sockfd, client_addr);
    ```

4. **客户端**创建client套接字
    ```c
    int client_sockfd = socket(AF_INET, SOCK_STREAM, 0);
    ```

5. **客户端**绑定套接字和结构体: 绑定IP地址和端口(用于应用层和传输层) <br> 虽然这个步骤可以省略(因为服务器端的端口是常熟端口)，但是为了区分客户端和服务器端，还是需要绑定IP地址和端口。
    ```c
    bind(client_sockfd, client_addr);
    ```

6. **客户端**连接自身套接字与服务器端套接字
    ```c
    connect(client_sockfd, server_addr);
    ```

7. **客户端**发送数据
    ```c
    client_sockfd = send(client_sockfd, send_buf);
    ```

8. **服务器端**读取数据
    ```c
    connect_socket = recv(server_sockfd, recv_buf);
    ```
9. 关闭套接字

    ```c
    close(server_sockfd);
    close(client_sockfd);
    ```

### UDP Socket编程

UDP Socket编程与TCP Socket编程基本相同，只是将SOCK_STREAM改为SOCK_DGRAM即可。

1. **服务器端**创建套接字
    ```c
    int server_sockfd = socket(AF_INET, SOCK_DGRAM, 0);
    ```

2. **服务器端**绑定结构体和套接字: 绑定IP地址和端口(用于应用层和传输层)
    ```c
    // 创建一个套接字地址结构体
    struct sockaddr_in server_addr;
    server_addr.sin_family = AF_INET;
    server_addr.sin_port = htons(8080);
    server_addr.sin_addr.s_addr = INADDR_ANY;

    bind(server_sockfd, server_addr);
    ```

3. **客户端**创建client套接字
    ```c
    int client_sockfd = socket(AF_INET, SOCK_DGRAM, 0);
    ```

4. **客户端**绑定套接字和结构体
    ```c
    bind(client_sockfd, client_addr);
    ```

5. **客户端**发送数据
    ```c
    client_sockfd = sendto(client_sockfd, send_buf, sizeof(send_buf), 0, server_addr);
    ```

6. **服务器端**读取数据
    ```c
    connect_socket = recvfrom(server_sockfd, recv_buf, sizeof(recv_buf), 0, client_addr);
    ```

7. 关闭套接字

    ```c
    close(server_sockfd);
    close(client_sockfd);
    ```

## Socket API (常见)

1. socket() 创建套接字

    `int socket(int domain, int type, int protocol); `

    **成功**：返回指向新创建的socket的文件描述符  **失败**：返回-1

2. bind() 绑定套接字，绑定IP地址和端口号

    `int bind(int sockfd, const struct sockaddr *addr, socklen_t addrlen); `

    **成功**：返回0  **失败**：返回-1

3. listen() 监听套接字状态

4. accept() 接收连接请求

    ` int accept(int sockfd, struct sockaddr *addr, socklen_t *addrlen);`

    **成功**：返回指向新创建的socket的文件描述符  **失败**：返回-1

5. connect() 调用以连接服务器

    ` int connect(int sockfd, const struct sockaddr *addr, socklen_t addrlen)`

    **成功**：返回0  **失败**：返回-1

6. send() 发送数据
7. recv() 接收数据
8. sendto() 发送数据到指定地址
9.  recvfrom() 接收数据来自指定地址
10. close() 关闭套接字