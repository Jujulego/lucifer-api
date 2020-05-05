import {MigrationInterface, QueryRunner} from "typeorm";

export class Role1588679938853 implements MigrationInterface {
    name = 'Role1588679938853'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "rule" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "resource" character varying(128) NOT NULL, "target" uuid, "roleId" uuid, "parentId" uuid, CONSTRAINT "PK_a5577f464213af7ffbe866e3cb5" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_d33140e0198c37ed472f67b289" ON "rule" ("roleId", "resource", "target") `, undefined);
        await queryRunner.query(`CREATE TABLE "role" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(128), CONSTRAINT "PK_b36bcfe02fc8de3c57a8b2391c2" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`ALTER TABLE "rule" ADD CONSTRAINT "FK_97045b469c2a8d50b69c00328d2" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "rule" ADD CONSTRAINT "FK_6c641d8fcb879a1aee4cfc2169b" FOREIGN KEY ("parentId") REFERENCES "rule"("id") ON DELETE CASCADE ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "rule" DROP CONSTRAINT "FK_6c641d8fcb879a1aee4cfc2169b"`, undefined);
        await queryRunner.query(`ALTER TABLE "rule" DROP CONSTRAINT "FK_97045b469c2a8d50b69c00328d2"`, undefined);
        await queryRunner.query(`DROP TABLE "role"`, undefined);
        await queryRunner.query(`DROP INDEX "IDX_d33140e0198c37ed472f67b289"`, undefined);
        await queryRunner.query(`DROP TABLE "rule"`, undefined);
    }

}
