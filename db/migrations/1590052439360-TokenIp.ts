import {MigrationInterface, QueryRunner} from "typeorm";

export class TokenIp1590052439360 implements MigrationInterface {
    name = 'TokenIp1590052439360'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "token" ADD "ip" inet`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "token" DROP COLUMN "ip"`, undefined);
    }

}
