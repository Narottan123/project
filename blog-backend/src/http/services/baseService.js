import mongoose from "mongoose";

class BaseService {
  constructor() {
    if (this.constructor === BaseService) {
      throw new Error("Can't instantiate abstract class!");
    }
  }

  /**
   * This method is used for get a single data using query
   *
   * @param {mongoose.Schema} Schema
   * @param {Object} query | the query
   */
  findOne(Schema, query = {}, exclude = {}) {
    // query.deleted_at = null;
    return Schema.findOne(query, exclude);
  }

  /**
   * This method is used for get set of data using query
   *
   * @param {mongoose.Schema} Schema
   * @param {Object} query | the query
   * @param {Object} project | the query
   * @param session
   */
  find(Schema, query = {}, project = {}, session = false) {
    query.deleted_at = null;
    if (session) {
      return Schema.find(query, project, { session });
    }
    return Schema.find(query, project);
  }
  findData(Schema, query = {}, project = {}, session = false) {
    query.deleted_at = null;
    if (session) {
      return Schema.find(query, project, { session }).lean();
    }
    return Schema.find(query, project).lean();
  }

  findSort(Schema, query = {}, project = {}, options = {}) {
    query.deleted_at = null;

    const { session = null, sort = {} } = options;

    let dbQuery = Schema.find(query, project);

    if (session) {
      dbQuery = dbQuery.session(session);
    }

    if (sort && Object.keys(sort).length > 0) {
      dbQuery = dbQuery.sort(sort);
    }

    return dbQuery;
  }

  /**
   *
   * @param {Object} Schema | The schema
   * @param {string} value | The schema id
   */
  findById(Schema, value) {
    return Schema.findById(value);
  }

  /**
   * This method is used for save a new schema
   *
   * @param {mongoose.Schema} Schema
   * @param {Object} data | The insert data
   *
   * @param session
   * @returns {mongoose.Schema}
   */
  save(Schema, data = {}, session = null) {
    let SchemaInstance = new Schema(data);
    if (session) {
      return SchemaInstance.save({ session });
    }
    return SchemaInstance.save();
  }

  /**
   * This method is used for save a new schema
   *
   * @param {mongoose.Schema} Schema
   * @param query
   * @param {Object} data | The insert data
   *
   * @param session
   * @returns {mongoose.Schema}
   */
  findOneAndUpdate(Schema, query = {}, data = {}, session = null) {
    // let SchemaInstance = new Schema(data)
    // return SchemaInstance.save()
    if (session) {
      return Schema.findOneAndUpdate(
        query,
        { $set: data },
        { returnDocument: "after", upsert: true, session },
      );
    }
    return Schema.findOneAndUpdate(
      query,
      { $set: data },
      { returnDocument: "after", upsert: true },
    );
  }

  findOneAndUpdateOnly(Schema, query = {}, data = {}, upsert = {}) {
    return Schema.findOneAndUpdate(query, { $set: data }, upsert);
  }

  /**
   * This method is used for update existing schema
   *
   * @param {mongoose.Schema} Schema
   * @param {Object} data | The update data
   *
   * @returns {mongoose.Schema}
   */
  findManyAndUpdate(Schema, query = {}, data = {}, session = null) {
    const isOperatorUsed = Object.keys(data).some((key) => key.startsWith("$"));

    if (session) {
      return Schema.updateMany(query, isOperatorUsed ? data : { $set: data }, {
        session,
      });
    }

    return Schema.updateMany(query, isOperatorUsed ? data : { $set: data }, {
      new: true,
      multi: true,
      upsert: true,
    });
  }

  findManyAndUpdate1(Schema, query = {}, data = {}, session = null) {
    const isOperatorUsed = Object.keys(data).some((key) => key.startsWith("$"));

    if (session) {
      return Schema.updateMany(query, isOperatorUsed ? data : { $set: data }, {
        session,
      });
    }

    return Schema.updateMany(query, isOperatorUsed ? data : { $set: data });
  }

  findByIdUpdate(Schema, query = {}, data = {}, session = null) {
    if (session) {
      return Schema.findByIdAndUpdate(
        query,
        { $set: data },
        { new: true, session },
      );
    }

    return Schema.findByIdAndUpdate(
      query,
      { $set: data },
      { new: true, multi: true, upsert: true },
    );
  }

  /**
   * This method is used for insert many existing schema
   *
   * @param {mongoose.Schema} Schema
   * @param {Object} data | The insert data
   *
   * @param session
   * @returns {mongoose.Schema}
   */
  insertMany(Schema, data = {}, session = null) {
    if (session) {
      return Schema.insertMany(data, { ordered: false }, { session });
    }
    return Schema.insertMany(data);
  }

  /**
   * This method is used for insert many existing schema
   *
   * @param {mongoose.Schema} Schema
   * @param {Object} query
   *
   * @param session
   * @returns {mongoose.Schema}
   */
  deleteMany(Schema, query = {}, session = null) {
    if (session) {
      return Schema.deleteMany(query, { session });
    }
    return Schema.deleteMany(query);
  }
  delete(Schema, query = {}, session = null) {
    if (session) {
      return Schema.delete(query, { session });
    }
    return Schema.delete(query);
  }
  deleteOne(Schema, condition = {}) {
    return Schema.deleteOne(condition); // ✅ use deleteOne instead of delete
  }

  /**
   * This method is used for remove _id from nested object
   *
   * @param {Object} data
   */
  removeId(data) {
    if (typeof data == "object") {
      if (data && data.hasOwnProperty) {
        if (data.hasOwnProperty("_id")) {
          delete data._id;
        }
      }
    }
    for (let key in data) {
      if (typeof data[key] == "object") {
        this.removeId(data[key]);
      }
    }
  }

  /**
   * This method is used for get pagination
   *
   * @returns
   */
  getPagination(skip = 0, limit = 0) {
    skip = parseInt(skip);
    skip = skip == 0 ? 1 : skip;
    limit = parseInt(limit);
    limit = limit == 0 ? Config.limit : limit;
    return ({ $skip: limit * (skip - 1) }, { $limit: limit });
  }

  /**
   * This method is used for convert id to mongoose object id
   *
   * @param {String} id
   */
  convertToMongoID(id) {
    return new mongoose.Types.ObjectId(id);
  }

  /**
   * This method is used for follow same traction process
   *
   * @return {ClientSession | boolean}
   */
  async startDbTransaction() {
    return false;

    try {
      let session = await mongoose.startSession();
      session.startTransaction();
      return session;
    } catch (e) {
      console.log(`BaseService startDbTransaction Error => `, e);
      return false;
    }
  }

  /**
   * This method is used if transaction process completed finaly
   *
   * @return {ClientSession | boolean}
   */
  async commitTransaction(session) {
    return false;
    try {
      if (session) {
        if (!session.hasEnded) {
          if (session.inTransaction) {
            await session.commitTransaction();
          } else {
            console.log(
              `BaseService commitTransaction - Transaction already completed or not started!`,
            );
          }
          await session.endSession();
          return true;
        } else {
          console.log(`BaseService commitTransaction - session already ended`);
        }
      } else {
        console.log("BaseService commitTransaction - Invalid Session");
      }
      return false;
    } catch (e) {
      console.log(`BaseService commitTransaction Error => `, e);
      return false;
    }
  }

  /**
   * This method is used if transaction process faild
   *
   * @param {ClientSession} session
   */
  async abortTransaction(session) {
    return false;
    try {
      if (session) {
        if (!session.hasEnded) {
          if (session.inTransaction) {
            await session.abortTransaction();
          } else {
            console.log(
              `BaseService abortTransaction - Transaction already completed or not started!`,
            );
          }
          await session.endSession();
          return true;
        } else {
          console.log(`BaseService abortTransaction - session already ended`);
        }
      } else {
        console.log("BaseService abortTransaction - Invalid Session");
      }
      return false;
    } catch (e) {
      console.log(`BaseService abortTransaction Error => `, e);
      return false;
    }
  }

  aggregate(Schema, pipeline = []) {
    return Schema.aggregate(pipeline);
  }
}

export default BaseService;
