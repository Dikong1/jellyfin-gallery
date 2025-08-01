import SearchPage from 'src/pages/SearchPage.vue'

const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('src/pages/MediaGallery.vue'),
      },
      {
        path: 'gallery',
        component: () => import('src/pages/MediaGallery.vue'),
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
      {
        path: '/search',
        name: 'search',
        component: SearchPage,
      },
    ],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
