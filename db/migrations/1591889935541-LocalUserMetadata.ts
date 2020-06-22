import {MigrationInterface, QueryRunner} from "typeorm";

export class LocalUserMetadata1591889935541 implements MigrationInterface {
    name = 'LocalUserMetadata1591889935541'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "local_user" ADD "email" character varying NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "local_user" ADD "name" character varying NOT NULL`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "local_user" DROP COLUMN "name"`, undefined);
        await queryRunner.query(`ALTER TABLE "local_user" DROP COLUMN "email"`, undefined);
    }

}
