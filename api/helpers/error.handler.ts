/** =====================================
 * Error Handler for Mongoose / MongoDB
 * =======================================
 * @params are @err @res @model
    @err is the error from your catch block
    @res is the res from your route controller
    @model is a string of the name of your model e.g. 'user', 'todo', etc
 * e.g.
 *  try {
    } catch (err) {  
      errorController(err, res, model) 
    }
*/

import { Response } from "express";
import { MongoError, MongoServerError } from "mongodb";
import { Error } from "mongoose";

export type DBError = MongoError | Error.CastError | Error.ValidationError;

function errorHandler(error: DBError, res: Response, model: string) {
  let errMsg, code;

  // validation errors
  if (error.name === "ValidationError") {
    [code, errMsg] = (() => {
      const err = error as Error.ValidationError;
      const field = Object.keys(err.errors);
      return [400, err.errors[field[0]].message];
    })();
  }
  // unique key error
  else if ((error as MongoError).code && (error as MongoError).code === 11000) {
    [code, errMsg] = (() => {
      const err = error as MongoServerError;
      const field = Object.keys(err.keyValue);
      return [409, `${model} with such ${field[0]} already exist`];
    })();
  }
  // cast errors e.g. filter @params (e.g. id, name, etc) not found
  else if (error.name === "CastError") {
    [code, errMsg] = (() => {
      const err = error as Error.CastError;
      return [404, `${model} with such ${err.path} does not exist`];
    })();
  }

  // send error response
  if (code && errMsg) {
    return res.status(+code).json({
      success: false,
      error: errMsg,
    });
  } else {
    return res
      .status(500)
      .send({ success: false, error: Object.keys(error).length ? error : "Something went wrong, try again later" });
  }
}

export default errorHandler;
