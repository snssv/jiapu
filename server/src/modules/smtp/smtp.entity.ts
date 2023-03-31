import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity()
export class SMTP {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'text', default: null })
    from: string; // 发件人

    @Column({ type: 'text', default: null })
    to: string; // 收件人

    @Column({ type: 'text', default: null })
    subject: string; // 主题

    @Column({ type: 'text', default: null })
    text: string; // 文本内容

    @Column({ type: 'text', default: null })
    html: string; // html 内容

    @CreateDateColumn()
    createAt: Date;


}
