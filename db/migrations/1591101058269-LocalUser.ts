import {MigrationInterface, QueryRunner} from "typeorm";

export class LocalUser1591101058269 implements MigrationInterface {
    name = 'LocalUser1591101058269'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "local_user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "auth0" character varying NOT NULL, CONSTRAINT "UQ_f4e6eb6a4c47fb01509e79bf370" UNIQUE ("auth0"), CONSTRAINT "PK_a3e985b84a3998ad4503d3f0d4b" PRIMARY KEY ("id"))`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "local_user"`, undefined);
    }

}
