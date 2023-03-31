
前阵子挤了个多月时间弄了个家谱网站，相较于当前所有家谱类网站（我所查到的）有以下区别。

1. 加入了地理坐标，更容易查找/区分同名人物/家谱
2. 最早至汉代年号的天干地支日历，方便对古谱/碑文日期进行精确记录
3. 多人协作共同发编修本族家谱，比如兄弟各自发展到十几代后，分支间相互不甚了解却能追溯到共同先祖时，可加入同一家谱共同编修
4. 一目了然的成员树图谱，除了传统父子继承关系，还加入了配偶、女儿、义子/女
5. 可以记录每个人的生平故事
6. 支持加密访问和随时备份到本地

-----

在线演示： https://www.jiapuu.com

没太多时间和精力继续，有兴趣的学习nodejs、nestjs 的clone试下吧


nestjs 生成命令

cd src/modules
nest g mo account
nest g co account
nest g s account


node 版本 14.16
系统要求 redis mysql mp2 git nginx

数据库名称 jiapu

cd /data/jiapu/server
mkdir config

首次启动node server，端口3016
pm2 start ./server/main.js --name='jiapu'




