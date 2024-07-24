export const ENV = import.meta.env.VITE_APP_ENV ?? 'development'

const OPTIONS = {
  qa: {
    API_URL: 'http://localhost:8000/api/v1',
  },
  development: {
    API_URL: 'http://localhost:8000/api/v1',
  },
  production: {
    API_URL: 'NOTSET',
  },
}

export const API_URL = OPTIONS[[ENV]].API_URL
