import { defineMock } from 'vite-plugin-mock-dev-server';

export default defineMock([
  {
    url: '/api/system/users',
    method: 'GET',
    body: {
      code: 0,
      message: 'ok',
      data: { total: 0, list: [] },
    },
  },
  {
    url: '/api/system/orgs/tree',
    method: 'GET',
    body: {
      code: 0,
      message: 'ok',
      data: [
        {
          id: 'org-root',
          name: '123456789',
          parentId: null,
          children: [
            {
              id: 'org-a',
              name: '演示子组织',
              parentId: 'org-root',
            },
          ],
        },
      ],
    },
  },
  {
    url: '/api/system/orgs/members',
    method: 'GET',
    body: {
      code: 0,
      message: 'ok',
      data: { total: 0, list: [] },
    },
  },
  {
    url: '/api/system/roles',
    method: 'GET',
    body: {
      code: 0,
      message: 'ok',
      data: { total: 0, list: [] },
    },
  },
]);
