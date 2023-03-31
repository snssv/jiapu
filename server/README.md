# `@wipi/server`

后台服务。配置文件在 `./src/config`。

## 模块

### 用户

- `POST /user/register`：用户注册（`name`、`password`）
- `POST /auth/login`：用户登录（`name`、`password`）
- `POST /user/update`：更新用户信息
- `POST /user/password`：更新用户密码（`oldPassword`、`newPassword`）

