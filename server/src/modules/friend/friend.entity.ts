import {Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn} from 'typeorm';

@Entity()
export class FriendMap {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    friendId: string;

    @Column()
    userId: string;

    @Column({default:0})
    status: number; // 0 待通过 1通过 2 拒绝

    @CreateDateColumn()
    createAt: Date;

    @UpdateDateColumn()
    updateAt: Date;
}
