import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn, ManyToOne, JoinTable,
} from 'typeorm';

@Entity()
export class Backup {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'mediumtext', default: null, charset: 'utf8mb4' })
    content: string;

    @Column({ default: 0 })
    status: number; // 状态  0正常，1隐藏

    @Column()
    hostId: string; // 关联家谱id
    @Column()
    hostName: string; // 关联家谱始祖姓名

    @CreateDateColumn()
    createAt: Date;
}
