const randexp = require('randexp').randexp;
const { faker } = require('@faker-js/faker');
const _ = require('lodash');
const { shape } = require('@sleeksky/alt-schema');
const { getImg } = require('./helpers');

const getMockValue = ({field, env}) => {
    let type = field.type;
    if (type === 'singleline') {
        let { len, rx } = field.attr;
        if (rx) return randexp(new RegExp(rx));
        if (len) {
            len = _.random(...len);
            let text = faker.lorem.paragraph()
            return text.substr(0, len);
        }
        return faker.lorem.sentence();
    }
    if (type === 'number') {
        return _.random(0, 100);
    }
    if (type === 'boolean') {
        return _.random(0, 1) === 1;
    }
    if (type === 'markdown') {
        return faker.lorem.paragraph();
    }
    if (type === 'json') {
        let { schema } = field.attr;
        if (schema) {
            try {
                let json = shape({}, schema);
                return dfsMockJson(json);
            } catch (error) {   
                return { error };
            }
        }
        return {};
    }
    if (type === 'select') {
        let { options, multiple } = field.attr;
        if (options) {
            options = options.map(o => o[1]);
            let size = multiple ? _.random(1, options.length) : 1;
            return _.sampleSize(options, size);
        }
        return [];
    }
    if (type === 'image') {
        return getImg({env, img: null, attr: field.attr});
    }
    return "hello";
}

const mockify = (snapshot) => {
    let recs = [];
    for (let schema of snapshot.schemas) {
        let count = schema.is_list ? 5 : 1;
        for (let i = 0; i < count; i++) {
            recs.push({
                id: i,
                values: {},
                schema_id: schema.id
            })
        }
    }
    snapshot.recs = recs;
    return snapshot;
}

module.exports = { getMockValue, mockify };