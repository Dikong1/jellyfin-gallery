const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'), // MainLayout will contain QLayout
    children: [
      {
        path: '', // This will be the default child for '/' when MainLayout is loaded
        redirect: '/auth', // Redirects to /auth within the MainLayout context
      },
      {
        path: 'auth', // Full path will be /auth
        component: () => import('pages/AuthPage.vue'), // AuthPage will be rendered inside MainLayout's QPageContainer
      },
      {
        path: 'gallery', // Full path will be /gallery
        component: () => import('pages/MediaGallery.vue'), // MediaGallery will be rendered inside MainLayout's QPageContainer
      },
    ],
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
