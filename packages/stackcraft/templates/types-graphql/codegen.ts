import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: '../../apps/backend/src/schema.gql',
  documents: ['../../apps/web/src/**/*.graphql'],
  generates: {
    './src/graphql/index.ts': {
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-react-apollo',
      ],
    },
  },
};

export default config;
