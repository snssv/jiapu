import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn, ManyToOne, JoinTable,
} from 'typeorm';
import {User} from '../user/user.entity';

@Entity()
export class Manage {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(
        () => User,
        (user) => user.id,
        { cascade: true},
    )
    @JoinTable()
    fromUser: User;
    @ManyToOne(
        () => User,
        (user) => user.id,
        { cascade: true},
    )
    @JoinTable()
    toUser: User;

    @Column({ type: 'mediumtext', default: null, charset: 'utf8mb4' }) // 评论内容
    content: string;

    @Column({ default: 0 })
    pass: number; // 是否审核通过

    @Column({ default: 0 })
    status: number; // 状态  0正常，1隐藏

    @Column()
    hostId: string; // 关联家谱id
    @Column()
    hostName: string; // 关联家谱始祖姓名

    @CreateDateColumn()
    createAt: Date;

    @UpdateDateColumn()
    updateAt: Date;
}
