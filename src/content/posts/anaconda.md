---
title: "Anaconda"
description: "这是一篇关于 Anaconda 的基础介绍和使用的文章。"
pubDatetime: 2024-07-25
author: Zari Tsu
featured: false
draft: false
tags:
  - Python
---

# Anaconda

Anaconda是一个虚拟环境管理器，可以帮助我们创建、管理和部署Python环境。它可以帮助我们解决环境依赖问题，并简化了不同版本Python的安装和切换。

## 安装

我们打开官网的[下载](https://www.anaconda.com/download/success)页面，copy这里面的Linux的下载链接，然后去服务器输入。

```bash
wget <复制来的下载链接>
```

## 配置

我们需要配置一下shell的交互。

1. 如果你用的是普通的bash，则打开`.bashrc`文件，在文件末尾添加：

    ```bash
    export PATH="~/anaconda3/bin":$PATH
    source ~/anaconda3/bin/activate
    ```

2. 比如我用的是fish，则直接运行：

    ```bash
    conda init fish
    ```

    你就可以在`~/.config/fish/config.fish`文件里面看到：

    ```config
    # >>> conda initialize >>>
    # !! Contents within this block are managed by 'conda init' !!
    if test -f /root/anaconda3/bin/conda
        eval /root/anaconda3/bin/conda "shell.fish" "hook" $argv | source
    else
        if test -f "/root/anaconda3/etc/fish/conf.d/conda.fish"
            . "/root/anaconda3/etc/fish/conf.d/conda.fish"
        else
            set -x PATH "/root/anaconda3/bin" $PATH
        end
    end
    # <<< conda initialize <<<
    ```

    再重启fish即可。

## 创建环境

Anaconda安装完成后，我们可以创建环境。

```bash
conda create -n <环境名称> python=<版本号>
```

## 常用命令

1. 查看已有环境：`conda env list`
2. 激活环境：`source activate <环境名称>`
3. 退出环境：`source deactivate`
4. 删除环境：`conda remove -n <环境名称> --all`
5. 导出环境：`conda env export > environment.yml`
6. 导入环境：`conda env create -f environment.yml`
7. 查看所有包：`conda list`
