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
import {Article} from '../article/article.entity';

@Entity()
export class People {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ default: null })
    code: string;

    @Column({ default: null })
    cover: string; // 封面图

    @Column({ length: 8, default: null, charset: 'utf8' })
    name: string;

    @Column({ default: 1 })
    sex: number;
    @Column({ type: 'boolean', default: false })
    public: boolean;
    @Column({ length: 100, default: null, charset: 'utf8'  })
    tag: string;

    @Column({ length: 8, default: null, charset: 'utf8' })
    clan: string; // 民族

    @Column({ type: 'mediumtext', default: null, charset: 'utf8mb4' })
    tree: string;
    @Column({ type: 'mediumtext', default: null, charset: 'utf8mb4' })
    summary: string; // 摘要，自动生成

    @Column({ type: 'mediumtext', default: null, charset: 'utf8mb4' })
    content: string; // 原始内容，hash值存储txt文件

    @ManyToOne(
        () => User,
        (user) => user.id,
        { cascade: true },
    )
    @JoinTable()
    user: User;

    @Column({ length: 2000, default: null, charset: 'utf8' })
    catalog: string;

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
    device: string;

    @Column({type: 'bigint', default: null})
    birthAt: number;

    @Column({type: 'bigint', default: null})
    deathAt: number;

    @CreateDateColumn()
    createAt: Date;

    @UpdateDateColumn()
    updateAt: Date;
}
