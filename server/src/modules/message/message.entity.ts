import {Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn} from 'typeorm';
import {User} from '../user/user.entity';

@Entity()
export class Message {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(
        () => User,
        (user) => user.id,
        { cascade: true},
    )
    fromUser: User;

    @ManyToOne(
        () => User,
        (user) => user.id,
        { cascade: true},
    )
    toUser: User;

    @Column()
    type: number;

    @Column()
    hostId: string; // 关联id
    @Column()
    hostName: string; // 关联姓名

    @Column({default: 0})
    status: number;

    @Column({ length: 500, default: null, charset: 'utf8' })
    content: string;

    @CreateDateColumn()
    createAt: Date;

    @UpdateDateColumn()
    updateAt: Date;
}
