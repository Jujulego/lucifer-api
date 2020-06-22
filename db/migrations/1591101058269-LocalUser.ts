import {MigrationInterface, QueryRunner} from "typeorm";

export class LocalUser1591101058269 implements MigrationInterface {
    name = 'LocalUser1591101058269'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "local_user" ("id" character varying NOT NULL, CONSTRAINT "PK_a3e985b84a3998ad4503d3f0d4b" PRIMARY KEY ("id"))`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "local_user"`, undefined);
    }

}
