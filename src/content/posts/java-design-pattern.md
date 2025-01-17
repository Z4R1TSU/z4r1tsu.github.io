---
title: "Java 设计模式"
description: "这篇来讲讲 Java 中的设计模式。"
pubDatetime: 2025-01-17
author: Zari Tsu
featured: false
draft: false
tags:
  - Java
---

# 设计模式

举个例子，比如我们有个导出功能，按照不同的格式导出数据，比如 CSV、Excel、JSON 等；比如我们需要导入execl文件，需要解析文件内容，针对不同的格式，需要不同的解析方式；再比如我们有一个给用户发送邮件功能，有可能需要用 gmail, qq, 163 等邮箱服务商，手机验证码服务也是如此。如果我们使用 if-else 或者 switch-case 来实现，代码会变得很臃肿，而且扩展性很差，多一个导出为其他格式的需求，就需要大量修改代码。

处理之前的代码可能长这样：

```java
/**
 * @param filePath 文件路径（含文件名）
 * 
 * 导出 CSV 和 Excel 的需求
 */
public void export(String filePath) {
    String fileType = filePath.substring(filePath.lastIndexOf(".") + 1);
    if ("csv".equals(fileType)) {
        // 导出 CSV 的具体代码，以下省略100行
    } else if ("excel".equals(fileType)) {
        // 导出 Excel 的具体代码，以下省略100行
    } else {
        throw new IllegalArgumentException("不支持的文件类型：" + fileType);
    }
}
```

## 策略模式

策略模式的主要作用是用来提升一些代码的复用性的，或者解决代码中出现很多 if-else 语句的问题。

那么利用策略模式进行优化呢，则是一种利用添加大量相关类的方式，通过 OOP 的继承和组合的方式，来减少调用时的 if-else 语句，提高代码的可扩展性，同时维护可读性和简洁性。

```java
public interface Exporter {
    void export(String filePath);
}

public class CSVExporter implements Exporter {
    public void export(String filePath) {
        // 导出 CSV 的具体代码，以下省略100行
    }
}

public class ExcelExporter implements Exporter {
    public void export(String filePath) {
        // 导出 Excel 的具体代码，以下省略100行
    }
}

public static void main(String[] args) {

    private static final Map<String, Exporter> exporterMap = new HashMap<>();
    static {
        exporterMap.put("csv", new CSVExporter());
        exporterMap.put("excel", new ExcelExporter());
    }

    public void export(String filePath) {
        String fileType = filePath.substring(filePath.lastIndexOf(".") + 1);
        if (!exporterMap.containsKey(fileType)) {
            throw new IllegalArgumentException("不支持的文件类型：" + fileType);
        }
        exporterMap.get(fileType).export(filePath);
    }
```

## 模板方法模式

由于上一种优化把具体的导出逻辑都封装在出来了，一定程度上提升了代码可扩展性，但是在添加新的导出格式时，仍然需要动这个 Map。同时，代码的复用性其实仍然没有提升，只是把 if-else 语句封装成了一个类。

接下来我们可以用模板方式来解决，具体地，我们可以使用一个抽象类作为中间层，放在接口类 Exporter 和实现类 CSVExporter、ExcelExporter 之间，来简化重复的代码，以提升代码复用性。

```java
public abstract class Exporter {
    public abstract void export(String filePath);
}

public abstract class AbstractExporter implements Exporter {
    public void export(String filePath) {
        // 1. 异常或非法参数检查（由于所有文件的合法性检查都是一致的，不需要根据子类的不同而改变）
        // 2. 获取文件类型（同上）
        // 3. 读取文件（这个不同文件的读取逻辑不同，对于不同子类需要重写）
        List<String> content = ReadFile(filePath);
        // 4. 处理数据与导出（这个不同文件的处理逻辑不同，对于不同子类需要重写）
        WriteFile(filePath, content);
    }

    protected String ReadFile(String filePath);

    protected void WriteFile(String filePath, List<String> content);
}

public class CSVExporter extends AbstractExporter {
    @Override
    protected String ReadFile(String filePath) {
        // 实现读取 CSV 文件的代码
    }

    @Override
    protected void WriteFile(String filePath, List<String> content) {
        // 实现处理 CSV 文件的代码
    }
}

// ExcelExporter 类同上...

public static void main(String[] args) {
    private static final Map<String, Exporter> exporterMap = new HashMap<>();
    static {
        exporterMap.put("csv", new CSVExporter());
        exporterMap.put("excel", new ExcelExporter());
    }

    public void export(String filePath) {
        String fileType = filePath.substring(filePath.lastIndexOf(".") + 1);
        if (!exporterMap.containsKey(fileType)) {
            throw new IllegalArgumentException("不支持的文件类型：" + fileType);
        }
        exporterMap.get(fileType).export(filePath);
    }
}
```

## 工厂模式

那么现在我们解决了代码复用性不高，也就是重复代码过多的问题。但扩展代码时，需要在静态 map 中添加新类型的问题依旧存在，因为我们始终需要通过 String 类型的 type 参数来获取执行的具体的 Exporter 对象。

我们很容易可以想到可以利用工厂模式来解决，工厂模式生来就是为了 **创建对象**，并且根据 **参数的不同**，返回 **不同的对象**，这恰好符合了我们的需求。

具体地，我们多创建一个枚举类，用来映射导出格式名和对应的 Exporter 实现类。然后跟之前一样，我们在工厂类里面，初始化一个 map，通过遍历枚举类，将每个 Exporter 实现类的实例放入 map 中，再在里面实现一个根据 String 类型的文件类型获取 Exporter 实例的静态方法。这样我们就可以在之后调用时，使用工厂类的 getExporter 方法，传入文件类型，获取对应的 Exporter 实例，并调用其 export 方法。

```java
// 抽象类、实现类均不变

@Getter
@AllArgsConstructor
public enum FileType {
    CSV("csv", CSVExporter.class),
    EXCEL("excel", ExcelExporter.class);
    // 之后如果有更多的导出格式，可以继续通过添加(格式名, 实现类)的形式添加到枚举类中
    private String type;
}

public class ExporterFactory {
    private static final Map<FileType, Exporter> exporterMap;
    static {
        exporterMap = Arrays.stream(FileType.values())
            .collect(Collectors.toMap(
                Function.identity(),
                fileType -> {
                    try {
                        return fileType.getExporterClass().newInstance();
                    } catch (InstantiationException | IllegalAccessException e) {
                        throw new RuntimeException(e);
                    }
                }
                (exisitingValue, newValue) -> newValue
            )
    }

    public static Exporter getExporter(FileType fileType) {
        if (!exporterMap.containsKey(fileType)) {
            throw new IllegalArgumentException("不支持的文件类型：" + fileType);
        }
        return exporterMap.get(fileType);
    }
}

public static void main(String[] args) {
    String filePath = "xxx.csv";
    FileType fileType = FileType.getByType(filePath.substring(filePath.lastIndexOf(".") + 1));
    Exporter exporter = ExporterFactory.getExporter(fileType);
    exporter.export(filePath);
}
```
