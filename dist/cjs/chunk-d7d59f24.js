'use strict';

/* istanbul ignore next */
function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var _merge = _interopDefault(require('lodash/merge'));
var __chunk_2 = require('./chunk-6127be9d.js');
var __chunk_3 = require('./chunk-c93e6c1a.js');
var _isObject = _interopDefault(require('lodash/isObject'));
var __chunk_4 = require('./chunk-40280356.js');
var __chunk_5 = require('./chunk-1d740ce9.js');
var _clone = _interopDefault(require('lodash/clone'));
var __chunk_6 = require('./chunk-a5b67d13.js');
var _cloneDeep = _interopDefault(require('lodash/cloneDeep'));
var _each = _interopDefault(require('lodash/each'));
var _eachRight = _interopDefault(require('lodash/eachRight'));
var _has = _interopDefault(require('lodash/has'));
var _set = _interopDefault(require('lodash/set'));
var _unset = _interopDefault(require('lodash/unset'));
var _isPlainObject = _interopDefault(require('lodash/isPlainObject'));
var _iteratee = _interopDefault(require('lodash/iteratee'));
var __chunk_7 = require('./chunk-78c5fa0e.js');

var deps = _merge(
  {
    merge: _merge,
    clone: _clone,
    cloneDeep: _cloneDeep,
    isArray: __chunk_2._isArray,
    isObject: _isObject,
    each: _each,
    eachRight: _eachRight,
    has: _has,
    set: _set,
    unset: _unset,
    isPlainObject: _isPlainObject,
    iteratee: _iteratee,
  },
  __chunk_3.eachDeepDeps,
  __chunk_4.deps,
  __chunk_7.deps,
  __chunk_5.condenseDeepDeps,
  __chunk_6.existsDeps
);

function getFilterDeep(_) {
  // console.log('getFilterDeep:', _);
  var eachDeep = __chunk_3.getEachDeep(_);
  var pathToString = __chunk_4.getPathToString(_);
  var obtain = __chunk_7.getObtain(_);
  var condenseDeep = __chunk_5.getCondenseDeep(_);
  var exists = __chunk_6.getExists(_);

  function filterDeep(obj, predicate, options) {
    predicate = _.iteratee(predicate);
    if (options && options.leafsOnly !== undefined) {
      options.leavesOnly = options.leafsOnly;
    }
    if (!options) {
      options = {};
    }
    if (!options.onTrue) {
      options.onTrue = {};
    }
    if (!options.onFalse) {
      options.onFalse = {};
    }
    if (!options.onUndefined) {
      options.onUndefined = {};
    }
    if (options.childrenPath !== undefined) {
      if (options.onTrue.skipChildren === undefined) {
        options.onTrue.skipChildren = false;
      }
      if (options.onUndefined.skipChildren === undefined) {
        options.onUndefined.skipChildren = false;
      }
      if (options.onFalse.skipChildren === undefined) {
        options.onFalse.skipChildren = false;
      }

      if (options.onTrue.cloneDeep === undefined) {
        options.onTrue.cloneDeep = true;
      }
      if (options.onUndefined.cloneDeep === undefined) {
        options.onUndefined.cloneDeep = true;
      }
      if (options.onFalse.cloneDeep === undefined) {
        options.onFalse.cloneDeep = true;
      }
    }
    options = _.merge(
      {
        checkCircular: false,
        keepCircular: true,
        //replaceCircularBy: <by>,
        leavesOnly: options.childrenPath === undefined,
        condense: true,
        cloneDeep: _.cloneDeep,
        pathFormat: 'string',
        onTrue: { skipChildren: true, cloneDeep: true, keepIfEmpty: true },
        onUndefined: {
          skipChildren: false,
          cloneDeep: false,
          keepIfEmpty: false,
        },
        onFalse: {
          skipChildren: true,
          cloneDeep: false,
          keepIfEmpty: false,
        },
      },
      options
    );

    var eachDeepOptions = {
      pathFormat: options.pathFormat,
      checkCircular: options.checkCircular,
      childrenPath: options.childrenPath,
      includeRoot: options.includeRoot,
      callbackAfterIterate: true,
      leavesOnly: options.leavesOnly,
    };

    var res = _.isArray(obj) ? [] : _.isObject(obj) ? {} : null;
    var replies = {};
    var rootReply;
    var foundCircular = [];
    // console.log('filterDeep → eachDeep', eachDeepOptions);
    eachDeep(
      obj,
      function(value, key, parent, context) {
        var curPath = pathToString(context.path);
        if (!context.afterIterate) {
          if (!context.isCircular) {
            // console.log('fr: ', context.path);
            var reply;
            reply = predicate(value, key, parent, context);
            // console.log(context.path + '?', reply);

            if (!_.isObject(reply)) {
              if (reply === undefined) {
                reply = _.clone(options.onUndefined);
              } else if (reply) {
                reply = _.clone(options.onTrue);
              } else {
                reply = _.clone(options.onFalse);
              }
            }
            if (reply.empty === undefined) {
              reply.empty = true;
            }
            if (curPath !== undefined) {
              replies[curPath] = reply;

              _.eachRight(context.parents, function(parent) {
                var p = pathToString(parent.path);
                if (p !== undefined && !replies[p]) {
                  replies[p] = {
                    skipChildren: false,
                    cloneDeep: false,
                    keepIfEmpty: false,
                    empty: reply.empty,
                  };
                } else {
                  return false;
                }
              });

              if (!rootReply) {
                rootReply = {
                  skipChildren: false,
                  cloneDeep: false,
                  keepIfEmpty: false,
                  empty: reply.empty,
                };
              }
            } else {
              rootReply = reply;
              // console.log('root reply', reply);
            }
            // console.log('→', replies);
            if (reply.keepIfEmpty || !reply.skipChildren) {
              if (options.cloneDeep && reply.cloneDeep) {
                if (context.path !== undefined) {
                  _.set(res, context.path, options.cloneDeep(value));
                } else {
                  res = options.cloneDeep(value);
                }
              } else {
                if (context.path !== undefined) {
                  _.set(
                    res,
                    context.path,
                    _.isArray(value) ? [] : _.isPlainObject(value) ? {} : value
                  );
                } else {
                  res = _.isArray(value)
                    ? []
                    : _.isPlainObject(value)
                    ? {}
                    : value;
                }
              }
            }
            return !reply.skipChildren;
          } else {
            // console.log('fc: ', context.path);
            _.unset(res, context.path);

            if (options.keepCircular) {
              foundCircular.push([context.path, context.circularParent.path]);
            }
            return false;
          }
        } else if (context.afterIterate && !context.isCircular) {
          // console.log('ai: ', context.path);
          if (
            curPath === undefined &&
            rootReply.empty &&
            !rootReply.keepIfEmpty
          ) {
            res = null;
          } else if (
            curPath !== undefined &&
            replies[curPath].empty &&
            !replies[curPath].keepIfEmpty
          ) {
            _.unset(res, context.path);
          } else {
            _.eachRight(context.parents, function(parent) {
              var p = pathToString(parent.path);
              if (p !== undefined && replies[p].empty) {
                replies[p].empty = false;
              } else {
                return false;
              }
            });
            rootReply.empty = false;
          }

          // console.log('←', replies);
          return;
        }
      },
      eachDeepOptions
    );
    if (rootReply && rootReply.empty && !rootReply.keepIfEmpty) {
      res = null;
    } else {
      _.each(replies, (reply, path) => {
        if (reply.empty && !reply.keepIfEmpty) {
          _.unset(res, path);
        }
      });
    }
    _.each(foundCircular, function(c) {
      var cv;
      var found = c[1] === undefined || exists(res, c[1]);
      if (!found) return;
      // console.log('circular: ', c[0], c[1]);
      if (_.has(options, 'replaceCircularBy')) {
        cv = options.replaceCircularBy;
      } else {
        cv = obtain(res, c[1]);
      }
      _.set(res, c[0], cv);
    });
    if (options.condense) {
      //console.log('filterDeep → condenseDeep');
      res = condenseDeep(res, { checkCircular: options.checkCircular });
    }
    if (_.isArray(res) && !res.length && !eachDeepOptions.includeRoot)
      return null;
    return res;
  }
  return filterDeep;
}

exports.filterDeepDeps = deps;
exports.getFilterDeep = getFilterDeep;