# Configuration
export TYPEORM_URL=$DATABASE_URL
export TYPEORM_ENTITIES='dist/src/**/*.entity.js'
export TYPEORM_MIGRATIONS='dist/db/migrations/*.js'

# Execution
typeorm migration:run
