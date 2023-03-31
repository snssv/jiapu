import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Search {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    type: string; // 搜索类型
    @Column({type: 'boolean', default: false})
    locked: boolean; // 搜索类型

    @Column({ length: 100, default: null, charset: 'utf8' })
    keyword: string; // 搜索关键词

    @Column({ default: 1 })
    count: number;

    @CreateDateColumn()
    createAt: Date;

    @UpdateDateColumn()
    updateAt: Date;
}
