module.exports = (fn) => {
    return (req, res, next) => {
      const result = fn(req, res, next);
  
      if (result instanceof Promise) {
        result.catch(next);
      } else {
        res.send(result);
      }
    };
  };
  