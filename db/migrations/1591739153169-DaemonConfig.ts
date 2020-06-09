import {MigrationInterface, QueryRunner} from "typeorm";

export class DaemonConfig1591739153169 implements MigrationInterface {
    name = 'DaemonConfig1591739153169'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "daemon_config" ("daemon" character varying NOT NULL, "image" character varying, "env" json, "type" character varying NOT NULL, "daemonId" uuid NOT NULL, CONSTRAINT "REL_e6dd000800ad5f7108a4635adc" UNIQUE ("daemonId"), CONSTRAINT "PK_c0e91987388aba980c08685e8c2" PRIMARY KEY ("daemon"))`, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_4ad80d0040790114b3d02a845d" ON "daemon_config" ("type") `, undefined);
        await queryRunner.query(`ALTER TABLE "daemon_config" ADD CONSTRAINT "FK_e6dd000800ad5f7108a4635adcd" FOREIGN KEY ("daemonId") REFERENCES "daemon"("id") ON DELETE CASCADE ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "daemon_config" DROP CONSTRAINT "FK_e6dd000800ad5f7108a4635adcd"`, undefined);
        await queryRunner.query(`DROP INDEX "IDX_4ad80d0040790114b3d02a845d"`, undefined);
        await queryRunner.query(`DROP TABLE "daemon_config"`, undefined);
    }

}
