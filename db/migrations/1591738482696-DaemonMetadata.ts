import {MigrationInterface, QueryRunner} from "typeorm";

export class DaemonMetadata1591738482696 implements MigrationInterface {
    name = 'DaemonMetadata1591738482696'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "daemon_dependencies" ("dependent" uuid NOT NULL, "dependency" uuid NOT NULL, CONSTRAINT "PK_7e728fbea6cc0c2a8b7920ccd6f" PRIMARY KEY ("dependent", "dependency"))`, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_28992105a9aac461ba2faeb5ba" ON "daemon_dependencies" ("dependent") `, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_2df389a0d5432561d0ded00b67" ON "daemon_dependencies" ("dependency") `, undefined);
        await queryRunner.query(`ALTER TABLE "daemon" ADD "name" character varying(100)`, undefined);
        await queryRunner.query(`ALTER TABLE "daemon_dependencies" ADD CONSTRAINT "FK_28992105a9aac461ba2faeb5bac" FOREIGN KEY ("dependent") REFERENCES "daemon"("id") ON DELETE CASCADE ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "daemon_dependencies" ADD CONSTRAINT "FK_2df389a0d5432561d0ded00b67d" FOREIGN KEY ("dependency") REFERENCES "daemon"("id") ON DELETE CASCADE ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "daemon_dependencies" DROP CONSTRAINT "FK_2df389a0d5432561d0ded00b67d"`, undefined);
        await queryRunner.query(`ALTER TABLE "daemon_dependencies" DROP CONSTRAINT "FK_28992105a9aac461ba2faeb5bac"`, undefined);
        await queryRunner.query(`ALTER TABLE "daemon" DROP COLUMN "name"`, undefined);
        await queryRunner.query(`DROP INDEX "IDX_2df389a0d5432561d0ded00b67"`, undefined);
        await queryRunner.query(`DROP INDEX "IDX_28992105a9aac461ba2faeb5ba"`, undefined);
        await queryRunner.query(`DROP TABLE "daemon_dependencies"`, undefined);
    }

}
