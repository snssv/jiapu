import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as dayjs from 'dayjs';
import * as nuid from 'nuid';
import * as fs from 'fs-extra';
import { join } from 'path';
import { SettingService } from '../setting/setting.service';
import { File } from './file.entity';

const mkdirp = require('mkdirp')
const getDirName = require('path').dirname
let OSS = require('ali-oss');

@Injectable()
export class FileService {
    constructor(
        @InjectRepository(File)
        private readonly fileRepository: Repository<File>,
        private readonly settingService: SettingService
    ) {}
    /**
     * 上传文件
     * @param file
     */
    // async uploadFiles(files, userId) {
    //     console.log(files)
    //     let newArr = [];
    //     await files.article.forEach(file => {
    //         const { originalname, mimetype, size, buffer } = file;
    //         // FIXME: 使用 uuid ，无法管理，改成相应资源包名
    //         const extname = (mimetype.replace('image/',''));
    //
    //         if (!/^jpg|jpeg|gif|svg|png|webp$/.test(extname)) {
    //             throw new HttpException('图片格式不合法', HttpStatus.BAD_REQUEST);
    //         }
    //         if (size>(1024*1024*5)) {
    //             throw new HttpException('图片最大限制5MB', HttpStatus.BAD_REQUEST);
    //         }
    //
    //     })
    //     await files.article.forEach(file => {
    //         const { originalname, mimetype, size, buffer } = file;
    //         // FIXME: 使用 uuid ，无法管理，改成相应资源包名
    //         const extname = (mimetype.replace('image/',''));
    //         const filename = `${dayjs().format('YYYYMMDDHHmmss')}${Math.round(Math.random() * 9347)}.${extname}`;
    //
    //         const pt = join(__dirname, '../../../upload/cdn/'+userId+'/img/')+filename
    //         mkdirp(getDirName(pt), (err,data) => {
    //             // console.log(err)
    //             // console.log(data)
    //             if (err) return false;
    //             fs.writeFileSync(pt, buffer)
    //         })
    //         const newFile = this.fileRepository.create({
    //             originalname,
    //             filename,
    //             url: userId,
    //             type: mimetype,
    //             size,
    //         });
    //         this.fileRepository.save(newFile);
    //         newArr.push(newFile.filename)
    //     })
    //
    //     return newArr;
    // }
    dirPath () {
        let ps = '../../../upload/cdn/';
        if (__dirname.indexOf('yangshu') >= 0 ){
            ps = '../../../../upload/cdn/';
        }
        // console.log(ps);
        return ps
    }
    async uploadFile(id, files) {
        const {type, file, filename} = files;
        if (!filename || !type || !file) {
            throw new HttpException('参数缺失', HttpStatus.BAD_REQUEST);
        }
        const pt = join(__dirname, this.dirPath() + id + '/img/' + filename + '.jpg');
        // console.log(pt)
        const base64Data = file.replace(/^data:image\/\w+;base64,/, '');
        const dataBuffer = Buffer.from(base64Data, 'base64');
        await mkdirp(getDirName(pt), (err) => {
            if (err) { return false; }
            fs.writeFileSync(pt, dataBuffer);
        });
        const newFile = this.fileRepository.create({
            ...files,
            url: id,
            size: file.length,
        });
        this.fileRepository.save(newFile);

        setTimeout(() => {
            return newFile;
        }, 2000);
    }

    /**
     * 获取所有文件
     */
    async findAll(queryParams: any = {}): Promise<[File[], number]> {
        const query = this.fileRepository
            .createQueryBuilder('file')
            .orderBy('file.createAt', 'DESC');

        const { page = 1, pageSize = 30, pass, ...otherParams } = queryParams;

        query.skip((+page - 1) * +pageSize);
        query.take(+pageSize);

        if (otherParams) {
            Object.keys(otherParams).forEach(key => {
                query
                    .andWhere(`file.${key} LIKE :${key}`)
                    .setParameter(`${key}`, `%${otherParams[key]}%`);
            });
        }
        return query.getManyAndCount();
    }


    /**
     * 获取指定文件
     * @param id
     */
    async findById(id): Promise<File> {
        return this.fileRepository.findOne(id);
    }

    async findByIds(ids): Promise<Array<File>> {
        return this.fileRepository.findByIds(ids);
    }

    /**
     * 删除文件
     * @param id
     */
    async deleteById(userId, id, isAdmin= false) {
        const tag = await this.fileRepository.findOne(id);
        if (!tag) {
            throw new HttpException('文件不存在', HttpStatus.I_AM_A_TEAPOT);
        } else
        if (isAdmin || userId === tag.url) {
            const pt = join(__dirname, this.dirPath()) + tag.url + '/img/' + tag.filename + '.jpg';
            await fs.unlinkSync(pt);

            return this.fileRepository.remove(tag);

        } else {
            throw new HttpException('没有权限', HttpStatus.I_AM_A_TEAPOT);
        }
    }

    async getDocument() {

        let arr = [];
        const files = fs.readdirSync(join(__dirname, this.dirPath() + 'document/'));

        files.forEach(function(file) {
            // if (/md$/.test(file)) {
            //     // arr.push(file.replace('.md',''))
            // }
            arr.push(file)
        });
        arr.sort();
        // arr.reverse();

        return arr
    }

    async postDocument(par) {

        const {name, content} = par;

        if (!name || !content) {
            throw new HttpException('文件内容缺失', HttpStatus.BAD_REQUEST);
        }
        const pt = join(__dirname, this.dirPath() + 'document/') + name;
        await mkdirp(getDirName(pt), (err, data) => {
            if (err) return false;
            fs.writeFileSync(pt, content)
        });
        return 'ok';
    }
    async postDocumentDelete(par) {

        const {name} = par;

        if (!name) {
            throw new HttpException('文件内容缺失', HttpStatus.BAD_REQUEST);
        }

        const pt = join(__dirname, this.dirPath() + 'document/') + name;
        await fs.unlinkSync(pt);

        return 'ok';
    }
}
