import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// Entity
@Entity()
export class Hell {
  // Columns
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 100, nullable: true })
  name: string | null;
}
