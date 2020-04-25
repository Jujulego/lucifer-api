import {MigrationInterface, QueryRunner} from "typeorm";

export class Token1587854394325 implements MigrationInterface {
    name = 'Token1587854394325'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "token" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "date" TIMESTAMP NOT NULL DEFAULT now(), "ip" inet NOT NULL, "tags" character varying(64) array NOT NULL, "userId" uuid, CONSTRAINT "PK_82fae97f905930df5d62a702fc9" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`ALTER TABLE "token" ADD CONSTRAINT "FK_94f168faad896c0786646fa3d4a" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "token" DROP CONSTRAINT "FK_94f168faad896c0786646fa3d4a"`, undefined);
        await queryRunner.query(`DROP TABLE "token"`, undefined);
    }

}
