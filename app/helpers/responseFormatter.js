class responseFormatter{
  static _response = {
    meta: {
      code: null,
      status: null,
      message: null
    },
    data: null
  }

  static success(data = null, message = null, code = null){
    this._response.meta.status = 'success';
    this._response.meta.code = code;
    this._response.meta.message = message;
    this._response.data = data;

    return this._response;
  }

  static error(data = null, message = null, code = null){
    this._response.meta.status = 'error';
    this._response.meta.code = code;
    this._response.meta.message = message;
    this._response.data = data;

    return this._response;
  }
}

module.exports = responseFormatter;
