import {Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn} from 'typeorm';
import {User} from "../user/user.entity";

@Entity()
export class Follows {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(
        () => User,
        (user) => user.id,
        { cascade:true}
    )
    from: User;

    @ManyToOne(
        () => User,
        (user) => user.id,
        { cascade:true}
    )
    to: User;

    @Column()
    type: number;


    @CreateDateColumn()
    createAt: Date;

    @UpdateDateColumn()
    updateAt: Date;
}
