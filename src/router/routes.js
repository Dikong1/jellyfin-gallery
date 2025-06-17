const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'), // MainLayout will contain QLayout
    children: [
      {
        path: '',
        redirect: '/auth',
      },
      {
        path: 'auth',
        component: () => import('pages/AuthPage.vue'),
      },
      {
        path: 'gallery',
        component: () => import('pages/MediaGallery.vue'),
      },
      {
        path: 'view/:id',
        component: () => import('pages/MediaItems.vue'),
      },
    ],
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
