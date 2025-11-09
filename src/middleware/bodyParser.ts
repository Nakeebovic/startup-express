import express from 'express';

export const jsonMiddleware = (options?: express.json.OptionsJson) => {
  return express.json({
    limit: '10mb',
    ...options,
  });
};

export const urlencodedMiddleware = (options?: express.urlencoded.OptionsUrlencoded) => {
  return express.urlencoded({
    extended: true,
    limit: '10mb',
    ...options,
  });
};

