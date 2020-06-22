import {MigrationInterface, QueryRunner} from "typeorm";

export class DaemonConfig1591886751089 implements MigrationInterface {
    name = 'DaemonConfig1591886751089'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "config_registry" ("id" SERIAL NOT NULL, "daemonId" uuid NOT NULL, "dockerId" uuid, CONSTRAINT "REL_5309b5bd49d20edfc90b3e7dd2" UNIQUE ("daemonId"), CONSTRAINT "REL_9399554fa82ae91faf2afa805a" UNIQUE ("dockerId"), CONSTRAINT "PK_02735cd3d855936427060ba7393" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "docker_config" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "version" integer NOT NULL, "image" character varying NOT NULL, "env" json NOT NULL, CONSTRAINT "PK_ca3632cebd29e81c25650ffe9ef" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`ALTER TABLE "config_registry" ADD CONSTRAINT "FK_5309b5bd49d20edfc90b3e7dd22" FOREIGN KEY ("daemonId") REFERENCES "daemon"("id") ON DELETE CASCADE ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "config_registry" ADD CONSTRAINT "FK_9399554fa82ae91faf2afa805a5" FOREIGN KEY ("dockerId") REFERENCES "docker_config"("id") ON DELETE CASCADE ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "config_registry" DROP CONSTRAINT "FK_9399554fa82ae91faf2afa805a5"`, undefined);
        await queryRunner.query(`ALTER TABLE "config_registry" DROP CONSTRAINT "FK_5309b5bd49d20edfc90b3e7dd22"`, undefined);
        await queryRunner.query(`DROP TABLE "docker_config"`, undefined);
        await queryRunner.query(`DROP TABLE "config_registry"`, undefined);
    }

}
