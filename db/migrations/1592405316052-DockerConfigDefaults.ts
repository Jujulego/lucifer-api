import {MigrationInterface, QueryRunner} from "typeorm";

export class DockerConfigDefaults1592405316052 implements MigrationInterface {
    name = 'DockerConfigDefaults1592405316052'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "docker_config" ALTER COLUMN "image" DROP NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "docker_config" ALTER COLUMN "env" SET DEFAULT '{}'`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "docker_config" ALTER COLUMN "env" DROP DEFAULT`, undefined);
        await queryRunner.query(`ALTER TABLE "docker_config" ALTER COLUMN "image" SET NOT NULL`, undefined);
    }

}
