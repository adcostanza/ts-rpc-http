import * as fs from 'fs';

const validate = require('jsonschema').validate;

export const validateRequest = <T>(request: T, schemaFile: string) => {
    const schema = JSON.parse(fs.readFileSync(schemaFile, 'utf-8'));
    const errors = validate(request, schema).errors.map(error => error.stack);
    if (errors.length > 0) {
        throw Error('Validation errors: ' + errors.map(error => error.replace(/"/g, "`")).join(', '));
    }
};
