import { StatusApi } from '@dipa-projekt/projektassistent-openapi';
import { DI } from '@leanup/lib';

DI.register('StatusApi', new StatusApi());
