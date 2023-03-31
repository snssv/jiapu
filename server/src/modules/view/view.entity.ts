import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity()
export class View {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    ip: string;

    @Column({ default: null })
    device: string;
    
    @Column({ type: 'text', default: null })
    userAgent: string;

    @Column({ type: 'text', default: null })
    url: string;

    @Column({ default: 1 })
    count: number; // 同一 userAgent ，同一 url 的访问量

    @Column({ type: 'text', default: null })
    address: string; // 访问地址

    @CreateDateColumn()
    createAt: Date;

    @UpdateDateColumn()
    updateAt: Date;
}
