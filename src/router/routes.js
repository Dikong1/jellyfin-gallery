const routes = [
  {
    path: '/auth',
    component: () => import('layouts/AuthLayout.vue'),
    meta: { public: true },
    children: [
      {
        path: '',
        name: 'AuthPage',
        component: () => import('pages/AuthPage.vue'),
      },
    ],
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/auth',
      },
      {
        path: 'gallery',
        component: () => import('src/pages/MediaGallery.vue'),
      },
      {
        path: 'view/:id',
        component: () => import('pages/MediaItems.vue'),
      },
      {
        path: '/watch/:id',
        name: 'WatchVideo',
        component: () => import('pages/WatchVideoPage.vue'),
      },
      {
        path: '/document/:id',
        name: 'DocumentViewer',
        component: () => import('pages/DocumentViewerPage.vue'),
      },
    ],
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
