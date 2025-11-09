---
title: Git 命令完全指南
published: 2025-11-10
description: '全面掌握 Git 版本控制：从基础到进阶的 Git 命令详解，涵盖日常开发中最常用的操作和技巧'
image: ''
tags: [Git, 版本控制, 开发工具, 教程]
category: '技术'
draft: false 
lang: ''
---

## 前言

Git 是目前最流行的分布式版本控制系统，掌握 Git 命令是每个开发者的必备技能。本文将系统地介绍 Git 的常用命令，从基础到进阶，帮助你更好地管理代码版本。

## 一、Git 配置

### 1.1 设置用户信息

```bash
# 设置全局用户名
git config --global user.name "你的名字"

# 设置全局邮箱
git config --global user.email "your.email@example.com"

# 查看配置信息
git config --list

# 查看特定配置
git config user.name
```

### 1.2 其他常用配置

```bash
# 设置默认编辑器
git config --global core.editor "code --wait"  # VSCode
git config --global core.editor "vim"          # Vim

# 设置命令别名
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.lg "log --color --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit"

# 设置默认分支名称
git config --global init.defaultBranch main
```

## 二、仓库初始化与克隆

### 2.1 创建仓库

```bash
# 在当前目录初始化 Git 仓库
git init

# 在指定目录初始化仓库
git init <project-name>
```

### 2.2 克隆远程仓库

```bash
# 克隆远程仓库
git clone <url>

# 克隆到指定目录
git clone <url> <directory-name>

# 克隆指定分支
git clone -b <branch-name> <url>

# 浅克隆（只克隆最近的历史）
git clone --depth 1 <url>
```

## 三、基础操作

### 3.1 查看状态

```bash
# 查看工作区状态
git status

# 简洁模式
git status -s
```

### 3.2 添加文件到暂存区

```bash
# 添加指定文件
git add <file>

# 添加多个文件
git add <file1> <file2>

# 添加所有修改的文件
git add .

# 添加所有 .js 文件
git add *.js

# 交互式添加
git add -p
```

### 3.3 提交更改

```bash
# 提交暂存区的文件
git commit -m "提交信息"

# 添加并提交（跳过 git add）
git commit -am "提交信息"

# 修改最后一次提交
git commit --amend

# 修改最后一次提交信息
git commit --amend -m "新的提交信息"
```

### 3.4 查看差异

```bash
# 查看工作区与暂存区的差异
git diff

# 查看暂存区与最新提交的差异
git diff --staged
# 或
git diff --cached

# 查看两个提交之间的差异
git diff <commit1> <commit2>

# 查看指定文件的差异
git diff <file>
```

## 四、分支管理

### 4.1 查看分支

```bash
# 查看本地分支
git branch

# 查看所有分支（包括远程）
git branch -a

# 查看远程分支
git branch -r

# 查看分支详细信息
git branch -v
git branch -vv  # 显示跟踪的远程分支
```

### 4.2 创建与切换分支

```bash
# 创建新分支
git branch <branch-name>

# 切换分支
git checkout <branch-name>

# 创建并切换到新分支
git checkout -b <branch-name>

# 基于某个提交创建分支
git checkout -b <branch-name> <commit-hash>

# 使用 switch 命令（Git 2.23+）
git switch <branch-name>
git switch -c <branch-name>  # 创建并切换
```

### 4.3 合并分支

```bash
# 合并指定分支到当前分支
git merge <branch-name>

# 不使用快进合并
git merge --no-ff <branch-name>

# 压缩合并（将多个提交合并为一个）
git merge --squash <branch-name>
```

### 4.4 删除分支

```bash
# 删除本地分支
git branch -d <branch-name>

# 强制删除本地分支
git branch -D <branch-name>

# 删除远程分支
git push origin --delete <branch-name>
# 或
git push origin :<branch-name>
```

### 4.5 变基操作

```bash
# 将当前分支变基到指定分支
git rebase <branch-name>

# 交互式变基（可以编辑、合并、删除提交）
git rebase -i <commit-hash>

# 继续变基
git rebase --continue

# 跳过当前提交
git rebase --skip

# 放弃变基
git rebase --abort
```

## 五、远程仓库操作

### 5.1 查看远程仓库

```bash
# 查看远程仓库
git remote

# 查看远程仓库详细信息
git remote -v

# 查看指定远程仓库信息
git remote show origin
```

### 5.2 添加与删除远程仓库

```bash
# 添加远程仓库
git remote add <name> <url>

# 删除远程仓库
git remote remove <name>

# 重命名远程仓库
git remote rename <old-name> <new-name>

# 修改远程仓库 URL
git remote set-url origin <new-url>
```

### 5.3 推送与拉取

```bash
# 推送到远程仓库
git push origin <branch-name>

# 推送所有分支
git push --all origin

# 推送标签
git push --tags

# 强制推送（危险操作！）
git push -f origin <branch-name>

# 设置上游分支
git push -u origin <branch-name>

# 拉取远程更改
git pull origin <branch-name>

# 拉取并变基
git pull --rebase origin <branch-name>

# 获取远程更改但不合并
git fetch origin

# 获取所有远程分支
git fetch --all
```

## 六、查看历史

### 6.1 查看提交日志

```bash
# 查看提交历史
git log

# 简洁显示
git log --oneline

# 显示最近 n 条记录
git log -n 5

# 图形化显示分支
git log --graph --oneline --all

# 显示每次提交的差异
git log -p

# 显示统计信息
git log --stat

# 按作者筛选
git log --author="作者名"

# 按时间筛选
git log --since="2 weeks ago"
git log --after="2025-01-01"
git log --before="2025-12-31"

# 按提交信息筛选
git log --grep="关键词"

# 查看某个文件的历史
git log -- <file>
```

### 6.2 查看引用日志

```bash
# 查看所有操作记录（包括已删除的提交）
git reflog

# 查看指定分支的引用日志
git reflog show <branch-name>
```

## 七、撤销与回退

### 7.1 撤销工作区修改

```bash
# 撤销工作区的修改
git checkout -- <file>

# 使用 restore 命令（Git 2.23+）
git restore <file>

# 撤销所有工作区修改
git checkout -- .
git restore .
```

### 7.2 撤销暂存区

```bash
# 将文件从暂存区移除（保留工作区修改）
git reset HEAD <file>

# 使用 restore 命令
git restore --staged <file>
```

### 7.3 回退版本

```bash
# 回退到上一个版本（保留工作区修改）
git reset --soft HEAD^

# 回退到上一个版本（不保留工作区修改）
git reset --hard HEAD^

# 回退到指定版本
git reset --hard <commit-hash>

# 回退 n 个版本
git reset --hard HEAD~3

# 创建一个新提交来撤销指定提交（推荐）
git revert <commit-hash>
```

## 八、暂存工作

### 8.1 储藏更改

```bash
# 暂存当前工作区
git stash

# 暂存并添加说明
git stash save "说明信息"

# 查看暂存列表
git stash list

# 应用最近的暂存
git stash apply

# 应用指定的暂存
git stash apply stash@{0}

# 应用并删除最近的暂存
git stash pop

# 删除指定暂存
git stash drop stash@{0}

# 清空所有暂存
git stash clear

# 查看暂存的内容
git stash show
git stash show -p  # 显示详细差异
```

## 九、标签管理

### 9.1 创建标签

```bash
# 创建轻量标签
git tag <tag-name>

# 创建附注标签
git tag -a <tag-name> -m "标签说明"

# 给指定提交打标签
git tag -a <tag-name> <commit-hash> -m "说明"
```

### 9.2 查看与删除标签

```bash
# 查看所有标签
git tag

# 查看标签详情
git show <tag-name>

# 删除本地标签
git tag -d <tag-name>

# 删除远程标签
git push origin --delete tag <tag-name>
# 或
git push origin :refs/tags/<tag-name>

# 推送指定标签
git push origin <tag-name>

# 推送所有标签
git push origin --tags
```

## 十、高级技巧

### 10.1 Cherry-pick

```bash
# 将指定提交应用到当前分支
git cherry-pick <commit-hash>

# 应用多个提交
git cherry-pick <commit1> <commit2>

# 应用一个范围的提交
git cherry-pick <commit1>..<commit2>
```

### 10.2 清理操作

```bash
# 删除未跟踪的文件
git clean -f

# 删除未跟踪的文件和目录
git clean -fd

# 预览将被删除的文件
git clean -n

# 删除被忽略的文件
git clean -fX
```

### 10.3 子模块

```bash
# 添加子模块
git submodule add <url> <path>

# 初始化子模块
git submodule init

# 更新子模块
git submodule update

# 克隆包含子模块的项目
git clone --recursive <url>

# 拉取子模块的更新
git submodule update --remote
```

### 10.4 搜索与查找

```bash
# 在工作区搜索文本
git grep "搜索内容"

# 在指定提交中搜索
git grep "搜索内容" <commit-hash>

# 查找哪个提交引入了 bug
git bisect start
git bisect bad          # 当前版本有 bug
git bisect good <commit> # 指定一个好的版本
# 然后 Git 会二分查找，每次测试后标记 good 或 bad
git bisect reset        # 结束查找
```

### 10.5 重写历史

```bash
# 修改多个提交信息
git rebase -i HEAD~3

# 合并最近 n 个提交
git reset --soft HEAD~3
git commit -m "合并后的提交信息"

# 修改作者信息
git commit --amend --author="新作者 <email@example.com>"
```

## 十一、常见场景

### 11.1 同步 Fork 的仓库

```bash
# 添加上游仓库
git remote add upstream <original-repo-url>

# 获取上游更新
git fetch upstream

# 合并上游更新
git checkout main
git merge upstream/main

# 推送到你的远程仓库
git push origin main
```

### 11.2 解决冲突

```bash
# 1. 拉取远程代码时发生冲突
git pull origin main

# 2. 手动解决冲突文件中的冲突标记
# <<<<<<< HEAD
# 你的更改
# =======
# 远程的更改
# >>>>>>> branch-name

# 3. 标记冲突已解决
git add <conflict-file>

# 4. 完成合并
git commit -m "解决冲突"
```

### 11.3 修改已推送的提交

```bash
# 1. 本地修改
git commit --amend

# 2. 强制推送（确保没有其他人基于这个分支工作）
git push -f origin <branch-name>
```

### 11.4 恢复误删的提交

```bash
# 1. 查看引用日志找到提交 hash
git reflog

# 2. 恢复到指定提交
git reset --hard <commit-hash>

# 或者创建新分支保存该提交
git branch <branch-name> <commit-hash>
```

## 十二、最佳实践

### 12.1 提交信息规范

```bash
# 推荐的提交信息格式
<type>(<scope>): <subject>

<body>

<footer>

# type 类型：
# feat: 新功能
# fix: 修复 bug
# docs: 文档更新
# style: 代码格式调整
# refactor: 重构
# test: 测试相关
# chore: 构建或辅助工具变动

# 示例：
git commit -m "feat(user): 添加用户登录功能"
git commit -m "fix(api): 修复接口返回错误"
```

### 12.2 分支管理策略

- **main/master**: 主分支，保持稳定
- **develop**: 开发分支
- **feature/xxx**: 功能分支
- **hotfix/xxx**: 紧急修复分支
- **release/xxx**: 发布分支

### 12.3 工作流程建议

1. 从 main 拉取最新代码
2. 创建功能分支进行开发
3. 定期提交代码
4. 完成后合并到 develop 分支
5. 测试通过后合并到 main 分支
6. 打标签发布版本

## 总结

Git 是一个功能强大的版本控制工具，掌握这些命令能极大提升开发效率。建议从基础命令开始练习，逐步深入学习高级功能。记住，熟能生巧，多使用、多实践才是掌握 Git 的最好方法。

## 参考资源

- [Git 官方文档](https://git-scm.com/doc)
- [Pro Git 中文版](https://git-scm.com/book/zh/v2)
- [Learn Git Branching](https://learngitbranching.js.org/) - 交互式学习 Git 分支

---

希望这篇文章能帮助你更好地掌握 Git！如果有任何问题或建议，欢迎在评论区留言讨论。