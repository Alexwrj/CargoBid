import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

import openapiTS, { astToString, COMMENT_HEADER } from 'openapi-typescript';
import { format } from 'prettier';

const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete'];
const JSON_MEDIA_TYPE = 'application/json';
const projectRoot = path.resolve(import.meta.dirname, '../..');
const contractPath = path.join(projectRoot, 'openapi.auctions.v1.json');
const outputDirectory = path.join(projectRoot, 'src/shared/api/generated');

function toPascalCase(value) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

function getOperationParameters(pathItem, operation) {
  return [...(pathItem.parameters ?? []), ...(operation.parameters ?? [])];
}

function getGeneratedDirectory(apiPath) {
  const segments = apiPath
    .split('/')
    .filter((segment) => segment && !segment.startsWith('{'));

  return path.join(outputDirectory, ...segments);
}

function createOperationTemplate({ apiPath, method, operation, pathItem }) {
  const { operationId, requestBody, responses } = operation;

  if (!operationId) {
    throw new Error(
      `operationId is required for ${method.toUpperCase()} ${apiPath}.`,
    );
  }

  const name = toPascalCase(operationId);
  const parameters = getOperationParameters(pathItem, operation);
  const pathParameters = parameters.filter(
    (parameter) => parameter.in === 'path',
  );
  const queryParameters = parameters.filter(
    (parameter) => parameter.in === 'query',
  );
  const hasRequestBody = Boolean(requestBody?.content?.[JSON_MEDIA_TYPE]);
  const isRequestBodyRequired = requestBody?.required === true;
  const hasJsonResponse = Boolean(
    responses?.['200']?.content?.[JSON_MEDIA_TYPE],
  );
  const hasRequiredParameters =
    isRequestBodyRequired ||
    parameters.some((parameter) => parameter.required === true);

  const exportedTypes = [
    `type Operation = operations['${operationId}'];`,
    pathParameters.length
      ? `export type ${name}PathParameters = NonNullable<Operation['parameters']['path']>;`
      : null,
    queryParameters.length
      ? `export type ${name}QueryParameters = NonNullable<Operation['parameters']['query']>;`
      : null,
    hasRequestBody
      ? `export type ${name}RequestBody = NonNullable<Operation['requestBody']>['content']['${JSON_MEDIA_TYPE}'];`
      : null,
    hasJsonResponse
      ? `export type ${name}Response = Operation['responses'][200]['content']['${JSON_MEDIA_TYPE}'];`
      : null,
  ].filter(Boolean);

  const paramsParts = [
    pathParameters.length ? `${name}PathParameters` : null,
    queryParameters.length ? `${name}QueryParameters` : null,
    hasRequestBody
      ? `{ body${isRequestBodyRequired ? '' : '?'}: ${name}RequestBody }`
      : null,
    '{ signal?: AbortSignal }',
  ].filter(Boolean);

  const requestPath = apiPath.replaceAll(
    /{([^}]+)}/g,
    (_match, parameterName) => {
      return `\${encodeURIComponent(String(params[${JSON.stringify(parameterName)}]))}`;
    },
  );

  const queryLines = queryParameters.flatMap(({ name: parameterName }) => [
    `  if (params[${JSON.stringify(parameterName)}] != null) {`,
    `    searchParams.set(${JSON.stringify(parameterName)}, String(params[${JSON.stringify(parameterName)}]));`,
    '  }',
  ]);

  const querySetup = queryParameters.length
    ? [
        '  const searchParams = new URLSearchParams();',
        ...queryLines,
        "  const search = searchParams.size ? `?${searchParams.toString()}` : '';",
        '',
      ]
    : [];

  const responseType = hasJsonResponse ? `${name}Response` : 'void';
  const bodyType = hasRequestBody ? `, ${name}RequestBody` : '';
  const functionDefault = hasRequiredParameters ? '' : ' = {}';
  const pathSuffix = queryParameters.length ? '${search}' : '';

  return `${COMMENT_HEADER}import type { operations } from '@/shared/api/generated/types';
import { apiClient } from '@/shared/api/client';

${exportedTypes.join('\n')}

export type ${name}Params = ${paramsParts.join(' & ')};

export function ${operationId}(params: ${name}Params${functionDefault}) {
${querySetup.join('\n')}  return apiClient.request<${responseType}${bodyType}>({
${hasRequestBody ? '    body: params.body,\n' : ''}    method: '${method.toUpperCase()}',
    path: \`${requestPath}${pathSuffix}\`,
${hasJsonResponse ? '' : "    responseType: 'void',\n"}    signal: params.signal,
  });
}
`;
}

async function generateOperationFiles(contract) {
  for (const [apiPath, pathItem] of Object.entries(contract.paths ?? {})) {
    for (const method of HTTP_METHODS) {
      const operation = pathItem[method];

      if (!operation) {
        continue;
      }

      const source = await format(
        createOperationTemplate({ apiPath, method, operation, pathItem }),
        {
          parser: 'typescript',
          singleQuote: true,
        },
      );
      const operationDirectory = getGeneratedDirectory(apiPath);
      const outputPath = path.join(
        operationDirectory,
        `${operation.operationId}.ts`,
      );

      await mkdir(operationDirectory, { recursive: true });
      await writeFile(outputPath, source, 'utf8');
    }
  }
}

const contract = JSON.parse(await readFile(contractPath, 'utf8'));
const ast = await openapiTS(contract);

await rm(outputDirectory, { force: true, recursive: true });
await mkdir(outputDirectory, { recursive: true });
await writeFile(
  path.join(outputDirectory, 'types.ts'),
  `${COMMENT_HEADER}${astToString(ast)}`,
  'utf8',
);
await generateOperationFiles(contract);
