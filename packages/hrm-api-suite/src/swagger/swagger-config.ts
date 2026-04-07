import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import yaml from 'js-yaml';
import path from 'path';

const openApiPath = path.resolve(process.cwd(), 'docs/openapi.yml');

let swaggerDocument: Record<string, unknown>;
try {
  swaggerDocument = yaml.load(fs.readFileSync(openApiPath, 'utf8')) as Record<string, unknown>;
} catch (err) {
  throw new Error(`Failed to load OpenAPI specification from "${openApiPath}": ${(err as Error).message}`);
}

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
