import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn, ManyToOne, JoinTable,
} from 'typeorm';
import {User} from '../user/user.entity';

@Entity()
export class Feeling {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(
        () => User,
        (user) => user.id,
        { cascade: true}
    )
    @JoinTable()
    user: User;


    @Column()
    hostId: string; // 关联家谱或页面 id

    @Column({ default: 0 })
    val: number;

    @Column({ default: 0 })
    type: number;

    @CreateDateColumn()
    createAt: Date;

    @UpdateDateColumn()
    updateAt: Date;
}
