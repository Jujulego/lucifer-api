import {MigrationInterface, QueryRunner} from "typeorm";

export class UserRole1588887119377 implements MigrationInterface {
    name = 'UserRole1588887119377'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "token" DROP CONSTRAINT "FK_94f168faad896c0786646fa3d4a"`, undefined);
        await queryRunner.query(`ALTER TABLE "daemon" DROP CONSTRAINT "FK_e3786bb15020acb034755b4b7fb"`, undefined);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_cace4a159ff9f2512dd42373760" UNIQUE ("id")`, undefined);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "id" DROP DEFAULT`, undefined);
        await queryRunner.query(`INSERT INTO "role" SELECT "user"."id" FROM "user" LEFT JOIN "role" ON "role"."id" = "user"."id" WHERE "role"."id" IS NULL`);
        // await queryRunner.query(`DROP SEQUENCE "user_id_seq"`, undefined);
        await queryRunner.query(`ALTER TABLE "token" ADD CONSTRAINT "FK_94f168faad896c0786646fa3d4a" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_cace4a159ff9f2512dd42373760" FOREIGN KEY ("id") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "daemon" ADD CONSTRAINT "FK_e3786bb15020acb034755b4b7fb" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "daemon" DROP CONSTRAINT "FK_e3786bb15020acb034755b4b7fb"`, undefined);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_cace4a159ff9f2512dd42373760"`, undefined);
        await queryRunner.query(`ALTER TABLE "token" DROP CONSTRAINT "FK_94f168faad896c0786646fa3d4a"`, undefined);
        // await queryRunner.query(`CREATE SEQUENCE "user_id_seq" OWNED BY "user"."id"`, undefined);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "id" SET DEFAULT nextval('user_id_seq')`, undefined);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_cace4a159ff9f2512dd42373760"`, undefined);
        await queryRunner.query(`ALTER TABLE "daemon" ADD CONSTRAINT "FK_e3786bb15020acb034755b4b7fb" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "token" ADD CONSTRAINT "FK_94f168faad896c0786646fa3d4a" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`, undefined);
    }

}
