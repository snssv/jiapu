import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    JoinTable,
    ManyToOne,
} from 'typeorm';
import {User} from '../user/user.entity';

@Entity()
export class Article {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ default: null })
    cover: string; // 封面图

    @Column({ type: 'mediumtext', default: null, charset: 'utf8mb4' })
    tree: string; // JSON成员树

    @Column({ length: 8, default: null, charset: 'utf8' })
    clan: string; // 民族

    @Column({ length: 8, default: null, charset: 'utf8' })
    ancestor: string; // 始祖

    @Column({ default: null})
    ancestorId: string; // 始祖Id

    @Column({ default: null})
    manageId: string; // 管理员Id ,分割

    @Column({ length: 50, default: null, charset: 'utf8' })
    seniority: string; // 字辈
    @Column({ default: false })
    private: boolean; // 访问码
    @Column({ length: 4, default: null, charset: 'utf8' })
    privateCode: string; // 访问码

    @Column({ type: 'mediumtext', default: null, charset: 'utf8mb4' })
    content: string; // 原始内容，hash值存储txt文件

    @ManyToOne(
        () => User,
        (user) => user.id,
        { cascade: true },
    )
    @JoinTable()
    user: User;

    @Column({ default: 0 })
    status: number; // 状态  0正常，1隐藏

    @Column({ type: 'int', default: 0 })
    views: number; // 阅读量

    @Column({ type: 'int', default: 0 })
    comment: number; // 评论数量

    @Column({ type: 'int', default: 0 })
    feeling: number; // 表态数量

    @Column({ type: 'float', default: null })
    lat: number;

    @Column({ type: 'float', default: null })
    lng: number;

    @Column({ length: 100, default: null, charset: 'utf8' })
    address: string;

    @Column({ default: null })
    nickname: string;

    @Column({ default: null })
    domain: string;

    @Column({ default: null })
    ip: string;

    @Column({ default: null })
    device: string;

    @CreateDateColumn()
    createAt: Date;

    @UpdateDateColumn()
    updateAt: Date;
}
