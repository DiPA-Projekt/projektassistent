import { Configuration } from '@dipa-projekt/projektassistent-openapi';
import { ProductsApi } from '@dipa-projekt/projektassistent-openapi/dist/apis/ProductsApi';

const configuration = new Configuration({
  basePath: '/api/v1',
});

const API = {
  ProductsApi: new ProductsApi(configuration),
};

export default API;
