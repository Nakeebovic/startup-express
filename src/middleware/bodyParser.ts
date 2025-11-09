import express from 'express';
import { OptionsJson, OptionsUrlencoded } from 'body-parser';

export const jsonMiddleware = (options?: OptionsJson) => {
  return express.json({
    limit: '10mb',
    ...options,
  });
};

export const urlencodedMiddleware = (options?: OptionsUrlencoded) => {
  return express.urlencoded({
    extended: true,
    limit: '10mb',
    ...options,
  });
};

