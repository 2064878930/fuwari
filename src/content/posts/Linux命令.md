---
title: Linux命令
published: 2025-11-10
description: 'Linux常用命令速查手册'
image: ''
tags: [Linux, 命令行, Shell]
category: '技术'
draft: false 
lang: ''
---

## 文件和目录操作

### ls - 列出目录内容
```bash
ls              # 列出当前目录
ls -l           # 详细信息
ls -a           # 显示隐藏文件
ls -lh          # 人性化显示文件大小
ls -R           # 递归显示子目录
ls -lt          # 按修改时间排序
ls -lS          # 按文件大小排序
```

### cd - 切换目录
```bash
cd /path        # 切换到指定路径
cd ~            # 切换到家目录
cd ..           # 返回上级目录
cd -            # 返回上次目录
```

### pwd - 显示当前目录
```bash
pwd             # 显示当前工作目录完整路径
pwd -P          # 显示物理路径（不含符号链接）
```

### mkdir - 创建目录
```bash
mkdir dir       # 创建目录
mkdir -p a/b/c  # 递归创建多级目录
mkdir -m 755 dir # 创建目录并设置权限
```

### rmdir - 删除空目录
```bash
rmdir dir       # 删除空目录
rmdir -p a/b/c  # 递归删除空目录
```

### cp - 复制文件/目录
```bash
cp file1 file2          # 复制文件
cp -r dir1 dir2         # 递归复制目录
cp -i file1 file2       # 交互式复制（覆盖前提示）
cp -u file1 file2       # 仅复制较新文件
cp -p file1 file2       # 保留属性
cp -a dir1 dir2         # 归档模式（保留所有属性）
```

### mv - 移动/重命名
```bash
mv file1 file2          # 重命名文件
mv file dir/            # 移动文件到目录
mv -i file1 file2       # 交互式移动
mv -u file1 file2       # 仅移动较新文件
```

### rm - 删除文件/目录
```bash
rm file                 # 删除文件
rm -f file              # 强制删除
rm -i file              # 交互式删除
rm -r dir               # 递归删除目录
rm -rf dir              # 强制递归删除（危险）
```

### touch - 创建文件/更新时间戳
```bash
touch file              # 创建空文件或更新时间戳
touch -t 202501011200 file  # 设置指定时间戳
```

## 文件查看和编辑

### cat - 查看文件内容
```bash
cat file                # 显示文件内容
cat -n file             # 显示行号
cat file1 file2         # 合并显示多个文件
cat > file              # 创建文件（Ctrl+D结束）
```

### more - 分页查看
```bash
more file               # 分页显示（空格下一页，q退出）
```

### less - 分页查看（增强版）
```bash
less file               # 分页显示（支持上下翻页）
less -N file            # 显示行号
# 快捷键: 空格(下一页) b(上一页) /(搜索) q(退出)
```

### head - 查看文件开头
```bash
head file               # 显示前10行
head -n 20 file         # 显示前20行
head -c 100 file        # 显示前100字节
```

### tail - 查看文件末尾
```bash
tail file               # 显示后10行
tail -n 20 file         # 显示后20行
tail -f file            # 实时监控文件变化
tail -F file            # 实时监控（文件重建也能跟踪）
```

### nano - 简单文本编辑器
```bash
nano file               # 编辑文件
# Ctrl+O 保存, Ctrl+X 退出
```

### vim - 强大文本编辑器
```bash
vim file                # 编辑文件
# i 进入插入模式, Esc 退出插入模式
# :w 保存, :q 退出, :wq 保存并退出, :q! 不保存退出
```

## 文件权限管理

### chmod - 修改权限
```bash
chmod 755 file          # 设置权限为rwxr-xr-x
chmod u+x file          # 给所有者添加执行权限
chmod g-w file          # 移除组写权限
chmod o=r file          # 设置其他人只读
chmod -R 755 dir        # 递归修改目录权限
```

### chown - 修改所有者
```bash
chown user file         # 修改所有者
chown user:group file   # 修改所有者和组
chown -R user dir       # 递归修改
```

### chgrp - 修改所属组
```bash
chgrp group file        # 修改所属组
chgrp -R group dir      # 递归修改
```

### umask - 设置默认权限
```bash
umask                   # 查看当前umask值
umask 022               # 设置umask为022
```

## 文件搜索

### find - 查找文件
```bash
find /path -name "*.txt"        # 按名称查找
find . -type f                  # 查找所有文件
find . -type d                  # 查找所有目录
find . -size +100M              # 查找大于100M的文件
find . -mtime -7                # 查找7天内修改的文件
find . -user username           # 查找指定用户的文件
find . -perm 755                # 查找指定权限的文件
find . -name "*.log" -delete    # 查找并删除
find . -name "*.txt" -exec rm {} \;  # 查找并执行命令
```

### locate - 快速查找文件
```bash
locate file             # 快速查找文件
locate -i file          # 忽略大小写
updatedb                # 更新locate数据库
```

### which - 查找命令路径
```bash
which command           # 查找命令的完整路径
```

### whereis - 查找命令相关文件
```bash
whereis command         # 查找命令、源码、手册页
```

## 文本处理

### grep - 文本搜索
```bash
grep "pattern" file             # 搜索匹配的行
grep -i "pattern" file          # 忽略大小写
grep -r "pattern" dir           # 递归搜索目录
grep -v "pattern" file          # 显示不匹配的行
grep -n "pattern" file          # 显示行号
grep -c "pattern" file          # 统计匹配行数
grep -l "pattern" *.txt         # 只显示匹配的文件名
grep -A 3 "pattern" file        # 显示匹配行及后3行
grep -B 3 "pattern" file        # 显示匹配行及前3行
grep -C 3 "pattern" file        # 显示匹配行及前后3行
```

### sed - 流编辑器
```bash
sed 's/old/new/' file           # 替换每行第一个匹配
sed 's/old/new/g' file          # 替换所有匹配
sed -i 's/old/new/g' file       # 直接修改文件
sed '1,10d' file                # 删除1-10行
sed -n '5,10p' file             # 只显示5-10行
```

### awk - 文本分析工具
```bash
awk '{print $1}' file           # 打印第一列
awk '{print $1,$3}' file        # 打印第1和第3列
awk -F: '{print $1}' /etc/passwd # 指定分隔符
awk '$3>100' file               # 打印第3列大于100的行
awk '{sum+=$1} END {print sum}' file  # 求和
```

### cut - 剪切文本
```bash
cut -d: -f1 /etc/passwd         # 按:分割，取第1字段
cut -c1-10 file                 # 取每行第1-10个字符
cut -f1,3 file                  # 取第1和第3字段
```

### sort - 排序
```bash
sort file               # 按字母排序
sort -n file            # 按数字排序
sort -r file            # 逆序排序
sort -u file            # 排序并去重
sort -k2 file           # 按第2列排序
sort -t: -k3 -n file    # 指定分隔符按第3列数字排序
```

### uniq - 去重
```bash
uniq file               # 去除相邻重复行
uniq -c file            # 统计重复次数
uniq -d file            # 只显示重复行
uniq -u file            # 只显示不重复行
```

### wc - 统计
```bash
wc file                 # 统计行数、单词数、字节数
wc -l file              # 统计行数
wc -w file              # 统计单词数
wc -c file              # 统计字节数
```

### diff - 比较文件
```bash
diff file1 file2        # 比较两个文件
diff -u file1 file2     # 统一格式显示差异
diff -r dir1 dir2       # 递归比较目录
```

## 压缩和解压

### tar - 归档工具
```bash
tar -cvf archive.tar files      # 创建归档
tar -xvf archive.tar            # 解压归档
tar -tvf archive.tar            # 查看归档内容
tar -czvf archive.tar.gz files  # 创建gzip压缩归档
tar -xzvf archive.tar.gz        # 解压gzip归档
tar -cjvf archive.tar.bz2 files # 创建bzip2压缩归档
tar -xjvf archive.tar.bz2       # 解压bzip2归档
tar -xvf archive.tar -C /path   # 解压到指定目录
```

### gzip - 压缩文件
```bash
gzip file               # 压缩文件（删除原文件）
gzip -k file            # 压缩文件（保留原文件）
gzip -d file.gz         # 解压文件
gunzip file.gz          # 解压文件
gzip -r dir             # 递归压缩目录
```

### bzip2 - 压缩文件
```bash
bzip2 file              # 压缩文件
bzip2 -d file.bz2       # 解压文件
bunzip2 file.bz2        # 解压文件
```

### zip - 压缩工具
```bash
zip archive.zip files   # 创建zip压缩包
zip -r archive.zip dir  # 递归压缩目录
unzip archive.zip       # 解压zip文件
unzip -l archive.zip    # 查看zip内容
unzip archive.zip -d /path  # 解压到指定目录
```

## 进程管理

### ps - 查看进程
```bash
ps                      # 显示当前终端进程
ps aux                  # 显示所有进程详细信息
ps -ef                  # 显示所有进程完整信息
ps -u username          # 显示指定用户进程
ps -p PID               # 显示指定PID的进程
```

### top - 实时进程监控
```bash
top                     # 实时显示进程信息
top -u username         # 显示指定用户进程
# 快捷键: q(退出) k(杀死进程) P(按CPU排序) M(按内存排序)
```

### htop - 增强版进程监控
```bash
htop                    # 交互式进程查看器（需安装）
```

### kill - 终止进程
```bash
kill PID                # 终止进程
kill -9 PID             # 强制终止进程
kill -15 PID            # 正常终止进程（默认）
killall process_name    # 按名称终止进程
```

### pkill - 按名称终止进程
```bash
pkill process_name      # 终止匹配的进程
pkill -u username       # 终止指定用户的进程
```

### bg - 后台运行
```bash
bg                      # 将暂停的任务放到后台运行
bg %1                   # 将指定任务放到后台
```

### fg - 前台运行
```bash
fg                      # 将后台任务调到前台
fg %1                   # 将指定任务调到前台
```

### jobs - 查看后台任务
```bash
jobs                    # 显示后台任务列表
jobs -l                 # 显示任务PID
```

### nohup - 后台运行（退出终端仍运行）
```bash
nohup command &         # 后台运行命令
nohup command > output.log 2>&1 &  # 重定向输出
```

### nice - 设置进程优先级
```bash
nice -n 10 command      # 以优先级10运行命令
```

### renice - 修改进程优先级
```bash
renice -n 5 -p PID      # 修改进程优先级为5
```

## 系统信息

### uname - 系统信息
```bash
uname -a                # 显示所有系统信息
uname -r                # 显示内核版本
uname -m                # 显示硬件架构
```

### hostname - 主机名
```bash
hostname                # 显示主机名
hostname newname        # 设置主机名
```

### uptime - 系统运行时间
```bash
uptime                  # 显示系统运行时间和负载
```

### date - 日期时间
```bash
date                    # 显示当前日期时间
date +%Y-%m-%d          # 格式化显示日期
date +%H:%M:%S          # 显示时间
date -s "2025-01-01 12:00:00"  # 设置日期时间
```

### cal - 日历
```bash
cal                     # 显示当月日历
cal 2025                # 显示2025年日历
cal 12 2025             # 显示2025年12月日历
```

### whoami - 当前用户
```bash
whoami                  # 显示当前登录用户名
```

### who - 在线用户
```bash
who                     # 显示在线用户
who -b                  # 显示系统启动时间
```

### w - 详细用户信息
```bash
w                       # 显示在线用户详细信息
```

### id - 用户ID信息
```bash
id                      # 显示当前用户ID信息
id username             # 显示指定用户ID信息
```

## 磁盘管理

### df - 磁盘空间
```bash
df                      # 显示磁盘空间使用情况
df -h                   # 人性化显示
df -T                   # 显示文件系统类型
df -i                   # 显示inode使用情况
```

### du - 目录空间
```bash
du file                 # 显示文件/目录大小
du -h                   # 人性化显示
du -s                   # 只显示总大小
du -sh *                # 显示当前目录下各文件/目录大小
du -h --max-depth=1     # 显示一级子目录大小
```

### mount - 挂载文件系统
```bash
mount                   # 显示已挂载文件系统
mount /dev/sdb1 /mnt    # 挂载分区
mount -t type device dir # 指定类型挂载
mount -o loop iso.iso /mnt  # 挂载ISO文件
```

### umount - 卸载文件系统
```bash
umount /mnt             # 卸载目录
umount /dev/sdb1        # 卸载设备
```

### fdisk - 磁盘分区
```bash
fdisk -l                # 列出所有分区
fdisk /dev/sdb          # 对指定磁盘分区
```

### lsblk - 列出块设备
```bash
lsblk                   # 显示块设备信息
lsblk -f                # 显示文件系统信息
```

## 网络命令

### ifconfig - 网络接口配置（旧）
```bash
ifconfig                # 显示网络接口信息
ifconfig eth0           # 显示指定接口
ifconfig eth0 up        # 启用接口
ifconfig eth0 down      # 禁用接口
```

### ip - 网络配置（新）
```bash
ip addr                 # 显示IP地址
ip link                 # 显示网络接口
ip route                # 显示路由表
ip addr add IP/MASK dev eth0  # 添加IP地址
```

### ping - 测试连通性
```bash
ping host               # 测试主机连通性
ping -c 4 host          # 发送4个包
ping -i 2 host          # 间隔2秒发送
```

### netstat - 网络统计
```bash
netstat -a              # 显示所有连接
netstat -t              # 显示TCP连接
netstat -u              # 显示UDP连接
netstat -l              # 显示监听端口
netstat -p              # 显示进程信息
netstat -n              # 以数字形式显示
netstat -tulnp          # 常用组合
```

### ss - Socket统计（netstat替代）
```bash
ss -a                   # 显示所有socket
ss -t                   # 显示TCP socket
ss -l                   # 显示监听socket
ss -p                   # 显示进程信息
ss -tulnp               # 常用组合
```

### curl - URL传输工具
```bash
curl URL                # 获取URL内容
curl -O URL             # 下载文件
curl -o file URL        # 下载并重命名
curl -I URL             # 只显示响应头
curl -L URL             # 跟随重定向
curl -X POST URL        # 发送POST请求
curl -H "Header" URL    # 添加请求头
curl -d "data" URL      # 发送数据
```

### wget - 下载工具
```bash
wget URL                # 下载文件
wget -O file URL        # 下载并重命名
wget -c URL             # 断点续传
wget -b URL             # 后台下载
wget -r URL             # 递归下载
wget --limit-rate=200k URL  # 限速下载
```

### scp - 远程复制
```bash
scp file user@host:/path        # 上传文件
scp user@host:/path/file .      # 下载文件
scp -r dir user@host:/path      # 上传目录
scp -P port file user@host:/path # 指定端口
```

### rsync - 远程同步
```bash
rsync -av source dest           # 同步目录
rsync -avz source user@host:dest # 远程同步
rsync -av --delete source dest  # 删除目标多余文件
rsync -av --exclude='*.log' source dest  # 排除文件
```

### ssh - 远程登录
```bash
ssh user@host           # 远程登录
ssh -p port user@host   # 指定端口
ssh user@host command   # 远程执行命令
ssh-keygen              # 生成SSH密钥
ssh-copy-id user@host   # 复制公钥到远程主机
```

### telnet - 远程登录/测试端口
```bash
telnet host port        # 测试端口连通性
```

### nslookup - DNS查询
```bash
nslookup domain         # 查询域名DNS记录
```

### dig - DNS查询（增强版）
```bash
dig domain              # 查询域名
dig @8.8.8.8 domain     # 指定DNS服务器
dig domain MX           # 查询MX记录
```

### host - DNS查询
```bash
host domain             # 查询域名IP
```

### traceroute - 路由跟踪
```bash
traceroute host         # 跟踪到主机的路由
```

### nc - 网络工具
```bash
nc -l port              # 监听端口
nc host port            # 连接端口
nc -zv host port        # 扫描端口
```

## 用户管理

### useradd - 添加用户
```bash
useradd username                # 创建用户
useradd -m username             # 创建用户并创建家目录
useradd -d /home/dir username   # 指定家目录
useradd -s /bin/bash username   # 指定shell
useradd -g group username       # 指定主组
```

### userdel - 删除用户
```bash
userdel username        # 删除用户
userdel -r username     # 删除用户及家目录
```

### usermod - 修改用户
```bash
usermod -l newname oldname      # 修改用户名
usermod -d /new/home username   # 修改家目录
usermod -s /bin/zsh username    # 修改shell
usermod -aG group username      # 添加到附加组
```

### passwd - 修改密码
```bash
passwd                  # 修改当前用户密码
passwd username         # 修改指定用户密码
passwd -l username      # 锁定用户
passwd -u username      # 解锁用户
```

### groupadd - 添加组
```bash
groupadd groupname      # 创建组
groupadd -g GID groupname  # 指定GID创建组
```

### groupdel - 删除组
```bash
groupdel groupname      # 删除组
```

### groups - 显示用户组
```bash
groups                  # 显示当前用户所属组
groups username         # 显示指定用户所属组
```

### su - 切换用户
```bash
su                      # 切换到root
su username             # 切换到指定用户
su - username           # 切换用户并加载环境
```

### sudo - 以超级用户执行命令
```bash
sudo command            # 以root权限执行命令
sudo -u user command    # 以指定用户权限执行
sudo -i                 # 切换到root shell
sudo -l                 # 列出当前用户可用的sudo命令
```

## 包管理

### apt（Debian/Ubuntu）
```bash
apt update              # 更新软件包列表
apt upgrade             # 升级所有软件包
apt install package     # 安装软件包
apt remove package      # 卸载软件包
apt purge package       # 完全卸载（含配置）
apt search package      # 搜索软件包
apt show package        # 显示软件包信息
apt autoremove          # 删除不需要的依赖
apt clean               # 清理下载的包文件
```

### yum（CentOS/RHEL）
```bash
yum update              # 更新软件包
yum install package     # 安装软件包
yum remove package      # 卸载软件包
yum search package      # 搜索软件包
yum info package        # 显示软件包信息
yum list                # 列出所有软件包
yum clean all           # 清理缓存
```

### dnf（Fedora/CentOS 8+）
```bash
dnf update              # 更新软件包
dnf install package     # 安装软件包
dnf remove package      # 卸载软件包
dnf search package      # 搜索软件包
```

### pacman（Arch Linux）
```bash
pacman -S package       # 安装软件包
pacman -R package       # 卸载软件包
pacman -Syu             # 更新系统
pacman -Ss package      # 搜索软件包
pacman -Qi package      # 查看软件包信息
```

## 系统服务管理

### systemctl - 服务管理
```bash
systemctl start service         # 启动服务
systemctl stop service          # 停止服务
systemctl restart service       # 重启服务
systemctl reload service        # 重新加载配置
systemctl status service        # 查看服务状态
systemctl enable service        # 设置开机自启
systemctl disable service       # 禁用开机自启
systemctl list-units            # 列出所有单元
systemctl list-unit-files       # 列出所有单元文件
```

### service - 服务管理（旧）
```bash
service service_name start      # 启动服务
service service_name stop       # 停止服务
service service_name restart    # 重启服务
service service_name status     # 查看状态
```

## 环境变量

### export - 设置环境变量
```bash
export VAR=value        # 设置环境变量
export PATH=$PATH:/new/path  # 添加到PATH
```

### echo - 显示变量
```bash
echo $VAR               # 显示变量值
echo $PATH              # 显示PATH
```

### env - 显示所有环境变量
```bash
env                     # 显示所有环境变量
env VAR=value command   # 临时设置变量运行命令
```

### set - 显示所有变量
```bash
set                     # 显示所有变量（含shell变量）
```

### unset - 删除变量
```bash
unset VAR               # 删除变量
```

## 其他常用命令

### clear - 清屏
```bash
clear                   # 清除终端屏幕
```

### history - 命令历史
```bash
history                 # 显示命令历史
history 10              # 显示最近10条命令
!100                    # 执行第100条命令
!!                      # 执行上一条命令
!string                 # 执行最近以string开头的命令
```

### alias - 别名
```bash
alias                   # 显示所有别名
alias ll='ls -l'        # 创建别名
unalias ll              # 删除别名
```

### ln - 创建链接
```bash
ln file link            # 创建硬链接
ln -s file link         # 创建软链接（符号链接）
```

### tree - 树状显示目录
```bash
tree                    # 树状显示当前目录
tree -L 2               # 只显示2层
tree -a                 # 显示隐藏文件
```

### xargs - 参数传递
```bash
find . -name "*.txt" | xargs rm     # 查找并删除
ls | xargs -n 1 echo                # 每次传递1个参数
```

### tee - 双向输出
```bash
command | tee file      # 同时输出到屏幕和文件
command | tee -a file   # 追加到文件
```

### watch - 定期执行命令
```bash
watch command           # 每2秒执行一次命令
watch -n 5 command      # 每5秒执行一次
watch -d command        # 高亮显示变化
```

### cron - 定时任务
```bash
crontab -e              # 编辑定时任务
crontab -l              # 列出定时任务
crontab -r              # 删除所有定时任务
# 格式: 分 时 日 月 周 命令
# 示例: 0 2 * * * /path/to/script.sh  # 每天凌晨2点执行
```

### at - 一次性定时任务
```bash
at 10:00                # 在10点执行
at now + 1 hour         # 1小时后执行
atq                     # 查看待执行任务
atrm job_id             # 删除任务
```

### shutdown - 关机/重启
```bash
shutdown -h now         # 立即关机
shutdown -h 10          # 10分钟后关机
shutdown -r now         # 立即重启
shutdown -c             # 取消关机
```

### reboot - 重启
```bash
reboot                  # 重启系统
```

### halt - 关机
```bash
halt                    # 关机
```

### poweroff - 关机
```bash
poweroff                # 关机
```

### free - 内存使用
```bash
free                    # 显示内存使用情况
free -h                 # 人性化显示
free -m                 # 以MB为单位显示
```

### vmstat - 虚拟内存统计
```bash
vmstat                  # 显示虚拟内存统计
vmstat 2                # 每2秒更新一次
```

### iostat - IO统计
```bash
iostat                  # 显示IO统计
iostat -x               # 详细信息
```

### lsof - 列出打开的文件
```bash
lsof                    # 列出所有打开的文件
lsof /path/file         # 查看打开指定文件的进程
lsof -p PID             # 查看进程打开的文件
lsof -i :port           # 查看端口占用
lsof -u username        # 查看用户打开的文件
```

### dmesg - 内核消息
```bash
dmesg                   # 显示内核环缓冲区消息
dmesg | grep -i error   # 查看错误信息
dmesg -c                # 清空内核缓冲区
```

### journalctl - 日志查看
```bash
journalctl              # 查看所有日志
journalctl -u service   # 查看指定服务日志
journalctl -f           # 实时查看日志
journalctl --since today # 查看今天的日志
journalctl -p err       # 只显示错误级别日志
```

### tar命令组合技巧
```bash
# 打包并压缩到标准输出，再通过ssh传输
tar czf - /path | ssh user@host 'tar xzf - -C /dest'

# 解压时只提取特定文件
tar xzf archive.tar.gz file1 file2

# 追加文件到已存在的tar包（不能用于压缩包）
tar -rf archive.tar newfile
```

## 重定向和管道

```bash
command > file          # 标准输出重定向到文件（覆盖）
command >> file         # 标准输出追加到文件
command 2> file         # 标准错误重定向到文件
command &> file         # 标准输出和错误都重定向
command 2>&1            # 错误重定向到标准输出
command < file          # 从文件读取输入
command1 | command2     # 管道：命令1的输出作为命令2的输入
command1 && command2    # 命令1成功后执行命令2
command1 || command2    # 命令1失败后执行命令2
command &               # 后台运行命令
```