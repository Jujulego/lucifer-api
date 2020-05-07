import {MigrationInterface, QueryRunner} from "typeorm";

export class RoleRights1588885155392 implements MigrationInterface {
    name = 'RoleRights1588885155392'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "rule" ADD "create" boolean NOT NULL DEFAULT false`, undefined);
        await queryRunner.query(`ALTER TABLE "rule" ADD "read" boolean NOT NULL DEFAULT false`, undefined);
        await queryRunner.query(`ALTER TABLE "rule" ADD "write" boolean NOT NULL DEFAULT false`, undefined);
        await queryRunner.query(`ALTER TABLE "rule" ADD "delete" boolean NOT NULL DEFAULT false`, undefined);
        await queryRunner.query(`ALTER TABLE "role" ADD "create" boolean NOT NULL DEFAULT false`, undefined);
        await queryRunner.query(`ALTER TABLE "role" ADD "read" boolean NOT NULL DEFAULT false`, undefined);
        await queryRunner.query(`ALTER TABLE "role" ADD "write" boolean NOT NULL DEFAULT false`, undefined);
        await queryRunner.query(`ALTER TABLE "role" ADD "delete" boolean NOT NULL DEFAULT false`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "role" DROP COLUMN "delete"`, undefined);
        await queryRunner.query(`ALTER TABLE "role" DROP COLUMN "write"`, undefined);
        await queryRunner.query(`ALTER TABLE "role" DROP COLUMN "read"`, undefined);
        await queryRunner.query(`ALTER TABLE "role" DROP COLUMN "create"`, undefined);
        await queryRunner.query(`ALTER TABLE "rule" DROP COLUMN "delete"`, undefined);
        await queryRunner.query(`ALTER TABLE "rule" DROP COLUMN "write"`, undefined);
        await queryRunner.query(`ALTER TABLE "rule" DROP COLUMN "read"`, undefined);
        await queryRunner.query(`ALTER TABLE "rule" DROP COLUMN "create"`, undefined);
    }

}
