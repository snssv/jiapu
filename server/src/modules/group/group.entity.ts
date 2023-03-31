import {Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne} from 'typeorm';
import {User} from "../user/user.entity";

@Entity()
export class Group {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(
        () => User,
        (user)  => user.id,
        { cascade:true}
    )
    host: User;

    @Column({ default: null })
    name: string;

    @Column({ type: 'int', default: 0 })
    level: number;

    @Column({ default: null })
    cover: string; // 封面图

    @Column({ type: 'float', default: null })
    lat: number;

    @Column({ type: 'float', default: null })
    lng: number;

    @Column({ default: null })
    summary: string;

    @Column({ default: null , select:false})
    password: string;

    @CreateDateColumn()
    createAt: Date;

    @UpdateDateColumn()
    updateAt: Date;
}

@Entity()
export class GroupMap {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(
        () => Group,
        (group)  => group.id,
        { cascade:true}
    )
    group: Group;


    @ManyToOne(
        () => User,
        (user)  => user.id,
        { cascade:true}
    )
    user: User;

    @ManyToOne(
        () => User,
        (user)  => user.id,
        { cascade:true}
    )
    host: User;

    @Column({default:0})
    role: number; // 1 admin 2 创建者

    @Column({default:0})
    status: number; // 0 待通过 1通过 2 拒绝

    @CreateDateColumn()
    createAt: Date;
}

