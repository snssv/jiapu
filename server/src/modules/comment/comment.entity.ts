import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn, ManyToOne, JoinTable,
} from 'typeorm';
import {User} from '../user/user.entity';

@Entity()
export class Comment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(
        () => User,
        (user) => user.id,
        { cascade: true}
    )
    @JoinTable()
    user: User;

    @Column({ length: 20, default: null, charset: 'utf8' })
    nickname: string; // 联系方式

    // @Column()
    // email: string; // 联系方式

    @Column({ type: 'mediumtext', default: null, charset: 'utf8mb4' }) // 评论内容
    content: string;

    @Column({ type: 'boolean', default: false })
    pass: boolean; // 是否审核通过


    @Column({ default: 0 })
    status: number; // 状态  0正常，1隐藏

    // @Column({ type: 'mediumtext', default: null, charset: 'utf8mb4' })
    // userAgent: string;

    @Column()
    hostId: string; // 关联家谱或页面 id


    @Column({ default: null })
    ip: string;

    @Column({ default: null })
    device: string;

    @Column({ default: 0 })
    feeling: number; // 点赞数

    @Column({ default: 0 })
    type: number; // 0 article 1 page 2 comment

    @Column({ default: null })
    parentId: string; // 父级评论 id

    @CreateDateColumn()
    createAt: Date;

    @UpdateDateColumn()
    updateAt: Date;
}
