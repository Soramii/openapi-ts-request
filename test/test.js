const assert = require('assert');
const path = require('path');
const fs = require('fs');

const openAPI = require('../dist/index');

const gen = async () => {
  // 测试空的 openapi 定义
  await openAPI.generateService({
    schemaPath: `${__dirname}/example-files/openapi-empty.json`,
    serversPath: './apis/empty',
  });

  // 测试 swagger => openapi, schema 循环引用
  await openAPI.generateService({
    schemaPath: `${__dirname}/example-files/swagger-get-method-params-convert-obj.json`,
    serversPath: './apis/convert-obj',
  });

  // 测试空的 schema 引用
  await openAPI.generateService({
    schemaPath: `${__dirname}/example-files/openapi-schema-contain-blank-symbol.json`,
    serversPath: './apis/blank-symbol',
  });

  // 自定义 hook
  await openAPI.generateService({
    requestLibPath: "import request from '@/request';",
    schemaPath: `${__dirname}/example-files/openapi-custom-hook.json`,
    serversPath: './apis/custom',
    hook: {
      // 自定义类名
      customClassName: (tagName) => {
        return /[A-Z].+/.exec(tagName);
      },
      // 自定义函数名
      customFunctionName: (data) => {
        let funName = data.operationId ? data.operationId : '';
        const suffix = 'Using';

        if (funName.indexOf(suffix) != -1) {
          funName = funName.substring(0, funName.lastIndexOf(suffix));
        }

        return funName;
      },
      // 自定义类型名
      customTypeName: (data) => {
        const { operationId } = data;
        const funName = operationId ? operationId[0].toUpperCase() + operationId.substring(1) : '';
        const tag = data?.tags?.[0];

        return `${tag ? tag : ''}${funName}`;
      },
    },
  });

  // 支持 null 类型作为默认值
  await openAPI.generateService({
    schemaPath: `${__dirname}/example-files/openapi.json`,
    serversPath: './apis/support-null',
    nullable: true,
    mockFolder: './mocks',
  });

  // 正常命名文件和请求函数
  await openAPI.generateService({
    schemaPath: `${__dirname}/example-files/openapi-camelcase.json`,
    serversPath: './apis/name/normal',
    isCamelCase: false,
  });

  // 小驼峰命名文件和请求函数
  await openAPI.generateService({
    schemaPath: `${__dirname}/example-files/openapi-camelcase.json`,
    serversPath: './apis/name/camelcase',
    isCamelCase: true,
  });

  // 测试处理 allof 结构, 生成复杂 type 翻译
  await openAPI.generateService({
    schemaPath: `${__dirname}/example-files/openapi-test-allof-api.json`,
    serversPath: './apis/allof',
    isDisplayTypeLabel: true,
  });

  // 文件上传
  await openAPI.generateService({
    schemaPath: `${__dirname}/example-files/swagger-file-convert.json`,
    serversPath: './apis/file',
  });

  // 生成枚举翻译, 生成 type 翻译
  await openAPI.generateService({
    schemaPath: `${__dirname}/example-files/openapi-display-enum-label.json`,
    serversPath: './apis/display-enum-label',
    isDisplayTypeLabel: true,
  });

  // 测试筛选出指定 tags 对应的api
  await openAPI.generateService({
    schemaPath: `${__dirname}/example-files/openapi.json`,
    serversPath: './apis/filter-tags',
    allowedTags: ['pet'],
  });

  // check 文件生成
  const fileControllerStr = fs.readFileSync(
    path.join(__dirname, 'apis/file/fileController.ts'),
    'utf8',
  );
  assert(fileControllerStr.indexOf('!(item instanceof File)') > 0);
  assert(fileControllerStr.indexOf(`'multipart/form-data'`) > 0);
  assert(fileControllerStr.indexOf('Content-Type') > 0);
};

gen();
