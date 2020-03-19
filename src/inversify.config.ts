import "reflect-metadata";
import { Container } from 'inversify';

import DaemonsController from 'controllers/daemons';
import PermissionsController from 'controllers/permissions';
import TokensController from 'controllers/tokens';
import UsersController from 'controllers/users';

import TokensService from 'services/tokens.service';

// Container
const DIContainer = new Container();
DIContainer.bind(DaemonsController).toSelf().inSingletonScope();
DIContainer.bind(PermissionsController).toSelf().inSingletonScope();
DIContainer.bind(TokensController).toSelf().inSingletonScope();
DIContainer.bind(UsersController).toSelf().inSingletonScope();

DIContainer.bind(TokensService).toSelf().inSingletonScope();

export default DIContainer;
