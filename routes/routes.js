import userRoute from './userRoute.js';
import adminRoute from './adminRoute.js';
import productRoute from './productRoute.js';
import newsletterRoute from './newsLetterRoute.js';
import cartRoute from './cartRoute.js';

const routes = [
  {
    path: '/api/v1/users',
    handler: userRoute
  },
  {
    path: '/api/v1/admin',
    handler: adminRoute
  },
  {
    path: '/api/v1/products',
    handler: productRoute
  },
  {
    path: '/api/v1/newsletter',
    handler: newsletterRoute
  },
  {
    path: '/api/v1/carts',
    handler: cartRoute
  },
];

const setRoute = (app) => {
  routes.forEach(({ path, handler }) => app.use(path, handler));
};

export default setRoute;