import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity()
export class File {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 100, default: null, charset: 'utf8' })
    originalname: string; // 文件名

    @Column({default: ''})
    filename: string; // 文件名

    @Column({default: ''})
    type: string; // 文件信息

    @Column({default: 0})
    size: number; // 文件大小

    @Column({default:''})
    url: string;

    @CreateDateColumn()
    createAt: Date;

}
