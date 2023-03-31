import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn
} from 'typeorm';

@Entity()
export class VerificationCode {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 20 })
    username: string;

    // 1. 邮箱验证码；2.短信验证码
    @Column({ type: 'int', default: 0 })
    type: string;

    // 验证码
    @Column({ default: null })
    code: string;

    @Column({ default: null })
    email: string;

    @Column({ default: null, length: 20})
    mobile: string;

    // 是否已经使用
    @Column({ type: 'boolean', default: false })
    isUsed: boolean;

    @CreateDateColumn()
    createAt: Date;

    @UpdateDateColumn()
    updateAt: Date;
}
