import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: '../../apps/backend/swagger.json',
  output: {
    path: './src/rest',
    format: 'prettier',
  },
  plugins: ['@hey-api/typescript'],
});
