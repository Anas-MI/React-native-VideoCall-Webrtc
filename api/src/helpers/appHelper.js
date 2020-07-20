import isArray from 'lodash/isArray';
import isEmpty from 'lodash/isEmpty';
import flatten from 'lodash/flatten';
import merge from 'lodash/merge';

export function executeAsync(controller, validator) {
  return async function (req, res, next) {
    try {
      let data = { ...req.body, ...req.params, ...req.query };

      if (!isEmpty(req.files)) data['files'] = req.files;
      if (!isEmpty(req.file)) data['file'] = req.file;

      if (!isEmpty(validator)) {
        if (isArray(validator)) {
          data = await Promise.all(
            validator.map((single) =>
              single.validate(data, { stripUnknown: true })
            )
          );
          data = merge.apply(this, flatten(data));
        } else {
          data = await validator.validate(data, { stripUnknown: true });
        }
      }

      const responce = await controller(data);

      res.send({ success: true, data: responce });
    } catch (error) {
      console.log(error);
      res.send({ success: false, error: { message: error.message } });
    }
  };
}
