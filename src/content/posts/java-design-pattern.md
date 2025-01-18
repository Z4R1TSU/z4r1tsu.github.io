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

举个例子，比如我们有个导出功能，按照不同的格式导出数据，比如 CSV、Excel、JSON 等；比如我们需要导入 execl 文件，需要解析文件内容，针对不同的格式，需要不同的解析方式；再比如我们有一个给用户发送邮件功能，有可能需要用 gmail, qq, 163 等邮箱服务商，手机验证码服务也是如此。如果我们使用 if-else 或者 switch-case 来实现，代码会变得很臃肿，而且扩展性很差，多一个导出为其他格式的需求，就需要大量修改代码。

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
    private final Class<? extends Exporter> exporterClass;
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

## 门面模式

门面模式的主要作用是用来简化客户端代码的使用，隐藏内部的复杂逻辑，让客户端只需要调用一个方法，就能完成整个功能，相当于客户端和内部的实现类之间的一个封装层。

毕竟我们想要更深层次的封装，单纯出于想导出某个文件的目的，其实我们并不需要知道内部的实现逻辑，应该只调用一个接口就可以了。

具体地，我们可以创建一个 ExportClient 类，作为门面类，负责对外提供一个 export 方法，并在内部调用具体的 Exporter 实现类的 export 方法。

```java
public class ExportClient {
    public static void export(String filePath) {
        String fileType = filePath.substring(filePath.lastIndexOf(".") + 1);
        Exporter exporter = ExporterFactory.getExporter(FileType.getByType(fileType));
        exporter.export(filePath);
    }
    // 处理其他导出逻辑
    public static void export(String filePath, FileType fileType) {
        Exporter exporter = ExporterFactory.getExporter(fileType);
        exporter.export(filePath);
    }
    // 处理文件对象导出逻辑
    public static void export(File file) {
        String filePath = file.getAbsolutePath();
        export(filePath);
    }
}

// 接口类、抽象类、实现类均不需要变动...

// 那么现在我们只需要调用 ExportClient 类的单个 export 方法，就可以完成导出功能了。
public static void main(String[] args) {
    String filePath = "xxx.csv";
    ExportClient.export(filePath);
}
```

## 单例模式

单例模式的主要作用是确保某个类只有一个实例存在，并且提供一个全局访问点。即当我们进行类似 `getInstance()` 方法的调用时，始终返回同一个对象。

其实单例模式的设计已经融合在我们之前的设计模式中了，往往实际要提如何单纯实现单例模式其实比较麻烦，需要靠记忆。

```java
public class Singleton {
    public static final Singleton INSTANCE = new Singleton();

    private Singleton() {
    }

    public static Singleton getInstance() {
        return INSTANCE;
    }
}
```

## 与 Spring 结合

之前我们讲的都是用 maven 项目来演示设计模式，但实际上，Spring 框架中的 IOC 容器、AOP 等功能，都可以帮助我们更优雅、更方便地实现设计模式。

在 Spring Boot 当中，我们会将类放到 IOC 容器中，并通过注解来配置，这样就可以通过 `@Autowired` 注解来注入依赖，而不需要在代码中手动创建对象。但对于这种有多个类型对应多个实例对象的情况，Spring 就不知道要导入哪个特定的实现类，如果用接口类型来注入也不对。所以，我们需要结合 Spring 的特性，结合其提供的各种注解与工厂，自定义一个工厂来实现。

首先，我们在注入时，我们要将具体策略实现类通过 `@Component` 注解，加入到 IOC 容器中。注入了还不够，我们还需要具体文件类型和相应实现类实例对象的映射关系，于是我们在工厂类中，通过遍历枚举类，将对应映射关系集注入到 IOC 容器中。最后是使用时，通过 `@Autowired` 注解

```java
// 注入文件类型名和具体实例对象到IOC容器
@Component
public class ExporterFactory {
    private final ApplicationContext applicationContext;
    private Map<FileType, Exporter> exporterMap;

    @Autowired
    public ExporterFactory(ApplicationContext applicationContext) {
        this.applicationContext = applicationContext;
    }

    @PostConstruct
    public void init() {
        exporterMap = Arrays.stream(FileType.values())
            .collect(Collectors.toMap(
                Function.identity(),
                fileType -> {
                    try {
                        return applicationContext.getBean(fileType.getExporterClass());
                    } catch (BeansException e) {
                        throw new RuntimeException("Failed to create Exporter for type: " + fileType, e);
                    }
                }
            ));
    }

    public Exporter getExporter(FileType fileType) {
        if (!exporterMap.containsKey(fileType)) {
            throw new IllegalArgumentException("不支持的文件类型：" + fileType);
        }
        return exporterMap.get(fileType);
    }
}

// 具体实现类上添加注解以加入到IOC容器
@Component
public class CSVExporter implements Exporter {
    // 具体实现代码
}

@Component
public class ExcelExporter implements Exporter {
    // 具体实现代码
}

// Interface类不需要变化...

@Component
public class ExportClient {
    @Autowired
    private ExporterFactory exporterFactory;

    public void export(String filePath) {
        String fileType = filePath.substring(filePath.lastIndexOf(".") + 1);
        Exporter exporter = exporterFactory.getExporter(FileType.getByType(fileType));
        exporter.export(filePath);
    }
}

// 使用时，通过注解注入依赖，并调用其 export 方法
public static void main(String[] args) {
    @Autowired
    private ExportClient exportClient;

    public static void main(String[] args) {
        String filePath = "xxx.csv";
        exportClient.export(filePath);
    }
}
```
