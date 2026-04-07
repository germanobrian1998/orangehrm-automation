import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import yaml from 'js-yaml';
import path from 'path';

const swaggerDocument = yaml.load(
  fs.readFileSync(path.join(__dirname, '../../../docs/openapi.yml'), 'utf8')
) as Record<string, unknown>;

export const swaggerSetup = (app: {
  use: (path: string, ...handlers: unknown[]) => void;
  get: (path: string, ...handlers: unknown[]) => void;
}) => {
  app.use('/api-docs', swaggerUi.serve);
  app.get(
    '/api-docs',
    swaggerUi.setup(swaggerDocument, {
      swaggerOptions: {
        persistAuthorization: true,
      },
      customCss: '.swagger-ui .topbar { display: none }',
    })
  );
};
