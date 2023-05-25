
module.exports = {
    NODE_ENV: process.env.NODE_ENV,
    AWS_REGION: process.env.AWS_REGION || "us-east-1",
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,

    PRODUCTION_APP_SECRET: process.env.PRODUCTION_APP_SECRET,
    STAGING_APP_SECRET: process.env.STAGING_APP_SECRET,
    DEVELOPMENT_APP_SECRET: process.env.DEVELOPMENT_APP_SECRET,

    PRODUCTION_DATA_CDN: process.env.PRODUCTION_DATA_CDN || 'https://data.sleekcms.com',
    STAGING_DATA_CDN: process.env.STAGING_DATA_CDN || 'https://stg-data.sleekcms.com',
    DEVELOPMENT_DATA_CDN: process.env.DEVELOPMENT_DATA_CDN || 'https://dev-data.sleekcms.com',

    PRODUCTION_BACKEND_URL: process.env.PRODUCTION_BACKEND_URL || 'https://app.sleekcms.com',
    STAGING_BACKEND_URL: process.env.STAGING_BACKEND_URL || 'https://stg-app.sleekcms.com',
    DEVELOPMENT_BACKEND_URL: process.env.DEVELOPMENT_BACKEND_URL || 'https://dev-app.sleekcms.com',

    PRODUCTION_IMG_CDN: process.env.PRODUCTION_IMG_CDN || 'https://img.sleekcms.com',
    STAGING_IMG_CDN: process.env.STAGING_IMG_CDN || 'https://stg-img.sleekcms.com',
    DEVELOPMENT_IMG_CDN: process.env.DEVELOPMENT_IMG_CDN || 'https://dev-img.sleekcms.com',

    USE_CACHE: process.env.USE_CACHE || 'true',

    _OPTIONAL: ['AWS_REGION', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'PRODUCTION_DATA_CDN', 'STAGING_DATA_CDN', 'DEVELOPMENT_DATA_CDN', 'PRODUCTION_BACKEND_URL', 'STAGING_BACKEND_URL', 'DEVELOPMENT_BACKEND_URL', 'PRODUCTION_IMG_CDN', 'STAGING_IMG_CDN', 'DEVELOPMENT_IMG_CDN', 'USE_CACHE', '_OPTIONAL']
};