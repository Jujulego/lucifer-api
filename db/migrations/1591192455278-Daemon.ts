import {MigrationInterface, QueryRunner} from "typeorm";

export class Daemon1591192455278 implements MigrationInterface {
    name = 'Daemon1591192455278'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "daemon" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "ownerId" character varying, CONSTRAINT "PK_5c09cb3f741a21cebb3fe015c6e" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`ALTER TABLE "daemon" ADD CONSTRAINT "FK_e3786bb15020acb034755b4b7fb" FOREIGN KEY ("ownerId") REFERENCES "local_user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "daemon" DROP CONSTRAINT "FK_e3786bb15020acb034755b4b7fb"`, undefined);
        await queryRunner.query(`DROP TABLE "daemon"`, undefined);
    }

}
