import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    BeforeInsert,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import * as bcrypt from 'bcryptjs';

@Entity()
export class User {
    /**
     * 检测密码是否一致
     * @param password0 加密前密码
     * @param password1 加密后密码
     */
    static async comparePassword(password0, password1) {
        return bcrypt.compareSync(password0, password1);
    }

    static encryptPassword(password) {
        return bcrypt.hashSync(password, 10);
    }
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ default: null })
    code: string;

    @Column({ length: 20 })
    username: string;

    @Column({ length: 20, default: null, charset: 'utf8' })
    nickname: string;


    @Column({ default: null })
    email: string;

    @Column({ default: null, length: 20})
    mobile: string;

    @Column({ type: 'boolean', default: false })
    mobileAuth: boolean;

    @Column({ type: 'boolean', default: false })
    emailAuth: boolean;

    @Exclude()
    @Column({ length: 100 })
    password: string;
    @Column({default: null, length: 20 })
    pwdQ: string;
    @Column({default: null, length: 50 })
    pwdA: string;

    @Column({ default: null })
    domain: string;

    @Column({ default: null })
    ip: string;

    @Column({ default: null })
    device: string;

    @Column({ type: 'mediumtext', default: null, charset: 'utf8mb4' })
    summary: string; // 摘要，自动生成


    @Column({ type: 'mediumtext', default: null, charset: 'utf8mb4' })
    content: string; // 原始内容，hash值存储txt文件


    @Column({ type: 'int', default: 0 })
    sex: number;

    @Column({ default: null })
    cover: string; // 封面图

    @Column({ type: 'boolean', default: false })
    author: boolean; // 是否作家

    @Column({ type: 'int', default: 0 })
    articles: number;

    @Column({ type: 'int', default: 0 })
    hot: number;

    @Column({ type: 'float', default: null })
    lat: number;

    @Column({ type: 'float', default: null })
    lng: number;

    @Column({ length: 100, default: null, charset: 'utf8' })
    address: string;

    @Column({ type: 'int', default: 0 })
    followers: number;

    @Column({ type: 'int', default: 0 })
    role: number; // 用户角色

    @Column({ type: 'int', default: 0 })
    level: number; // 用户等级

    @Column({ type: 'int', default: 0 })
    integral: number; // 经验

    @Column({ type: 'int', default: 0 })
    coin: number; // 经验

    @Column({length: 100, default: null  })
    parent: string;

    // @Column('simple-enum', { enum: ['locked', 'active'], default: 'active' })
    @Column({ type: 'int', default: 0 })
    status: number; // 用户状态

    @CreateDateColumn()
    createAt: Date;

    @UpdateDateColumn()
    updateAt: Date;

    /**
     * 插入数据前，对密码进行加密
     */
    @BeforeInsert()
    encrypt() {
        // this.pwdA = bcrypt.hashSync(this.pwdA, 10);
        this.password = bcrypt.hashSync(this.password, 10);
    }
}
