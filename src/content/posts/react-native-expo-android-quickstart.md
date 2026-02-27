---
title: React Native + Expo 安卓快速开发实战：expo-sqlite、React Native Paper 与手势处理
published: 2026-02-27
description: '基于 Expo + expo-sqlite + React Native Paper + react-native-gesture-handler 技术栈，从零搭建一个可运行的安卓 Todo 应用，涵盖环境配置、数据库操作、UI 组件与手势交互。'
image: ''
tags: [React Native, Expo, Android, SQLite, 移动开发]
category: '技术'
draft: false
lang: ''
---

## 前言

想快速做一个安卓 App？**Expo** 是目前最低门槛的 React Native 开发方案——无需配置 Android Studio 的 NDK、无需手动链接原生模块，一条命令启动，扫码即可在真机预览。

本文以一个**本地持久化 Todo 应用**为例，串联以下四个核心库：

- **Expo** — 托管工作流 + EAS Build
- **expo-sqlite** — 设备本地 SQLite 数据库
- **React Native Paper** — Material Design 3 UI 组件库
- **react-native-gesture-handler** — 原生级手势（滑动删除等）

> 阅读完本文，你将拥有一个可以直接打包为 APK 的完整 App 骨架。

---

## 一、环境准备

### 1.1 必装工具

| 工具 | 版本要求 | 说明 |
|------|----------|------|
| Node.js | >= 18 | 推荐 LTS |
| pnpm / npm | 任意 | 包管理器 |
| Expo CLI | 最新 | `npm i -g expo` |
| EAS CLI | 最新 | 云端打包用，`npm i -g eas-cli` |

调试安卓有两条路：

- **真机**：下载 [Expo Go](https://expo.dev/go)，扫码即可（最省事）
- **模拟器**：安装 Android Studio，创建 AVD（需要 16 GB+ 内存推荐）

### 1.2 创建项目

```bash
npx create-expo-app@latest TodoApp --template blank-typescript
cd TodoApp
```

---

## 二、安装依赖

```bash
# SQLite
npx expo install expo-sqlite

# UI 组件库
npx expo install react-native-paper react-native-safe-area-context

# 手势处理（Paper 内部也依赖它）
npx expo install react-native-gesture-handler
```

> `npx expo install` 会自动匹配与当前 Expo SDK 兼容的版本，**不要用** `npm install` 替代。

---

## 三、项目结构

```
TodoApp/
├── app/               # Expo Router 页面（或直接用 App.tsx）
├── components/
│   ├── TodoItem.tsx   # 单条 Todo（支持滑动删除）
│   └── AddTodoBar.tsx # 底部输入栏
├── db/
│   └── database.ts    # SQLite 初始化 & CRUD
├── App.tsx            # 入口，Provider 挂载
└── app.json
```

---

## 四、配置入口文件

### 4.1 `App.tsx` — 挂载 Provider

React Native Paper 和手势处理都需要在应用最外层包裹 Provider。

```tsx
// App.tsx
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PaperProvider, MD3LightTheme } from "react-native-paper";
import { StyleSheet } from "react-native";
import HomeScreen from "./components/HomeScreen";

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <PaperProvider theme={MD3LightTheme}>
        <HomeScreen />
      </PaperProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
```

**关键点：**
- `GestureHandlerRootView` 必须是**最外层**，否则手势无法正常工作。
- `flex: 1` 确保它撑满全屏。

---

## 五、expo-sqlite 数据库层

### 5.1 初始化数据库

```ts
// db/database.ts
import * as SQLite from "expo-sqlite";

export interface Todo {
  id: number;
  text: string;
  done: number; // SQLite 没有 boolean，用 0/1
}

// openDatabaseSync 是 expo-sqlite v14+ 的同步 API
const db = SQLite.openDatabaseSync("todos.db");

export function initDB() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS todos (
      id   INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT    NOT NULL,
      done INTEGER NOT NULL DEFAULT 0
    );
  `);
}

export function getTodos(): Todo[] {
  return db.getAllSync<Todo>("SELECT * FROM todos ORDER BY id DESC;");
}

export function addTodo(text: string): void {
  db.runSync("INSERT INTO todos (text, done) VALUES (?, ?);", text, 0);
}

export function toggleTodo(id: number, done: number): void {
  db.runSync("UPDATE todos SET done = ? WHERE id = ?;", done ? 0 : 1, id);
}

export function deleteTodo(id: number): void {
  db.runSync("DELETE FROM todos WHERE id = ?;", id);
}
```

> `expo-sqlite` v14 引入了 **同步 API**（`execSync` / `runSync` / `getAllSync`），在主逻辑中使用更直观；若数据量大，改用异步版 `runAsync` / `getAllAsync` 避免阻塞 UI。

---

## 六、UI 组件

### 6.1 `AddTodoBar.tsx` — 输入栏

```tsx
// components/AddTodoBar.tsx
import { useState } from "react";
import { View, StyleSheet } from "react-native";
import { TextInput, IconButton } from "react-native-paper";

interface Props {
  onAdd: (text: string) => void;
}

export default function AddTodoBar({ onAdd }: Props) {
  const [text, setText] = useState("");

  const handleAdd = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setText("");
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        mode="outlined"
        label="新增待办..."
        value={text}
        onChangeText={setText}
        onSubmitEditing={handleAdd}
        returnKeyType="done"
      />
      <IconButton
        icon="plus-circle"
        size={32}
        onPress={handleAdd}
        disabled={!text.trim()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  input: { flex: 1 },
});
```

### 6.2 `TodoItem.tsx` — 滑动删除

这里用 `react-native-gesture-handler` 的 `Swipeable` 实现左滑删除。

```tsx
// components/TodoItem.tsx
import { useRef } from "react";
import { View, StyleSheet } from "react-native";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { List, Checkbox, IconButton, useTheme } from "react-native-paper";
import type { Todo } from "../db/database";

interface Props {
  item: Todo;
  onToggle: (id: number, done: number) => void;
  onDelete: (id: number) => void;
}

export default function TodoItem({ item, onToggle, onDelete }: Props) {
  const swipeRef = useRef<Swipeable>(null);
  const theme = useTheme();

  const renderRightActions = () => (
    <View style={[styles.deleteBox, { backgroundColor: theme.colors.error }]}>
      <IconButton icon="trash-can-outline" iconColor="#fff" size={28} />
    </View>
  );

  return (
    <Swipeable
      ref={swipeRef}
      renderRightActions={renderRightActions}
      onSwipeableOpen={() => {
        onDelete(item.id);
        swipeRef.current?.close();
      }}
      rightThreshold={80}
    >
      <List.Item
        title={item.text}
        titleStyle={item.done ? styles.done : undefined}
        left={() => (
          <Checkbox
            status={item.done ? "checked" : "unchecked"}
            onPress={() => onToggle(item.id, item.done)}
          />
        )}
        style={styles.item}
      />
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  item: { backgroundColor: "#fff" },
  done: { textDecorationLine: "line-through", opacity: 0.5 },
  deleteBox: {
    justifyContent: "center",
    alignItems: "center",
    width: 80,
  },
});
```

### 6.3 `HomeScreen.tsx` — 主页面

```tsx
// components/HomeScreen.tsx
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Appbar, Divider, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  initDB,
  getTodos,
  addTodo,
  toggleTodo,
  deleteTodo,
  type Todo,
} from "../db/database";
import TodoItem from "./TodoItem";
import AddTodoBar from "./AddTodoBar";

export default function HomeScreen() {
  const [todos, setTodos] = useState<Todo[]>([]);

  const refresh = () => setTodos(getTodos());

  useEffect(() => {
    initDB();
    refresh();
  }, []);

  const handleAdd = (text: string) => {
    addTodo(text);
    refresh();
  };

  const handleToggle = (id: number, done: number) => {
    toggleTodo(id, done);
    refresh();
  };

  const handleDelete = (id: number) => {
    deleteTodo(id);
    refresh();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="我的待办" />
      </Appbar.Header>

      {todos.length === 0 ? (
        <View style={styles.empty}>
          <Text variant="bodyLarge">暂无待办，添加一条吧 🎉</Text>
        </View>
      ) : (
        <FlatList
          data={todos}
          keyExtractor={(item) => String(item.id)}
          ItemSeparatorComponent={Divider}
          renderItem={({ item }) => (
            <TodoItem
              item={item}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          )}
        />
      )}

      <AddTodoBar onAdd={handleAdd} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  empty: { flex: 1, justifyContent: "center", alignItems: "center" },
});
```

---

## 七、本地运行与真机调试

```bash
npx expo start
```

终端会显示一个二维码：

1. 安卓手机安装 **Expo Go**
2. 打开 App 扫描二维码
3. 修改代码 → 自动热更新，无需重启

> 如果和电脑不在同一 Wi-Fi，改用 **Tunnel 模式**：`npx expo start --tunnel`（需要安装 `@expo/ngrok`）

---

## 八、打包 APK（EAS Build）

本地不需要安装 Android Studio，直接云端构建：

### 8.1 初始化 EAS

```bash
eas login          # 登录 Expo 账号
eas build:configure
```

### 8.2 构建调试版 APK

```bash
eas build -p android --profile preview
```

`eas.json` 中 `preview` 配置默认输出 **APK**（而非 AAB），适合直接安装到设备测试：

```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {}
  }
}
```

构建完成后 EAS 会给出下载链接，直接安装到安卓设备即可。

### 8.3 构建正式版（上架 Google Play）

```bash
eas build -p android --profile production
```

正式版输出 **AAB** 格式，用于上传 Google Play Console。

---

## 九、常见问题

### `GestureHandlerRootView` 忘记包裹

**现象**：滑动手势完全无响应。  
**解决**：确保它是应用最外层组件，`style={{ flex: 1 }}` 不能省略。

### expo-sqlite 同步 API 报错

`openDatabaseSync` 在 **expo-sqlite < 14** 中不存在。  
**解决**：`npx expo install expo-sqlite` 重新安装对齐版本，或查看 `package.json` 确认版本 >= `14.0.0`。

### Paper 组件样式在安卓上显示异常

部分 Material 3 组件需要 `react-native-safe-area-context` 的 `SafeAreaProvider`。  
**解决**：在 `App.tsx` 最外层加上：

```tsx
import { SafeAreaProvider } from "react-native-safe-area-context";
// 包裹 PaperProvider
<SafeAreaProvider>
  <PaperProvider>...</PaperProvider>
</SafeAreaProvider>
```

### 真机扫码后白屏

通常是 Metro Bundler 还未就绪。等待终端出现 `Bundle loaded` 后再刷新 App。

---

## 十、技术栈小结

| 层次 | 技术 | 核心职责 |
|------|------|----------|
| 开发框架 | Expo (Managed Workflow) | 零配置启动、EAS 云构建 |
| 本地存储 | expo-sqlite | 设备本地 SQL 数据库，离线可用 |
| UI 组件 | React Native Paper | Material Design 3，开箱即用 |
| 手势交互 | react-native-gesture-handler | 原生线程手势，流畅无卡顿 |

这套组合的优势在于**全部走 Expo 生态**，依赖版本自动对齐，几乎不会遇到原生链接问题，非常适合快速验证产品想法或独立开发者出品。

---

## 延伸阅读

- [Expo 官方文档](https://docs.expo.dev/)
- [expo-sqlite API 参考](https://docs.expo.dev/versions/latest/sdk/sqlite/)
- [React Native Paper 组件库](https://callstack.github.io/react-native-paper/)
- [react-native-gesture-handler 文档](https://docs.swmansion.com/react-native-gesture-handler/)
- [EAS Build 文档](https://docs.expo.dev/build/introduction/)
