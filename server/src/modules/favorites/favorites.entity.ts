import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn, ManyToOne, JoinTable,
} from 'typeorm';
import {User} from '../user/user.entity';
import {Article} from "../article/article.entity";

@Entity()
export class Favorites {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(
        () => User,
        (user) => user.id,
        { cascade: true}
    )
    @JoinTable()
    user: User;

    @ManyToOne(
        () => Article,
        (article)  => article.id,
        { cascade:true }
    )
    @JoinTable()
    article: Article;

    // @Column()
    // hostId: string; // 关联家谱或页面 id

    @CreateDateColumn()
    createAt: Date;

    @UpdateDateColumn()
    updateAt: Date;
}
