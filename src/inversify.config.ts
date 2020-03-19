import "reflect-metadata";
import { Container } from 'inversify';

import DaemonsController from 'controllers/daemons';
import UsersController from 'controllers/users';

import AuthorizeService from 'services/authorize.service';
import PermissionsService from 'services/permissions.service';
import TokensService from 'services/tokens.service';

// Container
const DIContainer = new Container();
DIContainer.bind(DaemonsController).toSelf().inSingletonScope();
DIContainer.bind(UsersController).toSelf().inSingletonScope();

DIContainer.bind(AuthorizeService).toSelf().inSingletonScope();
DIContainer.bind(PermissionsService).toSelf().inSingletonScope();
DIContainer.bind(TokensService).toSelf().inSingletonScope();

export default DIContainer;
