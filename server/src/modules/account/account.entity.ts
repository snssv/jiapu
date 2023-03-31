import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    JoinTable,
    ManyToOne, BeforeInsert,
} from 'typeorm';
import {User} from '../user/user.entity';
import {Exclude} from 'class-transformer';
import * as bcrypt from 'bcryptjs';

@Entity()
export class Account {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(
        () => User,
        (user) => user.id,
        { cascade: true }
    )
    @JoinTable()
    user: User;

    @Column({ length: 20 })
    username: string;

    @Exclude()
    @Column({ length: 100 })
    password: string;

    @Column({ default: 0 })
    status: number; // 状态  0正常，1隐藏

    @Column({ default: null })
    email: string;

    @Column({ default: null, length: 20})
    mobile: string;

    @Column({ type: 'boolean', default: false })
    mobileAuth: boolean;

    @Column({ type: 'boolean', default: false })
    emailAuth: boolean;

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

    /**
     * 插入数据前，对密码进行加密
     */
    @BeforeInsert()
    encrypt() {
        this.password = bcrypt.hashSync(this.password, 10);
    }
}
