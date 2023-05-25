import { Image, ImageAttr } from "./types";

const ENV = require('./env');

interface GetImg {
    env : string
    site_id : number
    img : Image
    attr : ImageAttr
}

const getImgUrl = ({env, site_id, img, attr}:GetImg) => {
    let source = (img && img.source) ? img.source : 'sleekcms';
    if (!['sleekcms', 'unsplash'].includes(source)) source = 'sleekcms';
    if (source === 'sleekcms') {
        let token = (!img || !img.key_name) ? 'random' : `${site_id.toString(36)}${img.key_name.substr(-8)}`;
        let url = null;
        if (env === 'production') url = ENV.PRODUCTION_IMG_CDN;
        else if (env === 'staging') url = ENV.STAGING_IMG_CDN;
        else if (process.env['IMG_CDN']) url = process.env['IMG_CDN'];
        else if (env === 'development') url = ENV.DEVELOPMENT_IMG_CDN;
        else throw new Error('E72: ENV not set');
    
        let query = [];
        url = url + `/${token}.png`;
        if (attr.w) query.push(`w=${attr.w}`);
        if (attr.h) query.push(`h=${attr.h}`);
        if (attr.fit) query.push(`fit=${attr.fit}`);
        if (query.length > 0) url += '?' + query.join('&');
        return url;    
    } else if (source === 'unsplash') {
        let url = new URL(img.path ?? '');
        let fit = attr.fit || 'crop';
        if (fit === 'cover') fit = 'crop';
        if (attr.w) url.searchParams.set('w', `${attr.w}`);
        if (attr.h) url.searchParams.set('h', `${attr.h}`);
        if (attr.w || attr.h) url.searchParams.set('fit', fit);
        return url.href;
    }
}

const getImg = ({env, site_id, img, attr}:GetImg) => {
    let obj:any = {attribution: {name: null, url: null}, blur_hash: null, description: '', url : ''}
    obj.url = getImgUrl({env, site_id, img, attr}) ?? '';
    if (img) {
        obj.attribution.name = img.attr_name
        obj.attribution.url = img.attr_url
        obj.blur_hash = img.blur_hash
        obj.description = img.description
     }
     return obj;
}

const getBackendUrl = (env:string) => {
    if (env === 'production') return ENV.PRODUCTION_BACKEND_URL;
    else if (env === 'staging') return ENV.STAGING_BACKEND_URL;
    else if (process.env['BACKEND_URL']) return process.env['BACKEND_URL'];
    else if (env === 'development') return ENV.DEVELOPMENT_BACKEND_URL;
    else throw new Error('E70: ENV not set');
}

const getDataCdnUrl = (env:string) => {
    if (env === 'production') return ENV.PRODUCTION_DATA_CDN;
    else if (env === 'staging') return ENV.STAGING_DATA_CDN;
    else if (process.env['DATA_CDN']) return process.env['DATA_CDN'];
    else if (env === 'development') return ENV.DEVELOPMENT_DATA_CDN;
    else throw new Error('E71: ENV not set');
}

const getAppSecret = (env:string) => {
    if (env === 'production') return ENV.PRODUCTION_APP_SECRET;
    else if (env === 'staging') return ENV.STAGING_APP_SECRET;
    else if (process.env['APP_SECRET']) return process.env['APP_SECRET'];
    else if (env === 'development') return ENV.DEVELOPMENT_APP_SECRET;
    else throw new Error('E73: ENV not set');
}

module.exports = { getImgUrl, getBackendUrl, getDataCdnUrl, getAppSecret, getImg };